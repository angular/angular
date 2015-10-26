/**
 * Tries to decode the URI component without throwing an exception.
 */
export function tryDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    // Ignore any invalid uri component
  }
}