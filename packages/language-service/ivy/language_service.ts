/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerOptions, formatDiagnostics, readConfiguration} from '@angular/compiler-cli';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {NgCompilerAdapter} from '@angular/compiler-cli/src/ngtsc/core/api';
import {absoluteFrom, absoluteFromSourceFile, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {PatchedProgramIncrementalBuildStrategy} from '@angular/compiler-cli/src/ngtsc/incremental';
import {isShim} from '@angular/compiler-cli/src/ngtsc/shims';
import {TypeCheckShimGenerator} from '@angular/compiler-cli/src/ngtsc/typecheck';
import {OptimizeFor, TypeCheckingProgramStrategy} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript/lib/tsserverlibrary';

import {QuickInfoBuilder} from './quick_info';

export class LanguageService {
  private options: CompilerOptions;
  private lastKnownProgram: ts.Program|null = null;
  private readonly strategy: TypeCheckingProgramStrategy;
  private readonly adapter: NgCompilerAdapter;

  constructor(project: ts.server.Project, private readonly tsLS: ts.LanguageService) {
    this.strategy = createTypeCheckingProgramStrategy(project);
    this.adapter = createNgCompilerAdapter(project);
    this.options = this.getOptionsAndWatchConfigFile(project);
  }

  getCompilerOptions(): CompilerOptions {
    return this.options;
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

  getQuickInfoAtPosition(fileName: string, position: number): ts.QuickInfo|undefined {
    const program = this.strategy.getProgram();
    const compiler = this.createCompiler(program);
    return new QuickInfoBuilder(this.tsLS, compiler).get(fileName, position);
  }

  private createCompiler(program: ts.Program): NgCompiler {
    return new NgCompiler(
        this.adapter,
        this.options,
        program,
        this.strategy,
        new PatchedProgramIncrementalBuildStrategy(),
        /** enableTemplateTypeChecker */ true,
        this.lastKnownProgram,
        /** perfRecorder (use default) */ undefined,
    );
  }

  /**
   * Returns Angular compiler options configured for a project.
   * Attaches file watchers to the project config file and all recursively extended config files,
   * updating the compiler options whenever any such file is changed.
   *
   * NOTE: The Angular language service will updates its known compiler options anytime a relevant
   * config file is changed, but tsserver delays config update propogation (currently by 250ms, see
   * https://sourcegraph.com/github.com/microsoft/TypeScript@66c877f57aa642ed953f1376e302ed5c88473ad7/-/blob/src/server/editorServices.ts#L1283-1291).
   * This means that the compiler options used by the Angular LS to provide language services may be
   * different from those of the tsLS, which independently provides language service requests that
   * Angular cannot.
   */
  private getOptionsAndWatchConfigFile(project: ts.server.Project): CompilerOptions {
    if (!(project instanceof ts.server.ConfiguredProject)) {
      // If the project does not have a config file, there are no Angular compiler options to find.
      return {};
    }

    const {host} = project.projectService;
    const rootConfigFile = project.getConfigFilePath();

    const allConfigFileWatchers = new Map<string, ts.FileWatcher>();
    const closeAllWatchers = () => {
      for (const watcher of allConfigFileWatchers.values()) {
        watcher.close();
      }
      allConfigFileWatchers.clear();
    };

    /**
     * Reads the project configuration and adds file watchers to extended config files for whom
     * watchers are missing. The latter is needed when a new extended config file is added.
     */
    const readProjectConfigAndUpdateExtendedWatchers = () => {
      const {options, errors, allExtendedConfigs} = readConfiguration(rootConfigFile);
      if (errors.length > 0) {
        project.error(formatDiagnostics(errors));
      }
      for (const file of allExtendedConfigs) {
        if (allConfigFileWatchers.has(file)) {
          continue;
        }
        addConfigFileWatcher(file, /* isRoot */ false);
      }
      return options;
    };

    const addConfigFileWatcher = (file: string, isRoot: boolean) => {
      if (allConfigFileWatchers.has(file)) {
        throw new Error(`${file} is already being watched.`);
      }

      const watcher =
          host.watchFile(file, (fileName: string, eventKind: ts.FileWatcherEventKind) => {
            project.log(`Config file changed: ${fileName}`);
            if (eventKind === ts.FileWatcherEventKind.Changed) {
              // Re-parse the project compiler options, and add watchers for any new extended config
              // files we find.
              this.options = readProjectConfigAndUpdateExtendedWatchers();
            } else if (eventKind === ts.FileWatcherEventKind.Deleted) {
              if (isRoot) {
                // If the root project config file is deleted, the project is no longer configured.
                // Therefore there is no config for us to watch, and all existing watchers should be
                // cleaned up.
                closeAllWatchers();
                this.options = {};
              } else {
                // If an extended config file was removed, remove its watcher and refresh the
                // project config options.
                watcher.close();
                allConfigFileWatchers.delete(fileName);
                this.options = readProjectConfigAndUpdateExtendedWatchers();
              }
            }
          });

      allConfigFileWatchers.set(file, watcher);
    };

    // Now we kick off the work:
    //   1. add a file watcher for the root project config file
    //   2. read the root project config file to determine the project compiler options,
    //      in the process attaching watchers to all extended configs.
    addConfigFileWatcher(rootConfigFile, /* isRoot */ true);
    const options = readProjectConfigAndUpdateExtendedWatchers();

    return options;
  }
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
