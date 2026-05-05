'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import clsx from 'clsx'

interface Props {
  onUpload: (file: File) => void
  disabled?: boolean
}

const ACCEPTED = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
}

export default function ScanUploadZone({ onUpload, disabled }: Props) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onUpload(acceptedFiles[0])
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer',
        'transition-all duration-300 select-none',
        isDragActive || dragActive
          ? 'border-hornet-gold bg-hornet-gold/5 shadow-gold'
          : 'border-hornet-border bg-hornet-panel hover:border-hornet-muted hover:bg-hornet-dark',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />

      {/* Corner brackets */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-hornet-gold/40" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-hornet-gold/40" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-hornet-gold/40" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-hornet-gold/40" />

      <div className="space-y-4">
        {/* Upload icon */}
        <div className="mx-auto w-16 h-16 flex items-center justify-center">
          <svg
            className={clsx(
              'w-12 h-12 transition-colors',
              isDragActive ? 'text-hornet-gold' : 'text-hornet-muted'
            )}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </div>

        <div>
          <p className={clsx(
            'font-mono text-sm font-bold tracking-wider transition-colors',
            isDragActive ? 'text-hornet-gold' : 'text-hornet-text'
          )}>
            {isDragActive ? 'DROP TO ANALYZE' : 'DROP MEDIA FOR ANALYSIS'}
          </p>
          <p className="font-mono text-xs text-hornet-dim mt-1">
            or click to browse
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5">
          {['JPG', 'PNG', 'WEBP', 'MP4', 'WEBM', 'MP3', 'WAV'].map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 bg-hornet-dark border border-hornet-border rounded font-mono text-[10px] text-hornet-dim"
            >
              {fmt}
            </span>
          ))}
        </div>

        <p className="font-mono text-[10px] text-hornet-muted">
          MAX 50MB — Powered by Hive Deepfake Detection
        </p>
      </div>
    </div>
  )
}
