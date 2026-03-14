import { createClient } from './client';

type Bucket = 'flyer-photos' | 'avatars' | 'campaign-images';

function getExtension(file: File): string {
  const parts = file.name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg';
}

export async function uploadFile(
  bucket: Bucket,
  folder: string,
  file: File,
): Promise<string> {
  const supabase = createClient();
  const ext = getExtension(file);
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
