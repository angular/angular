/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './utils';
export * from './ng-update/public-api';
export * from './update-tool/public-api';

// Re-exported so that Angular Material schematic code can consume the same AST utils as the CDK.
export * from '@schematics/angular/utility/ast-utils';
export * from '@schematics/angular/utility/ng-ast-utils';

// Re-export parse5 from the CDK. Material schematics code cannot simply import
// "parse5" because it could result in a different version. As long as we import
// it from within the CDK, it will always be the correct version that is specified
// in the CDK "package.json" as optional dependency.
import * as parse5 from 'parse5';
export {parse5};
