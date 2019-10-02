/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompiler} from '@angular/compiler';
import {CompilerHost, createProgram, readConfiguration} from '@angular/compiler-cli';
import * as ts from 'typescript';

/** Creates an NGC program that can be used to read and parse metadata for files. */
export function createNgcProgram(
    createHost: (options: ts.CompilerOptions) => CompilerHost, tsconfigPath: string) {
  const {rootNames, options} = readConfiguration(tsconfigPath);

  // https://github.com/angular/angular/commit/ec4381dd401f03bded652665b047b6b90f2b425f made Ivy
  // the default. This breaks the assumption that "createProgram" from compiler-cli returns the
  // NGC program. In order to ensure that the migration runs properly, we set "enableIvy" to false.
  options.enableIvy = false;

  const host = createHost(options);

  // For this migration, we never need to read resources and can just return
  // an empty string for requested resources. We need to handle requested resources
  // because our created NGC compiler program does not know about special resolutions
  // which are set up by the Angular CLI. i.e. resolving stylesheets through "tilde".
  host.readResource = () => '';
  host.resourceNameToFileName = () => '$fake-file$';

  const ngcProgram = createProgram({rootNames, options, host});

  // The "AngularCompilerProgram" does not expose the "AotCompiler" instance, nor does it
  // expose the logic that is necessary to analyze the determined modules. We work around
  // this by just accessing the necessary private properties using the bracket notation.
  const compiler: AotCompiler = (ngcProgram as any)['compiler'];
  const program = ngcProgram.getTsProgram();

  return {host, ngcProgram, program, compiler};
}
