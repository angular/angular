export function setupNodeEnv(): void {
  // Change default symbol prefix for testing to ensure no hard-coded references.
  (global as any)['__Zone_symbol_prefix'] = '__zone_symbol_test__';
  (global as any)['__zone_symbol_test__DISABLE_WRAPPING_UNCAUGHT_PROMISE_REJECTION'] = false;
}
