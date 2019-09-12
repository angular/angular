/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {findFlatIndexEntryPoint} from '../ngtsc/entry_point';
import {AbsoluteFsPath} from '../ngtsc/file_system';
import {getRootDirs} from '../ngtsc/util/src/typescript';
import {CompilerOptions} from '../transformers/api';
import {MetadataCache} from '../transformers/metadata_cache';
import {createDiagnostic} from '../transformers/util';

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
       onError: ((message: string) => void) | undefined,
       sourceFiles: Readonly<ts.SourceFile>[]) => {
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
  const files = rootFiles.filter(f => !DTS.test(f)) as AbsoluteFsPath[];
  const flatModuleEntryPoint = ngOptions._flatModuleEntryPoint;
  const indexFile: string|null = flatModuleEntryPoint ?
      findFlatIndexEntryPoint(files, getRootDirs(host, ngOptions), flatModuleEntryPoint) :
      findFlatIndexEntryPoint(files);

  if (indexFile === null) {
    return {
      host,
      errors: [
        flatModuleEntryPoint ?
            createDiagnostic(
                'Could not find specified flat module entry-point.', ts.DiagnosticCategory.Error) :
            createDiagnostic(
                'Angular compiler option "flatModuleIndex" requires one and only one .ts file in the "files" field.',
                ts.DiagnosticCategory.Error)
      ]
    };
  }

  const indexModule = indexFile.replace(/\.ts$/, '');

  // The operation of producing a metadata bundle happens twice - once during setup and once during
  // the emit phase. The first time, the bundle is produced without a metadata cache, to compute the
  // contents of the flat module index. The bundle produced during emit does use the metadata cache
  // with associated transforms, so the metadata will have lowered expressions, resource inlining,
  // etc.
  const getMetadataBundle = (cache: MetadataCache | null) => {
    const bundler = new MetadataBundler(
        indexModule, ngOptions.flatModuleId, new CompilerHostAdapter(host, cache, ngOptions),
        ngOptions.flatModulePrivateSymbolPrefix);
    return bundler.getMetadataBundle();
  };

  // First, produce the bundle with no MetadataCache.
  const metadataBundle = getMetadataBundle(/* MetadataCache */ null);
  const name =
      path.join(path.dirname(indexModule), ngOptions.flatModuleOutFile !.replace(JS_EXT, '.ts'));
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
