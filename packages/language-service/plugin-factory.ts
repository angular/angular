/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Note: use a type-only import to prevent TypeScript from being bundled in.
import type ts from 'typescript';

export const factory: ts.server.PluginModuleFactory = (mod) => {
  const {initialize}: {initialize: ts.server.PluginModuleFactory} = require(
    `@angular/language-service/bundles/language-service.js`,
  )(mod);

  return initialize(mod);
};
