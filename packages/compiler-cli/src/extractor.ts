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
// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import * as compiler from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import {CompilerHost, CompilerHostContext, ModuleResolutionHostAdapter} from './compiler_host';
import {PathMappedCompilerHost} from './path_mapped_compiler_host';
import {CompilerOptions} from './transformers/api';
import {i18nExtract, i18nGetExtension, i18nSerialize} from './transformers/program';

export class Extractor {
  constructor(
      private options: CompilerOptions, private ngExtractor: compiler.Extractor,
      public host: ts.CompilerHost, private ngCompilerHost: CompilerHost,
      private program: ts.Program) {}

  extract(formatName: string, outFile: string|null): Promise<string[]> {
    return this.extractBundle().then(
        bundle => i18nExtract(formatName, outFile, this.host, this.options, bundle));
  }

  extractBundle(): Promise<compiler.MessageBundle> {
    const files = this.program.getSourceFiles().map(
        sf => this.ngCompilerHost.getCanonicalFileName(sf.fileName));

    return this.ngExtractor.extract(files);
  }

  serialize(bundle: compiler.MessageBundle, formatName: string): string {
    return i18nSerialize(bundle, formatName, this.options);
  }

  getExtension(formatName: string): string { return i18nGetExtension(formatName); }

  static create(
      options: CompilerOptions, program: ts.Program, tsCompilerHost: ts.CompilerHost,
      locale?: string|null, compilerHostContext?: CompilerHostContext,
      ngCompilerHost?: CompilerHost): Extractor {
    if (!ngCompilerHost) {
      const usePathMapping = !!options.rootDirs && options.rootDirs.length > 0;
      const context = compilerHostContext || new ModuleResolutionHostAdapter(tsCompilerHost);
      ngCompilerHost = usePathMapping ? new PathMappedCompilerHost(program, options, context) :
                                        new CompilerHost(program, options, context);
    }

    const {extractor: ngExtractor} = compiler.Extractor.create(ngCompilerHost, locale || null);

    return new Extractor(options, ngExtractor, tsCompilerHost, ngCompilerHost, program);
  }
}
