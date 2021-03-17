/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, AST, ParseSourceSpan, TmplAstBoundEvent, TmplAstNode} from '@angular/compiler';
import {CompilerOptions, ConfigurationHost, readConfiguration} from '@angular/compiler-cli';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {ErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import {absoluteFrom, absoluteFromSourceFile, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {PerfPhase} from '@angular/compiler-cli/src/ngtsc/perf';
import {isNamedClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import {TypeCheckShimGenerator} from '@angular/compiler-cli/src/ngtsc/typecheck';
import {OptimizeFor, TypeCheckingProgramStrategy} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {findFirstMatchingNode} from '@angular/compiler-cli/src/ngtsc/typecheck/src/comments';
import * as ts from 'typescript/lib/tsserverlibrary';

import {GetComponentLocationsForTemplateResponse, GetTcbResponse} from '../api';

import {LanguageServiceAdapter, LSParseConfigHost} from './adapters';
import {CompilerFactory} from './compiler_factory';
import {CompletionBuilder, CompletionNodeContext} from './completions';
import {DefinitionBuilder} from './definitions';
import {QuickInfoBuilder} from './quick_info';
import {ReferencesAndRenameBuilder} from './references';
import {getTargetAtPosition, TargetContext, TargetNodeKind} from './template_target';
import {findTightestNode, getClassDeclFromDecoratorProp, getPropertyAssignmentFromValue} from './ts_utils';
import {getTemplateInfoAtPosition, isTypeScriptFile} from './utils';

interface LanguageServiceConfig {
  /**
   * If true, enable `strictTemplates` in Angular compiler options regardless
   * of its value in tsconfig.json.
   */
  forceStrictTemplates?: true;
}

export class LanguageService {
  private options: CompilerOptions;
  readonly compilerFactory: CompilerFactory;
  private readonly strategy: TypeCheckingProgramStrategy;
  private readonly adapter: LanguageServiceAdapter;
  private readonly parseConfigHost: LSParseConfigHost;

  constructor(
      private readonly project: ts.server.Project,
      private readonly tsLS: ts.LanguageService,
      private readonly config: LanguageServiceConfig,
  ) {
    this.parseConfigHost = new LSParseConfigHost(project.projectService.host);
    this.options = parseNgCompilerOptions(project, this.parseConfigHost, config);
    logCompilerOptions(project, this.options);
    this.strategy = createTypeCheckingProgramStrategy(project);
    this.adapter = new LanguageServiceAdapter(project);
    this.compilerFactory = new CompilerFactory(this.adapter, this.strategy, this.options);
    this.watchConfigFile(project);
  }

  getCompilerOptions(): CompilerOptions {
    return this.options;
  }

  getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
    return this.withCompilerAndPerfTracing(PerfPhase.LsDiagnostics, (compiler) => {
      const ttc = compiler.getTemplateTypeChecker();
      const diagnostics: ts.Diagnostic[] = [];
      if (isTypeScriptFile(fileName)) {
        const program = compiler.getNextProgram();
        const sourceFile = program.getSourceFile(fileName);
        if (sourceFile) {
          const ngDiagnostics = compiler.getDiagnosticsForFile(sourceFile, OptimizeFor.SingleFile);
          // There are several kinds of diagnostics returned by `NgCompiler` for a source file:
          //
          // 1. Angular-related non-template diagnostics from decorated classes within that
          // file.
          // 2. Template diagnostics for components with direct inline templates (a string
          // literal).
          // 3. Template diagnostics for components with indirect inline templates (templates
          // computed
          //    by expression).
          // 4. Template diagnostics for components with external templates.
          //
          // When showing diagnostics for a TS source file, we want to only include kinds 1 and
          // 2 - those diagnostics which are reported at a location within the TS file itself.
          // Diagnostics for external templates will be shown when editing that template file
          // (the `else` block) below.
          //
          // Currently, indirect inline template diagnostics (kind 3) are not shown at all by
          // the Language Service, because there is no sensible location in the user's code for
          // them. Such templates are an edge case, though, and should not be common.
          //
          // TODO(alxhub): figure out a good user experience for indirect template diagnostics
          // and show them from within the Language Service.
          diagnostics.push(...ngDiagnostics.filter(
              diag => diag.file !== undefined && diag.file.fileName === sourceFile.fileName));
        }
      } else {
        const components = compiler.getComponentsWithTemplateFile(fileName);
        for (const component of components) {
          if (ts.isClassDeclaration(component)) {
            diagnostics.push(...ttc.getDiagnosticsForComponent(component));
          }
        }
      }
      return diagnostics;
    });
  }

  getDefinitionAndBoundSpan(fileName: string, position: number): ts.DefinitionInfoAndBoundSpan
      |undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsDefinition, (compiler) => {
      if (!isInAngularContext(compiler.getNextProgram(), fileName, position)) {
        return undefined;
      }
      return new DefinitionBuilder(this.tsLS, compiler)
          .getDefinitionAndBoundSpan(fileName, position);
    });
  }

  getTypeDefinitionAtPosition(fileName: string, position: number):
      readonly ts.DefinitionInfo[]|undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsDefinition, (compiler) => {
      if (!isTemplateContext(compiler.getNextProgram(), fileName, position)) {
        return undefined;
      }
      return new DefinitionBuilder(this.tsLS, compiler)
          .getTypeDefinitionsAtPosition(fileName, position);
    });
  }

  getQuickInfoAtPosition(fileName: string, position: number): ts.QuickInfo|undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsQuickInfo, (compiler) => {
      return this.getQuickInfoAtPositionImpl(fileName, position, compiler);
    });
  }

  private getQuickInfoAtPositionImpl(
      fileName: string,
      position: number,
      compiler: NgCompiler,
      ): ts.QuickInfo|undefined {
    if (!isTemplateContext(compiler.getNextProgram(), fileName, position)) {
      return undefined;
    }

    const templateInfo = getTemplateInfoAtPosition(fileName, position, compiler);
    if (templateInfo === undefined) {
      return undefined;
    }
    const positionDetails = getTargetAtPosition(templateInfo.template, position);
    if (positionDetails === null) {
      return undefined;
    }

    // Because we can only show 1 quick info, just use the bound attribute if the target is a two
    // way binding. We may consider concatenating additional display parts from the other target
    // nodes or representing the two way binding in some other manner in the future.
    const node = positionDetails.context.kind === TargetNodeKind.TwoWayBindingContext ?
        positionDetails.context.nodes[0] :
        positionDetails.context.node;
    return new QuickInfoBuilder(this.tsLS, compiler, templateInfo.component, node).get();
  }

  getReferencesAtPosition(fileName: string, position: number): ts.ReferenceEntry[]|undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsReferencesAndRenames, (compiler) => {
      return new ReferencesAndRenameBuilder(this.strategy, this.tsLS, compiler)
          .getReferencesAtPosition(fileName, position);
    });
  }

  getRenameInfo(fileName: string, position: number): ts.RenameInfo {
    return this.withCompilerAndPerfTracing(PerfPhase.LsReferencesAndRenames, (compiler) => {
      const renameInfo = new ReferencesAndRenameBuilder(this.strategy, this.tsLS, compiler)
                             .getRenameInfo(absoluteFrom(fileName), position);
      if (!renameInfo.canRename) {
        return renameInfo;
      }

      const quickInfo = this.getQuickInfoAtPositionImpl(fileName, position, compiler) ??
          this.tsLS.getQuickInfoAtPosition(fileName, position);
      const kind = quickInfo?.kind ?? ts.ScriptElementKind.unknown;
      const kindModifiers = quickInfo?.kindModifiers ?? ts.ScriptElementKind.unknown;
      return {...renameInfo, kind, kindModifiers};
    });
  }

  findRenameLocations(fileName: string, position: number): readonly ts.RenameLocation[]|undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsReferencesAndRenames, (compiler) => {
      return new ReferencesAndRenameBuilder(this.strategy, this.tsLS, compiler)
          .findRenameLocations(fileName, position);
    });
  }

  private getCompletionBuilder(fileName: string, position: number, compiler: NgCompiler):
      CompletionBuilder<TmplAstNode|AST>|null {
    const templateInfo = getTemplateInfoAtPosition(fileName, position, compiler);
    if (templateInfo === undefined) {
      return null;
    }
    const positionDetails = getTargetAtPosition(templateInfo.template, position);
    if (positionDetails === null) {
      return null;
    }

    // For two-way bindings, we actually only need to be concerned with the bound attribute because
    // the bindings in the template are written with the attribute name, not the event name.
    const node = positionDetails.context.kind === TargetNodeKind.TwoWayBindingContext ?
        positionDetails.context.nodes[0] :
        positionDetails.context.node;
    return new CompletionBuilder(
        this.tsLS, compiler, templateInfo.component, node, positionDetails);
  }

  getCompletionsAtPosition(
      fileName: string, position: number, options: ts.GetCompletionsAtPositionOptions|undefined):
      ts.WithMetadata<ts.CompletionInfo>|undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsCompletions, (compiler) => {
      return this.getCompletionsAtPositionImpl(fileName, position, options, compiler);
    });
  }

  private getCompletionsAtPositionImpl(
      fileName: string, position: number, options: ts.GetCompletionsAtPositionOptions|undefined,
      compiler: NgCompiler): ts.WithMetadata<ts.CompletionInfo>|undefined {
    if (!isTemplateContext(compiler.getNextProgram(), fileName, position)) {
      return undefined;
    }

    const builder = this.getCompletionBuilder(fileName, position, compiler);
    if (builder === null) {
      return undefined;
    }
    return builder.getCompletionsAtPosition(options);
  }

  getCompletionEntryDetails(
      fileName: string, position: number, entryName: string,
      formatOptions: ts.FormatCodeOptions|ts.FormatCodeSettings|undefined,
      preferences: ts.UserPreferences|undefined): ts.CompletionEntryDetails|undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsCompletions, (compiler) => {
      if (!isTemplateContext(compiler.getNextProgram(), fileName, position)) {
        return undefined;
      }

      const builder = this.getCompletionBuilder(fileName, position, compiler);
      if (builder === null) {
        return undefined;
      }
      return builder.getCompletionEntryDetails(entryName, formatOptions, preferences);
    });
  }

  getCompletionEntrySymbol(fileName: string, position: number, entryName: string): ts.Symbol
      |undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsCompletions, (compiler) => {
      if (!isTemplateContext(compiler.getNextProgram(), fileName, position)) {
        return undefined;
      }

      const builder = this.getCompletionBuilder(fileName, position, compiler);
      if (builder === null) {
        return undefined;
      }
      const result = builder.getCompletionEntrySymbol(entryName);
      this.compilerFactory.registerLastKnownProgram();
      return result;
    });
  }

  getComponentLocationsForTemplate(fileName: string): GetComponentLocationsForTemplateResponse {
    return this.withCompilerAndPerfTracing<GetComponentLocationsForTemplateResponse>(
        PerfPhase.LsComponentLocations, (compiler) => {
          const components = compiler.getComponentsWithTemplateFile(fileName);
          const componentDeclarationLocations: ts.DocumentSpan[] =
              Array.from(components.values()).map(c => {
                let contextSpan: ts.TextSpan|undefined = undefined;
                let textSpan: ts.TextSpan;
                if (isNamedClassDeclaration(c)) {
                  textSpan = ts.createTextSpanFromBounds(c.name.getStart(), c.name.getEnd());
                  contextSpan = ts.createTextSpanFromBounds(c.getStart(), c.getEnd());
                } else {
                  textSpan = ts.createTextSpanFromBounds(c.getStart(), c.getEnd());
                }
                return {
                  fileName: c.getSourceFile().fileName,
                  textSpan,
                  contextSpan,
                };
              });
          return componentDeclarationLocations;
        });
  }

  getTcb(fileName: string, position: number): GetTcbResponse|undefined {
    return this.withCompilerAndPerfTracing<GetTcbResponse|undefined>(PerfPhase.LsTcb, compiler => {
      const templateInfo = getTemplateInfoAtPosition(fileName, position, compiler);
      if (templateInfo === undefined) {
        return undefined;
      }
      const tcb = compiler.getTemplateTypeChecker().getTypeCheckBlock(templateInfo.component);
      if (tcb === null) {
        return undefined;
      }
      const sf = tcb.getSourceFile();

      let selections: ts.TextSpan[] = [];
      const target = getTargetAtPosition(templateInfo.template, position);
      if (target !== null) {
        let selectionSpans: Array<ParseSourceSpan|AbsoluteSourceSpan>;
        if ('nodes' in target.context) {
          selectionSpans = target.context.nodes.map(n => n.sourceSpan);
        } else {
          selectionSpans = [target.context.node.sourceSpan];
        }
        const selectionNodes: ts.Node[] =
            selectionSpans
                .map(s => findFirstMatchingNode(tcb, {
                       withSpan: s,
                       filter: (node: ts.Node): node is ts.Node => true,
                     }))
                .filter((n): n is ts.Node => n !== null);

        selections = selectionNodes.map(n => {
          return {
            start: n.getStart(sf),
            length: n.getEnd() - n.getStart(sf),
          };
        });
      }

      return {
        fileName: sf.fileName,
        content: sf.getFullText(),
        selections,
      };
    });
  }

  /**
   * Provides an instance of the `NgCompiler` and traces perf results. Perf results are logged only
   * if the log level is verbose or higher. This method is intended to be called once per public
   * method call.
   *
   * Here is an example of the log output.
   *
   * Perf 245  [16:16:39.353] LanguageService#getQuickInfoAtPosition(): {"events":{},"phases":{
   * "Unaccounted":379,"TtcSymbol":4},"memory":{}}
   *
   * Passing name of caller instead of using `arguments.caller` because 'caller', 'callee', and
   * 'arguments' properties may not be accessed in strict mode.
   *
   * @param phase the `PerfPhase` to execute the `p` callback in
   * @param p callback to be run synchronously with an instance of the `NgCompiler` as argument
   * @return the result of running the `p` callback
   */
  private withCompilerAndPerfTracing<T>(phase: PerfPhase, p: (compiler: NgCompiler) => T): T {
    const compiler = this.compilerFactory.getOrCreate();
    const result = compiler.perfRecorder.inPhase(phase, () => p(compiler));
    this.compilerFactory.registerLastKnownProgram();

    const logger = this.project.projectService.logger;
    if (logger.hasLevel(ts.server.LogLevel.verbose)) {
      logger.perftrc(`LanguageService#${PerfPhase[phase]}: ${
          JSON.stringify(compiler.perfRecorder.finalize())}`);
    }

    return result;
  }

  getCompilerOptionsDiagnostics(): ts.Diagnostic[] {
    const project = this.project;
    if (!(project instanceof ts.server.ConfiguredProject)) {
      return [];
    }

    return this.withCompilerAndPerfTracing(PerfPhase.LsDiagnostics, (compiler) => {
      const diagnostics: ts.Diagnostic[] = [];
      const configSourceFile = ts.readJsonConfigFile(
          project.getConfigFilePath(), (path: string) => project.readFile(path));

      if (!this.options.strictTemplates && !this.options.fullTemplateTypeCheck) {
        diagnostics.push({
          messageText: 'Some language features are not available. ' +
              'To access all features, enable `strictTemplates` in `angularCompilerOptions`.',
          category: ts.DiagnosticCategory.Suggestion,
          code: ngErrorCode(ErrorCode.SUGGEST_STRICT_TEMPLATES),
          file: configSourceFile,
          start: undefined,
          length: undefined,
        });
      }

      diagnostics.push(...compiler.getOptionDiagnostics());

      return diagnostics;
    });
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
            this.options = parseNgCompilerOptions(project, this.parseConfigHost, this.config);
            logCompilerOptions(project, this.options);
          }
        });
  }
}

function logCompilerOptions(project: ts.server.Project, options: CompilerOptions) {
  const {logger} = project.projectService;
  const projectName = project.getProjectName();
  logger.info(`Angular compiler options for ${projectName}: ` + JSON.stringify(options, null, 2));
}

function parseNgCompilerOptions(
    project: ts.server.Project, host: ConfigurationHost,
    config: LanguageServiceConfig): CompilerOptions {
  if (!(project instanceof ts.server.ConfiguredProject)) {
    return {};
  }
  const {options, errors} =
      readConfiguration(project.getConfigFilePath(), /* existingOptions */ undefined, host);
  if (errors.length > 0) {
    project.setProjectErrors(errors);
  }

  // Projects loaded into the Language Service often include test files which are not part of the
  // app's main compilation unit, and these test files often include inline NgModules that declare
  // components from the app. These declarations conflict with the main declarations of such
  // components in the app's NgModules. This conflict is not normally present during regular
  // compilation because the app and the tests are part of separate compilation units.
  //
  // As a temporary mitigation of this problem, we instruct the compiler to ignore classes which
  // are not exported. In many cases, this ensures the test NgModules are ignored by the compiler
  // and only the real component declaration is used.
  options.compileNonExportedClasses = false;

  // If `forceStrictTemplates` is true, always enable `strictTemplates`
  // regardless of its value in tsconfig.json.
  if (config.forceStrictTemplates === true) {
    options.strictTemplates = true;
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
        true,  // openedByClient
        '',    // fileContent
        // script info added by plugins should be marked as external, see
        // https://github.com/microsoft/TypeScript/blob/b217f22e798c781f55d17da72ed099a9dee5c650/src/compiler/program.ts#L1897-L1899
        ts.ScriptKind.External,  // scriptKind
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

function isTemplateContext(program: ts.Program, fileName: string, position: number): boolean {
  if (!isTypeScriptFile(fileName)) {
    // If we aren't in a TS file, we must be in an HTML file, which we treat as template context
    return true;
  }

  const node = findTightestNodeAtPosition(program, fileName, position);
  if (node === undefined) {
    return false;
  }

  let asgn = getPropertyAssignmentFromValue(node, 'template');
  if (asgn === null) {
    return false;
  }
  return getClassDeclFromDecoratorProp(asgn) !== null;
}

function isInAngularContext(program: ts.Program, fileName: string, position: number) {
  if (!isTypeScriptFile(fileName)) {
    return true;
  }

  const node = findTightestNodeAtPosition(program, fileName, position);
  if (node === undefined) {
    return false;
  }

  const asgn = getPropertyAssignmentFromValue(node, 'template') ??
      getPropertyAssignmentFromValue(node, 'templateUrl') ??
      getPropertyAssignmentFromValue(node.parent, 'styleUrls');
  return asgn !== null && getClassDeclFromDecoratorProp(asgn) !== null;
}

function findTightestNodeAtPosition(program: ts.Program, fileName: string, position: number) {
  const sourceFile = program.getSourceFile(fileName);
  if (sourceFile === undefined) {
    return undefined;
  }

  return findTightestNode(sourceFile, position);
}
