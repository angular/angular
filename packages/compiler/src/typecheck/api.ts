/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SchemaMetadata} from '../core';
import {AbsoluteSourceSpan} from '../expression_parser/ast';
import {ClassPropertyMapping, ClassPropertyName, InputOrOutput} from '../property_mapping';
import {BoundTarget, LegacyAnimationTriggerNames, MatchSource} from '../render3/view/t2_api';
import {TcbExpr} from './ops/codegen';

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
  fields: {inputs: ClassPropertyMapping<TcbInputMapping>};

  /**
   * `Set` of field names which have type coercion enabled.
   */
  coercedInputFields: Set<string>;
}

export interface TcbReferenceMetadata {
  /** The name of the class */
  readonly name: string;
  /** The module path where the symbol is located, or null if local/ambient */
  readonly moduleName: string | null;
  /** True if the symbol successfully emitted locally (no external import required) */
  readonly isLocal: boolean;
  /** If the reference could not be externally emitted, this string holds the diagnostic reason why */
  readonly unexportedDiagnostic: string | null;

  /** Key used to uniquely identify the target of this reference. */
  readonly key: TcbReferenceKey;

  /**
   * Defines the `AbsoluteSourceSpan` of the target's node name, if available.
   */
  readonly nodeNameSpan?: AbsoluteSourceSpan;

  /**
   * The absolute path to the file containing the reference node, if available.
   */
  readonly nodeFilePath?: string;
}

export type TcbReferenceKey = string & {__brand: 'TcbReferenceKey'};

export interface TcbTypeParameter {
  name: string;
  representation: string;
  representationWithDefault: string;
}

export type TcbInputMapping = InputOrOutput & {
  required: boolean;

  /**
   * AST-free string representation of the transform type of the input, if available.
   */
  transformType?: string;
};

export interface TcbPipeMetadata {
  name: string;
  ref: TcbReferenceMetadata;
  isExplicitlyDeferred: boolean;
}

/**
 * Metadata that describes a template guard for one of the directive's inputs.
 */
export interface TemplateGuardMeta {
  /**
   * The input name that this guard should be applied to.
   */
  inputName: string;

  /**
   * Represents the type of the template guard.
   *
   * - 'invocation' means that a call to the template guard function is emitted so that its return
   *   type can result in narrowing of the input type.
   * - 'binding' means that the input binding expression itself is used as template guard.
   */
  type: 'invocation' | 'binding';
}

export interface TcbDirectiveMetadata {
  ref: TcbReferenceMetadata;
  name: string;
  selector: string | null;
  isComponent: boolean;
  isGeneric: boolean;
  isStructural: boolean;
  isStandalone: boolean;
  isExplicitlyDeferred: boolean;
  preserveWhitespaces: boolean;
  exportAs: string[] | null;
  matchSource: MatchSource;

  /** Type parameters of the directive, if available. */
  typeParameters: TcbTypeParameter[] | null;
  inputs: ClassPropertyMapping<TcbInputMapping>;
  outputs: ClassPropertyMapping;
  requiresInlineTypeCtor: boolean;
  ngTemplateGuards: TemplateGuardMeta[];
  hasNgTemplateContextGuard: boolean;
  hasNgFieldDirective: boolean;
  coercedInputFields: Set<ClassPropertyName>;
  restrictedInputFields: Set<ClassPropertyName>;
  stringLiteralInputFields: Set<ClassPropertyName>;
  undeclaredInputFields: Set<ClassPropertyName>;
  publicMethods: Set<string>;
  ngContentSelectors: string[] | null;
  animationTriggerNames: LegacyAnimationTriggerNames | null;
}

export interface TcbComponentMetadata {
  ref: TcbReferenceMetadata;
  typeParameters: TcbTypeParameter[] | null;
  typeArguments: string[] | null;
}

export interface TcbTypeCheckBlockMetadata {
  id: TypeCheckId;
  boundTarget: BoundTarget<TcbDirectiveMetadata>;
  pipes: Map<string, TcbPipeMetadata> | null;
  schemas: SchemaMetadata[];
  isStandalone: boolean;
  preserveWhitespaces: boolean;
}

export type TypeCheckId = string & {__brand: 'TypeCheckId'};

/**
 * Interface representing the environment needed for TCB generation.
 * This allows us to avoid depending on the full `Environment` class from `compiler-cli`
 * which depends on TypeScript APIs.
 */
export interface TcbEnvironment {
  config: TypeCheckingConfig;
  referenceTcbValue(ref: TcbReferenceMetadata): TcbExpr;
  referenceExternalSymbol(moduleName: string, name: string): TcbExpr;
  pipeInst(pipeMeta: TcbPipeMetadata): TcbExpr;
  typeCtorFor(dir: TcbDirectiveMetadata): TcbExpr;
  getPreludeStatements(): TcbExpr[];
}

export interface TypeCheckingConfig {
  /**
   * Whether to check the left-hand side type of binding operations.
   */
  checkTypeOfInputBindings: boolean;

  /**
   * Whether to honor the access modifiers on input bindings for the component/directive.
   */
  honorAccessModifiersForInputBindings: boolean;

  /**
   * Whether to use strict null types for input bindings for directives.
   */
  strictNullInputBindings: boolean;

  /**
   * Whether to check text attributes that happen to be consumed by a directive or component.
   */
  checkTypeOfAttributes: boolean;

  /**
   * Whether to check the left-hand side type of binding operations to DOM properties.
   */
  checkTypeOfDomBindings: boolean;

  /**
   * Whether to infer the type of the `$event` variable in event bindings for directive outputs or
   * animation events.
   */
  checkTypeOfOutputEvents: boolean;

  /**
   * Whether to infer the type of the `$event` variable in event bindings for animations.
   */
  checkTypeOfAnimationEvents: boolean;

  /**
   * Whether to infer the type of the `$event` variable in event bindings to DOM events.
   */
  checkTypeOfDomEvents: boolean;

  /**
   * Whether to infer the type of local references to DOM elements.
   */
  checkTypeOfDomReferences: boolean;

  /**
   * Whether to infer the type of local references.
   */
  checkTypeOfNonDomReferences: boolean;

  /**
   * Whether to adjust the output of the TCB to ensure compatibility with the `TemplateTypeChecker`.
   */
  enableTemplateTypeChecker: boolean;

  /**
   * Whether to include type information from pipes in the type-checking operation.
   */
  checkTypeOfPipes: boolean;

  /**
   * Whether to narrow the types of template contexts.
   */
  applyTemplateContextGuards: boolean;

  /**
   * Whether to use a strict type for null-safe navigation operations.
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
   */
  useContextGenericType: boolean;

  /**
   * Whether or not to infer types for object and array literals in the template.
   */
  strictLiteralTypes: boolean;

  /**
   * Whether to use inline type constructors.
   */
  useInlineTypeConstructors: boolean;

  /**
   * Whether the type of two-way bindings should be widened to allow `WritableSignal`.
   */
  allowSignalsInTwoWayBindings: boolean;

  /**
   * Whether the type of DOM events should be asserted with '@angular/core' 'ɵassertType'.
   */
  allowDomEventAssertion: boolean;

  /**
   * Whether to descend into the bodies of control flow blocks (`@if`, `@switch` and `@for`).
   */
  checkControlFlowBodies: boolean;
}
