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
import * as path from 'path';
import * as ts from 'typescript';

import {CompilerHost, CompilerHostContext, ModuleResolutionHostAdapter} from './compiler_host';
import {PathMappedCompilerHost} from './path_mapped_compiler_host';
import {getI18nSerializer} from './utils';

export class Extractor {
  constructor(
      private options: tsc.AngularCompilerOptions, private ngExtractor: compiler.Extractor,
      public host: ts.CompilerHost, private ngCompilerHost: CompilerHost,
      private program: ts.Program) {}

  extract(formatName: string, serializerPath: string): Promise<void> {
    // Checks the arguments first
    this.checkArguments(formatName, serializerPath);

    const promiseBundle = this.extractBundle();

    return promiseBundle.then(bundle => {
      const serializer = this.getSerializer(formatName, serializerPath);
      const content = this.serialize(bundle, serializer);
      const dstPath = path.join(this.options.genDir, `messages.${serializer.getExtension()}`);
      this.host.writeFile(dstPath, content, false);
    });
  }

  extractBundle(): Promise<compiler.MessageBundle> {
    const files = this.program.getSourceFiles().map(
        sf => this.ngCompilerHost.getCanonicalFileName(sf.fileName));

    return this.ngExtractor.extract(files);
  }

  getSerializer(ext: string, serializerPath: string): compiler.Serializer {
    let serializer: compiler.Serializer;

    if (serializerPath) {
      serializer = getI18nSerializer(serializerPath);
    } else {
      switch (ext) {
        case 'xmb':
          serializer = new compiler.Xmb();
          break;
        case 'xlf':
        case 'xlif':
        default:
          serializer = new compiler.Xliff();
      }
    }
    return serializer;
  }

  serialize(bundle: compiler.MessageBundle, serializer: compiler.Serializer): string {
    return bundle.write(serializer);
  }

  checkArguments(formatName: string, serializerPath: string) {
    if (!serializerPath) {
      if (formatName && ['xmb', 'xlf', 'xlif'].indexOf(formatName) == -1) {
        throw new Error('Unsupported format "${formatName}"');
      }
    }
  }

  static create(
      options: tsc.AngularCompilerOptions, program: ts.Program, tsCompilerHost: ts.CompilerHost,
      compilerHostContext?: CompilerHostContext, ngCompilerHost?: CompilerHost): Extractor {
    if (!ngCompilerHost) {
      const usePathMapping = !!options.rootDirs && options.rootDirs.length > 0;
      const context = compilerHostContext || new ModuleResolutionHostAdapter(tsCompilerHost);
      ngCompilerHost = usePathMapping ? new PathMappedCompilerHost(program, options, context) :
                                        new CompilerHost(program, options, context);
    }

    const {extractor: ngExtractor} = compiler.Extractor.create(ngCompilerHost);

    return new Extractor(options, ngExtractor, tsCompilerHost, ngCompilerHost, program);
  }
}
