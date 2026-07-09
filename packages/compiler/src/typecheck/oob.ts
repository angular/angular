/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, BindingPipe, PropertyRead} from '../expression_parser/ast';

import {
  BoundAttribute,
  BoundEvent,
  Component,
  Directive,
  Element,
  ForLoopBlock,
  ForLoopBlockEmpty,
  HoverDeferredTrigger,
  IfBlockBranch,
  InteractionDeferredTrigger,
  LetDeclaration,
  Reference,
  SwitchBlockCase,
  Template,
  TextAttribute,
  Variable,
  ViewportDeferredTrigger,
} from '../render3/r3_ast';

import {TcbDirectiveMetadata, TypeCheckId} from './api';

/** Categories of diagnostics that can be reported by a `OutOfBandDiagnosticRecorder`. */
export enum OutOfBandDiagnosticCategory {
  Error,
  Warning,
}

/**
 * Collects diagnostics on problems which occur in the template which aren't directly sourced
 * from type check blocks.
 *
 * During the creation of a type check block, the template is traversed and the
 * `OutOfBandDiagnosticRecorder` is called to record cases when a correct interpretation for the
 * template cannot be found. These operations create diagnostics which are stored by the
 * recorder for later display.
 */
export interface OutOfBandDiagnosticRecorder<T> {
  readonly diagnostics: ReadonlyArray<T>;

  /**
   * Reports a `#ref="target"` expression in the template for which a target directive could not be
   * found.
   *
   * @param id the type-checking ID of the template which contains the broken reference.
   * @param ref the `Reference` which could not be matched to a directive.
   */
  missingReferenceTarget(id: TypeCheckId, ref: Reference): void;

  /**
   * Reports usage of a `| pipe` expression in the template for which the named pipe could not be
   * found.
   *
   * @param id the type-checking ID of the template which contains the unknown pipe.
   * @param ast the `BindingPipe` invocation of the pipe which could not be found.
   * @param isStandalone whether the host component is standalone.
   */
  missingPipe(id: TypeCheckId, ast: BindingPipe, isStandalone: boolean): void;

  /**
   * Reports usage of a pipe imported via `@Component.deferredImports` outside
   * of a `@defer` block in a template.
   *
   * @param id the type-checking ID of the template which contains the unknown pipe.
   * @param ast the `BindingPipe` invocation of the pipe which could not be found.
   */
  deferredPipeUsedEagerly(id: TypeCheckId, ast: BindingPipe): void;

  /**
   * Reports usage of a component/directive imported via `@Component.deferredImports` outside
   * of a `@defer` block in a template.
   *
   * @param id the type-checking ID of the template which contains the unknown pipe.
   * @param element the element which hosts a component that was defer-loaded.
   */
  deferredComponentUsedEagerly(id: TypeCheckId, element: Element): void;

  /**
   * Reports a duplicate declaration of a template variable.
   *
   * @param id the type-checking ID of the template which contains the duplicate
   * declaration.
   * @param variable the `Variable` which duplicates a previously declared variable.
   * @param firstDecl the first variable declaration which uses the same name as `variable`.
   */
  duplicateTemplateVar(id: TypeCheckId, variable: Variable, firstDecl: Variable): void;

  /**
   * Report a warning when structural directives support context guards, but the current
   * type-checking configuration prohibits their usage.
   */
  suboptimalTypeInference(id: TypeCheckId, variables: Variable[]): void;

  /**
   * Reports a split two way binding error message.
   */
  splitTwoWayBinding(
    id: TypeCheckId,
    input: BoundAttribute,
    output: BoundEvent,
    inputConsumer: Pick<TcbDirectiveMetadata, 'name' | 'isComponent' | 'ref'>,
    outputConsumer: Pick<TcbDirectiveMetadata, 'name' | 'isComponent' | 'ref'> | Element,
  ): void;

  /** Reports required inputs that haven't been bound. */
  missingRequiredInputs(
    id: TypeCheckId,
    element: Element | Template | Component | Directive,
    directiveName: string,
    isComponent: boolean,
    inputAliases: string[],
  ): void;

  /**
   * Reports accesses of properties that aren't available in a `for` block's tracking expression.
   */
  illegalForLoopTrackAccess(id: TypeCheckId, block: ForLoopBlock, access: PropertyRead): void;

  /**
   * Reports deferred triggers that cannot access the element they're referring to.
   */
  inaccessibleDeferredTriggerElement(
    id: TypeCheckId,
    trigger: HoverDeferredTrigger | InteractionDeferredTrigger | ViewportDeferredTrigger,
  ): void;

  /**
   * Reports cases where control flow nodes prevent content projection.
   */
  controlFlowPreventingContentProjection(
    id: TypeCheckId,
    category: OutOfBandDiagnosticCategory,
    projectionNode: Element | Template,
    componentName: string,
    slotSelector: string,
    controlFlowNode: IfBlockBranch | SwitchBlockCase | ForLoopBlock | ForLoopBlockEmpty,
    preservesWhitespaces: boolean,
  ): void;

  /** Reports cases where users are writing to `@let` declarations. */
  illegalWriteToLetDeclaration(id: TypeCheckId, node: AST, target: LetDeclaration): void;

  /** Reports cases where users are accessing an `@let` before it is defined.. */
  letUsedBeforeDefinition(id: TypeCheckId, node: PropertyRead, target: LetDeclaration): void;

  /**
   * Reports a `@let` declaration that conflicts with another symbol in the same scope.
   *
   * @param id the type-checking ID of the template which contains the declaration.
   * @param current the `LetDeclaration` which is invalid.
   */
  conflictingDeclaration(id: TypeCheckId, current: LetDeclaration): void;

  /**
   * Reports that a named template dependency (e.g. `<Missing/>`) is not available.
   * @param id Type checking ID of the template in which the dependency is declared.
   * @param node Node that declares the dependency.
   */
  missingNamedTemplateDependency(id: TypeCheckId, node: Component | Directive): void;

  /**
   * Reports that a templace dependency of the wrong kind has been referenced at a specific position
   * (e.g. `<SomeDirective/>`).
   * @param id Type checking ID of the template in which the dependency is declared.
   * @param node Node that declares the dependency.
   */
  incorrectTemplateDependencyType(id: TypeCheckId, node: Component | Directive): void;

  /**
   * Reports a binding inside directive syntax that does not match any of the inputs/outputs of
   * the directive.
   * @param id Type checking ID of the template in which the directive was defined.
   * @param directive Directive that contains the binding.
   * @param node Node declaring the binding.
   */
  unclaimedDirectiveBinding(
    id: TypeCheckId,
    directive: Directive,
    node: BoundAttribute | TextAttribute | BoundEvent,
  ): void;

  /**
   * Reports that an implicit deferred trigger is set on a block that does not have a placeholder.
   */
  deferImplicitTriggerMissingPlaceholder(
    id: TypeCheckId,
    trigger: HoverDeferredTrigger | InteractionDeferredTrigger | ViewportDeferredTrigger,
  ): void;

  /**
   * Reports that an implicit deferred trigger is set on a block whose placeholder is not set up
   * correctly (e.g. more than one root node).
   */
  deferImplicitTriggerInvalidPlaceholder(
    id: TypeCheckId,
    trigger: HoverDeferredTrigger | InteractionDeferredTrigger | ViewportDeferredTrigger,
  ): void;

  /**
   * Reports an unsupported binding on a form `FormField` node.
   */
  formFieldUnsupportedBinding(id: TypeCheckId, node: BoundAttribute | TextAttribute): void;

  /**
   * Reports that multiple components in the compilation scope match a given element.
   */
  multipleMatchingComponents(id: TypeCheckId, element: Element, componentNames: string[]): void;

  /**
   * Reports that a host directive input/output has been exposed under multiple names.
   * @param id Type checking ID of the template in which the host directive was used.
   * @param node Node on which the host directive was used.
   * @param directiveName Name of the host directive.
   * @param kind Type of the conflicting binding.
   * @param classPropertyName Name of the class member that declares the input/output.
   * @param aliases Aliases under which the binding is exposed.
   */
  conflictingHostDirectiveBinding(
    id: TypeCheckId,
    node: Element | Template | Component | Directive,
    directiveName: string,
    kind: 'input' | 'output',
    classPropertyName: string,
    aliases: string[],
  ): void;
}
