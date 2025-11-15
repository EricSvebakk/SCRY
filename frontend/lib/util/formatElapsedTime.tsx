
export function formatElapsed(seconds: number): string {
  const totalSeconds = Math.round(seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}