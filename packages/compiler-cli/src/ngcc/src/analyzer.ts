/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {DecoratedFile, DecoratorAnalyzer} from './decorator_analyzer';
import {NgccReflectionHost, SwitchableVariableDeclaration} from './host/ngcc_host';
import {FileParser} from './parsing/file_parser';
import {isDefined} from './utils';

export interface AnalyzedFile {
  sourceFile: ts.SourceFile;
  decorated?: DecoratedFile;
  switchable?: SwitchableFile;
}

export interface SwitchableFile {
  sourceFile: ts.SourceFile;
  declarations: SwitchableVariableDeclaration[];
}

export class Analyzer {
  constructor(
      private program: ts.Program, private host: NgccReflectionHost, private parser: FileParser,
      private decoratorAnalyzer: DecoratorAnalyzer) {}

  analyzeEntryPoint(entryPointFilePath: string): AnalyzedFile[] {
    const entryPointFile = this.program.getSourceFile(entryPointFilePath) !;
    const parsedFiles = this.parser.parseFile(entryPointFile);

    const decoratedFiles =
        parsedFiles.map(parsedFile => this.decoratorAnalyzer.analyzeFile(parsedFile));
    const switchableFiles = this.findSwitchableFiles();

    const mergedFiles = new Map<ts.SourceFile, AnalyzedFile>();

    decoratedFiles.forEach(file => mergedFiles.set(file.sourceFile, {
      sourceFile: file.sourceFile,
      decorated: file,
    }));

    switchableFiles.forEach(file => {
      let mergedFile = mergedFiles.get(file.sourceFile);
      if (!mergedFile) {
        mergedFile = {sourceFile: file.sourceFile};
        mergedFiles.set(file.sourceFile, mergedFile);
      }
      mergedFile.switchable = file;
    });

    return Array.from(mergedFiles.values());
  }

  private findSwitchableFiles(): SwitchableFile[] {
    return this.program.getSourceFiles()
        .map(sourceFile => this.analyzeFileForSwitches(sourceFile))
        .filter(isDefined);
  }

  private analyzeFileForSwitches(sourceFile: ts.SourceFile): SwitchableFile|undefined {
    const declarations = this.host.getSwitchableDeclarations(sourceFile);

    if (declarations.length > 0) {
      return {sourceFile, declarations};
    }
  }
}
