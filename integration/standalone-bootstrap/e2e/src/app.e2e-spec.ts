/**
 * Note: this file contains no e2e tests, since they rely on Protractor,
 * which requires Testability. Testability is not included by default when
 * the `bootstrapApplication` function is used (which is the case in this app).
 * We use this app primarily to measure payload size, so we want to keep
 * Testability excluded.
 */
describe('Standalone Bootstrap app', () => {
  // Jasmine will throw if there are no tests.
  it('should pass', () => {});
});
