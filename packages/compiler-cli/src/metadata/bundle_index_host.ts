/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {CompilerOptions} from '../transformers/api';
import {MetadataCache} from '../transformers/metadata_cache';

import {CompilerHostAdapter, MetadataBundler} from './bundler';
import {privateEntriesToIndex} from './index_writer';

const DTS = /\.d\.ts$/;
const JS_EXT = /(\.js|)$/;

function createSyntheticIndexHost<H extends ts.CompilerHost>(
    delegate: H, syntheticIndex: {name: string, content: string, getMetadata: () => string}): H {
  const normalSyntheticIndexName = path.normalize(syntheticIndex.name);

  const newHost = Object.create(delegate);
  newHost.fileExists = (fileName: string): boolean => {
    return path.normalize(fileName) == normalSyntheticIndexName || delegate.fileExists(fileName);
  };

  newHost.readFile = (fileName: string) => {
    return path.normalize(fileName) == normalSyntheticIndexName ? syntheticIndex.content :
                                                                  delegate.readFile(fileName);
  };

  newHost.getSourceFile =
      (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
        if (path.normalize(fileName) == normalSyntheticIndexName) {
          const sf = ts.createSourceFile(fileName, syntheticIndex.content, languageVersion, true);
          if ((delegate as any).fileNameToModuleName) {
            sf.moduleName = (delegate as any).fileNameToModuleName(fileName);
          }
          return sf;
        }
        return delegate.getSourceFile(fileName, languageVersion, onError);
      };

  newHost.writeFile =
      (fileName: string, data: string, writeByteOrderMark: boolean,
       onError: ((message: string) => void)|undefined, sourceFiles: Readonly<ts.SourceFile>[]) => {
        delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
        if (fileName.match(DTS) && sourceFiles && sourceFiles.length == 1 &&
            path.normalize(sourceFiles[0].fileName) === normalSyntheticIndexName) {
          // If we are writing the synthetic index, write the metadata along side.
          const metadataName = fileName.replace(DTS, '.metadata.json');
          const indexMetadata = syntheticIndex.getMetadata();
          delegate.writeFile(metadataName, indexMetadata, writeByteOrderMark, onError, []);
        }
      };
  return newHost;
}

export function createBundleIndexHost<H extends ts.CompilerHost>(
    ngOptions: CompilerOptions, rootFiles: ReadonlyArray<string>, host: H,
    getMetadataCache: () =>
        MetadataCache): {host: H, indexName?: string, errors?: ts.Diagnostic[]} {
  const files = rootFiles.filter(f => !DTS.test(f));
  let indexFile: string|undefined;
  if (files.length === 1) {
    indexFile = files[0];
  } else {
    for (const f of files) {
      // Assume the shortest file path called index.ts is the entry point. Note that we
      // need to use the posix path delimiter here because TypeScript internally only
      // passes posix paths.
      if (f.endsWith('/index.ts')) {
        if (!indexFile || indexFile.length > f.length) {
          indexFile = f;
        }
      }
    }
  }
  if (!indexFile) {
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

  const indexModule = indexFile.replace(/\.ts$/, '');

  // The operation of producing a metadata bundle happens twice - once during setup and once during
  // the emit phase. The first time, the bundle is produced without a metadata cache, to compute the
  // contents of the flat module index. The bundle produced during emit does use the metadata cache
  // with associated transforms, so the metadata will have lowered expressions, resource inlining,
  // etc.
  const getMetadataBundle = (cache: MetadataCache|null) => {
    const bundler = new MetadataBundler(
        indexModule, ngOptions.flatModuleId, new CompilerHostAdapter(host, cache, ngOptions),
        ngOptions.flatModulePrivateSymbolPrefix);
    return bundler.getMetadataBundle();
  };

  // First, produce the bundle with no MetadataCache.
  const metadataBundle = getMetadataBundle(/* MetadataCache */ null);
  const name =
      path.join(path.dirname(indexModule), ngOptions.flatModuleOutFile!.replace(JS_EXT, '.ts'));
  const libraryIndex = `./${path.basename(indexModule)}`;
  const content = privateEntriesToIndex(libraryIndex, metadataBundle.privates);

  host = createSyntheticIndexHost(host, {
    name,
    content,
    getMetadata: () => {
      // The second metadata bundle production happens on-demand, and uses the getMetadataCache
      // closure to retrieve an up-to-date MetadataCache which is configured with whatever metadata
      // transforms were used to produce the JS output.
      const metadataBundle = getMetadataBundle(getMetadataCache());
      return JSON.stringify(metadataBundle.metadata);
    }
  });
  return {host, indexName: name};
}
