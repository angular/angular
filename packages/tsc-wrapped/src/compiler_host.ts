/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';
import {normalize} from 'path';
import * as ts from 'typescript';

import NgOptions from './options';
import {MetadataCollector} from './collector';
import {ModuleMetadata} from './schema';

export function formatDiagnostics(d: ts.Diagnostic[]): string {
  const host: ts.FormatDiagnosticsHost = {
    getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
    getNewLine: () => ts.sys.newLine,
    getCanonicalFileName: (f: string) => f
  };
  return ts.formatDiagnostics(d, host);
}

/**
 * Implementation of CompilerHost that forwards all methods to another instance.
 * Useful for partial implementations to override only methods they care about.
 */
export abstract class DelegatingHost implements ts.CompilerHost {
  constructor(protected delegate: ts.CompilerHost) {}
  getSourceFile =
      (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) =>
          this.delegate.getSourceFile(fileName, languageVersion, onError);

  getCancellationToken = () => this.delegate.getCancellationToken();
  getDefaultLibFileName = (options: ts.CompilerOptions) =>
      this.delegate.getDefaultLibFileName(options);
  getDefaultLibLocation = () => this.delegate.getDefaultLibLocation();
  writeFile: ts.WriteFileCallback = this.delegate.writeFile;
  getCurrentDirectory = () => this.delegate.getCurrentDirectory();
  getDirectories = (path: string): string[] =>
      (this.delegate as any).getDirectories?(this.delegate as any).getDirectories(path): [];
  getCanonicalFileName = (fileName: string) => this.delegate.getCanonicalFileName(fileName);
  useCaseSensitiveFileNames = () => this.delegate.useCaseSensitiveFileNames();
  getNewLine = () => this.delegate.getNewLine();
  fileExists = (fileName: string) => this.delegate.fileExists(fileName);
  readFile = (fileName: string) => this.delegate.readFile(fileName);
  trace = (s: string) => this.delegate.trace(s);
  directoryExists = (directoryName: string) => this.delegate.directoryExists(directoryName);
}

const IGNORED_FILES = /\.ngfactory\.js$|\.ngstyle\.js$/;
const DTS = /\.d\.ts$/;

export class MetadataWriterHost extends DelegatingHost {
  private metadataCollector = new MetadataCollector({quotedNames: true});
  private metadataCollector1 = new MetadataCollector({version: 1});
  constructor(
      delegate: ts.CompilerHost, private ngOptions: NgOptions, private emitAllFiles: boolean) {
    super(delegate);
  }

  private writeMetadata(emitFilePath: string, sourceFile: ts.SourceFile) {
    // TODO: replace with DTS filePath when https://github.com/Microsoft/TypeScript/pull/8412 is
    // released
    if (/*DTS*/ /\.js$/.test(emitFilePath)) {
      const path = emitFilePath.replace(/*DTS*/ /\.js$/, '.metadata.json');

      // Beginning with 2.1, TypeScript transforms the source tree before emitting it.
      // We need the original, unmodified, tree which might be several levels back
      // depending on the number of transforms performed. All SourceFile's prior to 2.1
      // will appear to be the original source since they didn't include an original field.
      let collectableFile = sourceFile;
      while ((collectableFile as any).original) {
        collectableFile = (collectableFile as any).original;
      }

      const metadata =
          this.metadataCollector.getMetadata(collectableFile, !!this.ngOptions.strictMetadataEmit);
      const metadata1 = this.metadataCollector1.getMetadata(collectableFile, false);
      const metadatas: ModuleMetadata[] = [metadata, metadata1].filter(e => !!e);
      if (metadatas.length) {
        const metadataText = JSON.stringify(metadatas);
        writeFileSync(path, metadataText, {encoding: 'utf-8'});
      }
    }
  }

  writeFile: ts.WriteFileCallback =
      (fileName: string, data: string, writeByteOrderMark: boolean,
       onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
        const isDts = /\.d\.ts$/.test(fileName);
        if (this.emitAllFiles || isDts) {
          // Let the original file be written first; this takes care of creating parent directories
          this.delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
        }
        if (isDts) {
          // TODO: remove this early return after https://github.com/Microsoft/TypeScript/pull/8412
          // is released
          return;
        }

        if (IGNORED_FILES.test(fileName)) {
          return;
        }

        if (!sourceFiles) {
          throw new Error(
              'Metadata emit requires the sourceFiles are passed to WriteFileCallback. ' +
              'Update to TypeScript ^1.9.0-dev');
        }
        if (sourceFiles.length > 1) {
          throw new Error('Bundled emit with --out is not supported');
        }
        if (!this.ngOptions.skipMetadataEmit && !this.ngOptions.flatModuleOutFile) {
          this.writeMetadata(fileName, sourceFiles[0]);
        }
      }
}

export class SyntheticIndexHost extends DelegatingHost {
  private normalSyntheticIndexName: string;
  private indexContent: string;
  private indexMetadata: string;

  constructor(
      delegate: ts.CompilerHost,
      syntheticIndex: {name: string, content: string, metadata: string}) {
    super(delegate);
    this.normalSyntheticIndexName = normalize(syntheticIndex.name);
    this.indexContent = syntheticIndex.content;
    this.indexMetadata = syntheticIndex.metadata;
  }

  fileExists = (fileName: string):
      boolean => {
        return normalize(fileName) == this.normalSyntheticIndexName ||
            this.delegate.fileExists(fileName);
      }

  readFile =
      (fileName: string) => {
        return normalize(fileName) == this.normalSyntheticIndexName ?
            this.indexContent :
            this.delegate.readFile(fileName);
      }

  getSourceFile =
      (fileName: string, languageVersion: ts.ScriptTarget,
       onError?: (message: string) => void) => {
        if (normalize(fileName) == this.normalSyntheticIndexName) {
          return ts.createSourceFile(fileName, this.indexContent, languageVersion, true);
        }
        return this.delegate.getSourceFile(fileName, languageVersion, onError);
      }

                                               writeFile: ts.WriteFileCallback =
          (fileName: string, data: string, writeByteOrderMark: boolean,
           onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
            this.delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
            if (fileName.match(DTS) && sourceFiles && sourceFiles.length == 1 &&
                normalize(sourceFiles[0].fileName) == this.normalSyntheticIndexName) {
              // If we are writing the synthetic index, write the metadata along side.
              const metadataName = fileName.replace(DTS, '.metadata.json');
              writeFileSync(metadataName, this.indexMetadata, 'utf8');
            }
          }
}