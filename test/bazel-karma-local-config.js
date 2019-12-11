/**
 * Karma configuration that is used by Bazel karma_web_test targets which do not
 * want to launch any browser and just enable manual browser debugging.
 */

module.exports = config => {
  const overwrites = {};

  // By default "@bazel/karma" configures Chrome as browser. Since we don't want
  // to launch any browser at all, we overwrite the "browsers" option. Since the
  // default config tries to extend the browsers array with "Chrome", we need to
  // always return a new empty array.
  Object.defineProperty(overwrites, 'browsers', {
    get: () => [],
    set: () => {},
    enumerable: true
  });

  // Ensures that tests start executing once browsers have been manually connected. We need
  // to use "defineProperty" because the default "@bazel/karma" config overwrites the option.
  Object.defineProperty(overwrites, 'autoWatch', {
    value: true,
    writable: false,
  });

  config.set(overwrites);
};
