/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
    delegate: H, syntheticIndex: {name: string, content: string, metadata: string}): H {
  const normalSyntheticIndexName = path.normalize(syntheticIndex.name);
  const indexContent = syntheticIndex.content;
  const indexMetadata = syntheticIndex.metadata;

  const newHost = Object.create(delegate);
  newHost.fileExists = (fileName: string): boolean => {
    return path.normalize(fileName) == normalSyntheticIndexName || delegate.fileExists(fileName);
  };

  newHost.readFile = (fileName: string) => {
    return path.normalize(fileName) == normalSyntheticIndexName ? indexContent :
                                                                  delegate.readFile(fileName);
  };

  newHost.getSourceFile =
      (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
        if (path.normalize(fileName) == normalSyntheticIndexName) {
          return ts.createSourceFile(fileName, indexContent, languageVersion, true);
        }
        return delegate.getSourceFile(fileName, languageVersion, onError);
      };

  newHost.writeFile =
      (fileName: string, data: string, writeByteOrderMark: boolean,
       onError: ((message: string) => void) | undefined,
       sourceFiles: Readonly<ts.SourceFile>[]) => {
        delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
        if (fileName.match(DTS) && sourceFiles && sourceFiles.length == 1 &&
            path.normalize(sourceFiles[0].fileName) == normalSyntheticIndexName) {
          // If we are writing the synthetic index, write the metadata along side.
          const metadataName = fileName.replace(DTS, '.metadata.json');
          fs.writeFileSync(metadataName, indexMetadata, {encoding: 'utf8'});
        }
      };
  return newHost;
}

export function createBundleIndexHost<H extends ts.CompilerHost>(
    ngOptions: CompilerOptions, rootFiles: ReadonlyArray<string>,
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

export function createCachedMetadataBundleIndexHost<H extends ts.CompilerHost>(
    ngOptions: CompilerOptions, rootFiles: ReadonlyArray<string>, host: H,
    cache: MetadataCache): {host: H, indexName?: string, errors?: ts.Diagnostic[]} {
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
  const bundler = new MetadataBundler(indexModule, ngOptions.flatModuleId, {
    getMetadataFor(moduleName: string) {
      const sourceFile = host.getSourceFile(moduleName + '.ts', ts.ScriptTarget.Latest);
      return sourceFile && cache.getMetadata(sourceFile);
    }
  });
  const metadataBundle = bundler.getMetadataBundle();
  const metadata = JSON.stringify(metadataBundle.metadata);
  const name =
      path.join(path.dirname(indexModule), ngOptions.flatModuleOutFile !.replace(JS_EXT, '.ts'));
  const libraryIndex = `./${path.basename(indexModule)}`;
  const content = privateEntriesToIndex(libraryIndex, metadataBundle.privates);
  const syntheticHost = createSyntheticIndexHost(host, {name, content, metadata});

  return {host: syntheticHost, indexName: name};
}