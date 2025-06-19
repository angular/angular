/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  absoluteFrom,
  AbsoluteFsPath,
  FileSystem,
  getFileSystem,
  getSourceFileOrError,
  InternalOptions,
  LegacyNgcOptions,
  OptimizeFor,
  TemplateTypeChecker,
  TypeCheckingOptions,
} from '@angular/compiler-cli';
import ts from 'typescript';

import {ApplyRefactoringProgressFn, ApplyRefactoringResult} from '../../api';
import {LanguageService} from '../../src/language_service';

import {OpenBuffer} from './buffer';
import {patchLanguageServiceProjectsWithTestHost} from './language_service_test_cache';

export type ProjectFiles = {
  [fileName: string]: string;
};

function writeTsconfig(
  fs: FileSystem,
  tsConfigPath: AbsoluteFsPath,
  entryFiles: AbsoluteFsPath[],
  angularCompilerOptions: TestableOptions,
  tsCompilerOptions: {},
): void {
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
          lib: ['dom', 'es2015'],
          ...tsCompilerOptions,
        },
        files: entryFiles,
        angularCompilerOptions: {
          strictTemplates: true,
          ...angularCompilerOptions,
        },
      },
      null,
      2,
    ),
  );
}

export type TestableOptions = TypeCheckingOptions &
  InternalOptions &
  Pick<LegacyNgcOptions, 'fullTemplateTypeCheck'> & {
    // This already exists in `InternalOptions`, but it's `internal` so it's stripped away.
    _enableSelectorless?: boolean;
  };

export class Project {
  private tsProject: ts.server.Project;
  private tsLS: ts.LanguageService;
  readonly ngLS: LanguageService;
  private buffers = new Map<string, OpenBuffer>();

  static initialize(
    projectName: string,
    projectService: ts.server.ProjectService,
    files: ProjectFiles,
    angularCompilerOptions: TestableOptions = {},
    tsCompilerOptions = {},
  ): Project {
    const fs = getFileSystem();
    const tsConfigPath = absoluteFrom(`/${projectName}/tsconfig.json`);

    const entryFiles: AbsoluteFsPath[] = [];
    for (const projectFilePath of Object.keys(files)) {
      const contents = files[projectFilePath];
      const filePath = absoluteFrom(`/${projectName}/${projectFilePath}`);
      const dirPath = fs.dirname(filePath);
      fs.ensureDir(dirPath);
      fs.writeFile(filePath, contents);
      if (projectFilePath.endsWith('.ts') && !projectFilePath.endsWith('.d.ts')) {
        entryFiles.push(filePath);
      }
    }

    writeTsconfig(fs, tsConfigPath, entryFiles, angularCompilerOptions, tsCompilerOptions);

    patchLanguageServiceProjectsWithTestHost();

    // Ensure the project is live in the ProjectService.
    // This creates the `ts.Program` by configuring the project and loading it!
    projectService.openClientFile(entryFiles[0]);
    projectService.closeClientFile(entryFiles[0]);

    return new Project(projectName, projectService, tsConfigPath);
  }

  private constructor(
    readonly name: string,
    private projectService: ts.server.ProjectService,
    private tsConfigPath: AbsoluteFsPath,
  ) {
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
      this.projectService.openClientFile(
        // By attempting to open the file, the compiler is going to try to parse it as
        // TS which will throw an error. We pass in JSX which is more permissive.
        fileName,
        undefined,
        fileName.endsWith('.html') ? ts.ScriptKind.JSX : ts.ScriptKind.TS,
      );

      scriptInfo = this.tsProject.getScriptInfo(fileName);
      if (scriptInfo === undefined) {
        throw new Error(
          `Unable to open ScriptInfo for ${projectFileName} in project ${this.tsConfigPath}`,
        );
      }
      this.buffers.set(
        projectFileName,
        new OpenBuffer(this.ngLS, this.tsProject, projectFileName, scriptInfo),
      );
    }

    return this.buffers.get(projectFileName)!;
  }

  getSourceFile(projectFileName: string): ts.SourceFile | undefined {
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

  getCodeFixesAtPosition(
    projectFileName: string,
    start: number,
    end: number,
    errorCodes: readonly number[],
  ): readonly ts.CodeFixAction[] {
    const fileName = absoluteFrom(`/${this.name}/${projectFileName}`);
    return this.ngLS.getCodeFixesAtPosition(
      fileName,
      start,
      end,
      errorCodes,
      {},
      {
        includeCompletionsForModuleExports: true,
      },
    );
  }

  getRefactoringsAtPosition(
    projectFileName: string,
    positionOrRange: number | ts.TextRange,
  ): readonly ts.ApplicableRefactorInfo[] {
    const fileName = absoluteFrom(`/${this.name}/${projectFileName}`);
    return this.ngLS.getPossibleRefactorings(fileName, positionOrRange);
  }

  applyRefactoring(
    projectFileName: string,
    positionOrRange: number | ts.TextRange,
    refactorName: string,
    reportProgress: ApplyRefactoringProgressFn,
  ): Promise<ApplyRefactoringResult | undefined> {
    const fileName = absoluteFrom(`/${this.name}/${projectFileName}`);
    return this.ngLS.applyRefactoring(fileName, positionOrRange, refactorName, reportProgress);
  }

  getCombinedCodeFix(projectFileName: string, fixId: string): ts.CombinedCodeActions {
    const fileName = absoluteFrom(`/${this.name}/${projectFileName}`);
    return this.ngLS.getCombinedCodeFix(
      {
        type: 'file',
        fileName,
      },
      fixId,
      {},
      {},
    );
  }

  expectNoSourceDiagnostics(): void {
    const program = this.tsLS.getProgram();
    if (program === undefined) {
      throw new Error(`Expected to get a ts.Program`);
    }

    const ngCompiler = this.ngLS.compilerFactory.getOrCreate();

    for (const sf of program.getSourceFiles()) {
      if (
        sf.isDeclarationFile ||
        sf.fileName.endsWith('.ngtypecheck.ts') ||
        !sf.fileName.endsWith('.ts')
      ) {
        continue;
      }

      const syntactic = program.getSyntacticDiagnostics(sf);
      expect(syntactic.map((diag) => diag.messageText)).toEqual([]);
      if (syntactic.length > 0) {
        continue;
      }

      const semantic = program.getSemanticDiagnostics(sf);
      expect(semantic.map((diag) => diag.messageText)).toEqual([]);
      if (semantic.length > 0) {
        continue;
      }

      // It's more efficient to optimize for WholeProgram since we call this with every file in the
      // program.
      const ngDiagnostics = ngCompiler.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
      expect(ngDiagnostics.map((diag) => diag.messageText)).toEqual([]);
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
    expect(diags.map((diag) => diag.messageText)).toEqual([]);
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
