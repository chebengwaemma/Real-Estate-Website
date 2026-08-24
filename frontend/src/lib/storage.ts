import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'

export type StorageBucket = 'videos' | 'video-files' | 'sponsor-logos' | 'blog-covers'

const DEMO_MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024
const EDGE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024
const VIDEO_UPLOAD_MAX_BYTES = 1000 * 1024 * 1024

function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|m4v)$/i.test(file.name)
}

function contentTypeFor(file: File): string | undefined {
  if (file.type) return file.type
  if (/\.webm$/i.test(file.name)) return 'video/webm'
  if (/\.(mov|qt)$/i.test(file.name)) return 'video/quicktime'
  if (/\.(mp4|m4v)$/i.test(file.name)) return 'video/mp4'
  return undefined
}

export async function uploadFile(bucket: StorageBucket, file: File): Promise<string> {
  if (bucket === 'video-files' && file.size > VIDEO_UPLOAD_MAX_BYTES) {
    throw new Error('Video is too large. Please upload an MP4 or WebM under 1000 MB.')
  }

  if (!isSupabaseConfigured) {
    if (isVideoFile(file)) {
      throw new Error('Connect Supabase to upload video files from the admin dashboard.')
    }
    if (file.size > DEMO_MAX_FILE_SIZE_BYTES) {
      throw new Error('In demo mode, please use an image smaller than 2 MB.')
    }
    return readFileAsDataUrl(file)
  }

  // Edge Functions reject large bodies — send big videos straight to Storage.
  if (file.size <= EDGE_UPLOAD_MAX_BYTES) {
    const viaFunction = await uploadViaEdgeFunction(bucket, file)
    if (viaFunction) return viaFunction
  }

  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: contentTypeFor(file),
  })
  if (error) {
    if (
      !isVideoFile(file) &&
      file.size <= DEMO_MAX_FILE_SIZE_BYTES &&
      /row-level security|rls|violates|policy|permission|not allowed|unauthorized|403|jwt|forbidden/i.test(
        error.message,
      )
    ) {
      return readFileAsDataUrl(file)
    }
    throw new Error(formatStorageError(bucket, error.message))
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

async function uploadViaEdgeFunction(bucket: StorageBucket, file: File): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) return null

  const form = new FormData()
  form.append('bucket', bucket)
  form.append('file', file)

  const { data, error } = await supabase.functions.invoke<{ publicUrl?: string; error?: string }>(
    'admin-upload-media',
    { body: form },
  )

  if (error) {
    const message = error.message ?? ''
    if (/Failed to send|not found|404|FunctionsRelayError|FunctionsFetchError|payload|too large|413/i.test(message)) {
      return null
    }
    throw new Error(formatStorageError(bucket, message))
  }

  if (data?.error) {
    if (/not found|404/i.test(data.error)) return null
    throw new Error(formatStorageError(bucket, data.error))
  }

  if (!data?.publicUrl) return null
  return data.publicUrl
}

function formatStorageError(bucket: StorageBucket, message: string): string {
  if (/bucket not found/i.test(message)) {
    return `Storage bucket "${bucket}" is missing. Run supabase/VIDEO_UPLOAD_FIX.sql in the Supabase SQL Editor, then retry.`
  }
  if (/mime type|not allowed|invalid/i.test(message) && bucket === 'video-files') {
    return 'Use an MP4 or WebM video file.'
  }
  if (/row-level security|rls|permission|not allowed|unauthorized|403/i.test(message)) {
    return `Upload blocked for "${bucket}". Run supabase/VIDEO_UPLOAD_FIX.sql (storage policies) and confirm your account is admin.`
  }
  return message
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })
}
