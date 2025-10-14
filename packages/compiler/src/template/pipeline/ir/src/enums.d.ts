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
export declare enum OpKind {
    /**
     * A special operation type which is used to represent the beginning and end nodes of a linked
     * list of operations.
     */
    ListEnd = 0,
    /**
     * An operation which wraps an output AST statement.
     */
    Statement = 1,
    /**
     * An operation which declares and initializes a `SemanticVariable`.
     */
    Variable = 2,
    /**
     * An operation to begin rendering of an element.
     */
    ElementStart = 3,
    /**
     * An operation to render an element with no children.
     */
    Element = 4,
    /**
     * An operation which declares an embedded view.
     */
    Template = 5,
    /**
     * An operation to end rendering of an element previously started with `ElementStart`.
     */
    ElementEnd = 6,
    /**
     * An operation to begin an `ng-container`.
     */
    ContainerStart = 7,
    /**
     * An operation for an `ng-container` with no children.
     */
    Container = 8,
    /**
     * An operation to end an `ng-container`.
     */
    ContainerEnd = 9,
    /**
     * An operation disable binding for subsequent elements, which are descendants of a non-bindable
     * node.
     */
    DisableBindings = 10,
    /**
     * Create a conditional creation instruction op.
     */
    ConditionalCreate = 11,
    /**
     * Create a conditional branch creation instruction op.
     */
    ConditionalBranchCreate = 12,
    /**
     * An op to conditionally render a template.
     */
    Conditional = 13,
    /**
     * An operation to re-enable binding, after it was previously disabled.
     */
    EnableBindings = 14,
    /**
     * An operation to render a text node.
     */
    Text = 15,
    /**
     * An operation declaring an event listener for an element.
     */
    Listener = 16,
    /**
     * An operation to interpolate text into a text node.
     */
    InterpolateText = 17,
    /**
     * An intermediate binding op, that has not yet been processed into an individual property,
     * attribute, style, etc.
     */
    Binding = 18,
    /**
     * An operation to bind an expression to a property of an element.
     */
    Property = 19,
    /**
     * An operation to bind an expression to a style property of an element.
     */
    StyleProp = 20,
    /**
     * An operation to bind an expression to a class property of an element.
     */
    ClassProp = 21,
    /**
     * An operation to bind an expression to the styles of an element.
     */
    StyleMap = 22,
    /**
     * An operation to bind an expression to the classes of an element.
     */
    ClassMap = 23,
    /**
     * An operation to advance the runtime's implicit slot context during the update phase of a view.
     */
    Advance = 24,
    /**
     * An operation to instantiate a pipe.
     */
    Pipe = 25,
    /**
     * An operation to associate an attribute with an element.
     */
    Attribute = 26,
    /**
     * An attribute that has been extracted for inclusion in the consts array.
     */
    ExtractedAttribute = 27,
    /**
     * An operation that configures a `@defer` block.
     */
    Defer = 28,
    /**
     * An operation that controls when a `@defer` loads.
     */
    DeferOn = 29,
    /**
     * An operation that controls when a `@defer` loads, using a custom expression as the condition.
     */
    DeferWhen = 30,
    /**
     * An i18n message that has been extracted for inclusion in the consts array.
     */
    I18nMessage = 31,
    /**
     * A binding to a native DOM property.
     */
    DomProperty = 32,
    /**
     * A namespace change, which causes the subsequent elements to be processed as either HTML or SVG.
     */
    Namespace = 33,
    /**
     * Configure a content projeciton definition for the view.
     */
    ProjectionDef = 34,
    /**
     * Create a content projection slot.
     */
    Projection = 35,
    /**
     * Create a repeater creation instruction op.
     */
    RepeaterCreate = 36,
    /**
     * An update up for a repeater.
     */
    Repeater = 37,
    /**
     * An operation to bind an expression to the property side of a two-way binding.
     */
    TwoWayProperty = 38,
    /**
     * An operation declaring the event side of a two-way binding.
     */
    TwoWayListener = 39,
    /**
     * A creation-time operation that initializes the slot for a `@let` declaration.
     */
    DeclareLet = 40,
    /**
     * An update-time operation that stores the current value of a `@let` declaration.
     */
    StoreLet = 41,
    /**
     * The start of an i18n block.
     */
    I18nStart = 42,
    /**
     * A self-closing i18n on a single element.
     */
    I18n = 43,
    /**
     * The end of an i18n block.
     */
    I18nEnd = 44,
    /**
     * An expression in an i18n message.
     */
    I18nExpression = 45,
    /**
     * An instruction that applies a set of i18n expressions.
     */
    I18nApply = 46,
    /**
     * An instruction to create an ICU expression.
     */
    IcuStart = 47,
    /**
     * An instruction to update an ICU expression.
     */
    IcuEnd = 48,
    /**
     * An instruction representing a placeholder in an ICU expression.
     */
    IcuPlaceholder = 49,
    /**
     * An i18n context containing information needed to generate an i18n message.
     */
    I18nContext = 50,
    /**
     * A creation op that corresponds to i18n attributes on an element.
     */
    I18nAttributes = 51,
    /**
     * Creation op that attaches the location at which an element was defined in a template to it.
     */
    SourceLocation = 52,
    /**
     * An operation to bind animation css classes to an element.
     */
    Animation = 53,
    /**
     * An operation to bind animation css classes to an element.
     */
    AnimationString = 54,
    /**
     * An operation to bind animation css classes to an element.
     */
    AnimationBinding = 55,
    /**
     * An operation to bind animation events to an element.
     */
    AnimationListener = 56
}
/**
 * Distinguishes different kinds of IR expressions.
 */
export declare enum ExpressionKind {
    /**
     * Read of a variable in a lexical scope.
     */
    LexicalRead = 0,
    /**
     * A reference to the current view context.
     */
    Context = 1,
    /**
     * A reference to the view context, for use inside a track function.
     */
    TrackContext = 2,
    /**
     * Read of a variable declared in a `VariableOp`.
     */
    ReadVariable = 3,
    /**
     * Runtime operation to navigate to the next view context in the view hierarchy.
     */
    NextContext = 4,
    /**
     * Runtime operation to retrieve the value of a local reference.
     */
    Reference = 5,
    /**
     * A call storing the value of a `@let` declaration.
     */
    StoreLet = 6,
    /**
     * A reference to a `@let` declaration read from the context view.
     */
    ContextLetReference = 7,
    /**
     * Runtime operation to snapshot the current view context.
     */
    GetCurrentView = 8,
    /**
     * Runtime operation to restore a snapshotted view.
     */
    RestoreView = 9,
    /**
     * Runtime operation to reset the current view context after `RestoreView`.
     */
    ResetView = 10,
    /**
     * Defines and calls a function with change-detected arguments.
     */
    PureFunctionExpr = 11,
    /**
     * Indicates a positional parameter to a pure function definition.
     */
    PureFunctionParameterExpr = 12,
    /**
     * Binding to a pipe transformation.
     */
    PipeBinding = 13,
    /**
     * Binding to a pipe transformation with a variable number of arguments.
     */
    PipeBindingVariadic = 14,
    SafePropertyRead = 15,
    /**
     * A safe keyed read requiring expansion into a null check.
     */
    SafeKeyedRead = 16,
    /**
     * A safe function call requiring expansion into a null check.
     */
    SafeInvokeFunction = 17,
    /**
     * An intermediate expression that will be expanded from a safe read into an explicit ternary.
     */
    SafeTernaryExpr = 18,
    /**
     * An empty expression that will be stipped before generating the final output.
     */
    EmptyExpr = 19,
    AssignTemporaryExpr = 20,
    /**
     * A reference to a temporary variable.
     */
    ReadTemporaryExpr = 21,
    /**
     * An expression that will cause a literal slot index to be emitted.
     */
    SlotLiteralExpr = 22,
    /**
     * A test expression for a conditional op.
     */
    ConditionalCase = 23,
    /**
     * An expression that will be automatically extracted to the component const array.
     */
    ConstCollected = 24,
    /**
     * Operation that sets the value of a two-way binding.
     */
    TwoWayBindingSet = 25
}
export declare enum VariableFlags {
    None = 0,
    /**
     * Always inline this variable, regardless of the number of times it's used.
     * An `AlwaysInline` variable may not depend on context, because doing so may cause side effects
     * that are illegal when multi-inlined. (The optimizer will enforce this constraint.)
     */
    AlwaysInline = 1
}
/**
 * Distinguishes between different kinds of `SemanticVariable`s.
 */
export declare enum SemanticVariableKind {
    /**
     * Represents the context of a particular view.
     */
    Context = 0,
    /**
     * Represents an identifier declared in the lexical scope of a view.
     */
    Identifier = 1,
    /**
     * Represents a saved state that can be used to restore a view in a listener handler function.
     */
    SavedView = 2,
    /**
     * An alias generated by a special embedded view type (e.g. a `@for` block).
     */
    Alias = 3
}
/**
 * Whether to compile in compatibilty mode. In compatibility mode, the template pipeline will
 * attempt to match the output of `TemplateDefinitionBuilder` as exactly as possible, at the cost
 * of producing quirky or larger code in some cases.
 */
export declare enum CompatibilityMode {
    Normal = 0,
    TemplateDefinitionBuilder = 1
}
/**
 * Enumeration of the types of attributes which can be applied to an element.
 */
export declare enum BindingKind {
    /**
     * Static attributes.
     */
    Attribute = 0,
    /**
     * Class bindings.
     */
    ClassName = 1,
    /**
     * Style bindings.
     */
    StyleProperty = 2,
    /**
     * Dynamic property bindings.
     */
    Property = 3,
    /**
     * Property or attribute bindings on a template.
     */
    Template = 4,
    /**
     * Internationalized attributes.
     */
    I18n = 5,
    /**
     * Legacy animation property bindings.
     */
    LegacyAnimation = 6,
    /**
     * Property side of a two-way binding.
     */
    TwoWayProperty = 7,
    /**
     * Property side of an animation binding.
     */
    Animation = 8
}
/**
 * Enumeration of possible times i18n params can be resolved.
 */
export declare enum I18nParamResolutionTime {
    /**
     * Param is resolved at message creation time. Most params should be resolved at message creation
     * time. However, ICU params need to be handled in post-processing.
     */
    Creation = 0,
    /**
     * Param is resolved during post-processing. This should be used for params whose value comes from
     * an ICU.
     */
    Postproccessing = 1
}
/**
 * The contexts in which an i18n expression can be used.
 */
export declare enum I18nExpressionFor {
    /**
     * This expression is used as a value (i.e. inside an i18n block).
     */
    I18nText = 0,
    /**
     * This expression is used in a binding.
     */
    I18nAttribute = 1
}
/**
 * Flags that describe what an i18n param value. These determine how the value is serialized into
 * the final map.
 */
export declare enum I18nParamValueFlags {
    None = 0,
    /**
     *  This value represents an element tag.
     */
    ElementTag = 1,
    /**
     * This value represents a template tag.
     */
    TemplateTag = 2,
    /**
     * This value represents the opening of a tag.
     */
    OpenTag = 4,
    /**
     * This value represents the closing of a tag.
     */
    CloseTag = 8,
    /**
     * This value represents an i18n expression index.
     */
    ExpressionIndex = 16
}
/**
 * Whether the active namespace is HTML, MathML, or SVG mode.
 */
export declare enum Namespace {
    HTML = 0,
    SVG = 1,
    Math = 2
}
/**
 * The type of a `@defer` trigger, for use in the ir.
 */
export declare enum DeferTriggerKind {
    Idle = 0,
    Immediate = 1,
    Timer = 2,
    Hover = 3,
    Interaction = 4,
    Viewport = 5,
    Never = 6
}
/**
 * Kinds of i18n contexts. They can be created because of root i18n blocks, or ICUs.
 */
export declare enum I18nContextKind {
    RootI18n = 0,
    Icu = 1,
    Attr = 2
}
export declare enum TemplateKind {
    NgTemplate = 0,
    Structural = 1,
    Block = 2
}
/**
 * Kinds of animations
 */
export declare const enum AnimationKind {
    ENTER = "enter",
    LEAVE = "leave"
}
/**
 * Kinds of animations
 */
export declare const enum AnimationBindingKind {
    STRING = 0,
    VALUE = 1
}
/**
 * Kinds of modifiers for a defer block.
 */
export declare const enum DeferOpModifierKind {
    NONE = "none",
    PREFETCH = "prefetch",
    HYDRATE = "hydrate"
}
/**
 * Specifies defer block flags, which should be used for all
 * instances of a given defer block (the flags that should be
 * placed into the `TDeferDetails` at runtime).
 */
export declare const enum TDeferDetailsFlags {
    Default = 0,
    /**
     * Whether or not the defer block has hydrate triggers.
     */
    HasHydrateTriggers = 1
}
