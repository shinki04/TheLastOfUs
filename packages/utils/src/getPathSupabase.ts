export function urlToPath(url: string, bucket: string) {
  const prefix = `/storage/v1/object/public/${bucket}/`;
  const parts = url.split(prefix);
  return parts[1];
}
