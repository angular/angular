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
   * An operation which declares and initializes a `SemanticVariable`.
   */
  Variable,

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

  /**
   * An operation to advance the runtime's implicit slot context during the update phase of a view.
   */
  Advance,
}

/**
 * Distinguishes different kinds of IR expressions.
 */
export enum ExpressionKind {
  /**
   * Read of a variable in a lexical scope.
   */
  LexicalRead,

  /**
   * A reference to the current view context.
   */
  Context,

  /**
   * Read of a variable declared in a `VariableOp`.
   */
  ReadVariable,

  /**
   * Runtime operation to navigate to the next view context in the view hierarchy.
   */
  NextContext,

  /**
   * Runtime operation to retrieve the value of a local reference.
   */
  Reference,

  /**
   * Runtime operation to snapshot the current view context.
   */
  GetCurrentView,

  /**
   * Runtime operation to restore a snapshotted view.
   */
  RestoreView,

  /**
   * Runtime operation to reset the current view context after `RestoreView`.
   */
  ResetView,
}

/**
 * Distinguishes between different kinds of `SemanticVariable`s.
 */
export enum SemanticVariableKind {
  /**
   * Represents the context of a particular view.
   */
  Context,

  /**
   * Represents an identifier declared in the lexical scope of a view.
   */
  Identifier,

  /**
   * Represents a saved state that can be used to restore a view in a listener handler function.
   */
  SavedView,
}
