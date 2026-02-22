/**
 * Supabase Storage helper for quiz images.
 *
 * Security: uses SUPABASE_SERVICE_ROLE_KEY (server-only).
 * The bucket must be set to PUBLIC in the Supabase dashboard so that
 * the returned URLs work without signed tokens.
 */

import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

/**
 * Upload raw image bytes to Supabase Storage and return the public URL.
 *
 * @param imageBytes  Raw bytes of the image (PNG or WebP).
 * @param storagePath Path inside the bucket, e.g. "abc123/v1.png".
 * @param bucket      Bucket name from env SUPABASE_STORAGE_BUCKET.
 * @param contentType MIME type, defaults to "image/png".
 * @returns           Public URL of the uploaded image.
 */
export async function uploadImageToStorage(
  imageBytes: Uint8Array,
  storagePath: string,
  bucket: string,
  contentType = "image/png",
): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, imageBytes, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Fetch a remote image URL and return its bytes.
 * Used when a Google Search result URL needs to be re-hosted in our storage
 * so we own the asset and it won't disappear.
 *
 * @param url Remote image URL.
 * @returns   Raw bytes.
 */
export async function fetchImageBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url, {
    headers: { "User-Agent": "QuizApp/1.0" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch remote image (${res.status}): ${url}`);
  }

  const buffer = await res.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Detect content type from the first few bytes (magic bytes).
 * Falls back to "image/png".
 */
export function detectContentType(bytes: Uint8Array): string {
  // WebP: "RIFF....WEBP"
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 &&
    bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 &&
    bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 &&
    bytes[2] === 0x4e && bytes[3] === 0x47
  ) {
    return "image/png";
  }
  return "image/png";
}

/** Returns the file extension that matches a content type string. */
export function extensionForContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/webp": "webp",
    "image/jpeg": "jpg",
    "image/png": "png",
  };
  return map[contentType] ?? "png";
}
