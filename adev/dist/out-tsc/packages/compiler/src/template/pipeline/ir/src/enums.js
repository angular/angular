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
export var OpKind;
(function (OpKind) {
  /**
   * A special operation type which is used to represent the beginning and end nodes of a linked
   * list of operations.
   */
  OpKind[(OpKind['ListEnd'] = 0)] = 'ListEnd';
  /**
   * An operation which wraps an output AST statement.
   */
  OpKind[(OpKind['Statement'] = 1)] = 'Statement';
  /**
   * An operation which declares and initializes a `SemanticVariable`.
   */
  OpKind[(OpKind['Variable'] = 2)] = 'Variable';
  /**
   * An operation to begin rendering of an element.
   */
  OpKind[(OpKind['ElementStart'] = 3)] = 'ElementStart';
  /**
   * An operation to render an element with no children.
   */
  OpKind[(OpKind['Element'] = 4)] = 'Element';
  /**
   * An operation which declares an embedded view.
   */
  OpKind[(OpKind['Template'] = 5)] = 'Template';
  /**
   * An operation to end rendering of an element previously started with `ElementStart`.
   */
  OpKind[(OpKind['ElementEnd'] = 6)] = 'ElementEnd';
  /**
   * An operation to begin an `ng-container`.
   */
  OpKind[(OpKind['ContainerStart'] = 7)] = 'ContainerStart';
  /**
   * An operation for an `ng-container` with no children.
   */
  OpKind[(OpKind['Container'] = 8)] = 'Container';
  /**
   * An operation to end an `ng-container`.
   */
  OpKind[(OpKind['ContainerEnd'] = 9)] = 'ContainerEnd';
  /**
   * An operation disable binding for subsequent elements, which are descendants of a non-bindable
   * node.
   */
  OpKind[(OpKind['DisableBindings'] = 10)] = 'DisableBindings';
  /**
   * Create a conditional creation instruction op.
   */
  OpKind[(OpKind['ConditionalCreate'] = 11)] = 'ConditionalCreate';
  /**
   * Create a conditional branch creation instruction op.
   */
  OpKind[(OpKind['ConditionalBranchCreate'] = 12)] = 'ConditionalBranchCreate';
  /**
   * An op to conditionally render a template.
   */
  OpKind[(OpKind['Conditional'] = 13)] = 'Conditional';
  /**
   * An operation to re-enable binding, after it was previously disabled.
   */
  OpKind[(OpKind['EnableBindings'] = 14)] = 'EnableBindings';
  /**
   * An operation to render a text node.
   */
  OpKind[(OpKind['Text'] = 15)] = 'Text';
  /**
   * An operation declaring an event listener for an element.
   */
  OpKind[(OpKind['Listener'] = 16)] = 'Listener';
  /**
   * An operation to interpolate text into a text node.
   */
  OpKind[(OpKind['InterpolateText'] = 17)] = 'InterpolateText';
  /**
   * An intermediate binding op, that has not yet been processed into an individual property,
   * attribute, style, etc.
   */
  OpKind[(OpKind['Binding'] = 18)] = 'Binding';
  /**
   * An operation to bind an expression to a property of an element.
   */
  OpKind[(OpKind['Property'] = 19)] = 'Property';
  /**
   * An operation to bind an expression to a style property of an element.
   */
  OpKind[(OpKind['StyleProp'] = 20)] = 'StyleProp';
  /**
   * An operation to bind an expression to a class property of an element.
   */
  OpKind[(OpKind['ClassProp'] = 21)] = 'ClassProp';
  /**
   * An operation to bind an expression to the styles of an element.
   */
  OpKind[(OpKind['StyleMap'] = 22)] = 'StyleMap';
  /**
   * An operation to bind an expression to the classes of an element.
   */
  OpKind[(OpKind['ClassMap'] = 23)] = 'ClassMap';
  /**
   * An operation to advance the runtime's implicit slot context during the update phase of a view.
   */
  OpKind[(OpKind['Advance'] = 24)] = 'Advance';
  /**
   * An operation to instantiate a pipe.
   */
  OpKind[(OpKind['Pipe'] = 25)] = 'Pipe';
  /**
   * An operation to associate an attribute with an element.
   */
  OpKind[(OpKind['Attribute'] = 26)] = 'Attribute';
  /**
   * An attribute that has been extracted for inclusion in the consts array.
   */
  OpKind[(OpKind['ExtractedAttribute'] = 27)] = 'ExtractedAttribute';
  /**
   * An operation that configures a `@defer` block.
   */
  OpKind[(OpKind['Defer'] = 28)] = 'Defer';
  /**
   * An operation that controls when a `@defer` loads.
   */
  OpKind[(OpKind['DeferOn'] = 29)] = 'DeferOn';
  /**
   * An operation that controls when a `@defer` loads, using a custom expression as the condition.
   */
  OpKind[(OpKind['DeferWhen'] = 30)] = 'DeferWhen';
  /**
   * An i18n message that has been extracted for inclusion in the consts array.
   */
  OpKind[(OpKind['I18nMessage'] = 31)] = 'I18nMessage';
  /**
   * A binding to a native DOM property.
   */
  OpKind[(OpKind['DomProperty'] = 32)] = 'DomProperty';
  /**
   * A namespace change, which causes the subsequent elements to be processed as either HTML or SVG.
   */
  OpKind[(OpKind['Namespace'] = 33)] = 'Namespace';
  /**
   * Configure a content projeciton definition for the view.
   */
  OpKind[(OpKind['ProjectionDef'] = 34)] = 'ProjectionDef';
  /**
   * Create a content projection slot.
   */
  OpKind[(OpKind['Projection'] = 35)] = 'Projection';
  /**
   * Create a repeater creation instruction op.
   */
  OpKind[(OpKind['RepeaterCreate'] = 36)] = 'RepeaterCreate';
  /**
   * An update up for a repeater.
   */
  OpKind[(OpKind['Repeater'] = 37)] = 'Repeater';
  /**
   * An operation to bind an expression to the property side of a two-way binding.
   */
  OpKind[(OpKind['TwoWayProperty'] = 38)] = 'TwoWayProperty';
  /**
   * An operation declaring the event side of a two-way binding.
   */
  OpKind[(OpKind['TwoWayListener'] = 39)] = 'TwoWayListener';
  /**
   * A creation-time operation that initializes the slot for a `@let` declaration.
   */
  OpKind[(OpKind['DeclareLet'] = 40)] = 'DeclareLet';
  /**
   * An update-time operation that stores the current value of a `@let` declaration.
   */
  OpKind[(OpKind['StoreLet'] = 41)] = 'StoreLet';
  /**
   * The start of an i18n block.
   */
  OpKind[(OpKind['I18nStart'] = 42)] = 'I18nStart';
  /**
   * A self-closing i18n on a single element.
   */
  OpKind[(OpKind['I18n'] = 43)] = 'I18n';
  /**
   * The end of an i18n block.
   */
  OpKind[(OpKind['I18nEnd'] = 44)] = 'I18nEnd';
  /**
   * An expression in an i18n message.
   */
  OpKind[(OpKind['I18nExpression'] = 45)] = 'I18nExpression';
  /**
   * An instruction that applies a set of i18n expressions.
   */
  OpKind[(OpKind['I18nApply'] = 46)] = 'I18nApply';
  /**
   * An instruction to create an ICU expression.
   */
  OpKind[(OpKind['IcuStart'] = 47)] = 'IcuStart';
  /**
   * An instruction to update an ICU expression.
   */
  OpKind[(OpKind['IcuEnd'] = 48)] = 'IcuEnd';
  /**
   * An instruction representing a placeholder in an ICU expression.
   */
  OpKind[(OpKind['IcuPlaceholder'] = 49)] = 'IcuPlaceholder';
  /**
   * An i18n context containing information needed to generate an i18n message.
   */
  OpKind[(OpKind['I18nContext'] = 50)] = 'I18nContext';
  /**
   * A creation op that corresponds to i18n attributes on an element.
   */
  OpKind[(OpKind['I18nAttributes'] = 51)] = 'I18nAttributes';
  /**
   * Creation op that attaches the location at which an element was defined in a template to it.
   */
  OpKind[(OpKind['SourceLocation'] = 52)] = 'SourceLocation';
  /**
   * An operation to bind animation css classes to an element.
   */
  OpKind[(OpKind['Animation'] = 53)] = 'Animation';
  /**
   * An operation to bind animation css classes to an element.
   */
  OpKind[(OpKind['AnimationString'] = 54)] = 'AnimationString';
  /**
   * An operation to bind animation css classes to an element.
   */
  OpKind[(OpKind['AnimationBinding'] = 55)] = 'AnimationBinding';
  /**
   * An operation to bind animation events to an element.
   */
  OpKind[(OpKind['AnimationListener'] = 56)] = 'AnimationListener';
})(OpKind || (OpKind = {}));
/**
 * Distinguishes different kinds of IR expressions.
 */
export var ExpressionKind;
(function (ExpressionKind) {
  /**
   * Read of a variable in a lexical scope.
   */
  ExpressionKind[(ExpressionKind['LexicalRead'] = 0)] = 'LexicalRead';
  /**
   * A reference to the current view context.
   */
  ExpressionKind[(ExpressionKind['Context'] = 1)] = 'Context';
  /**
   * A reference to the view context, for use inside a track function.
   */
  ExpressionKind[(ExpressionKind['TrackContext'] = 2)] = 'TrackContext';
  /**
   * Read of a variable declared in a `VariableOp`.
   */
  ExpressionKind[(ExpressionKind['ReadVariable'] = 3)] = 'ReadVariable';
  /**
   * Runtime operation to navigate to the next view context in the view hierarchy.
   */
  ExpressionKind[(ExpressionKind['NextContext'] = 4)] = 'NextContext';
  /**
   * Runtime operation to retrieve the value of a local reference.
   */
  ExpressionKind[(ExpressionKind['Reference'] = 5)] = 'Reference';
  /**
   * A call storing the value of a `@let` declaration.
   */
  ExpressionKind[(ExpressionKind['StoreLet'] = 6)] = 'StoreLet';
  /**
   * A reference to a `@let` declaration read from the context view.
   */
  ExpressionKind[(ExpressionKind['ContextLetReference'] = 7)] = 'ContextLetReference';
  /**
   * Runtime operation to snapshot the current view context.
   */
  ExpressionKind[(ExpressionKind['GetCurrentView'] = 8)] = 'GetCurrentView';
  /**
   * Runtime operation to restore a snapshotted view.
   */
  ExpressionKind[(ExpressionKind['RestoreView'] = 9)] = 'RestoreView';
  /**
   * Runtime operation to reset the current view context after `RestoreView`.
   */
  ExpressionKind[(ExpressionKind['ResetView'] = 10)] = 'ResetView';
  /**
   * Defines and calls a function with change-detected arguments.
   */
  ExpressionKind[(ExpressionKind['PureFunctionExpr'] = 11)] = 'PureFunctionExpr';
  /**
   * Indicates a positional parameter to a pure function definition.
   */
  ExpressionKind[(ExpressionKind['PureFunctionParameterExpr'] = 12)] = 'PureFunctionParameterExpr';
  /**
   * Binding to a pipe transformation.
   */
  ExpressionKind[(ExpressionKind['PipeBinding'] = 13)] = 'PipeBinding';
  /**
   * Binding to a pipe transformation with a variable number of arguments.
   */
  ExpressionKind[(ExpressionKind['PipeBindingVariadic'] = 14)] = 'PipeBindingVariadic';
  /*
   * A safe property read requiring expansion into a null check.
   */
  ExpressionKind[(ExpressionKind['SafePropertyRead'] = 15)] = 'SafePropertyRead';
  /**
   * A safe keyed read requiring expansion into a null check.
   */
  ExpressionKind[(ExpressionKind['SafeKeyedRead'] = 16)] = 'SafeKeyedRead';
  /**
   * A safe function call requiring expansion into a null check.
   */
  ExpressionKind[(ExpressionKind['SafeInvokeFunction'] = 17)] = 'SafeInvokeFunction';
  /**
   * An intermediate expression that will be expanded from a safe read into an explicit ternary.
   */
  ExpressionKind[(ExpressionKind['SafeTernaryExpr'] = 18)] = 'SafeTernaryExpr';
  /**
   * An empty expression that will be stipped before generating the final output.
   */
  ExpressionKind[(ExpressionKind['EmptyExpr'] = 19)] = 'EmptyExpr';
  /*
   * An assignment to a temporary variable.
   */
  ExpressionKind[(ExpressionKind['AssignTemporaryExpr'] = 20)] = 'AssignTemporaryExpr';
  /**
   * A reference to a temporary variable.
   */
  ExpressionKind[(ExpressionKind['ReadTemporaryExpr'] = 21)] = 'ReadTemporaryExpr';
  /**
   * An expression that will cause a literal slot index to be emitted.
   */
  ExpressionKind[(ExpressionKind['SlotLiteralExpr'] = 22)] = 'SlotLiteralExpr';
  /**
   * A test expression for a conditional op.
   */
  ExpressionKind[(ExpressionKind['ConditionalCase'] = 23)] = 'ConditionalCase';
  /**
   * An expression that will be automatically extracted to the component const array.
   */
  ExpressionKind[(ExpressionKind['ConstCollected'] = 24)] = 'ConstCollected';
  /**
   * Operation that sets the value of a two-way binding.
   */
  ExpressionKind[(ExpressionKind['TwoWayBindingSet'] = 25)] = 'TwoWayBindingSet';
})(ExpressionKind || (ExpressionKind = {}));
export var VariableFlags;
(function (VariableFlags) {
  VariableFlags[(VariableFlags['None'] = 0)] = 'None';
  /**
   * Always inline this variable, regardless of the number of times it's used.
   * An `AlwaysInline` variable may not depend on context, because doing so may cause side effects
   * that are illegal when multi-inlined. (The optimizer will enforce this constraint.)
   */
  VariableFlags[(VariableFlags['AlwaysInline'] = 1)] = 'AlwaysInline';
})(VariableFlags || (VariableFlags = {}));
/**
 * Distinguishes between different kinds of `SemanticVariable`s.
 */
export var SemanticVariableKind;
(function (SemanticVariableKind) {
  /**
   * Represents the context of a particular view.
   */
  SemanticVariableKind[(SemanticVariableKind['Context'] = 0)] = 'Context';
  /**
   * Represents an identifier declared in the lexical scope of a view.
   */
  SemanticVariableKind[(SemanticVariableKind['Identifier'] = 1)] = 'Identifier';
  /**
   * Represents a saved state that can be used to restore a view in a listener handler function.
   */
  SemanticVariableKind[(SemanticVariableKind['SavedView'] = 2)] = 'SavedView';
  /**
   * An alias generated by a special embedded view type (e.g. a `@for` block).
   */
  SemanticVariableKind[(SemanticVariableKind['Alias'] = 3)] = 'Alias';
})(SemanticVariableKind || (SemanticVariableKind = {}));
/**
 * Whether to compile in compatibilty mode. In compatibility mode, the template pipeline will
 * attempt to match the output of `TemplateDefinitionBuilder` as exactly as possible, at the cost
 * of producing quirky or larger code in some cases.
 */
export var CompatibilityMode;
(function (CompatibilityMode) {
  CompatibilityMode[(CompatibilityMode['Normal'] = 0)] = 'Normal';
  CompatibilityMode[(CompatibilityMode['TemplateDefinitionBuilder'] = 1)] =
    'TemplateDefinitionBuilder';
})(CompatibilityMode || (CompatibilityMode = {}));
/**
 * Enumeration of the types of attributes which can be applied to an element.
 */
export var BindingKind;
(function (BindingKind) {
  /**
   * Static attributes.
   */
  BindingKind[(BindingKind['Attribute'] = 0)] = 'Attribute';
  /**
   * Class bindings.
   */
  BindingKind[(BindingKind['ClassName'] = 1)] = 'ClassName';
  /**
   * Style bindings.
   */
  BindingKind[(BindingKind['StyleProperty'] = 2)] = 'StyleProperty';
  /**
   * Dynamic property bindings.
   */
  BindingKind[(BindingKind['Property'] = 3)] = 'Property';
  /**
   * Property or attribute bindings on a template.
   */
  BindingKind[(BindingKind['Template'] = 4)] = 'Template';
  /**
   * Internationalized attributes.
   */
  BindingKind[(BindingKind['I18n'] = 5)] = 'I18n';
  /**
   * Legacy animation property bindings.
   */
  BindingKind[(BindingKind['LegacyAnimation'] = 6)] = 'LegacyAnimation';
  /**
   * Property side of a two-way binding.
   */
  BindingKind[(BindingKind['TwoWayProperty'] = 7)] = 'TwoWayProperty';
  /**
   * Property side of an animation binding.
   */
  BindingKind[(BindingKind['Animation'] = 8)] = 'Animation';
})(BindingKind || (BindingKind = {}));
/**
 * Enumeration of possible times i18n params can be resolved.
 */
export var I18nParamResolutionTime;
(function (I18nParamResolutionTime) {
  /**
   * Param is resolved at message creation time. Most params should be resolved at message creation
   * time. However, ICU params need to be handled in post-processing.
   */
  I18nParamResolutionTime[(I18nParamResolutionTime['Creation'] = 0)] = 'Creation';
  /**
   * Param is resolved during post-processing. This should be used for params whose value comes from
   * an ICU.
   */
  I18nParamResolutionTime[(I18nParamResolutionTime['Postproccessing'] = 1)] = 'Postproccessing';
})(I18nParamResolutionTime || (I18nParamResolutionTime = {}));
/**
 * The contexts in which an i18n expression can be used.
 */
export var I18nExpressionFor;
(function (I18nExpressionFor) {
  /**
   * This expression is used as a value (i.e. inside an i18n block).
   */
  I18nExpressionFor[(I18nExpressionFor['I18nText'] = 0)] = 'I18nText';
  /**
   * This expression is used in a binding.
   */
  I18nExpressionFor[(I18nExpressionFor['I18nAttribute'] = 1)] = 'I18nAttribute';
})(I18nExpressionFor || (I18nExpressionFor = {}));
/**
 * Flags that describe what an i18n param value. These determine how the value is serialized into
 * the final map.
 */
export var I18nParamValueFlags;
(function (I18nParamValueFlags) {
  I18nParamValueFlags[(I18nParamValueFlags['None'] = 0)] = 'None';
  /**
   *  This value represents an element tag.
   */
  I18nParamValueFlags[(I18nParamValueFlags['ElementTag'] = 1)] = 'ElementTag';
  /**
   * This value represents a template tag.
   */
  I18nParamValueFlags[(I18nParamValueFlags['TemplateTag'] = 2)] = 'TemplateTag';
  /**
   * This value represents the opening of a tag.
   */
  I18nParamValueFlags[(I18nParamValueFlags['OpenTag'] = 4)] = 'OpenTag';
  /**
   * This value represents the closing of a tag.
   */
  I18nParamValueFlags[(I18nParamValueFlags['CloseTag'] = 8)] = 'CloseTag';
  /**
   * This value represents an i18n expression index.
   */
  I18nParamValueFlags[(I18nParamValueFlags['ExpressionIndex'] = 16)] = 'ExpressionIndex';
})(I18nParamValueFlags || (I18nParamValueFlags = {}));
/**
 * Whether the active namespace is HTML, MathML, or SVG mode.
 */
export var Namespace;
(function (Namespace) {
  Namespace[(Namespace['HTML'] = 0)] = 'HTML';
  Namespace[(Namespace['SVG'] = 1)] = 'SVG';
  Namespace[(Namespace['Math'] = 2)] = 'Math';
})(Namespace || (Namespace = {}));
/**
 * The type of a `@defer` trigger, for use in the ir.
 */
export var DeferTriggerKind;
(function (DeferTriggerKind) {
  DeferTriggerKind[(DeferTriggerKind['Idle'] = 0)] = 'Idle';
  DeferTriggerKind[(DeferTriggerKind['Immediate'] = 1)] = 'Immediate';
  DeferTriggerKind[(DeferTriggerKind['Timer'] = 2)] = 'Timer';
  DeferTriggerKind[(DeferTriggerKind['Hover'] = 3)] = 'Hover';
  DeferTriggerKind[(DeferTriggerKind['Interaction'] = 4)] = 'Interaction';
  DeferTriggerKind[(DeferTriggerKind['Viewport'] = 5)] = 'Viewport';
  DeferTriggerKind[(DeferTriggerKind['Never'] = 6)] = 'Never';
})(DeferTriggerKind || (DeferTriggerKind = {}));
/**
 * Kinds of i18n contexts. They can be created because of root i18n blocks, or ICUs.
 */
export var I18nContextKind;
(function (I18nContextKind) {
  I18nContextKind[(I18nContextKind['RootI18n'] = 0)] = 'RootI18n';
  I18nContextKind[(I18nContextKind['Icu'] = 1)] = 'Icu';
  I18nContextKind[(I18nContextKind['Attr'] = 2)] = 'Attr';
})(I18nContextKind || (I18nContextKind = {}));
export var TemplateKind;
(function (TemplateKind) {
  TemplateKind[(TemplateKind['NgTemplate'] = 0)] = 'NgTemplate';
  TemplateKind[(TemplateKind['Structural'] = 1)] = 'Structural';
  TemplateKind[(TemplateKind['Block'] = 2)] = 'Block';
})(TemplateKind || (TemplateKind = {}));
//# sourceMappingURL=enums.js.map
