/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompiler, CompileStylesheetMetadata} from '@angular/compiler';
import {createProgram, readConfiguration} from '@angular/compiler-cli';
import * as ts from 'typescript';

/** Creates an NGC program that can be used to read and parse metadata for files. */
export function createNgcProgram(
    createHost: (options: ts.CompilerOptions) => ts.CompilerHost, tsconfigPath: string) {
  const {rootNames, options} = readConfiguration(tsconfigPath);

  // https://github.com/angular/angular/commit/ec4381dd401f03bded652665b047b6b90f2b425f made Ivy
  // the default. This breaks the assumption that "createProgram" from compiler-cli returns the
  // NGC program. In order to ensure that the migration runs properly, we set "enableIvy" to false.
  options.enableIvy = false;

  const host = createHost(options);
  const ngcProgram = createProgram({rootNames, options, host});
  const program = ngcProgram.getTsProgram();

  // The "AngularCompilerProgram" does not expose the "AotCompiler" instance, nor does it
  // expose the logic that is necessary to analyze the determined modules. We work around
  // this by just accessing the necessary private properties using the bracket notation.
  const compiler: AotCompiler = (ngcProgram as any)['compiler'];
  const metadataResolver = compiler['_metadataResolver'];
  // Modify the "DirectiveNormalizer" to not normalize any referenced external stylesheets.
  // This is necessary because in CLI projects preprocessor files are commonly referenced
  // and we don't want to parse them in order to extract relative style references. This
  // breaks the analysis of the project because we instantiate a standalone AOT compiler
  // program which does not contain the custom logic by the Angular CLI Webpack compiler plugin.
  const directiveNormalizer = metadataResolver !['_directiveNormalizer'];
  directiveNormalizer['_normalizeStylesheet'] = function(metadata: CompileStylesheetMetadata) {
    return new CompileStylesheetMetadata(
        {styles: metadata.styles, styleUrls: [], moduleUrl: metadata.moduleUrl !});
  };

  return {host, ngcProgram, program, compiler};
}
