let jitOptions = null;
export function setJitOptions(options) {
  if (jitOptions !== null) {
    if (options.defaultEncapsulation !== jitOptions.defaultEncapsulation) {
      ngDevMode &&
        console.error(
          'Provided value for `defaultEncapsulation` can not be changed once it has been set.',
        );
      return;
    }
    if (options.preserveWhitespaces !== jitOptions.preserveWhitespaces) {
      ngDevMode &&
        console.error(
          'Provided value for `preserveWhitespaces` can not be changed once it has been set.',
        );
      return;
    }
  }
  jitOptions = options;
}
export function getJitOptions() {
  return jitOptions;
}
export function resetJitOptions() {
  jitOptions = null;
}
//# sourceMappingURL=jit_options.js.map
