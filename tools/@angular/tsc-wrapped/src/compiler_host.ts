/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';
import * as tsickle from 'tsickle';
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

export class DecoratorDownlevelCompilerHost extends DelegatingHost {
  private ANNOTATION_SUPPORT = `
interface DecoratorInvocation {
  type: Function;
  args?: any[];
}
`;
  /** Error messages produced by tsickle, if any. */
  public diagnostics: ts.Diagnostic[] = [];

  constructor(delegate: ts.CompilerHost, private program: ts.Program) { super(delegate); }

  getSourceFile =
      (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
        const originalContent = this.delegate.readFile(fileName);
        let newContent = originalContent;
        if (!/\.d\.ts$/.test(fileName)) {
          try {
            const converted = tsickle.convertDecorators(
                this.program.getTypeChecker(), this.program.getSourceFile(fileName));
            if (converted.diagnostics) {
              this.diagnostics.push(...converted.diagnostics);
            }
            newContent = converted.output + this.ANNOTATION_SUPPORT;
          } catch (e) {
            console.error('Cannot convertDecorators on file', fileName);
            throw e;
          }
        }
        return ts.createSourceFile(fileName, newContent, languageVersion, true);
      }
}

export class TsickleCompilerHost extends DelegatingHost {
  /** Error messages produced by tsickle, if any. */
  public diagnostics: ts.Diagnostic[] = [];

  constructor(
      delegate: ts.CompilerHost, private oldProgram: ts.Program, private options: NgOptions) {
    super(delegate);
  }

  getSourceFile =
      (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
        let sourceFile = this.oldProgram.getSourceFile(fileName);
        let isDefinitions = /\.d\.ts$/.test(fileName);
        // Don't tsickle-process any d.ts that isn't a compilation target;
        // this means we don't process e.g. lib.d.ts.
        if (isDefinitions) return sourceFile;
        const es2015Target = this.options.target == ts.ScriptTarget.ES2015;  // This covers ES6 too
        let {output, externs, diagnostics} = tsickle.annotate(
            this.oldProgram, sourceFile, {untyped: true, convertIndexImportShorthand: es2015Target},
            this.delegate, this.options);
        this.diagnostics = diagnostics;
        return ts.createSourceFile(fileName, output, languageVersion, true);
      }
}

const IGNORED_FILES = /\.ngfactory\.js$|\.ngstyle\.js$/;

export class MetadataWriterHost extends DelegatingHost {
  private metadataCollector = new MetadataCollector({quotedNames: true});
  private metadataCollector1 = new MetadataCollector({version: 1});
  constructor(delegate: ts.CompilerHost, private ngOptions: NgOptions) { super(delegate); }

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
        if (/\.d\.ts$/.test(fileName)) {
          // Let the original file be written first; this takes care of creating parent directories
          this.delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);

          // TODO: remove this early return after https://github.com/Microsoft/TypeScript/pull/8412
          // is
          // released
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
        this.writeMetadata(fileName, sourceFiles[0]);
      }
}
