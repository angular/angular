/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '../../core';
import * as o from '../../output/output_ast';
import {ParseSourceSpan} from '../../parse_util';
import * as t from '../r3_ast';
import {R3DependencyMetadata} from '../r3_factory';

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
  type: o.Expression;

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
  deps: R3DependencyMetadata[]|null;

  /**
   * Unparsed selector of the directive, or `null` if there was no selector.
   */
  selector: string|null;

  /**
   * Information about the content queries made by the directive.
   */
  queries: R3QueryMetadata[];

  /**
   * Mappings indicating how the directive interacts with its host element (host bindings,
   * listeners, etc).
   */
  host: {
    /**
     * A mapping of attribute binding keys to unparsed expressions.
     */
    attributes: {[key: string]: string};

    /**
     * A mapping of event binding keys to unparsed expressions.
     */
    listeners: {[key: string]: string};

    /**
     * A mapping of property binding keys to unparsed expressions.
     */
    properties: {[key: string]: string};
  };

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
   * A mapping of input field names to the property names.
   */
  inputs: {[field: string]: string | [string, string]};

  /**
   * A mapping of output field names to the property names.
   */
  outputs: {[field: string]: string};

  /**
   * Whether or not the component or directive inherits from another class
   */
  usesInheritance: boolean;

  /**
   * Reference name under which to export the directive's type in a template,
   * if any.
   */
  exportAs: string|null;

  /**
   * The list of providers defined in the directive.
   */
  providers: o.Expression|null;
}

/**
 * Information needed to compile a component for the render3 runtime.
 */
export interface R3ComponentMetadata extends R3DirectiveMetadata {
  /**
   * Information about the component's template.
   */
  template: {
    /**
     * Parsed nodes of the template.
     */
    nodes: t.Node[];

    /**
     * Whether the template includes <ng-content> tags.
     */
    hasNgContent: boolean;

    /**
     * Selectors found in the <ng-content> tags in the template.
     */
    ngContentSelectors: string[];

    /**
     * Path to the .ts file in which this template's generated code will be included, relative to
     * the compilation root. This will be used to generate identifiers that need to be globally
     * unique in certain contexts (such as g3).
     */
    relativeContextFilePath: string;
  };

  /**
   * Information about the view queries made by the component.
   */
  viewQueries: R3QueryMetadata[];

  /**
   * A map of pipe names to an expression referencing the pipe type which are in the scope of the
   * compilation.
   */
  pipes: Map<string, o.Expression>;

  /**
   * A map of directive selectors to an expression referencing the directive type which are in the
   * scope of the compilation.
   */
  directives: Map<string, o.Expression>;

  /**
   * Whether to wrap the 'directives' and/or `pipes` array, if one is generated, in a closure.
   *
   * This is done when the directives or pipes contain forward references.
   */
  wrapDirectivesAndPipesInClosure: boolean;

  /**
   * A collection of styling data that will be applied and scoped to the component.
   */
  styles: string[];

  /**
   * An encapsulation policy for the template and CSS styles. One of:
   * - `ViewEncapsulation.Native`: Use shadow roots. This works only if natively available on the
   *   platform (note that this is marked the as the "deprecated shadow DOM" as of Angular v6.1.
   * - `ViewEncapsulation.Emulated`: Use shimmed CSS that emulates the native behavior.
   * - `ViewEncapsulation.None`: Use global CSS without any encapsulation.
   * - `ViewEncapsulation.ShadowDom`: Use the latest ShadowDOM API to natively encapsulate styles
   * into a shadow root.
   */
  encapsulation: ViewEncapsulation;

  /**
   * A collection of animation triggers that will be used in the component template.
   */
  animations: o.Expression|null;

  /**
   * The list of view providers defined in the component.
   */
  viewProviders: o.Expression|null;
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
   * Either an expression representing a type for the query predicate, or a set of string selectors.
   */
  predicate: o.Expression|string[];

  /**
   * Whether to include only direct children or all descendants.
   */
  descendants: boolean;

  /**
   * An expression representing a type to read from each matched node, or null if the default value
   * for a given node is to be returned.
   */
  read: o.Expression|null;
}

/**
 * Output of render3 directive compilation.
 */
export interface R3DirectiveDef {
  expression: o.Expression;
  type: o.Type;
  statements: o.Statement[];
}

/**
 * Output of render3 component compilation.
 */
export interface R3ComponentDef {
  expression: o.Expression;
  type: o.Type;
  statements: o.Statement[];
}
