/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BabelFile, types as t } from '@babel/core';

/**
 * Augment some Babel types to add symbols that we rely on, but are not included in the Babel typings.
 */

declare module '@babel/traverse' {
  interface Hub {
    file: BabelFile;
  }
}

declare module '@babel/core' {
  interface BabelFile {
    buildCodeFrameError(node: t.Node, message: string): Error;
  }
}

// The following modules are declared to work around a limitation in tsc_wrapped's `strict_deps`
// check. Since Babel uses scoped packages, the corresponding lookup for declaration files in the
// `node_modules/@types/` directory follows a special strategy: the `@types` package has to be
// named `{scope}__{package}`, e.g. `@types/babel__generator`. When `tsc` performs module
// resolution for the `@babel/generator` module specifier, it will first try the `paths` mappings
// but resolution through path mappings does _not_ apply this special naming convention rule for
// `@types` packages, `tsc` only applies that rule in its `@types` resolution step. Consequently,
// the path mapping into Bazel's private `node_modules` directory fails to resolve, causing `tsc`
// to find the nearest `node_modules` directory in an ancestor directory of the origin source
// file. This finds the `node_modules` directory in the workspace, _not_ Bazel's private copy of
// `node_modules` and therefore the `@types` end up being resolved from a `node_modules` tree
// that is not governed by Bazel, and therefore not expected by the `strict_deps` rule.
// Declaring the modules here allows `strict_deps` to always find a declaration of the modules
// in an input file to the compilation, therefore accepting the module import.
declare module '@babel/generator' {}
declare module '@babel/template' {}
declare module '@babel/parser' {}
