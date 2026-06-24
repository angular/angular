/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST} from '../../expression_parser/ast';
import {
  BoundAttribute,
  BoundEvent,
  Component,
  Content,
  DeferredBlock,
  DeferredBlockError,
  DeferredBlockLoading,
  DeferredBlockPlaceholder,
  DeferredTrigger,
  Directive,
  Element,
  ForLoopBlock,
  ForLoopBlockEmpty,
  HostElement,
  IfBlockBranch,
  LetDeclaration,
  Node,
  Reference,
  SwitchBlockCase,
  Template,
  TextAttribute,
  Variable,
} from '../r3_ast';

/** Node that has a `Scope` associated with it. */
export type ScopedNode =
  | Template
  | SwitchBlockCase
  | IfBlockBranch
  | ForLoopBlock
  | ForLoopBlockEmpty
  | DeferredBlock
  | DeferredBlockError
  | DeferredBlockLoading
  | DeferredBlockPlaceholder
  | Content
  | HostElement;

/** Possible values that a reference can be resolved to. */
export type ReferenceTarget<DirectiveT> =
  | {directive: DirectiveT; node: Exclude<DirectiveOwner, HostElement>}
  | Element
  | Template;

/** Entity that is local to the template and defined within the template. */
export type TemplateEntity = Reference | Variable | LetDeclaration;

/** Nodes that can have directives applied to them. */
export type DirectiveOwner = Element | Template | Component | Directive | HostElement;

/*
 * t2 is the replacement for the `TemplateDefinitionBuilder`. It handles the operations of
 * analyzing Angular templates, extracting semantic info, and ultimately producing a template
 * definition function which renders the template using Ivy instructions.
 *
 * t2 data is also utilized by the template type-checking facilities to understand a template enough
 * to generate type-checking code for it.
 */

/**
 * A logical target for analysis, which could contain a template or other types of bindings.
 */
export interface Target<DirectiveT> {
  template?: Node[];
  host?: {
    node: HostElement;
    directives: DirectiveT[];
  };
}

/**
 * A data structure which can indicate whether a given property name is present or not.
 *
 * This is used to represent the set of inputs or outputs present on a directive, and allows the
 * binder to query for the presence of a mapping for property names.
 */
export interface InputOutputPropertySet {
  hasBindingPropertyName(propertyName: string): boolean;
}

/**
 * A data structure which captures the animation trigger names that are statically resolvable
 * and whether some names could not be statically evaluated.
 */
export interface LegacyAnimationTriggerNames {
  includesDynamicAnimations: boolean;
  staticTriggerNames: string[];
}

/**
 * Metadata regarding a directive that's needed to match it against template elements. This is
 * provided by a consumer of the t2 APIs.
 */
export interface DirectiveMeta {
  /**
   * Name of the directive class (used for debugging).
   */
  name: string;

  /** The selector for the directive or `null` if there isn't one. */
  selector: string | null;

  /**
   * Whether the directive is a component.
   */
  isComponent: boolean;

  /**
   * Set of inputs which this directive claims.
   *
   * Goes from property names to field names.
   */
  inputs: InputOutputPropertySet;

  /**
   * Set of outputs which this directive claims.
   *
   * Goes from property names to field names.
   */
  outputs: InputOutputPropertySet;

  /**
   * Name under which the directive is exported, if any (exportAs in Angular).
   *
   * Null otherwise
   */
  exportAs: string[] | null;

  /**
   * Whether the directive is a structural directive (e.g. `<div *ngIf></div>`).
   */
  isStructural: boolean;

  /**
   * If the directive is a component, includes the selectors of its `ng-content` elements.
   */
  ngContentSelectors: string[] | null;

  /**
   * Whether the template of the component preserves whitespaces.
   */
  preserveWhitespaces: boolean;

  /**
   * The name of legacy animations that the user defines in the component.
   * Only includes the legacy animation names.
   */
  animationTriggerNames: LegacyAnimationTriggerNames | null;
}

/**
 * Interface to the binding API, which processes a template and returns an object similar to the
 * `ts.TypeChecker`.
 *
 * The returned `BoundTarget` has an API for extracting information about the processed target.
 */
export interface TargetBinder<D extends DirectiveMeta> {
  bind(target: Target<D>): BoundTarget<D>;
}

/**
 * Result of performing the binding operation against a `Target`.
 *
 * The original `Target` is accessible, as well as a suite of methods for extracting binding
 * information regarding the `Target`.
 *
 * @param DirectiveT directive metadata type
 */
export interface BoundTarget<DirectiveT extends DirectiveMeta> {
  /**
   * Get the original `Target` that was bound.
   */
  readonly target: Target<DirectiveT>;

  /**
   * For a given template node (either an `Element` or a `Template`), get the set of directives
   * which matched the node, if any.
   */
  getDirectivesOfNode(node: DirectiveOwner): DirectiveT[] | null;

  /**
   * For a given `Reference`, get the reference's target - either an `Element`, a `Template`, or
   * a directive on a particular node.
   */
  getReferenceTarget(ref: Reference): ReferenceTarget<DirectiveT> | null;

  /**
   * For a given binding, get the entity to which the binding is being made.
   *
   * This will either be a directive or the node itself.
   */
  getConsumerOfBinding(
    binding: BoundAttribute | BoundEvent | TextAttribute,
  ): DirectiveT | Element | Template | null;

  /**
   * If the given `AST` expression refers to a `Reference` or `Variable` within the `Target`, then
   * return that.
   *
   * Otherwise, returns `null`.
   *
   * This is only defined for `AST` expressions that read or write to a property of an
   * `ImplicitReceiver`.
   */
  getExpressionTarget(expr: AST): TemplateEntity | null;

  /**
   * Given a particular `Reference` or `Variable`, get the `ScopedNode` which created it.
   *
   * All `Variable`s are defined on node, so this will always return a value for a `Variable`
   * from the `Target`. Returns `null` otherwise.
   */
  getDefinitionNodeOfSymbol(symbol: TemplateEntity): ScopedNode | null;

  /**
   * Get the nesting level of a particular `ScopedNode`.
   *
   * This starts at 1 for top-level nodes within the `Target` and increases for nodes
   * nested at deeper levels.
   */
  getNestingLevel(node: ScopedNode): number;

  /**
   * Get all `Reference`s and `Variables` visible within the given `ScopedNode` (or at the top
   * level, if `null` is passed).
   */
  getEntitiesInScope(node: ScopedNode | null): ReadonlySet<TemplateEntity>;

  /**
   * Get a list of all the directives used by the target,
   * including directives from `@defer` blocks.
   */
  getUsedDirectives(): DirectiveT[];

  /**
   * Get a list of eagerly used directives from the target.
   * Note: this list *excludes* directives from `@defer` blocks.
   */
  getEagerlyUsedDirectives(): DirectiveT[];

  /**
   * Get a list of all the pipes used by the target,
   * including pipes from `@defer` blocks.
   */
  getUsedPipes(): string[];

  /**
   * Get a list of eagerly used pipes from the target.
   * Note: this list *excludes* pipes from `@defer` blocks.
   */
  getEagerlyUsedPipes(): string[];

  /**
   * Get a list of all `@defer` blocks used by the target.
   */
  getDeferBlocks(): DeferredBlock[];

  /**
   * Gets the element that a specific deferred block trigger is targeting.
   * @param block Block that the trigger belongs to.
   * @param trigger Trigger whose target is being looked up.
   */
  getDeferredTriggerTarget(block: DeferredBlock, trigger: DeferredTrigger): Element | null;

  /**
   * Whether a given node is located in a `@defer` block.
   */
  isDeferred(node: Element): boolean;

  /**
   * Checks whether a component/directive that was referenced directly in the template exists.
   * @param name Name of the component/directive.
   */
  referencedDirectiveExists(name: string): boolean;
}
