/** Checks whether the specified value matches the given pattern. */
export function matchesPattern(value: string, pattern: RegExp|string): boolean {
  return typeof pattern === 'string' ? value === pattern : pattern.test(value);
}
