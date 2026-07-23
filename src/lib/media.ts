const VIDEO_RE = /\.(mp4|webm|mov|m4v)$/i;

export function isVideo(src: string): boolean {
  return VIDEO_RE.test(src);
}
