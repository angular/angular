/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Distinguishes different kinds of IR operations.
 *
 * Includes both creation and update operations.
 */
export enum OpKind {
  /**
   * A special operation type which is used to represent the beginning and end nodes of a linked
   * list of operations.
   */
  ListEnd,

  /**
   * An operation which wraps an output AST statement.
   */
  Statement,

  /**
   * An operation to begin rendering of an element.
   */
  ElementStart,

  /**
   * An operation to render an element with no children.
   */
  Element,

  /**
   * An operation which declares an embedded view.
   */
  Template,

  /**
   * An operation to end rendering of an element previously started with `ElementStart`.
   */
  ElementEnd,

  /**
   * An operation to render a text node.
   */
  Text,

  /**
   * An operation declaring an event listener for an element.
   */
  Listener,

  /**
   * An operation to interpolate text into a text node.
   */
  InterpolateText,

  /**
   * An operation to bind an expression to a property of an element.
   */
  Property,
}

/**
 * Distinguishes different kinds of IR expressions.
 */
export enum ExpressionKind {
  /**
   * Read of a variable in a lexical scope.
   */
  LexicalRead,
}
