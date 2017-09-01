/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {CompilerHostAdapter, MetadataBundler} from './bundler';
import {CliOptions} from './cli_options';
import {createSyntheticIndexHost} from './compiler_host';
import {privateEntriesToIndex} from './index_writer';
import NgOptions from './options';

export {UserError} from './tsc';

export interface CodegenExtension {
  /**
   * Returns the generated file names.
   */
  (ngOptions: NgOptions, cliOptions: CliOptions, program: ts.Program,
   host: ts.CompilerHost): Promise<string[]>;
}

const DTS = /\.d\.ts$/;
const JS_EXT = /(\.js|)$/;

export function createBundleIndexHost<H extends ts.CompilerHost>(
    ngOptions: NgOptions, rootFiles: string[],
    host: H): {host: H, indexName?: string, errors?: ts.Diagnostic[]} {
  const files = rootFiles.filter(f => !DTS.test(f));
  if (files.length != 1) {
    return {
      host,
      errors: [{
        file: null as any as ts.SourceFile,
        start: null as any as number,
        length: null as any as number,
        messageText:
            'Angular compiler option "flatModuleIndex" requires one and only one .ts file in the "files" field.',
        category: ts.DiagnosticCategory.Error,
        code: 0
      }]
    };
  }
  const file = files[0];
  const indexModule = file.replace(/\.ts$/, '');
  const bundler =
      new MetadataBundler(indexModule, ngOptions.flatModuleId, new CompilerHostAdapter(host));
  const metadataBundle = bundler.getMetadataBundle();
  const metadata = JSON.stringify(metadataBundle.metadata);
  const name =
      path.join(path.dirname(indexModule), ngOptions.flatModuleOutFile !.replace(JS_EXT, '.ts'));
  const libraryIndex = `./${path.basename(indexModule)}`;
  const content = privateEntriesToIndex(libraryIndex, metadataBundle.privates);
  host = createSyntheticIndexHost(host, {name, content, metadata});
  return {host, indexName: name};
}