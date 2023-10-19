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
   * An operation that configures a `@defer` block.
   */
  Defer,

  /**
   * An IR operation that provides secondary templates of a `@defer` block.
   */
  DeferSecondaryBlock,

  /**
   * An operation that controls when a `@defer` loads.
   */
  DeferOn,

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
   * Create a repeater creation instruction op.
   */
  RepeaterCreate,

  /**
   * An update up for a repeater.
   */
  Repeater,

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

  /**
   * An instruction to create an ICU expression.
   */
  Icu,

  /**
   * An instruction to update an ICU expression.
   */
  IcuUpdate,
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
   * A reference to the view context, for use inside a track function.
   */
  TrackContext,

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

  /**
   * A variable for use inside a repeater, providing one of the ambiently-available context
   * properties ($even, $first, etc.).
   */
  DerivedRepeaterVar,
}

export enum VariableFlags {
  None = 0b0000,

  /**
   * Always inline this variable, regardless of the number of times it's used.
   * An `AlwaysInline` variable may not depend on context, because doing so may cause side effects
   * that are illegal when multi-inlined. (The optimizer will enforce this constraint.)
   */
  AlwaysInline = 0b0001,
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

  /**
   * An alias generated by a special embedded view type (e.g. a `@for` block).
   */
  Alias,
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
 * Enumeration of the different kinds of `@defer` secondary blocks.
 */
export enum DeferSecondaryKind {
  Loading,
  Placeholder,
  Error,
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

/**
 * Enumeration of possible times i18n params can be resolved.
 */
export enum I18nParamResolutionTime {
  /**
   * Param is resolved at message creation time. Most params should be resolved at message creation
   * time. However, ICU params need to be handled in post-processing.
   */
  Creation,

  /**
   * Param is resolved during post-processing. This should be used for params who's value comes from
   * an ICU.
   */
  Postproccessing
}
