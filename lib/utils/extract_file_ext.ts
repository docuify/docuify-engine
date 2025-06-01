export default function getFileExtension(filename: string): string | null {
  const match = filename.match(/(?:\.([^.\/\\]+))?$/);
  return match?.[1] ?? null;
}
