import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/ogg']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scans: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
  }

  const mediaType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'audio'
  const ext = file.name.split('.').pop()
  const storagePath = `${user.id}/${Date.now()}.${ext}`

  const serviceSupabase = await createServiceClient()

  // Upload to Supabase Storage
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await serviceSupabase.storage
    .from('scans')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
  }

  // Insert scan record — Edge Function will trigger automatically via DB webhook
  const { data: scan, error: insertError } = await serviceSupabase
    .from('scans')
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_size: file.size,
      media_type: mediaType as 'image' | 'video' | 'audio',
      storage_path: storagePath,
      status: 'pending',
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ scan_id: scan.id, status: 'pending' }, { status: 201 })
}
