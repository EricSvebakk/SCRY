
type validateOptions = {
  allowFloat?: boolean;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
};

export function validateNumber(value: string, options: validateOptions = {}): boolean {
  
  const { allowFloat = false, gt, gte, lt, lte } = options;

  // Trim whitespace
  const trimmed = value.trim();

  // Empty string is not a number
  if (trimmed === "") return false;

  // Try converting to a number
  const num = Number(trimmed);

  // Reject NaN or Infinity
  if (!Number.isFinite(num)) return false;

  // If floats aren't allowed, ensure it's an integer
  if (!allowFloat && !Number.isInteger(num)) return false;

  // Comparison checks
  if (typeof gt === "number" && !(num > gt)) return false;
  if (typeof gte === "number" && !(num >= gte)) return false;
  if (typeof lt === "number" && !(num < lt)) return false;
  if (typeof lte === "number" && !(num <= lte)) return false;

  // All checks passed
  return true;
}


export function toNumber(value: string, options: validateOptions = {}): number {
  if (!validateNumber(value, options)) {
    throw new Error(`Invalid numeric string: "${value}"`);
  }

  return Number(value.trim());
}