/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerOptions, formatDiagnostics, readConfiguration} from '@angular/compiler-cli';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {absoluteFromSourceFile, AbsoluteFsPath, FileSystem, setFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {TypeCheckShimGenerator} from '@angular/compiler-cli/src/ngtsc/typecheck';
import {OptimizeFor, TypeCheckingProgramStrategy} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript/lib/tsserverlibrary';

import {LanguageServiceAdapter, LanguageServiceFS} from './adapters';
import {CompilerFactory} from './compiler_factory';
import {DefinitionBuilder} from './definitions';
import {QuickInfoBuilder} from './quick_info';
import {getTargetAtPosition} from './template_target';
import {getTemplateInfoAtPosition, isTypeScriptFile} from './utils';

export class LanguageService {
  private options: CompilerOptions;
  private readonly compilerFactory: CompilerFactory;
  private readonly strategy: TypeCheckingProgramStrategy;
  private readonly adapter: LanguageServiceAdapter;
  private readonly fs: LanguageServiceFS;

  constructor(project: ts.server.Project, private readonly tsLS: ts.LanguageService) {
    this.fs = new LanguageServiceFS(project);
    this.options = parseNgCompilerOptions(project, this.fs);
    this.strategy = createTypeCheckingProgramStrategy(project);
    this.adapter = new LanguageServiceAdapter(project);
    this.compilerFactory = new CompilerFactory(this.adapter, this.strategy);
    this.watchConfigFile(project);
  }

  getCompilerOptions(): CompilerOptions {
    return this.options;
  }

  /**
   * Before the LS processes a request, it needs to ensure the state of the
   * compiler instance used to analyze the program:
   *
   * 1. The compiler should exist
   * 2. The compiler should be provided all, if any, changes to the file the request is for
   * 3. The compiler file system should be set to the one provided by the langauge
   *    service adapter
   */
  private ensureCompiler(fileName: string): NgCompiler {
    setFileSystem(this.fs);
    return this.compilerFactory.getOrCreateWithChangedFile(fileName, this.options);
  }

  getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
    const compiler = this.ensureCompiler(fileName);
    const ttc = compiler.getTemplateTypeChecker();
    const diagnostics: ts.Diagnostic[] = [];
    if (isTypeScriptFile(fileName)) {
      const program = compiler.getNextProgram();
      const sourceFile = program.getSourceFile(fileName);
      if (sourceFile) {
        diagnostics.push(...ttc.getDiagnosticsForFile(sourceFile, OptimizeFor.SingleFile));
      }
    } else {
      const components = compiler.getComponentsWithTemplateFile(fileName);
      for (const component of components) {
        if (ts.isClassDeclaration(component)) {
          diagnostics.push(...ttc.getDiagnosticsForComponent(component));
        }
      }
    }
    this.compilerFactory.registerLastKnownProgram();
    return diagnostics;
  }

  getDefinitionAndBoundSpan(fileName: string, position: number): ts.DefinitionInfoAndBoundSpan
      |undefined {
    const compiler = this.ensureCompiler(fileName);
    const results = new DefinitionBuilder(this.tsLS, compiler, this.adapter)
                        .getDefinitionAndBoundSpan(fileName, position);
    this.compilerFactory.registerLastKnownProgram();
    return results;
  }

  getTypeDefinitionAtPosition(fileName: string, position: number):
      readonly ts.DefinitionInfo[]|undefined {
    const compiler = this.ensureCompiler(fileName);
    const results = new DefinitionBuilder(this.tsLS, compiler, this.adapter)
                        .getTypeDefinitionsAtPosition(fileName, position);
    this.compilerFactory.registerLastKnownProgram();
    return results;
  }

  getQuickInfoAtPosition(fileName: string, position: number): ts.QuickInfo|undefined {
    const program = this.strategy.getProgram();
    const compiler = this.compilerFactory.getOrCreateWithChangedFile(fileName, this.options);
    const templateInfo = getTemplateInfoAtPosition(fileName, position, compiler);
    if (templateInfo === undefined) {
      return undefined;
    }
    const positionDetails = getTargetAtPosition(templateInfo.template, position);
    if (positionDetails === null) {
      return undefined;
    }
    const results =
        new QuickInfoBuilder(this.tsLS, compiler, templateInfo.component, positionDetails.node)
            .get();
    this.compilerFactory.registerLastKnownProgram();
    return results;
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
            this.options = parseNgCompilerOptions(project, this.fs);
          }
        });
  }
}

export function parseNgCompilerOptions(
    project: ts.server.Project, fs: FileSystem): CompilerOptions {
  if (!(project instanceof ts.server.ConfiguredProject)) {
    return {};
  }
  setFileSystem(fs);
  const {options, errors} =
      readConfiguration(project.getConfigFilePath(), /* existingOptions */ undefined);
  if (errors.length > 0) {
    project.error(formatDiagnostics(errors));
  }

  return options;
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
