/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, TmplAstNode} from '@angular/compiler';
import {CompilerOptions, ConfigurationHost, readConfiguration} from '@angular/compiler-cli';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {ErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import {absoluteFrom, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {PerfPhase} from '@angular/compiler-cli/src/ngtsc/perf';
import {FileUpdate, ProgramDriver} from '@angular/compiler-cli/src/ngtsc/program_driver';
import {isNamedClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import {OptimizeFor} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

import {
  ApplyRefactoringProgressFn,
  ApplyRefactoringResult,
  GetComponentLocationsForTemplateResponse,
  GetTcbResponse,
  GetTemplateLocationForComponentResponse,
  PluginConfig,
} from '../api';

import {LanguageServiceAdapter, LSParseConfigHost} from './adapters';
import {ALL_CODE_FIXES_METAS, CodeFixes} from './codefixes';
import {CompilerFactory} from './compiler_factory';
import {CompletionBuilder} from './completions';
import {DefinitionBuilder} from './definitions';
import {getOutliningSpans} from './outlining_spans';
import {QuickInfoBuilder} from './quick_info';
import {ReferencesBuilder, RenameBuilder} from './references_and_rename';
import {createLocationKey} from './references_and_rename_utils';
import {getSignatureHelp} from './signature_help';
import {
  getTargetAtPosition,
  getTcbNodesOfTemplateAtPosition,
  TargetNodeKind,
} from './template_target';
import {
  findTightestNode,
  getClassDeclFromDecoratorProp,
  getParentClassDeclaration,
  getPropertyAssignmentFromValue,
} from './utils/ts_utils';
import {getTypeCheckInfoAtPosition, isTypeScriptFile, TypeCheckInfo} from './utils';
import {ActiveRefactoring, allRefactorings} from './refactorings/refactoring';
import {getClassificationsForTemplate, TokenEncodingConsts} from './semantic_tokens';
import {isExternalResource} from '@angular/compiler-cli/src/ngtsc/metadata';

type LanguageServiceConfig = Omit<PluginConfig, 'angularOnly'>;

// Whether the language service should suppress the below for google3.
const enableG3Suppression = false;

// The Copybara config that syncs the language service into g3 will be patched to
// always suppress any diagnostics in this list.
// See `angular2/copy.bara.sky` for more information.
const suppressDiagnosticsInG3: number[] = [
  parseInt(`-99${ErrorCode.COMPONENT_RESOURCE_NOT_FOUND}`),
  parseInt(`-99${ErrorCode.INLINE_TCB_REQUIRED}`),
];

export class LanguageService {
  private options: CompilerOptions;
  readonly compilerFactory: CompilerFactory;
  private readonly codeFixes: CodeFixes;
  private readonly activeRefactorings = new Map<string, ActiveRefactoring>();

  constructor(
    private readonly project: ts.server.Project,
    private readonly tsLS: ts.LanguageService,
    private readonly config: Omit<PluginConfig, 'angularOnly'>,
  ) {
    if (project.projectKind === ts.server.ProjectKind.Configured) {
      const parseConfigHost = new LSParseConfigHost(project.projectService.host);
      this.options = parseNgCompilerOptions(project, parseConfigHost, config);
      this.watchConfigFile(project, parseConfigHost);
    } else {
      this.options = project.getCompilerOptions();
    }
    logCompilerOptions(project, this.options);

    const programDriver = createProgramDriver(project);
    const adapter = new LanguageServiceAdapter(project);
    this.compilerFactory = new CompilerFactory(adapter, programDriver, this.options);
    this.codeFixes = new CodeFixes(tsLS, ALL_CODE_FIXES_METAS);
  }

  getCompilerOptions(): CompilerOptions {
    return this.options;
  }

  getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
    return this.withCompilerAndPerfTracing(PerfPhase.LsDiagnostics, (compiler) => {
      let diagnostics: ts.Diagnostic[] = [];
      if (isTypeScriptFile(fileName)) {
        const program = compiler.getCurrentProgram();
        const sourceFile = program.getSourceFile(fileName);
        if (sourceFile) {
          const ngDiagnostics = compiler.getDiagnosticsForFile(sourceFile, OptimizeFor.SingleFile);
          diagnostics.push(...filterNgDiagnosticsForFile(ngDiagnostics, sourceFile.fileName));
        }
      } else {
        const components = compiler.getComponentsWithTemplateFile(fileName);
        for (const component of components) {
          if (ts.isClassDeclaration(component)) {
            diagnostics.push(...compiler.getDiagnosticsForComponent(component));
          }
        }
      }
      if (this.config.suppressAngularDiagnosticCodes) {
        diagnostics = diagnostics.filter(
          (diag) => !this.config.suppressAngularDiagnosticCodes!.includes(diag.code),
        );
      }
      if (enableG3Suppression) {
        diagnostics = diagnostics.filter((diag) => !suppressDiagnosticsInG3.includes(diag.code));
      }
      return diagnostics;
    });
  }

  getSuggestionDiagnostics(fileName: string): ts.DiagnosticWithLocation[] {
    return this.withCompilerAndPerfTracing(PerfPhase.LsSuggestionDiagnostics, (compiler) => {
      const diagnostics: ts.DiagnosticWithLocation[] = [];
      if (isTypeScriptFile(fileName)) {
        const program = compiler.getCurrentProgram();
        const sourceFile = program.getSourceFile(fileName);
        if (sourceFile) {
          const ngDiagnostics = compiler
            .getTemplateTypeChecker()
            .getSuggestionDiagnosticsForFile(sourceFile, this.tsLS, OptimizeFor.SingleFile);
          diagnostics.push(...filterNgDiagnosticsForFile(ngDiagnostics, sourceFile.fileName));
        }
      } else {
        const components = compiler.getComponentsWithTemplateFile(fileName);
        for (const component of components) {
          if (ts.isClassDeclaration(component)) {
            diagnostics.push(
              ...compiler
                .getTemplateTypeChecker()
                .getSuggestionDiagnosticsForComponent(component, this.tsLS),
            );
          }
        }
      }
      return diagnostics;
    });
  }

  getDefinitionAndBoundSpan(
    fileName: string,
    position: number,
  ): ts.DefinitionInfoAndBoundSpan | undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsDefinition, (compiler) => {
      if (!isInAngularContext(compiler.getCurrentProgram(), fileName, position)) {
        return undefined;
      }
      return new DefinitionBuilder(this.tsLS, compiler).getDefinitionAndBoundSpan(
        fileName,
        position,
      );
    });
  }

  getTypeDefinitionAtPosition(
    fileName: string,
    position: number,
  ): readonly ts.DefinitionInfo[] | undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsDefinition, (compiler) => {
      if (!isInTypeCheckContext(compiler.getCurrentProgram(), fileName, position)) {
        return undefined;
      }
      return new DefinitionBuilder(this.tsLS, compiler).getTypeDefinitionsAtPosition(
        fileName,
        position,
      );
    });
  }

  getQuickInfoAtPosition(fileName: string, position: number): ts.QuickInfo | undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsQuickInfo, (compiler) => {
      return this.getQuickInfoAtPositionImpl(fileName, position, compiler);
    });
  }

  private getQuickInfoAtPositionImpl(
    fileName: string,
    position: number,
    compiler: NgCompiler,
  ): ts.QuickInfo | undefined {
    if (!isInTypeCheckContext(compiler.getCurrentProgram(), fileName, position)) {
      return undefined;
    }

    const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, position, compiler);
    if (typeCheckInfo === undefined) {
      return undefined;
    }
    const positionDetails = getTargetAtPosition(typeCheckInfo.nodes, position);
    if (positionDetails === null) {
      return undefined;
    }

    // Because we can only show 1 quick info, just use the bound attribute if the target is a two
    // way binding. We may consider concatenating additional display parts from the other target
    // nodes or representing the two way binding in some other manner in the future.
    const node =
      positionDetails.context.kind === TargetNodeKind.TwoWayBindingContext
        ? positionDetails.context.nodes[0]
        : positionDetails.context.node;
    return new QuickInfoBuilder(
      this.tsLS,
      compiler,
      typeCheckInfo.declaration,
      node,
      positionDetails,
    ).get();
  }

  getReferencesAtPosition(fileName: string, position: number): ts.ReferenceEntry[] | undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsReferencesAndRenames, (compiler) => {
      const results = new ReferencesBuilder(this.tsLS, compiler).getReferencesAtPosition(
        fileName,
        position,
      );
      return results === undefined ? undefined : getUniqueLocations(results);
    });
  }

  getRenameInfo(fileName: string, position: number): ts.RenameInfo {
    return this.withCompilerAndPerfTracing(PerfPhase.LsReferencesAndRenames, (compiler) => {
      const renameInfo = new RenameBuilder(this.tsLS, compiler).getRenameInfo(
        absoluteFrom(fileName),
        position,
      );
      if (!renameInfo.canRename) {
        return renameInfo;
      }

      const quickInfo =
        this.getQuickInfoAtPositionImpl(fileName, position, compiler) ??
        this.tsLS.getQuickInfoAtPosition(fileName, position);
      const kind = quickInfo?.kind ?? ts.ScriptElementKind.unknown;
      const kindModifiers = quickInfo?.kindModifiers ?? ts.ScriptElementKind.unknown;
      return {...renameInfo, kind, kindModifiers};
    });
  }

  findRenameLocations(
    fileName: string,
    position: number,
  ): readonly ts.RenameLocation[] | undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsReferencesAndRenames, (compiler) => {
      const results = new RenameBuilder(this.tsLS, compiler).findRenameLocations(
        fileName,
        position,
      );
      return results === null ? undefined : getUniqueLocations(results);
    });
  }

  private getCompletionBuilder(
    fileName: string,
    position: number,
    compiler: NgCompiler,
  ): CompletionBuilder<TmplAstNode | AST> | null {
    const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, position, compiler);
    if (typeCheckInfo === undefined) {
      return null;
    }
    const positionDetails = getTargetAtPosition(typeCheckInfo.nodes, position);
    if (positionDetails === null) {
      return null;
    }

    // For two-way bindings, we actually only need to be concerned with the bound attribute because
    // the bindings in the template are written with the attribute name, not the event name.
    const node =
      positionDetails.context.kind === TargetNodeKind.TwoWayBindingContext
        ? positionDetails.context.nodes[0]
        : positionDetails.context.node;
    return new CompletionBuilder(
      this.tsLS,
      compiler,
      typeCheckInfo.declaration,
      node,
      positionDetails,
    );
  }

  getEncodedSemanticClassifications(
    fileName: string,
    span: ts.TextSpan,
    format: ts.SemanticClassificationFormat | undefined,
  ): ts.Classifications {
    return this.withCompilerAndPerfTracing(PerfPhase.LSSemanticClassification, (compiler) => {
      return this.getEncodedSemanticClassificationsImpl(fileName, span, format, compiler);
    });
  }

  private getEncodedSemanticClassificationsImpl(
    fileName: string,
    span: ts.TextSpan,
    format: ts.SemanticClassificationFormat | undefined,
    compiler: NgCompiler,
  ): ts.Classifications {
    if (format == ts.SemanticClassificationFormat.Original) {
      return {spans: [], endOfLineState: ts.EndOfLineState.None};
    }

    if (isTypeScriptFile(fileName)) {
      const sf = compiler.getCurrentProgram().getSourceFile(fileName);
      if (sf === undefined) {
        return {spans: [], endOfLineState: ts.EndOfLineState.None};
      }

      const classDeclarations: ts.ClassDeclaration[] = [];
      sf.forEachChild((node) => {
        if (ts.isClassDeclaration(node)) {
          classDeclarations.push(node);
        }
      });

      const hasInlineTemplate = (classDecl: ts.ClassDeclaration) => {
        const resources = compiler.getDirectiveResources(classDecl);
        return resources && resources.template && !isExternalResource(resources.template);
      };

      const typeCheckInfos: TypeCheckInfo[] = [];
      const templateChecker = compiler.getTemplateTypeChecker();

      for (const classDecl of classDeclarations) {
        if (!hasInlineTemplate(classDecl)) {
          continue;
        }
        const template = templateChecker.getTemplate(classDecl);
        if (template !== null) {
          typeCheckInfos.push({
            nodes: template,
            declaration: classDecl,
          });
        }
      }

      const spans = [];
      for (const templInfo of typeCheckInfos) {
        const classifications = getClassificationsForTemplate(compiler, templInfo, span);
        spans.push(...classifications.spans);
      }

      return {spans, endOfLineState: ts.EndOfLineState.None};
    } else {
      const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, span.start, compiler);
      if (typeCheckInfo === undefined) {
        return {spans: [], endOfLineState: ts.EndOfLineState.None};
      }

      return getClassificationsForTemplate(compiler, typeCheckInfo, span);
    }
  }

  getTokenTypeFromClassification(classification: number): number | undefined {
    if (classification > TokenEncodingConsts.modifierMask) {
      return (classification >> TokenEncodingConsts.typeOffset) - 1;
    }
    return undefined;
  }

  getTokenModifierFromClassification(classification: number) {
    return classification & TokenEncodingConsts.modifierMask;
  }

  getCompletionsAtPosition(
    fileName: string,
    position: number,
    options: ts.GetCompletionsAtPositionOptions | undefined,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsCompletions, (compiler) => {
      return this.getCompletionsAtPositionImpl(fileName, position, options, compiler);
    });
  }

  private getCompletionsAtPositionImpl(
    fileName: string,
    position: number,
    options: ts.GetCompletionsAtPositionOptions | undefined,
    compiler: NgCompiler,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    if (!isInTypeCheckContext(compiler.getCurrentProgram(), fileName, position)) {
      return undefined;
    }

    const builder = this.getCompletionBuilder(fileName, position, compiler);
    if (builder === null) {
      return undefined;
    }
    return builder.getCompletionsAtPosition(options);
  }

  getCompletionEntryDetails(
    fileName: string,
    position: number,
    entryName: string,
    formatOptions: ts.FormatCodeOptions | ts.FormatCodeSettings | undefined,
    preferences: ts.UserPreferences | undefined,
    data: ts.CompletionEntryData | undefined,
  ): ts.CompletionEntryDetails | undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsCompletions, (compiler) => {
      if (!isInTypeCheckContext(compiler.getCurrentProgram(), fileName, position)) {
        return undefined;
      }

      const builder = this.getCompletionBuilder(fileName, position, compiler);
      if (builder === null) {
        return undefined;
      }
      return builder.getCompletionEntryDetails(entryName, formatOptions, preferences, data);
    });
  }

  getSignatureHelpItems(
    fileName: string,
    position: number,
    options?: ts.SignatureHelpItemsOptions,
  ): ts.SignatureHelpItems | undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsSignatureHelp, (compiler) => {
      if (!isInTypeCheckContext(compiler.getCurrentProgram(), fileName, position)) {
        return undefined;
      }

      return getSignatureHelp(compiler, this.tsLS, fileName, position, options);
    });
  }

  getOutliningSpans(fileName: string): ts.OutliningSpan[] {
    return this.withCompilerAndPerfTracing(PerfPhase.OutliningSpans, (compiler) => {
      return getOutliningSpans(compiler, fileName);
    });
  }

  getCompletionEntrySymbol(
    fileName: string,
    position: number,
    entryName: string,
  ): ts.Symbol | undefined {
    return this.withCompilerAndPerfTracing(PerfPhase.LsCompletions, (compiler) => {
      if (!isInTypeCheckContext(compiler.getCurrentProgram(), fileName, position)) {
        return undefined;
      }

      const builder = this.getCompletionBuilder(fileName, position, compiler);
      if (builder === null) {
        return undefined;
      }
      const result = builder.getCompletionEntrySymbol(entryName);
      return result;
    });
  }

  /**
   * Performance helper that can help make quick decisions for
   * the VSCode language server to decide whether a code fix exists
   * for the given error code.
   *
   * Related context: https://github.com/angular/vscode-ng-language-service/pull/2050#discussion_r1673079263
   */
  hasCodeFixesForErrorCode(errorCode: number): boolean {
    return this.codeFixes.hasFixForCode(errorCode);
  }

  getCodeFixesAtPosition(
    fileName: string,
    start: number,
    end: number,
    errorCodes: readonly number[],
    formatOptions: ts.FormatCodeSettings,
    preferences: ts.UserPreferences,
  ): readonly ts.CodeFixAction[] {
    return this.withCompilerAndPerfTracing<readonly ts.CodeFixAction[]>(
      PerfPhase.LsCodeFixes,
      (compiler) => {
        // Fast exit if we know no code fix can exist for the given range/and error codes.
        if (errorCodes.every((code) => !this.hasCodeFixesForErrorCode(code))) {
          return [];
        }

        const diags = this.getSemanticDiagnostics(fileName);
        if (diags.length === 0) {
          return [];
        }
        return this.codeFixes.getCodeFixesAtPosition(
          fileName,
          getTypeCheckInfoAtPosition(fileName, start, compiler) ?? null,
          compiler,
          start,
          end,
          errorCodes,
          diags,
          formatOptions,
          preferences,
        );
      },
    );
  }

  getCombinedCodeFix(
    scope: ts.CombinedCodeFixScope,
    fixId: string,
    formatOptions: ts.FormatCodeSettings,
    preferences: ts.UserPreferences,
  ): ts.CombinedCodeActions {
    return this.withCompilerAndPerfTracing<ts.CombinedCodeActions>(
      PerfPhase.LsCodeFixesAll,
      (compiler) => {
        const diags = this.getSemanticDiagnostics(scope.fileName);
        if (diags.length === 0) {
          return {changes: []};
        }
        return this.codeFixes.getAllCodeActions(
          compiler,
          diags,
          scope,
          fixId,
          formatOptions,
          preferences,
        );
      },
    );
  }

  getComponentLocationsForTemplate(fileName: string): GetComponentLocationsForTemplateResponse {
    return this.withCompilerAndPerfTracing<GetComponentLocationsForTemplateResponse>(
      PerfPhase.LsComponentLocations,
      (compiler) => {
        const components = compiler.getComponentsWithTemplateFile(fileName);
        const componentDeclarationLocations: ts.DocumentSpan[] = Array.from(
          components.values(),
        ).map((c) => {
          let contextSpan: ts.TextSpan | undefined = undefined;
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
      },
    );
  }

  getTemplateLocationForComponent(
    fileName: string,
    position: number,
  ): GetTemplateLocationForComponentResponse {
    return this.withCompilerAndPerfTracing<GetTemplateLocationForComponentResponse>(
      PerfPhase.LsComponentLocations,
      (compiler) => {
        const nearestNode = findTightestNodeAtPosition(
          compiler.getCurrentProgram(),
          fileName,
          position,
        );
        if (nearestNode === undefined) {
          return undefined;
        }
        const classDeclaration = getParentClassDeclaration(nearestNode);
        if (classDeclaration === undefined) {
          return undefined;
        }
        const template = compiler.getDirectiveResources(classDeclaration)?.template || null;
        if (template === null) {
          return undefined;
        }
        let templateFileName: string;
        let span: ts.TextSpan;
        if (template.path !== null) {
          span = ts.createTextSpanFromBounds(0, 0);
          templateFileName = template.path;
        } else {
          span = ts.createTextSpanFromBounds(template.node.getStart(), template.node.getEnd());
          templateFileName = template.node.getSourceFile().fileName;
        }
        return {fileName: templateFileName, textSpan: span, contextSpan: span};
      },
    );
  }

  getTcb(fileName: string, position: number): GetTcbResponse | undefined {
    return this.withCompilerAndPerfTracing<GetTcbResponse | undefined>(
      PerfPhase.LsTcb,
      (compiler) => {
        const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, position, compiler);
        if (typeCheckInfo === undefined) {
          return undefined;
        }

        const selectionNodesInfo = getTcbNodesOfTemplateAtPosition(
          typeCheckInfo,
          position,
          compiler,
        );
        if (selectionNodesInfo === null) {
          return undefined;
        }

        const sf = selectionNodesInfo.componentTcbNode.getSourceFile();

        const selections = selectionNodesInfo.nodes.map((n) => {
          return {
            start: n.getStart(sf),
            length: n.getEnd() - n.getStart(sf),
          };
        });

        return {
          fileName: sf.fileName,
          content: sf.getFullText(),
          selections,
        };
      },
    );
  }

  getPossibleRefactorings(
    fileName: string,
    positionOrRange: number | ts.TextRange,
  ): ts.ApplicableRefactorInfo[] {
    return this.withCompilerAndPerfTracing(
      PerfPhase.LSComputeApplicableRefactorings,
      (compiler) => {
        return allRefactorings
          .filter((r) => r.isApplicable(compiler, fileName, positionOrRange))
          .map((r) => ({name: r.id, description: r.description, actions: []}));
      },
    );
  }

  /**
   * Computes edits for applying the specified refactoring.
   *
   * VSCode explicitly split code actions into two stages:
   *
   *  - 1) what actions are active?
   *  - 2) what are the edits? <- if the user presses the button
   *
   * The latter stage may take longer to compute complex edits, perform
   * analysis. This stage is currently implemented via our non-LSP standard
   * `applyRefactoring` method. We implemented it in a way to support asynchronous
   * computation, so that it can easily integrate with migrations that aren't
   * synchronous/or compute edits in parallel.
   */
  async applyRefactoring(
    fileName: string,
    positionOrRange: number | ts.TextRange,
    refactorName: string,
    reportProgress: ApplyRefactoringProgressFn,
  ): Promise<ApplyRefactoringResult | undefined> {
    const matchingRefactoring = allRefactorings.find((r) => r.id === refactorName);
    if (matchingRefactoring === undefined) {
      return undefined;
    }

    return this.withCompilerAndPerfTracing(PerfPhase.LSApplyRefactoring, (compiler) => {
      if (!this.activeRefactorings.has(refactorName)) {
        this.activeRefactorings.set(refactorName, new matchingRefactoring(this.project));
      }
      const activeRefactoring = this.activeRefactorings.get(refactorName)!;

      return activeRefactoring.computeEditsForFix(
        compiler,
        this.options,
        fileName,
        positionOrRange,
        reportProgress,
      );
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
    const logger = this.project.projectService.logger;
    if (logger.hasLevel(ts.server.LogLevel.verbose)) {
      logger.perftrc(
        `LanguageService#${PerfPhase[phase]}: ${JSON.stringify(compiler.perfRecorder.finalize())}`,
      );
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
      const configSourceFile = ts.readJsonConfigFile(project.getConfigFilePath(), (path: string) =>
        project.readFile(path),
      );

      if (!this.options.strictTemplates && !this.options.fullTemplateTypeCheck) {
        diagnostics.push({
          messageText:
            'Some language features are not available. ' +
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

  private watchConfigFile(project: ts.server.Project, parseConfigHost: LSParseConfigHost) {
    // TODO: Check the case when the project is disposed. An InferredProject
    // could be disposed when a tsconfig.json is added to the workspace,
    // in which case it becomes a ConfiguredProject (or vice-versa).
    // We need to make sure that the FileWatcher is closed.
    if (!(project instanceof ts.server.ConfiguredProject)) {
      return;
    }
    const {host} = project.projectService;
    host.watchFile(
      project.getConfigFilePath(),
      (fileName: string, eventKind: ts.FileWatcherEventKind) => {
        project.log(`Config file changed: ${fileName}`);
        if (eventKind === ts.FileWatcherEventKind.Changed) {
          this.options = parseNgCompilerOptions(project, parseConfigHost, this.config);
          logCompilerOptions(project, this.options);
        }
      },
    );
  }
}

function logCompilerOptions(project: ts.server.Project, options: CompilerOptions) {
  const {logger} = project.projectService;
  const projectName = project.getProjectName();
  logger.info(`Angular compiler options for ${projectName}: ` + JSON.stringify(options, null, 2));
}

function parseNgCompilerOptions(
  project: ts.server.Project,
  host: ConfigurationHost,
  config: LanguageServiceConfig,
): CompilerOptions {
  if (!(project instanceof ts.server.ConfiguredProject)) {
    return {};
  }
  const {options, errors} = readConfiguration(
    project.getConfigFilePath(),
    /* existingOptions */ undefined,
    host,
  );
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
  if (config['forceStrictTemplates'] === true) {
    options.strictTemplates = true;
  }
  if (config['enableSelectorless'] === true) {
    options['_enableSelectorless'] = true;
  }

  options['_angularCoreVersion'] = config['angularCoreVersion'];

  return options;
}

function createProgramDriver(project: ts.server.Project): ProgramDriver {
  return {
    supportsInlineOperations: false,
    getProgram(): ts.Program {
      const program = project.getLanguageService().getProgram();
      if (!program) {
        throw new Error('Language service does not have a program!');
      }
      return program;
    },
    updateFiles(contents: Map<AbsoluteFsPath, FileUpdate>) {
      for (const [fileName, {newText}] of contents) {
        const scriptInfo = getOrCreateTypeCheckScriptInfo(project, fileName);
        const snapshot = scriptInfo.getSnapshot();
        const length = snapshot.getLength();
        scriptInfo.editContent(0, length, newText);
      }
    },
    getSourceFileVersion(sf: ts.SourceFile): string {
      return project.getScriptVersion(sf.fileName);
    },
  };
}

function getOrCreateTypeCheckScriptInfo(
  project: ts.server.Project,
  tcf: string,
): ts.server.ScriptInfo {
  // First check if there is already a ScriptInfo for the tcf
  const {projectService} = project;
  let scriptInfo = projectService.getScriptInfo(tcf);
  if (!scriptInfo) {
    // ScriptInfo needs to be opened by client to be able to set its user-defined
    // content. We must also provide file content, otherwise the service will
    // attempt to fetch the content from disk and fail.
    scriptInfo = projectService.getOrCreateScriptInfoForNormalizedPath(
      ts.server.toNormalizedPath(tcf),
      true, // openedByClient
      '', // fileContent
      // script info added by plugins should be marked as external, see
      // https://github.com/microsoft/TypeScript/blob/b217f22e798c781f55d17da72ed099a9dee5c650/src/compiler/program.ts#L1897-L1899
      ts.ScriptKind.External, // scriptKind
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

function isInTypeCheckContext(program: ts.Program, fileName: string, position: number): boolean {
  if (!isTypeScriptFile(fileName)) {
    // If we aren't in a TS file, we must be in an HTML file, which we treat as template context
    return true;
  }

  const node = findTightestNodeAtPosition(program, fileName, position);
  if (node === undefined) {
    return false;
  }

  const assignment = getPropertyAssignmentFromValue(node, 'template');
  if (assignment !== null) {
    return getClassDeclFromDecoratorProp(assignment) !== null;
  }
  return isHostBindingExpression(node);
}

function isHostBindingExpression(node: ts.Node): boolean {
  if (!ts.isStringLiteralLike(node)) {
    return false;
  }

  const assignment = closestAncestorNode(node, ts.isPropertyAssignment);
  if (assignment === null || assignment.initializer !== node) {
    return false;
  }

  const literal = closestAncestorNode(assignment, ts.isObjectLiteralExpression);
  if (literal === null) {
    return false;
  }

  const parentAssignment = getPropertyAssignmentFromValue(literal, 'host');
  if (parentAssignment === null || parentAssignment.initializer !== literal) {
    return false;
  }

  return getClassDeclFromDecoratorProp(parentAssignment) !== null;
}

function closestAncestorNode<T extends ts.Node>(
  start: ts.Node,
  predicate: (node: ts.Node) => node is T,
): T | null {
  let current = start.parent;

  while (current) {
    if (predicate(current)) {
      return current;
    } else {
      current = current.parent;
    }
  }

  return null;
}

function isInAngularContext(program: ts.Program, fileName: string, position: number) {
  if (!isTypeScriptFile(fileName)) {
    return true;
  }

  const node = findTightestNodeAtPosition(program, fileName, position);
  if (node === undefined) {
    return false;
  }

  if (isHostBindingExpression(node)) {
    return true;
  }

  const assignment =
    getPropertyAssignmentFromValue(node, 'template') ??
    getPropertyAssignmentFromValue(node, 'templateUrl') ??
    // `node.parent` is used because the string is a child of an array element and we want to get
    // the property name
    getPropertyAssignmentFromValue(node.parent, 'styleUrls') ??
    getPropertyAssignmentFromValue(node, 'styleUrl');
  return assignment !== null && getClassDeclFromDecoratorProp(assignment) !== null;
}

function findTightestNodeAtPosition(program: ts.Program, fileName: string, position: number) {
  const sourceFile = program.getSourceFile(fileName);
  if (sourceFile === undefined) {
    return undefined;
  }

  return findTightestNode(sourceFile, position);
}

function getUniqueLocations<T extends ts.DocumentSpan>(locations: readonly T[]): T[] {
  const uniqueLocations: Map<string, T> = new Map();
  for (const location of locations) {
    uniqueLocations.set(createLocationKey(location), location);
  }
  return Array.from(uniqueLocations.values());
}

/**
 * There are several kinds of diagnostics returned by `NgCompiler` for a source file:
 *
 * 1. Angular-related non-template diagnostics from decorated classes within that
 *    file.
 * 2. Template diagnostics for components with direct inline templates (a string
 *    literal).
 * 3. Template diagnostics for components with indirect inline templates (templates
 *    computed by expression).
 * 4. Template diagnostics for components with external templates.
 *
 * When showing diagnostics for a TS source file, we want to only include kinds 1 and
 * 2 - those diagnostics which are reported at a location within the TS file itself.
 * Diagnostics for external templates will be shown when editing that template file
 * (the `else` block) below.
 *
 * Currently, indirect inline template diagnostics (kind 3) are not shown at all by
 * the Language Service, because there is no sensible location in the user's code for
 * them. Such templates are an edge case, though, and should not be common.
 *
 * TODO(alxhub): figure out a good user experience for indirect template diagnostics
 * and show them from within the Language Service.
 */
function filterNgDiagnosticsForFile(
  diagnostics: (ts.Diagnostic | ts.DiagnosticWithLocation)[],
  fileName: string,
): ts.DiagnosticWithLocation[] {
  return diagnostics.filter((diag): diag is ts.DiagnosticWithLocation => {
    return diag.file !== undefined && diag.file.fileName === fileName;
  });
}
