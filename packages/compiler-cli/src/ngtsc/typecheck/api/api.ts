/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbsoluteSourceSpan,
  BoundTarget,
  DirectiveMeta,
  ParseSourceSpan,
  SchemaMetadata,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode} from '../../diagnostics';
import {Reference} from '../../imports';
import {
  ClassPropertyMapping,
  DirectiveTypeCheckMeta,
  HostDirectiveMeta,
  InputMapping,
  PipeMeta,
} from '../../metadata';
import {ClassDeclaration} from '../../reflection';

/**
 * Extension of `DirectiveMeta` that includes additional information required to type-check the
 * usage of a particular directive.
 */
export interface TypeCheckableDirectiveMeta extends DirectiveMeta, DirectiveTypeCheckMeta {
  ref: Reference<ClassDeclaration>;
  queries: string[];
  inputs: ClassPropertyMapping<InputMapping>;
  outputs: ClassPropertyMapping;
  isStandalone: boolean;
  isSignal: boolean;
  hostDirectives: HostDirectiveMeta[] | null;
  decorator: ts.Decorator | null;
  isExplicitlyDeferred: boolean;
  imports: Reference<ClassDeclaration>[] | null;
  rawImports: ts.Expression | null;
}

export type TypeCheckId = string & {__brand: 'TypeCheckId'};

/**
 * A `ts.Diagnostic` with additional information about the diagnostic related to template
 * type-checking.
 */
export interface TemplateDiagnostic extends ts.DiagnosticWithLocation {
  /**
   * The component with the template that resulted in this diagnostic.
   */
  sourceFile: ts.SourceFile;

  /**
   * The type check ID of the directive that resulted in this diagnostic.
   */
  typeCheckId: TypeCheckId;
}

/**
 * A `TemplateDiagnostic` with a specific error code.
 */
export type NgTemplateDiagnostic<T extends ErrorCode> = TemplateDiagnostic & {__ngCode: T};

/**
 * Metadata required in addition to a component class in order to generate a type check block (TCB)
 * for that component.
 */
export interface TypeCheckBlockMetadata {
  /**
   * A unique identifier for the class which gave rise to this TCB.
   *
   * This can be used to map errors back to the `ts.ClassDeclaration` for the directive.
   */
  id: TypeCheckId;

  /**
   * Semantic information about the template of the component.
   */
  boundTarget: BoundTarget<TypeCheckableDirectiveMeta>;

  /*
   * Pipes used in the template of the component.
   */
  pipes: Map<string, PipeMeta> | null;

  /**
   * Schemas that apply to this template.
   */
  schemas: SchemaMetadata[];

  /*
   * A boolean indicating whether the component is standalone.
   */
  isStandalone: boolean;

  /**
   * A boolean indicating whether the component preserves whitespaces in its template.
   */
  preserveWhitespaces: boolean;
}

export interface TypeCtorMetadata {
  /**
   * The name of the requested type constructor function.
   */
  fnName: string;

  /**
   * Whether to generate a body for the function or not.
   */
  body: boolean;

  /**
   * Input, output, and query field names in the type which should be included as constructor input.
   */
  fields: {inputs: ClassPropertyMapping<InputMapping>; queries: string[]};

  /**
   * `Set` of field names which have type coercion enabled.
   */
  coercedInputFields: Set<string>;
}

export interface TypeCheckingConfig {
  /**
   * Whether to check the left-hand side type of binding operations.
   *
   * For example, if this is `false` then the expression `[input]="expr"` will have `expr` type-
   * checked, but not the assignment of the resulting type to the `input` property of whichever
   * directive or component is receiving the binding. If set to `true`, both sides of the assignment
   * are checked.
   *
   * This flag only affects bindings to components/directives. Bindings to the DOM are checked if
   * `checkTypeOfDomBindings` is set.
   */
  checkTypeOfInputBindings: boolean;

  /**
   * Whether to honor the access modifiers on input bindings for the component/directive.
   *
   * If a template binding attempts to assign to an input that is private/protected/readonly,
   * this will produce errors when enabled but will not when disabled.
   */
  honorAccessModifiersForInputBindings: boolean;

  /**
   * Whether to use strict null types for input bindings for directives.
   *
   * If this is `true`, applications that are compiled with TypeScript's `strictNullChecks` enabled
   * will produce type errors for bindings which can evaluate to `undefined` or `null` where the
   * inputs's type does not include `undefined` or `null` in its type. If set to `false`, all
   * binding expressions are wrapped in a non-null assertion operator to effectively disable strict
   * null checks. This may be particularly useful when the directive is from a library that is not
   * compiled with `strictNullChecks` enabled.
   *
   * If `checkTypeOfInputBindings` is set to `false`, this flag has no effect.
   */
  strictNullInputBindings: boolean;

  /**
   * Whether to check text attributes that happen to be consumed by a directive or component.
   *
   * For example, in a template containing `<input matInput disabled>` the `disabled` attribute ends
   * up being consumed as an input with type `boolean` by the `matInput` directive. At runtime, the
   * input will be set to the attribute's string value, which is an empty string for attributes
   * without a value, so with this flag set to `true`, an error would be reported. If set to
   * `false`, text attributes will never report an error.
   *
   * Note that if `checkTypeOfInputBindings` is set to `false`, this flag has no effect.
   */
  checkTypeOfAttributes: boolean;

  /**
   * Whether to check the left-hand side type of binding operations to DOM properties.
   *
   * As `checkTypeOfBindings`, but only applies to bindings to DOM properties.
   *
   * This does not affect the use of the `DomSchemaChecker` to validate the template against the DOM
   * schema. Rather, this flag is an experimental, not yet complete feature which uses the
   * lib.dom.d.ts DOM typings in TypeScript to validate that DOM bindings are of the correct type
   * for assignability to the underlying DOM element properties.
   */
  checkTypeOfDomBindings: boolean;

  /**
   * Whether to infer the type of the `$event` variable in event bindings for directive outputs or
   * animation events.
   *
   * If this is `true`, the type of `$event` will be inferred based on the generic type of
   * `EventEmitter`/`Subject` of the output. If set to `false`, the `$event` variable will be of
   * type `any`.
   */
  checkTypeOfOutputEvents: boolean;

  /**
   * Whether to infer the type of the `$event` variable in event bindings for animations.
   *
   * If this is `true`, the type of `$event` will be `AnimationEvent` from `@angular/animations`.
   * If set to `false`, the `$event` variable will be of type `any`.
   */
  checkTypeOfAnimationEvents: boolean;

  /**
   * Whether to infer the type of the `$event` variable in event bindings to DOM events.
   *
   * If this is `true`, the type of `$event` will be inferred based on TypeScript's
   * `HTMLElementEventMap`, with a fallback to the native `Event` type. If set to `false`, the
   * `$event` variable will be of type `any`.
   */
  checkTypeOfDomEvents: boolean;

  /**
   * Whether to infer the type of local references to DOM elements.
   *
   * If this is `true`, the type of a `#ref` variable on a DOM node in the template will be
   * determined by the type of `document.createElement` for the given DOM node type. If set to
   * `false`, the type of `ref` for DOM nodes will be `any`.
   */
  checkTypeOfDomReferences: boolean;

  /**
   * Whether to infer the type of local references.
   *
   * If this is `true`, the type of a `#ref` variable that points to a directive or `TemplateRef` in
   * the template will be inferred correctly. If set to `false`, the type of `ref` for will be
   * `any`.
   */
  checkTypeOfNonDomReferences: boolean;

  /**
   * Whether to adjust the output of the TCB to ensure compatibility with the `TemplateTypeChecker`.
   *
   * The statements generated in the TCB are optimized for performance and producing diagnostics.
   * These optimizations can result in generating a TCB that does not have all the information
   * needed by the `TemplateTypeChecker` for retrieving `Symbol`s. For example, as an optimization,
   * the TCB will not generate variable declaration statements for directives that have no
   * references, inputs, or outputs. However, the `TemplateTypeChecker` always needs these
   * statements to be present in order to provide `ts.Symbol`s and `ts.Type`s for the directives.
   *
   * When set to `false`, enables TCB optimizations for template diagnostics.
   * When set to `true`, ensures all information required by `TemplateTypeChecker` to
   * retrieve symbols for template nodes is available in the TCB.
   */
  enableTemplateTypeChecker: boolean;

  /**
   * Whether to include type information from pipes in the type-checking operation.
   *
   * If this is `true`, then the pipe's type signature for `transform()` will be used to check the
   * usage of the pipe. If this is `false`, then the result of applying a pipe will be `any`, and
   * the types of the pipe's value and arguments will not be matched against the `transform()`
   * method.
   */
  checkTypeOfPipes: boolean;

  /**
   * Whether to narrow the types of template contexts.
   */
  applyTemplateContextGuards: boolean;

  /**
   * Whether to use a strict type for null-safe navigation operations.
   *
   * If this is `false`, then the return type of `a?.b` or `a?()` will be `any`. If set to `true`,
   * then the return type of `a?.b` for example will be the same as the type of the ternary
   * expression `a != null ? a.b : a`.
   */
  strictSafeNavigationTypes: boolean;

  /**
   * Whether to descend into template bodies and check any bindings there.
   */
  checkTemplateBodies: boolean;

  /**
   * Whether to always apply DOM schema checks in template bodies, independently of the
   * `checkTemplateBodies` setting.
   */
  alwaysCheckSchemaInTemplateBodies: boolean;

  /**
   * Whether to check resolvable queries.
   *
   * This is currently an unsupported feature.
   */
  checkQueries: false;

  /**
   * Whether to check if control flow syntax will prevent a node from being projected.
   */
  controlFlowPreventingContentProjection: 'error' | 'warning' | 'suppress';

  /**
   * Whether to check if `@Component.imports` contains unused symbols.
   */
  unusedStandaloneImports: 'error' | 'warning' | 'suppress';

  /**
   * Whether to use any generic types of the context component.
   *
   * If this is `true`, then if the context component has generic types, those will be mirrored in
   * the template type-checking context. If `false`, any generic type parameters of the context
   * component will be set to `any` during type-checking.
   */
  useContextGenericType: boolean;

  /**
   * Whether or not to infer types for object and array literals in the template.
   *
   * If this is `true`, then the type of an object or an array literal in the template will be the
   * same type that TypeScript would infer if the literal appeared in code. If `false`, then such
   * literals are cast to `any` when declared.
   */
  strictLiteralTypes: boolean;

  /**
   * Whether to use inline type constructors.
   *
   * If this is `true`, create inline type constructors when required. For example, if a type
   * constructor's parameters has private types, it cannot be created normally, so we inline it in
   * the directives definition file.
   *
   * If false, do not create inline type constructors. Fall back to using `any` type for
   * constructors that normally require inlining.
   *
   * This option requires the environment to support inlining. If the environment does not support
   * inlining, this must be set to `false`.
   */
  useInlineTypeConstructors: boolean;

  /**
   * Whether or not to produce diagnostic suggestions in cases where the compiler could have
   * inferred a better type for a construct, but was prevented from doing so by the current type
   * checking configuration.
   *
   * For example, if the compiler could have used a template context guard to infer a better type
   * for a structural directive's context and `let-` variables, but the user is in
   * `fullTemplateTypeCheck` mode and such guards are therefore disabled.
   *
   * This mode is useful for clients like the Language Service which want to inform users of
   * opportunities to improve their own developer experience.
   */
  suggestionsForSuboptimalTypeInference: boolean;

  /**
   * Whether the type of two-way bindings should be widened to allow `WritableSignal`.
   */
  allowSignalsInTwoWayBindings: boolean;

  /**
   * Whether the type of DOM events should be asserted with '@angular/core' 'ɵassertType' (see TCB implementation).
   */
  allowDomEventAssertion: boolean;

  /**
   * Whether to descend into the bodies of control flow blocks (`@if`, `@switch` and `@for`).
   */
  checkControlFlowBodies: boolean;

  /**
   * Whether the event side of a two-way binding should be type checked.
   */
  checkTwoWayBoundEvents: boolean;
}

export type SourceMapping =
  | DirectSourceMapping
  | IndirectSourceMapping
  | ExternalTemplateSourceMapping;

/**
 * A mapping to a node within the same source file..
 *
 * `ParseSourceSpan`s for this node should be accurate for direct reporting in a TS error message.
 */
export interface DirectSourceMapping {
  type: 'direct';
  node: ts.Node;
}

/**
 * A mapping to a node which is still in a TS file, but where the positions in any
 * `ParseSourceSpan`s are not accurate for one reason or another.
 *
 * This can occur if the expression was interpolated in a way where the compiler could not
 * construct a contiguous mapping for the template string.
 */
export interface IndirectSourceMapping {
  type: 'indirect';
  componentClass: ClassDeclaration;
  node: ts.Expression;
  template: string;
}

/**
 * A mapping to a template declared in an external HTML file, where node positions in
 * `ParseSourceSpan`s represent accurate offsets into the external file.
 *
 * In this case, the given `node` refers to the `templateUrl` expression.
 */
export interface ExternalTemplateSourceMapping {
  type: 'external';
  componentClass: ClassDeclaration;
  node: ts.Expression;
  template: string;
  templateUrl: string;
}

/**
 * A mapping of a TCB template id to a span in the corresponding source code.
 */
export interface SourceLocation {
  id: TypeCheckId;
  span: AbsoluteSourceSpan;
}

/**
 * A representation of all a node's type checking information we know. Useful for producing
 * diagnostics based on a TCB node or generally mapping from a TCB node back to a template location.
 */
export interface FullSourceMapping {
  sourceLocation: SourceLocation;
  sourceMapping: SourceMapping;
  span: ParseSourceSpan;
}

export interface GetPotentialAngularMetaOptions {
  includeExternalModule: boolean;
}
