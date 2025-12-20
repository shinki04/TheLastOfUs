/**
 * Supabase image loader for Next.js Image component.
 * This file is referenced by next.config.ts
 */
export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  return `${
    process.env.NEXT_PUBLIC_SUPABASE_URL
  }/storage/v1/object/public/${src}?width=${width}&quality=${quality || 75}`;
}
