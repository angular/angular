/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
   * A source span for the directive type.
   */
  typeSourceSpan: ParseSourceSpan;

  /**
   * Dependencies of the directive's constructor.
   */
  deps: R3DependencyMetadata[];

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
  inputs: {[field: string]: string};

  /**
   * A mapping of output field names to the property names.
   */
  outputs: {[field: string]: string};
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
   * An expression representing a type to read from each matched node, or null if the node itself
   * is to be returned.
   */
  read: o.Expression|null;
}

/**
 * Output of render3 directive compilation.
 */
export interface R3DirectiveDef {
  expression: o.Expression;
  type: o.Type;
}

/**
 * Output of render3 component compilation.
 */
export interface R3ComponentDef {
  expression: o.Expression;
  type: o.Type;
}
