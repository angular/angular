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
   * An operation disable binding for subsequent elements, which are descendants of a non-bindable
   * node.
   */
  DisableBindings,

  /**
   * An op to conditionally render a template.
   */
  Conditional,

  /**
   * An operation to re-enable binding, after it was previously disabled.
   */
  EnableBindings,

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
   * An intermediate binding op, that has not yet been processed into an individual property,
   * attribute, style, etc.
   */
  Binding,

  /**
   * An operation to bind an expression to a property of an element.
   */
  Property,

  /**
   * An operation to bind an expression to a style property of an element.
   */
  StyleProp,

  /**
   * An operation to bind an expression to a class property of an element.
   */
  ClassProp,

  /**
   * An operation to bind an expression to the styles of an element.
   */
  StyleMap,

  /**
   * An operation to bind an expression to the classes of an element.
   */
  ClassMap,

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

  /**
   * An attribute that has been extracted for inclusion in the consts array.
   */
  ExtractedAttribute,

  /**
   * An i18n message that has been extracted for inclusion in the consts array.
   */
  ExtractedMessage,

  /**
   * A host binding property.
   */
  HostProperty,

  /**
   * A namespace change, which causes the subsequent elements to be processed as either HTML or SVG.
   */
  Namespace,

  /**
   * Configure a content projeciton definition for the view.
   */
  ProjectionDef,

  /**
   * Create a content projection slot.
   */
  Projection,

  /**
   * The start of an i18n block.
   */
  I18nStart,

  /**
   * A self-closing i18n on a single element.
   */
  I18n,

  /**
   * The end of an i18n block.
   */
  I18nEnd,

  /**
   * An expression in an i18n message.
   */
  I18nExpression,

  /**
   * An instruction that applies a set of i18n expressions.
   */
  I18nApply,
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

  /**
   * An expression representing a sanitizer function.
   */
  SanitizerExpr,

  /**
   * An expression that will cause a literal slot index to be emitted.
   */
  SlotLiteralExpr,

  /**
   * A test expression for a conditional op.
   */
  ConditionalCase,
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

/**
 * Whether to compile in compatibilty mode. In compatibility mode, the template pipeline will
 * attempt to match the output of `TemplateDefinitionBuilder` as exactly as possible, at the cost
 * of producing quirky or larger code in some cases.
 */
export enum CompatibilityMode {
  Normal,
  TemplateDefinitionBuilder,
}

/**
 * Represents functions used to sanitize different pieces of a template.
 */
export enum SanitizerFn {
  Html,
  Script,
  Style,
  Url,
  ResourceUrl,
  IframeAttribute,
}

/**
 * Enumeration of the types of attributes which can be applied to an element.
 */
export enum BindingKind {
  /**
   * Static attributes.
   */
  Attribute,

  /**
   * Class bindings.
   */
  ClassName,

  /**
   * Style bindings.
   */
  StyleProperty,

  /**
   * Dynamic property bindings.
   */
  Property,

  /**
   * Property or attribute bindings on a template.
   */
  Template,

  /**
   * Internationalized attributes.
   */
  I18n,

  /**
   * Animation property bindings.
   */
  Animation,
}
