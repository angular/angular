/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Karma configuration that is used by Bazel karma_web_test targets which do not
 * want to launch any browser and just enable manual browser debugging.
 */

module.exports = config => {
  const overwrites = {};

  // By default "@bazel/concatjs" configures Chrome as browser. Since we don't want
  // to launch any browser at all, we overwrite the "browsers" option. Since the
  // default config tries to extend the browsers array with "Chrome", we need to
  // always return a new empty array.
  Object.defineProperty(overwrites, 'browsers', {
    get: () => [],
    set: () => {},
    enumerable: true,
  });

  // Ensures that tests start executing once browsers have been manually connected. We need
  // to use "defineProperty" because the default "@bazel/concatjs" config overwrites the option.
  Object.defineProperty(overwrites, 'autoWatch', {
    get: () => true,
    set: () => {},
    enumerable: true,
  });

  // When not running with ibazel, do not set up the `@bazel/concatjs` watcher. This one
  // relies on ibazel to write to the `stdin` interface. When running without ibazel, the
  // watcher will kill concatjs since there is no data written to the `stdin` interface.
  if (process.env['IBAZEL_NOTIFY_CHANGES'] !== 'y') {
    // We pre-define a plugins array that captures registration of Karma plugins
    // and unsets the watcher definitions so that no watcher can be configured.
    overwrites.plugins = new KarmaPluginArrayWithoutWatchers();
  }

  config.set(overwrites);
};

class KarmaPluginArrayWithoutWatchers extends Array {
  // The Bazel Karma rules only register new plugins using `.push`.
  push(...plugins) {
    plugins.filter(p => typeof p === 'object').forEach(p => delete p.watcher);

    super.push(...plugins);
  }
}
