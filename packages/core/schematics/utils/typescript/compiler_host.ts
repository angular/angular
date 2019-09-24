/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Tree} from '@angular-devkit/schematics';
import {CompilerHost, createCompilerHost} from '@angular/compiler-cli';
import {relative} from 'path';
import * as ts from 'typescript';

export function createMigrationCompilerHost(
    tree: Tree, options: ts.CompilerOptions, basePath: string): CompilerHost {
  const host = createCompilerHost({options});

  // We need to overwrite the host "readFile" method, as we want the TypeScript
  // program to be based on the file contents in the virtual file tree. Otherwise
  // if we run the migration for multiple tsconfig files which have intersecting
  // source files, it can end up updating query definitions multiple times.
  host.readFile = fileName => {
    const buffer = tree.read(relative(basePath, fileName));
    // Strip BOM as otherwise TSC methods (Ex: getWidth) will return an offset which
    // which breaks the CLI UpdateRecorder.
    // See: https://github.com/angular/angular/pull/30719
    return buffer ? buffer.toString().replace(/^\uFEFF/, '') : undefined;
  };

  return host;
}
