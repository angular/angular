/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerOptions, ConfigurationHost, readConfiguration} from '@angular/compiler-cli';
import {absoluteFromSourceFile, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {TypeCheckShimGenerator} from '@angular/compiler-cli/src/ngtsc/typecheck';
import {OptimizeFor, TypeCheckingProgramStrategy} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript/lib/tsserverlibrary';

import {LanguageServiceAdapter, LSParseConfigHost} from './adapters';
import {CompilerFactory} from './compiler_factory';
import {DefinitionBuilder} from './definitions';
import {QuickInfoBuilder} from './quick_info';
import {getTargetAtPosition} from './template_target';
import {getTemplateInfoAtPosition, isTypeScriptFile} from './utils';

export class LanguageService {
  private options: CompilerOptions;
  readonly compilerFactory: CompilerFactory;
  private readonly strategy: TypeCheckingProgramStrategy;
  private readonly adapter: LanguageServiceAdapter;
  private readonly parseConfigHost: LSParseConfigHost;

  constructor(project: ts.server.Project, private readonly tsLS: ts.LanguageService) {
    this.parseConfigHost = new LSParseConfigHost(project.projectService.host);
    this.options = this.watchProjectConfig(project);
    this.strategy = createTypeCheckingProgramStrategy(project);
    this.adapter = new LanguageServiceAdapter(project);
    this.compilerFactory = new CompilerFactory(this.adapter, this.strategy, this.options);
  }

  getCompilerOptions(): CompilerOptions {
    return this.options;
  }

  getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
    const compiler = this.compilerFactory.getOrCreateWithChangedFile(fileName);
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
    const compiler = this.compilerFactory.getOrCreateWithChangedFile(fileName);
    const results =
        new DefinitionBuilder(this.tsLS, compiler).getDefinitionAndBoundSpan(fileName, position);
    this.compilerFactory.registerLastKnownProgram();
    return results;
  }

  getTypeDefinitionAtPosition(fileName: string, position: number):
      readonly ts.DefinitionInfo[]|undefined {
    const compiler = this.compilerFactory.getOrCreateWithChangedFile(fileName);
    const results =
        new DefinitionBuilder(this.tsLS, compiler).getTypeDefinitionsAtPosition(fileName, position);
    this.compilerFactory.registerLastKnownProgram();
    return results;
  }

  getQuickInfoAtPosition(fileName: string, position: number): ts.QuickInfo|undefined {
    const program = this.strategy.getProgram();
    const compiler = this.compilerFactory.getOrCreateWithChangedFile(fileName);
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

  /**
   * Attaches file watchers to the project config file and all transitively extended config files,
   * updating the compiler options whenever any such file is changed.
   * Then, returns Angular compiler options configured for a project.
   *
   * NOTE: The Angular language service will updates its known compiler options anytime a relevant
   * config file is changed, but tsserver
   *   (1) delays config update propogation (currently by 250ms, see
   *       https://sourcegraph.com/github.com/microsoft/TypeScript@66c877f57aa642ed953f1376e302ed5c88473ad7/-/blob/src/server/editorServices.ts#L1283-1291).
   *   (2) does not watch extended `tsconfig`s for changes (may be fixed by
   *       https://github.com/microsoft/TypeScript/pull/41493).
   * This means that the compiler options used by the Angular LS to provide language services may
   * differ from those of the tsLS, which independently provides language service requests that
   * Angular cannot.
   */
  private watchProjectConfig(project: ts.server.Project): CompilerOptions {
    if (!(project instanceof ts.server.ConfiguredProject)) {
      // If the project does not have a config file, there are no Angular compiler options to find.
      return {};
    }

    const {host} = project.projectService;
    const rootProjectConfigFile = project.getConfigFilePath();

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
      const {options, errors, allExtendedConfigs} = readConfiguration(
          rootProjectConfigFile, /* existingConfig */ undefined, this.parseConfigHost);
      if (errors.length > 0) {
        project.setProjectErrors(errors);
      }

      // At this point, we need to reconcile which config files to watch with the set of config
      // files determined as dependencies for the project configuration we just parsed out.
      //
      // It's reasonable to assume that the number of extended config files is relatively small
      // (~< 5) for most projects, so the easiest way to do this is just dump and reinitialize the
      // set of config files to watch.
      closeAllWatchers();
      addConfigFileWatcher(rootProjectConfigFile);
      for (const file of allExtendedConfigs) {
        addConfigFileWatcher(file);
      }

      return options;
    };

    const addConfigFileWatcher = (configFile: string) => {
      if (allConfigFileWatchers.has(configFile)) {
        throw new Error(`${configFile} is already being watched.`);
      }

      const watcher =
          host.watchFile(configFile, (fileName: string, eventKind: ts.FileWatcherEventKind) => {
            project.log(`Config file changed: ${fileName}`);
            if (eventKind === ts.FileWatcherEventKind.Changed) {
              // Re-parse the project compiler options, and add watchers for any new extended config
              // files we find.
              this.options = readProjectConfigAndUpdateExtendedWatchers();
            } else if (eventKind === ts.FileWatcherEventKind.Deleted) {
              if (configFile === rootProjectConfigFile) {
                // If the root project config file is deleted, the project is no longer configured.
                // Therefore there is no config for us to watch, and all existing watchers should be
                // cleaned up.
                // Futhermore, the owner of the `ts.Project` this language service instance is for
                // should now delete the project, as it is no longer a `ConfiguredProject`. If at
                // some point a new `ConfiguredProject` at the same file path is introduced, a new
                // language service instance should be created for that project.
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

      allConfigFileWatchers.set(configFile, watcher);
    };

    // Now we kick off the work:
    //   1. add a file watcher for the root project config file
    //   2. read the root project config file to determine the project compiler options,
    //      in the process attaching watchers to all extended configs.
    addConfigFileWatcher(rootProjectConfigFile);
    const options = readProjectConfigAndUpdateExtendedWatchers();

    return options;
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
