
export default function formatFileSize(value: number) {
  if (value === 0) {
    return "0   B";
  }

  const suffixes = ["KB", "MB", "GB"];

  const ceilLogSize = Math.ceil(Math.log10(value) / 4);
  const fileSize = value * (1 / 1024) ** ceilLogSize;
  const fileSizeResult = fileSize.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return fileSizeResult + " " + suffixes[ceilLogSize - 1];
}