/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';
import {convertDecorators} from 'tsickle';
import * as ts from 'typescript';

import NgOptions from './options';
import {MetadataCollector} from './collector';


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

export class TsickleHost extends DelegatingHost {
  // Additional diagnostics gathered by pre- and post-emit transformations.
  public diagnostics: ts.Diagnostic[] = [];
  private TSICKLE_SUPPORT = `
interface DecoratorInvocation {
  type: Function;
  args?: any[];
}
`;
  constructor(delegate: ts.CompilerHost, private program: ts.Program) { super(delegate); }

  getSourceFile =
      (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
        const originalContent = this.delegate.readFile(fileName);
        let newContent = originalContent;
        if (!/\.d\.ts$/.test(fileName)) {
          try {
            const converted = convertDecorators(
                this.program.getTypeChecker(), this.program.getSourceFile(fileName));
            if (converted.diagnostics) {
              this.diagnostics.push(...converted.diagnostics);
            }
            newContent = converted.output + this.TSICKLE_SUPPORT;
          } catch (e) {
            console.error('Cannot convertDecorators on file', fileName);
            throw e;
          }
        }
        return ts.createSourceFile(fileName, newContent, languageVersion, true);
      };
}

const DTS_EXPR = /\.d\.ts$/;

export class MetadataWriterHost extends DelegatingHost {
  private metadataCollector = new MetadataCollector();
  constructor(delegate: ts.CompilerHost, program: ts.Program, private ngOptions: NgOptions) {
    super(delegate);
  }

  private writeMetadata(emitFilePath: string, sourceFile: ts.SourceFile) {
    const path = emitFilePath.replace(DTS_EXPR, '.metadata.json');
    const metadata =
        this.metadataCollector.getMetadata(sourceFile, !!this.ngOptions.strictMetadataEmit);
    if (metadata && metadata.metadata) {
      const metadataText = JSON.stringify(metadata);
      writeFileSync(path, metadataText, {encoding: 'utf-8'});
    }
  }

  writeFile: ts.WriteFileCallback =
      (fileName: string, data: string, writeByteOrderMark: boolean,
       onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
        if (DTS_EXPR.test(fileName)) {
          // Let the original file be written first; this takes care of creating parent directories
          this.delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);

          // Write the metadata file alongside type definitions
          this.writeMetadata(fileName, sourceFiles[0]);
        }
      };
}
