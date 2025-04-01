/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
   * Create a conditional creation instruction op.
   */
  ConditionalCreate,

  /**
   * Create a conditional branch creation instruction op.
   */
  ConditionalBranchCreate,

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
   * An operation that controls when a `@defer` loads.
   */
  DeferOn,

  /**
   * An operation that controls when a `@defer` loads, using a custom expression as the condition.
   */
  DeferWhen,

  /**
   * An i18n message that has been extracted for inclusion in the consts array.
   */
  I18nMessage,

  /**
   * A binding to a native DOM property.
   */
  DomProperty,

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
   * An operation to bind an expression to the property side of a two-way binding.
   */
  TwoWayProperty,

  /**
   * An operation declaring the event side of a two-way binding.
   */
  TwoWayListener,

  /**
   * A creation-time operation that initializes the slot for a `@let` declaration.
   */
  DeclareLet,

  /**
   * An update-time operation that stores the current value of a `@let` declaration.
   */
  StoreLet,

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
  IcuStart,

  /**
   * An instruction to update an ICU expression.
   */
  IcuEnd,

  /**
   * An instruction representing a placeholder in an ICU expression.
   */
  IcuPlaceholder,

  /**
   * An i18n context containing information needed to generate an i18n message.
   */
  I18nContext,

  /**
   * A creation op that corresponds to i18n attributes on an element.
   */
  I18nAttributes,

  /**
   * Creation op that attaches the location at which an element was defined in a template to it.
   */
  SourceLocation,
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
   * A call storing the value of a `@let` declaration.
   */
  StoreLet,

  /**
   * A reference to a `@let` declaration read from the context view.
   */
  ContextLetReference,

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
   * An expression that will cause a literal slot index to be emitted.
   */
  SlotLiteralExpr,

  /**
   * A test expression for a conditional op.
   */
  ConditionalCase,

  /**
   * An expression that will be automatically extracted to the component const array.
   */
  ConstCollected,

  /**
   * Operation that sets the value of a two-way binding.
   */
  TwoWayBindingSet,
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

  /**
   * Property side of a two-way binding.
   */
  TwoWayProperty,
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
   * Param is resolved during post-processing. This should be used for params whose value comes from
   * an ICU.
   */
  Postproccessing,
}

/**
 * The contexts in which an i18n expression can be used.
 */
export enum I18nExpressionFor {
  /**
   * This expression is used as a value (i.e. inside an i18n block).
   */
  I18nText,

  /**
   * This expression is used in a binding.
   */
  I18nAttribute,
}

/**
 * Flags that describe what an i18n param value. These determine how the value is serialized into
 * the final map.
 */
export enum I18nParamValueFlags {
  None = 0b0000,

  /**
   *  This value represents an element tag.
   */
  ElementTag = 0b1,

  /**
   * This value represents a template tag.
   */
  TemplateTag = 0b10,

  /**
   * This value represents the opening of a tag.
   */
  OpenTag = 0b0100,

  /**
   * This value represents the closing of a tag.
   */
  CloseTag = 0b1000,

  /**
   * This value represents an i18n expression index.
   */
  ExpressionIndex = 0b10000,
}

/**
 * Whether the active namespace is HTML, MathML, or SVG mode.
 */
export enum Namespace {
  HTML,
  SVG,
  Math,
}

/**
 * The type of a `@defer` trigger, for use in the ir.
 */
export enum DeferTriggerKind {
  Idle,
  Immediate,
  Timer,
  Hover,
  Interaction,
  Viewport,
  Never,
}

/**
 * Kinds of i18n contexts. They can be created because of root i18n blocks, or ICUs.
 */
export enum I18nContextKind {
  RootI18n,
  Icu,
  Attr,
}

export enum TemplateKind {
  NgTemplate,
  Structural,
  Block,
}

/**
 * Kinds of modifiers for a defer block.
 */
export const enum DeferOpModifierKind {
  NONE = 'none',
  PREFETCH = 'prefetch',
  HYDRATE = 'hydrate',
}

/**
 * Specifies defer block flags, which should be used for all
 * instances of a given defer block (the flags that should be
 * placed into the `TDeferDetails` at runtime).
 */
export const enum TDeferDetailsFlags {
  Default = 0,

  /**
   * Whether or not the defer block has hydrate triggers.
   */
  HasHydrateTriggers = 1 << 0,
}
