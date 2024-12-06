/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, ViewEncapsulation} from '../../core';
import {InterpolationConfig} from '../../ml_parser/defaults';
import * as o from '../../output/output_ast';
import {ParseSourceSpan} from '../../parse_util';
import * as t from '../r3_ast';
import {R3DependencyMetadata} from '../r3_factory';
import {MaybeForwardRefExpression, R3Reference} from '../util';

/**
 * Information needed to compile a directive for the render3 runtime.
 */
export interface R3DirectiveMetadata {
  /**
   * Name of the directive type.
   */
  name: string;

  /**
   * An expression representing a reference to the directive itself.
   */
  type: R3Reference;

  /**
   * Number of generic type parameters of the type itself.
   */
  typeArgumentCount: number;

  /**
   * A source span for the directive type.
   */
  typeSourceSpan: ParseSourceSpan;

  /**
   * Dependencies of the directive's constructor.
   */
  deps: R3DependencyMetadata[] | 'invalid' | null;

  /**
   * Unparsed selector of the directive, or `null` if there was no selector.
   */
  selector: string | null;

  /**
   * Information about the content queries made by the directive.
   */
  queries: R3QueryMetadata[];

  /**
   * Information about the view queries made by the directive.
   */
  viewQueries: R3QueryMetadata[];

  /**
   * Mappings indicating how the directive interacts with its host element (host bindings,
   * listeners, etc).
   */
  host: R3HostMetadata;

  /**
   * Information about usage of specific lifecycle events which require special treatment in the
   * code generator.
   */
  lifecycle: {
    /**
     * Whether the directive uses NgOnChanges.
     */
    usesOnChanges: boolean;
  };

  /**
   * A mapping of inputs from class property names to binding property names, or to a tuple of
   * binding property name and class property name if the names are different.
   */
  inputs: {[field: string]: R3InputMetadata};

  /**
   * A mapping of outputs from class property names to binding property names, or to a tuple of
   * binding property name and class property name if the names are different.
   */
  outputs: {[field: string]: string};

  /**
   * Whether or not the component or directive inherits from another class
   */
  usesInheritance: boolean;

  /**
   * Whether or not the component or directive inherits its entire decorator from its base class.
   */
  fullInheritance: boolean;

  /**
   * Reference name under which to export the directive's type in a template,
   * if any.
   */
  exportAs: string[] | null;

  /**
   * The list of providers defined in the directive.
   */
  providers: o.Expression | null;

  /**
   * Whether or not the component or directive is standalone.
   */
  isStandalone: boolean;

  /**
   * Whether or not the component or directive is signal-based.
   */
  isSignal: boolean;

  /**
   * Additional directives applied to the directive host.
   */
  hostDirectives: R3HostDirectiveMetadata[] | null;
}

/**
 * Defines how dynamic imports for deferred dependencies should be emitted in the
 * generated output:
 *  - either in a function on per-component basis (in case of local compilation)
 *  - or in a function on per-block basis (in full compilation mode)
 */
export const enum DeferBlockDepsEmitMode {
  /**
   * Dynamic imports are grouped on per-block basis.
   *
   * This is used in full compilation mode, when compiler has more information
   * about particular dependencies that belong to this block.
   */
  PerBlock,

  /**
   * Dynamic imports are grouped on per-component basis.
   *
   * In local compilation, compiler doesn't have enough information to determine
   * which deferred dependencies belong to which block. In this case we group all
   * dynamic imports into a single file on per-component basis.
   */
  PerComponent,
}

/**
 * Specifies how a list of declaration type references should be emitted into the generated code.
 */
export const enum DeclarationListEmitMode {
  /**
   * The list of declarations is emitted into the generated code as is.
   *
   * ```ts
   * directives: [MyDir],
   * ```
   */
  Direct,

  /**
   * The list of declarations is emitted into the generated code wrapped inside a closure, which
   * is needed when at least one declaration is a forward reference.
   *
   * ```ts
   * directives: function () { return [MyDir, ForwardDir]; },
   * ```
   */
  Closure,

  /**
   * Similar to `Closure`, with the addition that the list of declarations can contain individual
   * items that are themselves forward references. This is relevant for JIT compilations, as
   * unwrapping the forwardRef cannot be done statically so must be deferred. This mode emits
   * the declaration list using a mapping transform through `resolveForwardRef` to ensure that
   * any forward references within the list are resolved when the outer closure is invoked.
   *
   * Consider the case where the runtime has captured two declarations in two distinct values:
   * ```ts
   * const dirA = MyDir;
   * const dirB = forwardRef(function() { return ForwardRef; });
   * ```
   *
   * This mode would emit the declarations captured in `dirA` and `dirB` as follows:
   * ```ts
   * directives: function () { return [dirA, dirB].map(ng.resolveForwardRef); },
   * ```
   */
  ClosureResolved,

  RuntimeResolved,
}

/**
 * Information needed to compile a component for the render3 runtime.
 */
export interface R3ComponentMetadata<DeclarationT extends R3TemplateDependency>
  extends R3DirectiveMetadata {
  /**
   * Information about the component's template.
   */
  template: {
    /**
     * Parsed nodes of the template.
     */
    nodes: t.Node[];

    /**
     * Any ng-content selectors extracted from the template. Contains `*` when an ng-content
     * element without selector is present.
     */
    ngContentSelectors: string[];

    /**
     * Whether the template preserves whitespaces from the user's code.
     */
    preserveWhitespaces?: boolean;
  };

  declarations: DeclarationT[];

  /** Metadata related to the deferred blocks in the component's template. */
  defer: R3ComponentDeferMetadata;

  /**
   * Specifies how the 'directives' and/or `pipes` array, if generated, need to be emitted.
   */
  declarationListEmitMode: DeclarationListEmitMode;

  /**
   * A collection of styling data that will be applied and scoped to the component.
   */
  styles: string[];

  /**
   * A collection of style paths for external stylesheets that will be applied and scoped to the component.
   */
  externalStyles?: string[];

  /**
   * An encapsulation policy for the component's styling.
   * Possible values:
   * - `ViewEncapsulation.Emulated`: Apply modified component styles in order to emulate
   *                                 a native Shadow DOM CSS encapsulation behavior.
   * - `ViewEncapsulation.None`: Apply component styles globally without any sort of encapsulation.
   * - `ViewEncapsulation.ShadowDom`: Use the browser's native Shadow DOM API to encapsulate styles.
   */
  encapsulation: ViewEncapsulation;

  /**
   * A collection of animation triggers that will be used in the component template.
   */
  animations: o.Expression | null;

  /**
   * The list of view providers defined in the component.
   */
  viewProviders: o.Expression | null;

  /**
   * Path to the .ts file in which this template's generated code will be included, relative to
   * the compilation root. This will be used to generate identifiers that need to be globally
   * unique in certain contexts (such as g3).
   */
  relativeContextFilePath: string;

  /**
   * Whether translation variable name should contain external message id
   * (used by Closure Compiler's output of `goog.getMsg` for transition period).
   */
  i18nUseExternalIds: boolean;

  /**
   * Overrides the default interpolation start and end delimiters ({{ and }}).
   */
  interpolation: InterpolationConfig;

  /**
   * Strategy used for detecting changes in the component.
   *
   * In global compilation mode the value is ChangeDetectionStrategy if available as it is
   * statically resolved during analysis phase. Whereas in local compilation mode the value is the
   * expression as appears in the decorator.
   */
  changeDetection: ChangeDetectionStrategy | o.Expression | null;

  /**
   * Relative path to the component's template from the root of the project.
   * Used to generate debugging information.
   */
  relativeTemplatePath: string | null;

  /**
   * The imports expression as appears on the component decorate for standalone component. This
   * field is currently needed only for local compilation, and so in other compilation modes it may
   * not be set. If component has empty array imports then this field is not set.
   */
  rawImports?: o.Expression;
}

/**
 * Information about the deferred blocks in a component's template.
 */
export type R3ComponentDeferMetadata =
  | {
      mode: DeferBlockDepsEmitMode.PerBlock;
      blocks: Map<t.DeferredBlock, o.Expression | null>;
    }
  | {
      mode: DeferBlockDepsEmitMode.PerComponent;
      dependenciesFn: o.Expression | null;
    };

/**
 * Metadata for an individual input on a directive.
 */
export interface R3InputMetadata {
  classPropertyName: string;
  bindingPropertyName: string;
  required: boolean;
  isSignal: boolean;
  /**
   * Transform function for the input.
   *
   * Null if there is no transform, or if this is a signal input.
   * Signal inputs capture their transform as part of the `InputSignal`.
   */
  transformFunction: o.Expression | null;
}

export enum R3TemplateDependencyKind {
  Directive = 0,
  Pipe = 1,
  NgModule = 2,
}

/**
 * A dependency that's used within a component template.
 */
export interface R3TemplateDependency {
  kind: R3TemplateDependencyKind;

  /**
   * The type of the dependency as an expression.
   */
  type: o.Expression;
}

/**
 * A dependency that's used within a component template
 */
export type R3TemplateDependencyMetadata =
  | R3DirectiveDependencyMetadata
  | R3PipeDependencyMetadata
  | R3NgModuleDependencyMetadata;

/**
 * Information about a directive that is used in a component template. Only the stable, public
 * facing information of the directive is stored here.
 */
export interface R3DirectiveDependencyMetadata extends R3TemplateDependency {
  kind: R3TemplateDependencyKind.Directive;

  /**
   * The selector of the directive.
   */
  selector: string;

  /**
   * The binding property names of the inputs of the directive.
   */
  inputs: string[];

  /**
   * The binding property names of the outputs of the directive.
   */
  outputs: string[];

  /**
   * Name under which the directive is exported, if any (exportAs in Angular). Null otherwise.
   */
  exportAs: string[] | null;

  /**
   * If true then this directive is actually a component; otherwise it is not.
   */
  isComponent: boolean;
}

export interface R3PipeDependencyMetadata extends R3TemplateDependency {
  kind: R3TemplateDependencyKind.Pipe;

  name: string;
}

export interface R3NgModuleDependencyMetadata extends R3TemplateDependency {
  kind: R3TemplateDependencyKind.NgModule;
}

/**
 * Information needed to compile a query (view or content).
 */
export interface R3QueryMetadata {
  /**
   * Name of the property on the class to update with query results.
   */
  propertyName: string;

  /**
   * Whether to read only the first matching result, or an array of results.
   */
  first: boolean;

  /**
   * Either an expression representing a type or `InjectionToken` for the query
   * predicate, or a set of string selectors.
   *
   * Note: At compile time we split selectors as an optimization that avoids this
   * extra work at runtime creation phase.
   *
   * Notably, if the selector is not statically analyzable due to an expression,
   * the selectors may need to be split up at runtime.
   */
  predicate: MaybeForwardRefExpression | string[];

  /**
   * Whether to include only direct children or all descendants.
   */
  descendants: boolean;

  /**
   * If the `QueryList` should fire change event only if actual change to query was computed (vs old
   * behavior where the change was fired whenever the query was recomputed, even if the recomputed
   * query resulted in the same list.)
   */
  emitDistinctChangesOnly: boolean;

  /**
   * An expression representing a type to read from each matched node, or null if the default value
   * for a given node is to be returned.
   */
  read: o.Expression | null;

  /**
   * Whether or not this query should collect only static results.
   *
   * If static is true, the query's results will be set on the component after nodes are created,
   * but before change detection runs. This means that any results that relied upon change detection
   * to run (e.g. results inside *ngIf or *ngFor views) will not be collected. Query results are
   * available in the ngOnInit hook.
   *
   * If static is false, the query's results will be set on the component after change detection
   * runs. This means that the query results can contain nodes inside *ngIf or *ngFor views, but
   * the results will not be available in the ngOnInit hook (only in the ngAfterContentInit for
   * content hooks and ngAfterViewInit for view hooks).
   *
   * Note: For signal-based queries, this option does not have any effect.
   */
  static: boolean;

  /** Whether the query is signal-based. */
  isSignal: boolean;
}

/**
 * Mappings indicating how the class interacts with its
 * host element (host bindings, listeners, etc).
 */
export interface R3HostMetadata {
  /**
   * A mapping of attribute binding keys to `o.Expression`s.
   */
  attributes: {[key: string]: o.Expression};

  /**
   * A mapping of event binding keys to unparsed expressions.
   */
  listeners: {[key: string]: string};

  /**
   * A mapping of property binding keys to unparsed expressions.
   */
  properties: {[key: string]: string};

  specialAttributes: {styleAttr?: string; classAttr?: string};
}

/**
 * Information needed to compile a host directive for the render3 runtime.
 */
export interface R3HostDirectiveMetadata {
  /** An expression representing the host directive class itself. */
  directive: R3Reference;

  /** Whether the expression referring to the host directive is a forward reference. */
  isForwardReference: boolean;

  /** Inputs from the host directive that will be exposed on the host. */
  inputs: {[publicName: string]: string} | null;

  /** Outputs from the host directive that will be exposed on the host. */
  outputs: {[publicName: string]: string} | null;
}

/**
 * Information needed to compile the defer block resolver function.
 */
export type R3DeferResolverFunctionMetadata =
  | {
      mode: DeferBlockDepsEmitMode.PerBlock;
      dependencies: R3DeferPerBlockDependency[];
    }
  | {
      mode: DeferBlockDepsEmitMode.PerComponent;
      dependencies: R3DeferPerComponentDependency[];
    };

/**
 * Information about a single dependency of a defer block in `PerBlock` mode.
 */
export interface R3DeferPerBlockDependency {
  /**
   * Reference to a dependency.
   */
  typeReference: o.Expression;

  /**
   * Dependency class name.
   */
  symbolName: string;

  /**
   * Whether this dependency can be defer-loaded.
   */
  isDeferrable: boolean;

  /**
   * Import path where this dependency is located.
   */
  importPath: string | null;

  /**
   * Whether the symbol is the default export.
   */
  isDefaultImport: boolean;
}

/**
 * Information about a single dependency of a defer block in `PerComponent` mode.
 */
export interface R3DeferPerComponentDependency {
  /**
   * Dependency class name.
   */
  symbolName: string;

  /**
   * Import path where this dependency is located.
   */
  importPath: string;

  /**
   * Whether the symbol is the default export.
   */
  isDefaultImport: boolean;
}
