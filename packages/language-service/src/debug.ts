// Simple verbose debug helper for the embedded language-service plugin
// Prefer a server-set flag that indicates verbose logging was enabled via the client
// (e.g. VS Code settings such as "angular.log" or "angular.trace.server") and fall
// back to the legacy env var `NG_VERBOSE_LOGS` for developer convenience.
export function isVerboseLogging(): boolean {
  try {
    // Prefer explicit signal set by the language server when the extension settings enable verbose logging
    if (process.env['NG_VERBOSE_FROM_CLIENT'] === 'true') return true;
    // Fall back to legacy developer env var
    return process.env['NG_VERBOSE_LOGS'] === 'true';
  } catch {
    return false;
  }
}

export function debugLog(message: string): void {
  if (!isVerboseLogging()) return;
  // Prefix so it's obvious in logs
  try {
    console.log(`[NG-VERBOSE] ${message}`);
  } catch {
    // Best effort
  }
}
