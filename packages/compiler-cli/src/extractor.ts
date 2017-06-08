/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import * as compiler from '@angular/compiler';
import {I18nVersion} from '@angular/core';
import * as tsc from '@angular/tsc-wrapped';
import * as path from 'path';
import * as ts from 'typescript';

import {CompilerHost, CompilerHostContext, ModuleResolutionHostAdapter} from './compiler_host';
import {PathMappedCompilerHost} from './path_mapped_compiler_host';

/**
 * Extract i18n messages from the Angular templates
 */
export class Extractor {
  constructor(
      private version: I18nVersion, private options: tsc.AngularCompilerOptions,
      private ngExtractor: compiler.Extractor, public host: ts.CompilerHost,
      private ngCompilerHost: CompilerHost, private program: ts.Program) {}

  extract(formatName: string, outFile: string|null): Promise<string[]> {
    // Checks the format and returns the extension
    const ext = this.getExtension(formatName);


    return this.extractBundle().then(bundle => {
      const serializer = compiler.createSerializer(formatName, this.version);
      const content = this.serialize(bundle, serializer);
      const dstFile = outFile || `messages.${ext}`;
      const dstPath = path.join(this.options.genDir, dstFile);
      this.host.writeFile(dstPath, content, false);
      return [dstPath];
    });
  }

  extractBundle(): Promise<compiler.MessageBundle> {
    const files = this.program.getSourceFiles().map(
        sf => this.ngCompilerHost.getCanonicalFileName(sf.fileName));

    return this.ngExtractor.extract(files);
  }

  serialize(bundle: compiler.MessageBundle, serializer: compiler.Serializer): string {
    return bundle.write(
        serializer, (sourcePath: string) => this.options.basePath ?
            path.relative(this.options.basePath, sourcePath) :
            sourcePath);
  }

  getExtension(formatName: string): string {
    const format = (formatName || 'xlf').toLowerCase();

    switch (format) {
      case 'xmb':
        return 'xmb';
      case 'xlf':
      case 'xlif':
      case 'xliff':
      case 'xlf2':
      case 'xliff2':
        return 'xlf';
    }

    throw new Error(`Unsupported format "${formatName}"`);
  }

  static create(
      version: I18nVersion, options: tsc.AngularCompilerOptions, program: ts.Program,
      tsCompilerHost: ts.CompilerHost, locale?: string|null,
      compilerHostContext?: CompilerHostContext, ngCompilerHost?: CompilerHost): Extractor {
    if (!ngCompilerHost) {
      const usePathMapping = !!options.rootDirs && options.rootDirs.length > 0;
      const context = compilerHostContext || new ModuleResolutionHostAdapter(tsCompilerHost);
      ngCompilerHost = usePathMapping ? new PathMappedCompilerHost(program, options, context) :
                                        new CompilerHost(program, options, context);
    }

    const {extractor} = compiler.Extractor.create(version, ngCompilerHost, locale || null);

    return new Extractor(version, options, extractor, tsCompilerHost, ngCompilerHost, program);
  }
}
