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
   * An operation to begin an `ng-container`.
   */
  ContainerStart,

  /**
   * An operation for an `ng-container` with no children.
   */
  Container,

  /**
   * An operation to end an `ng-container`.
   */
  ContainerEnd,

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
   * An operation to bind an expression to a style property of an element.
   */
  StyleProp,

  /**
   * An operation to bind an expression to the styles of an element.
   */
  StyleMap,

  /**
   * An operation to interpolate text into a property binding.
   */
  InterpolateProperty,

  /**
   * An operation to interpolate text into a style property binding.
   */
  InterpolateStyleProp,

  /**
   * An operation to interpolate text into a style mapping.
   */
  InterpolateStyleMap,

  /**
   * An operation to advance the runtime's implicit slot context during the update phase of a view.
   */
  Advance,

  /**
   * An operation to instantiate a pipe.
   */
  Pipe,

  /**
   * An operation to associate an attribute with an element.
   */
  Attribute,
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

  /**
   * Defines and calls a function with change-detected arguments.
   */
  PureFunctionExpr,

  /**
   * Indicates a positional parameter to a pure function definition.
   */
  PureFunctionParameterExpr,

  /**
   * Binding to a pipe transformation.
   */
  PipeBinding,

  /**
   * Binding to a pipe transformation with a variable number of arguments.
   */
  PipeBindingVariadic,

  /*
   * A safe property read requiring expansion into a null check.
   */
  SafePropertyRead,

  /**
   * A safe keyed read requiring expansion into a null check.
   */
  SafeKeyedRead,

  /**
   * A safe function call requiring expansion into a null check.
   */
  SafeInvokeFunction,

  /**
   * An intermediate expression that will be expanded from a safe read into an explicit ternary.
   */
  SafeTernaryExpr,

  /**
   * An empty expression that will be stipped before generating the final output.
   */
  EmptyExpr,

  /*
   * An assignment to a temporary variable.
   */
  AssignTemporaryExpr,

  /**
   * A reference to a temporary variable.
   */
  ReadTemporaryExpr,
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
