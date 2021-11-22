/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Custom resolution plugin for Webpack's `resolve-enhanced` package that is used by
 * Madge for resolving imports. The plugin extends the resolution by leveraging the
 * runfile resolution and module mappings handled in the module info aspect.
 */
class BazelRunfileResolutionPlugin {
  apply(resolver) {
    resolver.plugin('module', (request, callback) => {
      try {
        // Resolve the module through the `require.resolve` method which has been patched
        // in the Bazel NodeJS loader to respect runfiles and module mappings. This allows
        // Madge to handle module mappings specified in `ts_library` and `ng_module` targets.
        const resolvedPath = require.resolve(request.request);
        // Update the request to refer to the runfile resolved file path.
        resolver.doResolve('resolve', {...request, request: resolvedPath}, null, callback, true);
        return;
      } catch {
      }
      // If the file could not be resolved through Bazel's runfile resolution, proceed
      // with the default module resolvers.
      callback();
    });
  }
}

// Configures a plugin which ensures that Madge can properly resolve specified
// dependencies through their configured module names.
module.exports = {
  resolve: {plugins: [new BazelRunfileResolutionPlugin()]}
};
