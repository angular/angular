/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the language service package.
 */

import ts from 'typescript';

export interface PluginConfig {
  /**
   * If true, return only Angular results. Otherwise, return Angular + TypeScript
   * results.
   */
  angularOnly: boolean;
  /**
   * If true, enable `strictTemplates` in Angular compiler options regardless
   * of its value in tsconfig.json.
   */
  forceStrictTemplates?: true;

  /**
   * If false, disables parsing control flow blocks in the compiler. Should be used only when older
   * versions of Angular that do not support blocks (pre-v17) used with the language service.
   */
  enableBlockSyntax?: false;

  /**
   * Version of `@angular/core` that was detected in the user's workspace.
   */
  angularCoreVersion?: string;

  /**
   * If false, disables parsing of `@let` declarations in the compiler.
   */
  enableLetSyntax?: false;

  /**
   * Whether selectorless is enabled.
   */
  enableSelectorless?: true;

  /**
   * A list of diagnostic codes that should be supressed in the language service.
   */
  suppressAngularDiagnosticCodes?: number[];
}

export type GetTcbResponse = {
  /**
   * The filename of the SourceFile this typecheck block belongs to.
   * The filename is entirely opaque and unstable, useful only for debugging
   * purposes.
   */
  fileName: string;
  /** The content of the SourceFile this typecheck block belongs to. */
  content: string;
  /**
   * Spans over node(s) in the typecheck block corresponding to the
   * TS code generated for template node under the current cursor position.
   *
   * When the cursor position is over a source for which there is no generated
   * code, `selections` is empty.
   */
  selections: ts.TextSpan[];
};

export type GetComponentLocationsForTemplateResponse = ts.DocumentSpan[];
export type GetTemplateLocationForComponentResponse = ts.DocumentSpan | undefined;

/**
 * Function that can be invoked to show progress when computing
 * refactoring edits.
 *
 * Useful for refactorings which take a long time to compute edits for.
 */
export type ApplyRefactoringProgressFn = (percentage: number, updateMessage: string) => void;

/** Interface describing the result for computing edits of a refactoring. */
export interface ApplyRefactoringResult extends Omit<ts.RefactorEditInfo, 'notApplicableReason'> {
  errorMessage?: string;
  warningMessage?: string;
}

/**
 * A display part for interactive inlay hints.
 * When clicked, can navigate to the definition of the type/parameter.
 */
export interface InlayHintDisplayPart {
  /** The text to display */
  text: string;
  /** Optional navigation target span */
  span?: {
    /** Start offset in the target file */
    start: number;
    /** Length of the span */
    length: number;
  };
  /** Optional target file path for navigation */
  file?: string;
}

/**
 * Represents an Angular-specific inlay hint to be displayed in the editor.
 */
export interface AngularInlayHint {
  /** Offset position where the hint should appear */
  position: number;
  /**
   * The text to display.
   * For non-interactive hints, this contains the full hint text.
   * For interactive hints, this may be empty and displayParts is used instead.
   */
  text: string;
  /** Kind of hint: 'Type' for type annotations, 'Parameter' for parameter names */
  kind: 'Type' | 'Parameter';
  /** Whether to add padding before the hint */
  paddingLeft?: boolean;
  /** Whether to add padding after the hint */
  paddingRight?: boolean;
  /** Optional tooltip documentation */
  tooltip?: string;
  /**
   * Display parts for interactive hints.
   * When present, these parts can be clicked to navigate to type/parameter definitions.
   * Used when interactiveInlayHints is enabled.
   */
  displayParts?: InlayHintDisplayPart[];
}

/**
 * Configuration for which Angular inlay hints to show.
 * These options are designed to align with TypeScript's inlay hints configuration
 * where applicable to Angular templates.
 */
export interface InlayHintsConfig {
  // ═══════════════════════════════════════════════════════════════════════════
  // VARIABLE TYPE HINTS - equivalent to TypeScript's includeInlayVariableTypeHints
  // ═══════════════════════════════════════════════════════════════════════════

  /** Show type hints for @for loop variables: `@for (item: Item of items)` */
  forLoopVariableTypes?: boolean;

  /**
   * Show type hints for @if alias variables: `@if (data; as result: Data)`
   *
   * Can be a boolean to enable/disable all @if alias hints, or an object for fine-grained control:
   * - `simpleExpressions`: Show hints for simple variable references like `@if (data; as result)`
   * - `complexExpressions`: Show hints for complex expressions like `@if (data == 2; as b)` or `@if (data.prop; as p)`
   *
   * When set to true, shows hints for all @if aliases.
   * When set to 'complex', only shows hints for complex expressions (property access, comparisons, calls, etc.)
   */
  ifAliasTypes?:
    | boolean
    | 'complex'
    | {
        /** Show hints for simple variable references: @if (data; as result). Default: true */
        simpleExpressions?: boolean;
        /** Show hints for complex expressions: @if (data.prop; as p), @if (a == b; as c). Default: true */
        complexExpressions?: boolean;
      };

  /** Show type hints for @let declarations: `@let count: number = items.length` */
  letDeclarationTypes?: boolean;

  /** Show type hints for template reference variables: `#ref: HTMLInputElement` */
  referenceVariableTypes?: boolean;

  /**
   * Suppress hints when variable name matches the type name (case-insensitive).
   * Equivalent to TypeScript's `includeInlayVariableTypeHintsWhenTypeMatchesName`.
   * When false, skips hints like `@let user: User = getUser()` where name matches type.
   * @default true
   */
  variableTypeHintsWhenTypeMatchesName?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // ARROW FUNCTION TYPE HINTS - equivalent to TypeScript's function type hints
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Show type hints for arrow function parameters in templates.
   * Equivalent to TypeScript's `includeInlayFunctionParameterTypeHints`.
   *
   * When enabled, shows: `(a: number, b: string) => a + b` where types are inferred.
   * @default true
   */
  arrowFunctionParameterTypes?: boolean;

  /**
   * Show return type hints for arrow functions in templates.
   * Equivalent to TypeScript's `includeInlayFunctionLikeReturnTypeHints`.
   *
   * When enabled, shows: `(a, b): number => a + b` where return type is inferred.
   * @default true
   */
  arrowFunctionReturnTypes?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // PARAMETER NAME HINTS - equivalent to TypeScript's includeInlayParameterNameHints
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Show parameter name hints for function/method arguments in expressions.
   * Equivalent to TypeScript's `includeInlayParameterNameHints`.
   *
   * When enabled, shows: `handleClick(event: $event)` where 'event' is the parameter name.
   * Options:
   * - 'none': No parameter name hints
   * - 'literals': Only for literal arguments (strings, numbers, booleans)
   * - 'all': For all arguments
   * @default 'all'
   */
  parameterNameHints?: 'none' | 'literals' | 'all';

  /**
   * Show parameter hints even when argument name matches parameter name.
   * Equivalent to TypeScript's `includeInlayParameterNameHintsWhenArgumentMatchesName`.
   * When false, skips hints like `onClick(event)` where arg name matches param name.
   * @default false
   */
  parameterNameHintsWhenArgumentMatchesName?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT TYPE HINTS - Angular-specific for event bindings
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Show type hints for event binding $event parameter.
   * Works with @Output() EventEmitter<T>, output() OutputEmitterRef<T>, and model() changes.
   * Example: `(click: MouseEvent)`, `(valueChange: string)`
   *
   * Can be a boolean to enable/disable all event hints, or an object for fine-grained control:
   * - `nativeEvents`: Show hints for native HTML events (click, input, etc.)
   * - `componentEvents`: Show hints for custom component/directive events
   * - `animationEvents`: Show hints for animation events (@trigger.done)
   */
  eventParameterTypes?:
    | boolean
    | {
        /** Show hints for native HTML events (click, input, keydown, etc.). Default: true */
        nativeEvents?: boolean;
        /** Show hints for custom component/directive output events. Default: true */
        componentEvents?: boolean;
        /** Show hints for animation events (@trigger.start, @trigger.done). Default: true */
        animationEvents?: boolean;
      };

  // ═══════════════════════════════════════════════════════════════════════════
  // PIPE AND BINDING TYPE HINTS - Angular-specific
  // ═══════════════════════════════════════════════════════════════════════════

  /** Show type hints for pipe output types: `{{ value | async: Observable<T> }}` */
  pipeOutputTypes?: boolean;

  /**
   * Show type hints for property/input binding types.
   * Works with @Input(), input(), input.required(), and model() inputs.
   * Example: `[disabled: boolean]="isDisabled"`
   *
   * Can be a boolean to enable/disable all property hints, or an object for fine-grained control:
   * - `nativeProperties`: Show hints for native DOM properties ([disabled], [hidden], etc.)
   * - `componentInputs`: Show hints for component/directive @Input() and input() bindings
   */
  propertyBindingTypes?:
    | boolean
    | {
        /** Show hints for native DOM properties. Default: true */
        nativeProperties?: boolean;
        /** Show hints for component/directive inputs. Default: true */
        componentInputs?: boolean;
      };

  /**
   * Show WritableSignal<T> type for two-way bindings with model() signals.
   * When true: `[(checked: WritableSignal<boolean>)]="checkboxSignal"`
   * When false: `[(checked: boolean)]="checkboxSignal"`
   * @default true
   */
  twoWayBindingSignalTypes?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // VISUAL DIFFERENTIATION OPTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add visual indicator for input.required() bindings.
   * Options:
   * - 'none': No special indicator
   * - 'asterisk': Add asterisk suffix `[user*: User]`
   * - 'exclamation': Add exclamation suffix `[user: User!]`
   * @default 'none'
   */
  requiredInputIndicator?: 'none' | 'asterisk' | 'exclamation';

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERACTIVE HINTS - equivalent to TypeScript's interactiveInlayHints
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enable clickable hints that navigate to type/parameter definitions.
   * Equivalent to TypeScript's `interactiveInlayHints`.
   * @default false
   */
  interactiveInlayHints?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // HOST LISTENER ARGUMENT TYPE HINTS - Angular-specific for @HostListener
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Show type hints for @HostListener argument expressions.
   * Example: `@HostListener('click', ['$event.target: EventTarget | null', '$event.clientX: number'])`
   *
   * When enabled, shows the inferred type for each expression passed in the decorator arguments.
   * @default true
   */
  hostListenerArgumentTypes?: boolean;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROL FLOW BLOCK TYPE HINTS - Angular-specific for new control flow syntax
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Show type hints for @switch block expressions.
   * Example: `@switch (status: Status) { @case (Status.Active) { ... } }`
   *
   * When enabled, shows the inferred type of the switch expression value.
   * @default true
   */
  switchExpressionTypes?: boolean;

  /**
   * Show type hints for @defer block trigger expressions.
   * Example: `@defer (when isVisible: boolean) { ... }`
   *
   * When enabled, shows the inferred type for 'when' trigger conditions.
   * @default true
   */
  deferTriggerTypes?: boolean;
}

/**
 * `NgLanguageService` describes an instance of an Angular language service,
 * whose API surface is a strict superset of TypeScript's language service.
 */
export interface NgLanguageService extends ts.LanguageService {
  getTcb(fileName: string, position: number): GetTcbResponse | undefined;
  getComponentLocationsForTemplate(fileName: string): GetComponentLocationsForTemplateResponse;
  getTemplateLocationForComponent(
    fileName: string,
    position: number,
  ): GetTemplateLocationForComponentResponse;
  getTypescriptLanguageService(): ts.LanguageService;

  /**
   * Provide Angular-specific inlay hints for templates.
   *
   * Returns hints for:
   * - @for loop variable types: `@for (user: User of users)`
   * - @if alias types: `@if (data; as result: ApiResult)`
   * - Event parameter types: `(click)="onClick($event: MouseEvent)"`
   * - Pipe output types
   * - @let declaration types
   *
   * @param fileName The file to get inlay hints for
   * @param span The text span to get hints within
   * @param config Optional configuration for which hints to show
   */
  getAngularInlayHints(
    fileName: string,
    span: ts.TextSpan,
    config?: InlayHintsConfig,
  ): AngularInlayHint[];

  applyRefactoring(
    fileName: string,
    positionOrRange: number | ts.TextRange,
    refactorName: string,
    reportProgress: ApplyRefactoringProgressFn,
  ): Promise<ApplyRefactoringResult | undefined>;

  hasCodeFixesForErrorCode(errorCode: number): boolean;

  getTokenTypeFromClassification(classification: number): number | undefined;
  getTokenModifierFromClassification(classification: number): number;
}

export function isNgLanguageService(
  ls: ts.LanguageService | NgLanguageService,
): ls is NgLanguageService {
  return 'getTcb' in ls;
}
