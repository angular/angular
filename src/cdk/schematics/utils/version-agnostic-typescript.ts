/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This is just a type import and won't be generated in the release output.
 *
 * Note that we always need to adjust this type import based on the location of the Typescript
 * dependency that will be shipped with `@schematics/angular`.
 */
import typescript = require('typescript');
import {SchematicsException} from '@angular-devkit/schematics';

/**
 * This is an agnostic re-export of TypeScript. Depending on the context, this module file will
 * return the TypeScript version that is being shipped within the `@schematics/angular` package,
 * or fall back to the TypeScript version that has been flattened in the node modules.
 *
 * This is necessary because we parse TypeScript files and pass the resolved AST to the
 * `@schematics/angular` package which might have a different TypeScript version installed.
 */
let ts: typeof typescript;

try {
  ts = require('@schematics/angular/node_modules/typescript');
} catch {
  try {
    ts = require('typescript');
  } catch {
    throw new SchematicsException('Error: Could not find a TypeScript version for the ' +
      'schematics. Please report an issue on the Angular Material repository.');
  }
}

export {ts};
