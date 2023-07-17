/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST} from '../../expression_parser/ast';
import {BoundAttribute, BoundEvent, Element, Node, Reference, Template, TextAttribute, Variable} from '../r3_ast';


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
export interface Target {
  template?: Node[];
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
export interface AnimationTriggerNames {
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
  selector: string|null;

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
  exportAs: string[]|null;

  isStructural: boolean;

  /**
   * The name of animations that the user defines in the component.
   * Only includes the animation names.
   */
  animationTriggerNames: AnimationTriggerNames|null;
}

/**
 * Interface to the binding API, which processes a template and returns an object similar to the
 * `ts.TypeChecker`.
 *
 * The returned `BoundTarget` has an API for extracting information about the processed target.
 */
export interface TargetBinder<D extends DirectiveMeta> {
  bind(target: Target): BoundTarget<D>;
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
  readonly target: Target;

  /**
   * For a given template node (either an `Element` or a `Template`), get the set of directives
   * which matched the node, if any.
   */
  getDirectivesOfNode(node: Element|Template): DirectiveT[]|null;

  /**
   * For a given `Reference`, get the reference's target - either an `Element`, a `Template`, or
   * a directive on a particular node.
   */
  getReferenceTarget(ref: Reference): {directive: DirectiveT, node: Element|Template}|Element
      |Template|null;

  /**
   * For a given binding, get the entity to which the binding is being made.
   *
   * This will either be a directive or the node itself.
   */
  getConsumerOfBinding(binding: BoundAttribute|BoundEvent|TextAttribute): DirectiveT|Element
      |Template|null;

  /**
   * If the given `AST` expression refers to a `Reference` or `Variable` within the `Target`, then
   * return that.
   *
   * Otherwise, returns `null`.
   *
   * This is only defined for `AST` expressions that read or write to a property of an
   * `ImplicitReceiver`.
   */
  getExpressionTarget(expr: AST): Reference|Variable|null;

  /**
   * Given a particular `Reference` or `Variable`, get the `Template` which created it.
   *
   * All `Variable`s are defined on templates, so this will always return a value for a `Variable`
   * from the `Target`. For `Reference`s this only returns a value if the `Reference` points to a
   * `Template`. Returns `null` otherwise.
   */
  getTemplateOfSymbol(symbol: Reference|Variable): Template|null;

  /**
   * Get the nesting level of a particular `Template`.
   *
   * This starts at 1 for top-level `Template`s within the `Target` and increases for `Template`s
   * nested at deeper levels.
   */
  getNestingLevel(template: Template): number;

  /**
   * Get all `Reference`s and `Variables` visible within the given `Template` (or at the top level,
   * if `null` is passed).
   */
  getEntitiesInTemplateScope(template: Template|null): ReadonlySet<Reference|Variable>;

  /**
   * Get a list of all the directives used by the target.
   */
  getUsedDirectives(): DirectiveT[];

  /**
   * Get a list of all the pipes used by the target.
   */
  getUsedPipes(): string[];
}
