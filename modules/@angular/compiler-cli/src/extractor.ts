/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * Extract i18n messages from source code
 */
// Must be imported first, because angular2 decorators throws on load.
import 'reflect-metadata';

import * as compiler from '@angular/compiler';
import * as tsc from '@angular/tsc-wrapped';
import * as ts from 'typescript';

import {CompilerHost, ModuleResolutionHostAdapter} from './compiler_host';

export class Extractor {
  constructor(
      private ngExtractor: compiler.Extractor, private ngCompilerHost: CompilerHost,
      private program: ts.Program) {}

  extract(): Promise<compiler.MessageBundle> {
    return this.ngExtractor.extract(this.program.getSourceFiles().map(
        sf => this.ngCompilerHost.getCanonicalFileName(sf.fileName)));
  }

  static create(
      options: tsc.AngularCompilerOptions, translationsFormat: string, program: ts.Program,
      moduleResolverHost: ts.ModuleResolutionHost, ngCompilerHost?: CompilerHost): Extractor {
    if (!ngCompilerHost)
      ngCompilerHost =
          new CompilerHost(program, options, new ModuleResolutionHostAdapter(moduleResolverHost));
    const {extractor: ngExtractor} = compiler.Extractor.create(ngCompilerHost);
    return new Extractor(ngExtractor, ngCompilerHost, program);
  }
}
