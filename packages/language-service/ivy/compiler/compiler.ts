
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerOptions} from '@angular/compiler-cli';
import {NgCompiler, NgCompilerHost} from '@angular/compiler-cli/src/ngtsc/core';
import {absoluteFromSourceFile, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {PatchedProgramIncrementalBuildStrategy} from '@angular/compiler-cli/src/ngtsc/incremental';
import {TypeCheckShimGenerator} from '@angular/compiler-cli/src/ngtsc/typecheck';
import {TypeCheckingProgramStrategy, UpdateMode} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript/lib/tsserverlibrary';

import {makeCompilerHostFromProject} from './compiler_host';

interface AnalysisResult {
  compiler: NgCompiler;
  program: ts.Program;
}

export class Compiler {
  private tsCompilerHost: ts.CompilerHost;
  private lastKnownProgram: ts.Program|null = null;
  private readonly strategy: TypeCheckingProgramStrategy;

  constructor(private readonly project: ts.server.Project, private options: CompilerOptions) {
    this.tsCompilerHost = makeCompilerHostFromProject(project);
    this.strategy = createTypeCheckingProgramStrategy(project);
    // Do not retrieve the program in constructor because project is still in
    // the process of loading, and not all data members have been initialized.
  }

  setCompilerOptions(options: CompilerOptions) {
    this.options = options;
  }

  analyze(): AnalysisResult|undefined {
    const inputFiles = this.project.getRootFiles();
    const ngCompilerHost =
        NgCompilerHost.wrap(this.tsCompilerHost, inputFiles, this.options, this.lastKnownProgram);
    const program = this.strategy.getProgram();
    const compiler = new NgCompiler(
        ngCompilerHost, this.options, program, this.strategy,
        new PatchedProgramIncrementalBuildStrategy(), this.lastKnownProgram);
    try {
      // This is the only way to force the compiler to update the typecheck file
      // in the program. We have to do try-catch because the compiler immediately
      // throws if it fails to parse any template in the entire program!
      const d = compiler.getDiagnostics();
      if (d.length) {
        // There could be global compilation errors. It's useful to print them
        // out in development.
        console.error(d.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')));
      }
    } catch (e) {
      console.error('Failed to analyze program', e.message);
      return;
    }
    this.lastKnownProgram = compiler.getNextProgram();
    return {
      compiler,
      program: this.lastKnownProgram,
    };
  }
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
    updateFiles(contents: Map<AbsoluteFsPath, string>, updateMode: UpdateMode) {
      if (updateMode !== UpdateMode.Complete) {
        throw new Error(`Incremental update mode is currently not supported`);
      }
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
