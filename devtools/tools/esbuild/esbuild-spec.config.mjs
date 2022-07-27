/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import baseEsbuildConfig from './esbuild-base.config.mjs';

/**
 * Loads and creates the ESBuild linker plugin.
 *
 * The plugin is not loaded at top-level as not all spec bundle targets rely
 * on the linker and this would slow-down bundling.
 */
 async function fetchAndCreateLinkerEsbuildPlugin() {
  // Note: This needs to be a NPM module path as this ESBuild config is generated and can
  // end up in arbitrary Bazel packages or differently-named consumer workspaces.
  const {createLinkerEsbuildPlugin} = await import(
    '@angular/build-tooling/shared-scripts/angular-linker/esbuild-plugin.mjs'
  );

  return await createLinkerEsbuildPlugin(
    /.*/,
    /* ensureNoPartialDeclaration */ true,

    // DevTools relies on angular framework packages that are consumed,
    // locally via bazel. These packages have a version of 0.0.0-PLACEHOLDER.
    // DevTools also relies on Angular CDK and Material packages that are consumed via npm.
    // Because of this, we set unknownDeclarationVersionHandling to ignore so that we bypass
    // selecting a linker for our CDK and Material dependencies based on our local framework
    // version (0.0.0-PLACEHOLDER).
    // Instead this option defaults to the latest linker version, which should
    // be correct, except for the small time interval where we rollout a new
    // declaration version and target a Material release that hasn't been compiled
    // with that version yet
    { unknownDeclarationVersionHandling: 'ignore' }
  );
}

// Based on the Bazel action and its substitutions, we run the linker for all inputs.
const plugins = [await fetchAndCreateLinkerEsbuildPlugin()];

export default {
  ...baseEsbuildConfig,
  // Use the `iife` format for the test entry-point as tests should run immediately.
  // For browser tests which are wrapped in an AMD header and footer, this works as well.
  format: 'iife',
  plugins,
};
