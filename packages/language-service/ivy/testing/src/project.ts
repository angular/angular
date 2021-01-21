/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LegacyNgcOptions, StrictTemplateOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, getSourceFileOrError} from '@angular/compiler-cli/src/ngtsc/file_system';
import {OptimizeFor, TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript/lib/tsserverlibrary';
import {LanguageService} from '../../language_service';
import {OpenBuffer} from './buffer';

export type ProjectFiles = {
  [fileName: string]: string;
};

function writeTsconfig(
    fs: FileSystem, tsConfigPath: AbsoluteFsPath, entryFiles: AbsoluteFsPath[],
    options: TestableOptions): void {
  fs.writeFile(
      tsConfigPath,
      JSON.stringify(
          {
            compilerOptions: {
              strict: true,
              experimentalDecorators: true,
              moduleResolution: 'node',
              target: 'es2015',
              rootDir: '.',
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

export type TestableOptions = StrictTemplateOptions&Pick<LegacyNgcOptions, 'fullTemplateTypeCheck'>;

export class Project {
  private tsProject: ts.server.Project;
  private tsLS: ts.LanguageService;
  readonly ngLS: LanguageService;
  private buffers = new Map<string, OpenBuffer>();

  static initialize(
      projectName: string, projectService: ts.server.ProjectService, files: ProjectFiles,
      options: TestableOptions = {}): Project {
    const fs = getFileSystem();
    const tsConfigPath = absoluteFrom(`/${projectName}/tsconfig.json`);

    const entryFiles: AbsoluteFsPath[] = [];
    for (const projectFilePath of Object.keys(files)) {
      const contents = files[projectFilePath];
      const filePath = absoluteFrom(`/${projectName}/${projectFilePath}`);
      const dirPath = fs.dirname(filePath);
      fs.ensureDir(dirPath);
      fs.writeFile(filePath, contents);
      if (projectFilePath.endsWith('.ts')) {
        entryFiles.push(filePath);
      }
    }

    writeTsconfig(fs, tsConfigPath, entryFiles, options);

    // Ensure the project is live in the ProjectService.
    projectService.openClientFile(entryFiles[0]);
    projectService.closeClientFile(entryFiles[0]);

    return new Project(projectName, projectService, tsConfigPath);
  }

  constructor(
      readonly name: string, private projectService: ts.server.ProjectService,
      private tsConfigPath: AbsoluteFsPath) {
    // LS for project
    const tsProject = projectService.findProject(tsConfigPath);
    if (tsProject === undefined) {
      throw new Error(`Failed to create project for ${tsConfigPath}`);
    }

    this.tsProject = tsProject;

    // The following operation forces a ts.Program to be created.
    this.tsLS = tsProject.getLanguageService();
    this.ngLS = new LanguageService(tsProject, this.tsLS, {});
  }

  openFile(projectFileName: string): OpenBuffer {
    if (!this.buffers.has(projectFileName)) {
      const fileName = absoluteFrom(`/${this.name}/${projectFileName}`);
      let scriptInfo = this.tsProject.getScriptInfo(fileName);
      this.projectService.openClientFile(fileName);
      // Mark the project as dirty because the act of opening a file may result in the version
      // changing since TypeScript will `switchToScriptVersionCache` when a file is opened.
      // Note that this emulates what we have to do in the server/extension as well.
      // TODO: remove this once PR #41475 lands
      this.tsProject.markAsDirty();

      scriptInfo = this.tsProject.getScriptInfo(fileName);
      if (scriptInfo === undefined) {
        throw new Error(
            `Unable to open ScriptInfo for ${projectFileName} in project ${this.tsConfigPath}`);
      }
      this.buffers.set(projectFileName, new OpenBuffer(this.ngLS, projectFileName, scriptInfo));
    }

    return this.buffers.get(projectFileName)!;
  }

  getSourceFile(projectFileName: string): ts.SourceFile|undefined {
    const fileName = absoluteFrom(`/${this.name}/${projectFileName}`);
    return this.tsProject.getSourceFile(this.projectService.toPath(fileName));
  }

  getTypeChecker(): ts.TypeChecker {
    return this.ngLS.compilerFactory.getOrCreate().getCurrentProgram().getTypeChecker();
  }

  getDiagnosticsForFile(projectFileName: string): ts.Diagnostic[] {
    const fileName = absoluteFrom(`/${this.name}/${projectFileName}`);
    const diagnostics: ts.Diagnostic[] = [];
    if (fileName.endsWith('.ts')) {
      diagnostics.push(...this.tsLS.getSyntacticDiagnostics(fileName));
      diagnostics.push(...this.tsLS.getSemanticDiagnostics(fileName));
    }

    diagnostics.push(...this.ngLS.getSemanticDiagnostics(fileName));
    return diagnostics;
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

      // It's more efficient to optimize for WholeProgram since we call this with every file in the
      // program.
      const ngDiagnostics = ngCompiler.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
      expect(ngDiagnostics.map(diag => diag.messageText)).toEqual([]);
    }
  }

  expectNoTemplateDiagnostics(projectFileName: string, className: string): void {
    const program = this.tsLS.getProgram();
    if (program === undefined) {
      throw new Error(`Expected to get a ts.Program`);
    }
    const fileName = absoluteFrom(`/${this.name}/${projectFileName}`);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClassOrError(sf, className);

    const diags = this.getTemplateTypeChecker().getDiagnosticsForComponent(component);
    expect(diags.map(diag => diag.messageText)).toEqual([]);
  }

  getTemplateTypeChecker(): TemplateTypeChecker {
    return this.ngLS.compilerFactory.getOrCreate().getTemplateTypeChecker();
  }

  getLogger(): ts.server.Logger {
    return this.tsProject.projectService.logger;
  }
}

function getClassOrError(sf: ts.SourceFile, name: string): ts.ClassDeclaration {
  for (const stmt of sf.statements) {
    if (ts.isClassDeclaration(stmt) && stmt.name !== undefined && stmt.name.text === name) {
      return stmt;
    }
  }
  throw new Error(`Class ${name} not found in file: ${sf.fileName}: ${sf.text}`);
}
