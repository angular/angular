/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  BindingType,
  LiteralMap,
  LiteralPrimitive,
  TmplAstBoundAttribute,
  TmplAstNode,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {CompilerOptions, ConfigurationHost, readConfiguration} from '@angular/compiler-cli';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {
  ErrorCode,
  isFatalDiagnosticError,
  ngErrorCode,
} from '@angular/compiler-cli/src/ngtsc/diagnostics';
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
import {getInlayHintsForTemplate} from './inlay_hints';
import type {
  AngularInlayHint,
  InlayHintsConfig,
  CssDiagnosticsConfig,
  DocumentColorInfo,
  ColorInfo,
  ColorPresentation,
} from '../api';
import {
  getCssDiagnostics,
  DEFAULT_CSS_DIAGNOSTICS_CONFIG,
  parseColorValue,
  isColorProperty,
  getColorPresentations,
} from './css';
import {
  getEventDiagnostics,
  getOutputDefinitionDiagnostics,
  DEFAULT_EVENT_DIAGNOSTICS_CONFIG,
} from './events';
import {
  getAriaDiagnostics,
  DEFAULT_ARIA_DIAGNOSTICS_CONFIG,
  type AriaDiagnosticsConfig,
} from './aria';

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

          // Add CSS property validation diagnostics for components in this file
          // Note: This pattern (walking class declarations, using ttc.getTemplate) is similar
          // to getInlayHintsAtPosition - could be refactored to share a utility function.
          const cssConfig = this.getCssDiagnosticsConfig();
          const eventConfig = this.getEventDiagnosticsConfig();
          const ariaConfig = this.getAriaDiagnosticsConfig();
          if (cssConfig.enabled || eventConfig.enabled || ariaConfig.enabled) {
            const ttc = compiler.getTemplateTypeChecker();
            // Find all class declarations that are components/directives
            const visit = (node: ts.Node): void => {
              if (ts.isClassDeclaration(node)) {
                try {
                  // Check if this is a component/directive by getting its metadata
                  const meta = ttc.getDirectiveMetadata(node);
                  if (meta) {
                    try {
                      // Check outputs at definition site for all directives/components
                      if (eventConfig.enabled && eventConfig.warnOnShadowedEvents) {
                        const outputDiags = getOutputDefinitionDiagnostics(
                          node,
                          compiler,
                          eventConfig,
                        );
                        diagnostics.push(...outputDiags);
                      }

                      // For components with templates, also validate template events, CSS, and ARIA
                      const template = ttc.getTemplate(node);
                      if (template) {
                        if (cssConfig.enabled) {
                          const cssDiags = getCssDiagnostics(node, compiler, cssConfig);
                          diagnostics.push(...cssDiags);
                        }
                        if (eventConfig.enabled) {
                          const eventDiags = getEventDiagnostics(node, compiler, eventConfig);
                          diagnostics.push(...eventDiags);
                        }
                        if (ariaConfig.enabled) {
                          const ariaDiags = getAriaDiagnostics(node, compiler, ariaConfig);
                          diagnostics.push(...ariaDiags);
                        }
                      }
                    } catch {
                      // Skip diagnostics for components with compilation errors
                    }
                  }
                } catch {
                  // Not a component/directive or error getting metadata, skip
                }
              }
              ts.forEachChild(node, visit);
            };
            visit(sourceFile);
          }
        }
      } else {
        const components = compiler.getComponentsWithTemplateFile(fileName);
        for (const component of components) {
          if (ts.isClassDeclaration(component)) {
            diagnostics.push(...compiler.getDiagnosticsForComponent(component));
            // Add CSS property validation diagnostics
            diagnostics.push(...this.getCssDiagnosticsForComponent(component, compiler));
            // Add event validation diagnostics
            diagnostics.push(...this.getEventDiagnosticsForComponent(component, compiler));
            // Add ARIA validation diagnostics
            diagnostics.push(...this.getAriaDiagnosticsForComponent(component, compiler));
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

  /**
   * Gets CSS property validation diagnostics for a component.
   * @internal
   */
  private getCssDiagnosticsForComponent(
    component: ts.ClassDeclaration,
    compiler: NgCompiler,
  ): ts.Diagnostic[] {
    const cssConfig = this.getCssDiagnosticsConfig();
    if (!cssConfig.enabled) {
      return [];
    }
    try {
      return getCssDiagnostics(component, compiler, cssConfig);
    } catch {
      // Skip CSS diagnostics for components with compilation errors
      // (e.g., unexported host directives)
      return [];
    }
  }

  /**
   * Normalizes the CSS diagnostics configuration from the plugin config.
   * @internal
   */
  private getCssDiagnosticsConfig(): {
    enabled: boolean;
    severity: 'error' | 'warning' | 'suggestion';
    strictUnitValues?: boolean;
    validateValues?: boolean;
  } {
    const cssValidation = this.config.cssPropertyValidation;

    if (cssValidation === undefined || cssValidation === true) {
      // Default: enabled with warning severity
      return DEFAULT_CSS_DIAGNOSTICS_CONFIG;
    }

    if (cssValidation === false) {
      // Explicitly disabled
      return {enabled: false, severity: 'warning'};
    }

    // Custom configuration object
    return {
      enabled: cssValidation.enabled !== false,
      severity: cssValidation.severity ?? 'warning',
      strictUnitValues: cssValidation.strictUnitValues ?? false,
      validateValues: cssValidation.validateValues ?? true,
    };
  }

  /**
   * Gets event validation diagnostics for a component.
   * @internal
   */
  private getEventDiagnosticsForComponent(
    component: ts.ClassDeclaration,
    compiler: NgCompiler,
  ): ts.Diagnostic[] {
    const eventConfig = this.getEventDiagnosticsConfig();
    if (!eventConfig.enabled) {
      return [];
    }
    try {
      return getEventDiagnostics(component, compiler, eventConfig);
    } catch {
      // Skip event diagnostics for components with compilation errors
      return [];
    }
  }

  /**
   * Normalizes the event diagnostics configuration from the plugin config.
   * @internal
   */
  private getEventDiagnosticsConfig(): {
    enabled: boolean;
    severity: 'error' | 'warning' | 'suggestion';
    warnOnShadowedEvents: boolean;
  } {
    const eventValidation = this.config.eventValidation;

    if (eventValidation === undefined || eventValidation === true) {
      // Default: enabled with warning severity
      return DEFAULT_EVENT_DIAGNOSTICS_CONFIG;
    }

    if (eventValidation === false) {
      // Explicitly disabled
      return {enabled: false, severity: 'warning', warnOnShadowedEvents: true};
    }

    // Custom configuration object
    return {
      enabled: eventValidation.enabled !== false,
      severity: eventValidation.severity ?? 'warning',
      warnOnShadowedEvents: eventValidation.warnOnShadowedEvents !== false,
    };
  }

  /**
   * Gets ARIA validation diagnostics for a component.
   * @internal
   */
  private getAriaDiagnosticsForComponent(
    component: ts.ClassDeclaration,
    compiler: NgCompiler,
  ): ts.Diagnostic[] {
    const ariaConfig = this.getAriaDiagnosticsConfig();
    if (!ariaConfig.enabled) {
      return [];
    }
    try {
      return getAriaDiagnostics(component, compiler, ariaConfig);
    } catch {
      // Skip ARIA diagnostics for components with compilation errors
      return [];
    }
  }

  /**
   * Normalizes the ARIA diagnostics configuration from the plugin config.
   * @internal
   */
  private getAriaDiagnosticsConfig(): AriaDiagnosticsConfig {
    const ariaValidation = this.config.ariaValidation;

    if (ariaValidation === undefined || ariaValidation === true) {
      // Default: enabled
      return DEFAULT_ARIA_DIAGNOSTICS_CONFIG;
    }

    if (ariaValidation === false) {
      // Explicitly disabled
      return {...DEFAULT_ARIA_DIAGNOSTICS_CONFIG, enabled: false};
    }

    // Custom configuration object
    return {
      enabled: ariaValidation.enabled !== false,
      warnOnDeprecated: ariaValidation.warnOnDeprecated !== false,
      validateValues: ariaValidation.validateValues !== false,
      validateRoles: ariaValidation.validateRoles !== false,
    };
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
            try {
              diagnostics.push(
                ...compiler
                  .getTemplateTypeChecker()
                  .getSuggestionDiagnosticsForComponent(component, this.tsLS),
              );
            } catch (e) {
              // Type check code may throw fatal diagnostic errors if e.g. the type check
              // block cannot be generated. In this case, we consider that there are no available suggestion diagnostics.
              if (isFatalDiagnosticError(e)) {
                continue;
              }
              throw e;
            }
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

  /**
   * Provide Angular-specific inlay hints for templates.
   *
   * This returns hints for:
   * - @for loop variable types: `@for (user: User of users)`
   * - @if alias types: `@if (data; as result: ApiResult)`
   * - Event parameter types: `(click)="onClick($event: MouseEvent)"`
   * - Pipe output types: `{{ value | async: Observable<T> }}`
   * - @let declaration types
   *
   * @param fileName The file to get inlay hints for
   * @param span The text span to get hints within
   * @param config Optional configuration for which hints to show
   */
  provideInlayHints(
    fileName: string,
    span: ts.TextSpan,
    config?: InlayHintsConfig,
  ): AngularInlayHint[] {
    // Use LsQuickInfo phase since inlay hints are similar in cost
    return (
      this.withCompilerAndPerfTracing(PerfPhase.LsQuickInfo, (compiler) => {
        const hints: AngularInlayHint[] = [];

        if (isTypeScriptFile(fileName)) {
          // For TypeScript files, find all components and process their templates
          const program = compiler.getCurrentProgram();
          const sourceFile = program.getSourceFile(fileName);
          if (!sourceFile) {
            return hints;
          }

          const ttc = compiler.getTemplateTypeChecker();

          // Walk the source file to find component/directive classes
          const visit = (node: ts.Node): void => {
            if (ts.isClassDeclaration(node) && node.name) {
              // Try to get the template for this class (component) or host element (directive)
              try {
                const template = ttc.getTemplate(node);
                const hostElement = ttc.getHostElement(node);

                // Process if we have either a template or host element
                if (template || hostElement) {
                  // This is a component with a template or a directive with host bindings
                  const typeCheckInfo: TypeCheckInfo = {
                    declaration: node,
                    nodes: template ?? [],
                  };
                  const templateHints = getInlayHintsForTemplate(
                    compiler,
                    typeCheckInfo,
                    span,
                    config,
                  );
                  hints.push(...templateHints);
                }
              } catch {
                // Not a component/directive or error getting template, skip
              }
            }
            ts.forEachChild(node, visit);
          };

          visit(sourceFile);
        } else {
          // For external template files (HTML), find the associated component
          const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, span.start, compiler);
          if (typeCheckInfo) {
            const templateHints = getInlayHintsForTemplate(compiler, typeCheckInfo, span, config);
            hints.push(...templateHints);
          }
        }

        return hints;
      }) ?? []
    );
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
   * Get document colors for style bindings in templates and host bindings.
   * Finds color values in:
   * - Style bindings: [style.color]="'red'"
   * - Style objects: [style]="{color: 'red'}"
   * - Static styles: style="color: red"
   * - Host bindings: @Component({ host: { '[style.color]': "'red'" } })
   * - @HostBinding: @HostBinding('style.color') color = 'red';
   */
  getDocumentColors(fileName: string): DocumentColorInfo[] {
    return this.withCompilerAndPerfTracing(PerfPhase.LsQuickInfo, (compiler) => {
      const colors: DocumentColorInfo[] = [];

      // Only process template files or TypeScript files with inline templates
      const program = compiler.getCurrentProgram();
      const sourceFile = program.getSourceFile(fileName);
      if (!sourceFile) {
        return colors;
      }

      try {
        const ttc = compiler.getTemplateTypeChecker();

        // For template files (.html), find the component that owns this template
        if (!isTypeScriptFile(fileName)) {
          const components = compiler.getComponentsWithTemplateFile(fileName);
          for (const component of components) {
            if (ts.isClassDeclaration(component)) {
              const template = ttc.getTemplate(component);
              if (template) {
                this.findColorsInTemplate(template, sourceFile, colors);
              }
            }
          }
        } else {
          // For TypeScript files, find all components/directives and check their templates and host bindings
          const visit = (node: ts.Node): void => {
            if (ts.isClassDeclaration(node)) {
              try {
                // Check template for inline templates
                const template = ttc.getTemplate(node);
                if (template) {
                  // Get the template source file (inline templates are in the same file)
                  const templateSourceSpan = template[0]?.sourceSpan;
                  if (templateSourceSpan) {
                    const templateFile = program.getSourceFile(templateSourceSpan.start.file.url);
                    if (templateFile) {
                      this.findColorsInTemplate(template, templateFile, colors);
                    }
                  }
                }

                // Check host element for host bindings (@HostBinding and host property)
                const hostElement = ttc.getHostElement(node);
                if (hostElement) {
                  this.findColorsInHostBindings(hostElement.bindings, colors);
                }
              } catch {
                // Skip components with errors
              }
            }
            ts.forEachChild(node, visit);
          };
          visit(sourceFile);
        }
      } catch {
        // Skip on errors
      }

      return colors;
    });
  }

  /**
   * Find colors in host style bindings.
   * Handles bindings from @Component({ host: { '[style.color]': "'red'" } }) and @HostBinding('style.color')
   */
  private findColorsInHostBindings(
    bindings: readonly TmplAstBoundAttribute[],
    colors: DocumentColorInfo[],
  ): void {
    for (const binding of bindings) {
      // Skip bindings with invalid spans
      if (!binding.keySpan || binding.keySpan.start.offset < 0) {
        continue;
      }

      // Individual style binding: [style.color]
      if (binding.type === BindingType.Style) {
        const propertyName = binding.name;
        if (isColorProperty(propertyName)) {
          const value = binding.value;
          if (value instanceof ASTWithSource && value.ast instanceof LiteralPrimitive) {
            const literalValue = value.ast.value;
            if (typeof literalValue === 'string') {
              const color = parseColorValue(literalValue);
              if (color) {
                const valueSpan = value.ast.sourceSpan;
                colors.push({
                  color,
                  range: {
                    start: valueSpan.start + 1, // Skip opening quote
                    length: literalValue.length,
                  },
                });
              }
            }
          }
        }
      }

      // Style object binding: [style]="{color: 'red'}"
      if (binding.type === BindingType.Property && binding.name === 'style') {
        this.findColorsInStyleObject(binding.value, colors);
      }
    }
  }

  /**
   * Find colors in style bindings within a template.
   * Handles:
   * - Individual style bindings: [style.color]="'red'"
   * - Style object bindings: [style]="{color: 'red'}"
   * - ngStyle bindings: [ngStyle]="{color: 'red'}"
   * - Static style attributes: style="color: red"
   */
  private findColorsInTemplate(
    template: TmplAstNode[],
    sourceFile: ts.SourceFile,
    colors: DocumentColorInfo[],
  ): void {
    const visit = (node: TmplAstNode): void => {
      // Check for individual style bindings: [style.color]="'red'"
      if (node instanceof TmplAstBoundAttribute && node.type === BindingType.Style) {
        const propertyName = node.name;

        // Check if this is a color property
        if (isColorProperty(propertyName)) {
          // Try to extract the value if it's a literal
          const value = node.value;
          if (value instanceof ASTWithSource && value.ast instanceof LiteralPrimitive) {
            const literalValue = value.ast.value;
            if (typeof literalValue === 'string') {
              const color = parseColorValue(literalValue);
              if (color) {
                // Calculate the position of the color value in the source
                const valueSpan = value.ast.sourceSpan;
                colors.push({
                  color,
                  range: {
                    start: valueSpan.start + 1, // Skip opening quote
                    length: literalValue.length,
                  },
                });
              }
            }
          }
        }
      }

      // Check for style object bindings: [style]="{color: 'red'}" or [ngStyle]="{color: 'red'}"
      if (
        node instanceof TmplAstBoundAttribute &&
        node.type === BindingType.Property &&
        (node.name === 'style' || node.name === 'ngStyle')
      ) {
        this.findColorsInStyleObject(node.value, colors);
      }

      // Check for static style attributes: style="color: red"
      if (node instanceof TmplAstTextAttribute && node.name === 'style') {
        this.findColorsInStaticStyle(node.value, node.valueSpan?.start.offset ?? 0, colors);
      }

      // Visit children for elements and templates
      if ('children' in node && Array.isArray(node.children)) {
        for (const child of node.children) {
          visit(child);
        }
      }
      if ('attributes' in node && Array.isArray(node.attributes)) {
        for (const attr of node.attributes) {
          visit(attr);
        }
      }
      if ('inputs' in node && Array.isArray(node.inputs)) {
        for (const input of node.inputs) {
          visit(input);
        }
      }
    };

    for (const node of template) {
      visit(node);
    }
  }

  /**
   * Find colors in a style object literal expression.
   * Handles expressions like: {color: 'red', backgroundColor: 'blue'}
   */
  private findColorsInStyleObject(value: AST, colors: DocumentColorInfo[]): void {
    let ast: AST = value;
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }

    if (!(ast instanceof LiteralMap)) {
      return;
    }

    for (let i = 0; i < ast.keys.length; i++) {
      const key = ast.keys[i];
      if (key.kind !== 'property') continue;

      const propertyName = key.key;
      if (!isColorProperty(propertyName)) continue;

      const valueAst = ast.values[i];
      let valueNode: AST = valueAst;
      if (valueNode instanceof ASTWithSource) {
        valueNode = valueNode.ast;
      }

      if (valueNode instanceof LiteralPrimitive && typeof valueNode.value === 'string') {
        const color = parseColorValue(valueNode.value);
        if (color) {
          colors.push({
            color,
            range: {
              start: valueNode.sourceSpan.start + 1, // Skip opening quote
              length: valueNode.value.length,
            },
          });
        }
      }
    }
  }

  /**
   * Find colors in a static style attribute value.
   * Parses CSS declarations like: "color: red; background-color: blue"
   */
  private findColorsInStaticStyle(
    styleValue: string,
    baseOffset: number,
    colors: DocumentColorInfo[],
  ): void {
    // Parse CSS declarations from the style attribute value
    // Format: "property: value; property: value"
    const declarations = styleValue.split(';');
    let currentOffset = baseOffset;

    for (const declaration of declarations) {
      const colonIndex = declaration.indexOf(':');
      if (colonIndex === -1) {
        currentOffset += declaration.length + 1; // +1 for semicolon
        continue;
      }

      const propertyName = declaration.substring(0, colonIndex).trim();
      const propertyValue = declaration.substring(colonIndex + 1).trim();

      if (isColorProperty(propertyName)) {
        const color = parseColorValue(propertyValue);
        if (color) {
          // Calculate position: base + offset to colon + 1 + whitespace before value
          const valueStartInDecl =
            colonIndex +
            1 +
            (declaration.substring(colonIndex + 1).length -
              declaration.substring(colonIndex + 1).trimStart().length);
          colors.push({
            color,
            range: {
              start: currentOffset + valueStartInDecl,
              length: propertyValue.length,
            },
          });
        }
      }

      currentOffset += declaration.length + 1; // +1 for semicolon
    }
  }

  /**
   * Get color presentations (format conversions) for a color.
   */
  getColorPresentations(
    fileName: string,
    color: ColorInfo,
    range: ts.TextSpan,
  ): ColorPresentation[] {
    const presentations = getColorPresentations(color);
    return presentations.map((label) => ({label}));
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
  // Allow both key (name) and value (initializer) positions
  if (assignment === null || (assignment.initializer !== node && assignment.name !== node)) {
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
