/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerOptions, createNgCompilerOptions} from '@angular/compiler-cli';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {NgCompilerAdapter} from '@angular/compiler-cli/src/ngtsc/core/api';
import {absoluteFrom, absoluteFromSourceFile, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {PatchedProgramIncrementalBuildStrategy} from '@angular/compiler-cli/src/ngtsc/incremental';
import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import {TypeCheckShimGenerator} from '@angular/compiler-cli/src/ngtsc/typecheck';
import {OptimizeFor, TypeCheckingProgramStrategy} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript/lib/tsserverlibrary';

export class LanguageService {
  private options: CompilerOptions;
  private lastKnownProgram: ts.Program|null = null;
  private readonly strategy: TypeCheckingProgramStrategy;
  private readonly adapter: NgCompilerAdapter;

  constructor(project: ts.server.Project, private readonly tsLS: ts.LanguageService) {
    this.options = parseNgCompilerOptions(project);
    this.strategy = createTypeCheckingProgramStrategy(project);
    this.adapter = createNgCompilerAdapter(project);
    this.watchConfigFile(project);
  }

  getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
    const program = this.strategy.getProgram();
    const compiler = this.createCompiler(program);
    if (fileName.endsWith('.ts')) {
      const sourceFile = program.getSourceFile(fileName);
      if (!sourceFile) {
        return [];
      }
      const ttc = compiler.getTemplateTypeChecker();
      const diagnostics = ttc.getDiagnosticsForFile(sourceFile, OptimizeFor.SingleFile);
      this.lastKnownProgram = compiler.getNextProgram();
      return diagnostics;
    }
    throw new Error('Ivy LS currently does not support external template');
  }

  private createCompiler(program: ts.Program): NgCompiler {
    return new NgCompiler(
        this.adapter,
        this.options,
        program,
        this.strategy,
        new PatchedProgramIncrementalBuildStrategy(),
        this.lastKnownProgram,
    );
  }

  private watchConfigFile(project: ts.server.Project) {
    // TODO: Check the case when the project is disposed. An InferredProject
    // could be disposed when a tsconfig.json is added to the workspace,
    // in which case it becomes a ConfiguredProject (or vice-versa).
    // We need to make sure that the FileWatcher is closed.
    if (!(project instanceof ts.server.ConfiguredProject)) {
      return;
    }
    const {host} = project.projectService;
    host.watchFile(
        project.getConfigFilePath(), (fileName: string, eventKind: ts.FileWatcherEventKind) => {
          project.log(`Config file changed: ${fileName}`);
          if (eventKind === ts.FileWatcherEventKind.Changed) {
            this.options = parseNgCompilerOptions(project);
          }
        });
  }
}

export function parseNgCompilerOptions(project: ts.server.Project): CompilerOptions {
  let config = {};
  if (project instanceof ts.server.ConfiguredProject) {
    const configPath = project.getConfigFilePath();
    const result = ts.readConfigFile(configPath, path => project.readFile(path));
    if (result.error) {
      project.error(ts.flattenDiagnosticMessageText(result.error.messageText, '\n'));
    }
    config = result.config || config;
  }
  const basePath = project.getCurrentDirectory();
  return createNgCompilerOptions(basePath, config, project.getCompilationSettings());
}

function createNgCompilerAdapter(project: ts.server.Project): NgCompilerAdapter {
  return {
    entryPoint: null,  // entry point is only needed if code is emitted
    constructionDiagnostics: [],
    ignoreForEmit: new Set(),
    factoryTracker: null,      // no .ngfactory shims
    unifiedModulesHost: null,  // only used in Bazel
    rootDirs: project.getCompilationSettings().rootDirs?.map(absoluteFrom) || [],
    isShim,
    fileExists(fileName: string): boolean {
      return project.fileExists(fileName);
    },
    readFile(fileName: string): string |
        undefined {
          return project.readFile(fileName);
        },
    getCurrentDirectory(): string {
      return project.getCurrentDirectory();
    },
    getCanonicalFileName(fileName: string): string {
      return project.projectService.toCanonicalFileName(fileName);
    },
  };
}

function createTypeCheckingProgramStrategy(project: ts.server.Project):
    TypeCheckingProgramStrategy {
  return {
    supportsInlineOperations: false,
    shimPathForComponent(component: ts.ClassDeclaration): AbsoluteFsPath {
      return TypeCheckShimGenerator.shimFor(absoluteFromSourceFile(component.getSourceFile()));
    },
    getProgram(): ts.Program {
      const program = project.getLanguageService().getProgram();
      if (!program) {
        throw new Error('Language service does not have a program!');
      }
      return program;
    },
    updateFiles(contents: Map<AbsoluteFsPath, string>) {
      for (const [fileName, newText] of contents) {
        const scriptInfo = getOrCreateTypeCheckScriptInfo(project, fileName);
        const snapshot = scriptInfo.getSnapshot();
        const length = snapshot.getLength();
        scriptInfo.editContent(0, length, newText);
      }
    },
  };
}

function getOrCreateTypeCheckScriptInfo(
    project: ts.server.Project, tcf: string): ts.server.ScriptInfo {
  // First check if there is already a ScriptInfo for the tcf
  const {projectService} = project;
  let scriptInfo = projectService.getScriptInfo(tcf);
  if (!scriptInfo) {
    // ScriptInfo needs to be opened by client to be able to set its user-defined
    // content. We must also provide file content, otherwise the service will
    // attempt to fetch the content from disk and fail.
    scriptInfo = projectService.getOrCreateScriptInfoForNormalizedPath(
        ts.server.toNormalizedPath(tcf),
        true,              // openedByClient
        '',                // fileContent
        ts.ScriptKind.TS,  // scriptKind
    );
    if (!scriptInfo) {
      throw new Error(`Failed to create script info for ${tcf}`);
    }
  }
  // Add ScriptInfo to project if it's missing. A ScriptInfo needs to be part of
  // the project so that it becomes part of the program.
  if (!project.containsScriptInfo(scriptInfo)) {
    project.addRoot(scriptInfo);
  }
  return scriptInfo;
}
