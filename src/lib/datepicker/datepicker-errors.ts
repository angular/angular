/** @docs-private */
export function createMissingDateImplError(provider: string) {
  return new Error(
      `MdDatepicker: No provider found for ${provider}. You must import one of the following` +
      `modules at your application root: MdNativeDateModule, or provide a custom implementation.`);
}
