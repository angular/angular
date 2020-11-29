/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstNode} from '@angular/compiler';
import {StrictTemplateOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, getSourceFileOrError} from '@angular/compiler-cli/src/ngtsc/file_system';
import {MockFileSystem, TestFile} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '@angular/compiler-cli/src/ngtsc/testing';
import {TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript/lib/tsserverlibrary';

import {LanguageService} from '../language_service';

import {MockServerHost} from './mock_host';

function writeTsconfig(
    fs: FileSystem, entryFiles: AbsoluteFsPath[], options: TestableOptions): void {
  fs.writeFile(
      absoluteFrom('/tsconfig.json'),

      JSON.stringify(
          {
            compilerOptions: {
              strict: true,
              experimentalDecorators: true,
              moduleResolution: 'node',
              target: 'es2015',
              lib: [
                'dom',
                'es2015',
              ],
            },
            files: entryFiles,
            angularCompilerOptions: {
              strictTemplates: true,
              ...options,
            }
          },
          null, 2));
}

export type TestableOptions = StrictTemplateOptions;

export class LanguageServiceTestEnvironment {
  private constructor(private tsLS: ts.LanguageService, readonly ngLS: LanguageService) {}

  static setup(files: TestFile[], options: TestableOptions = {}): LanguageServiceTestEnvironment {
    const fs = getFileSystem();
    if (!(fs instanceof MockFileSystem)) {
      throw new Error(`LanguageServiceTestEnvironment only works with a mock filesystem`);
    }
    fs.init(loadStandardTestFiles({
      fakeCommon: true,
    }));

    const host = new MockServerHost(fs);
    const tsconfigPath = absoluteFrom('/tsconfig.json');

    const entryFiles: AbsoluteFsPath[] = [];
    for (const {name, contents, isRoot} of files) {
      fs.writeFile(name, contents);
      if (isRoot === true) {
        entryFiles.push(name);
      }
    }

    if (entryFiles.length === 0) {
      throw new Error(`Expected at least one root TestFile.`);
    }

    writeTsconfig(fs, files.filter(file => file.isRoot === true).map(file => file.name), options);

    const projectService = new ts.server.ProjectService({
      host,
      logger,
      cancellationToken: ts.server.nullCancellationToken,
      useSingleInferredProject: true,
      useInferredProjectPerProjectRoot: true,
      typingsInstaller: ts.server.nullTypingsInstaller,
    });

    // Open all root files.
    for (const entryFile of entryFiles) {
      projectService.openClientFile(entryFile);
    }

    const project = projectService.findProject(tsconfigPath);
    if (project === undefined) {
      throw new Error(`Failed to create project for ${tsconfigPath}`);
    }
    // The following operation forces a ts.Program to be created.
    const tsLS = project.getLanguageService();

    const ngLS = new LanguageService(project, tsLS);
    return new LanguageServiceTestEnvironment(tsLS, ngLS);
  }

  getClass(fileName: AbsoluteFsPath, className: string): ts.ClassDeclaration {
    const program = this.tsLS.getProgram();
    if (program === undefined) {
      throw new Error(`Expected to get a ts.Program`);
    }
    const sf = getSourceFileOrError(program, fileName);
    return getClassOrError(sf, className);
  }

  overrideTemplateWithCursor(fileName: AbsoluteFsPath, className: string, contents: string):
      {cursor: number, nodes: TmplAstNode[], component: ts.ClassDeclaration, text: string} {
    const program = this.tsLS.getProgram();
    if (program === undefined) {
      throw new Error(`Expected to get a ts.Program`);
    }
    const sf = getSourceFileOrError(program, fileName);
    const component = getClassOrError(sf, className);

    const ngCompiler = this.ngLS.compilerFactory.getOrCreate();
    const templateTypeChecker = ngCompiler.getTemplateTypeChecker();

    const {cursor, text} = extractCursorInfo(contents);

    const {nodes} = templateTypeChecker.overrideComponentTemplate(component, text);
    return {cursor, nodes, component, text};
  }

  expectNoSourceDiagnostics(): void {
    const program = this.tsLS.getProgram();
    if (program === undefined) {
      throw new Error(`Expected to get a ts.Program`);
    }

    const ngCompiler = this.ngLS.compilerFactory.getOrCreate();

    for (const sf of program.getSourceFiles()) {
      if (sf.isDeclarationFile || sf.fileName.endsWith('.ngtypecheck.ts')) {
        continue;
      }

      const syntactic = program.getSyntacticDiagnostics(sf);
      expect(syntactic.map(diag => diag.messageText)).toEqual([]);
      if (syntactic.length > 0) {
        continue;
      }

      const semantic = program.getSemanticDiagnostics(sf);
      expect(semantic.map(diag => diag.messageText)).toEqual([]);
      if (semantic.length > 0) {
        continue;
      }

      const ngDiagnostics = ngCompiler.getDiagnostics(sf);
      expect(ngDiagnostics.map(diag => diag.messageText)).toEqual([]);
    }

    this.ngLS.compilerFactory.registerLastKnownProgram();
  }

  expectNoTemplateDiagnostics(fileName: AbsoluteFsPath, className: string): void {
    const program = this.tsLS.getProgram();
    if (program === undefined) {
      throw new Error(`Expected to get a ts.Program`);
    }
    const sf = getSourceFileOrError(program, fileName);
    const component = getClassOrError(sf, className);

    const diags = this.getTemplateTypeChecker().getDiagnosticsForComponent(component);
    this.ngLS.compilerFactory.registerLastKnownProgram();
    expect(diags.map(diag => diag.messageText)).toEqual([]);
  }

  getTemplateTypeChecker(): TemplateTypeChecker {
    return this.ngLS.compilerFactory.getOrCreate().getTemplateTypeChecker();
  }
}

const logger: ts.server.Logger = {
  close(): void{},
  hasLevel(level: ts.server.LogLevel): boolean {
    return false;
  },
  loggingEnabled(): boolean {
    return false;
  },
  perftrc(s: string): void{},
  info(s: string): void{},
  startGroup(): void{},
  endGroup(): void{},
  msg(s: string, type?: ts.server.Msg): void{},
  getLogFileName(): string |
      undefined {
        return;
      },
};


function getClassOrError(sf: ts.SourceFile, name: string): ts.ClassDeclaration {
  for (const stmt of sf.statements) {
    if (ts.isClassDeclaration(stmt) && stmt.name !== undefined && stmt.name.text === name) {
      return stmt;
    }
  }
  throw new Error(`Class ${name} not found in file: ${sf.fileName}: ${sf.text}`);
}

function extractCursorInfo(textWithCursor: string): {cursor: number, text: string} {
  const cursor = textWithCursor.indexOf('¦');
  if (cursor === -1) {
    throw new Error(`Expected to find cursor symbol '¦'`);
  }

  return {
    cursor,
    text: textWithCursor.substr(0, cursor) + textWithCursor.substr(cursor + 1),
  };
}
