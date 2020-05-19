
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerOptions} from '@angular/compiler-cli';
import {NgCompiler, NgCompilerHost} from '@angular/compiler-cli/src/ngtsc/core';
import {AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {TypeCheckingProgramStrategy, UpdateMode} from '@angular/compiler-cli/src/ngtsc/typecheck';
import * as ts from 'typescript/lib/tsserverlibrary';

import {makeCompilerHostFromProject} from './compiler_host';

export class Compiler {
  private tsCompilerHost: ts.CompilerHost;
  private lastKnownProgram: ts.Program;
  private compiler: NgCompiler;
  private readonly strategy: TypeCheckingProgramStrategy;

  constructor(private readonly project: ts.server.Project, private options: CompilerOptions) {
    this.tsCompilerHost = makeCompilerHostFromProject(project);
    const ngCompilerHost = NgCompilerHost.wrap(
        this.tsCompilerHost,
        project.getRootFiles(),  // input files
        options,
        null,  // old program
    );
    this.strategy = createTypeCheckingProgramStrategy(project);
    this.lastKnownProgram = this.strategy.getProgram();
    this.compiler = new NgCompiler(ngCompilerHost, options, this.lastKnownProgram, this.strategy);
  }

  setCompilerOptions(options: CompilerOptions) {
    this.options = options;
  }

  analyze(): ts.Program|undefined {
    const inputFiles = this.project.getRootFiles();
    const ngCompilerHost =
        NgCompilerHost.wrap(this.tsCompilerHost, inputFiles, this.options, this.lastKnownProgram);
    const program = this.strategy.getProgram();
    this.compiler =
        new NgCompiler(ngCompilerHost, this.options, program, this.strategy, this.lastKnownProgram);
    try {
      // This is the only way to force the compiler to update the typecheck file
      // in the program. We have to do try-catch because the compiler immediately
      // throws if it fails to parse any template in the entire program!
      const d = this.compiler.getDiagnostics();
      if (d.length) {
        // There could be global compilation errors. It's useful to print them
        // out in development.
        console.error(d.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')));
      }
    } catch (e) {
      console.error('Failed to analyze program', e.message);
      return;
    }
    this.lastKnownProgram = this.compiler.getNextProgram();
    return this.lastKnownProgram;
  }

  getDiagnostics(sourceFile: ts.SourceFile): ts.Diagnostic[] {
    return this.compiler.getDiagnostics(sourceFile);
  }
}

function createTypeCheckingProgramStrategy(project: ts.server.Project):
    TypeCheckingProgramStrategy {
  return {
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
