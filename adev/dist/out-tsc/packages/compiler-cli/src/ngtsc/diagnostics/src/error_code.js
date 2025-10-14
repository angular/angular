/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @publicApi
 */
export var ErrorCode;
(function (ErrorCode) {
  ErrorCode[(ErrorCode['DECORATOR_ARG_NOT_LITERAL'] = 1001)] = 'DECORATOR_ARG_NOT_LITERAL';
  ErrorCode[(ErrorCode['DECORATOR_ARITY_WRONG'] = 1002)] = 'DECORATOR_ARITY_WRONG';
  ErrorCode[(ErrorCode['DECORATOR_NOT_CALLED'] = 1003)] = 'DECORATOR_NOT_CALLED';
  ErrorCode[(ErrorCode['DECORATOR_UNEXPECTED'] = 1005)] = 'DECORATOR_UNEXPECTED';
  /**
   * This error code indicates that there are incompatible decorators on a type or a class field.
   */
  ErrorCode[(ErrorCode['DECORATOR_COLLISION'] = 1006)] = 'DECORATOR_COLLISION';
  ErrorCode[(ErrorCode['VALUE_HAS_WRONG_TYPE'] = 1010)] = 'VALUE_HAS_WRONG_TYPE';
  ErrorCode[(ErrorCode['VALUE_NOT_LITERAL'] = 1011)] = 'VALUE_NOT_LITERAL';
  ErrorCode[(ErrorCode['DUPLICATE_DECORATED_PROPERTIES'] = 1012)] =
    'DUPLICATE_DECORATED_PROPERTIES';
  /**
   * Raised when an initializer API is annotated with an unexpected decorator.
   *
   * e.g. `@Input` is also applied on the class member using `input`.
   */
  ErrorCode[(ErrorCode['INITIALIZER_API_WITH_DISALLOWED_DECORATOR'] = 1050)] =
    'INITIALIZER_API_WITH_DISALLOWED_DECORATOR';
  /**
   * Raised when an initializer API feature (like signal inputs) are also
   * declared in the class decorator metadata.
   *
   * e.g. a signal input is also declared in the `@Directive` `inputs` array.
   */
  ErrorCode[(ErrorCode['INITIALIZER_API_DECORATOR_METADATA_COLLISION'] = 1051)] =
    'INITIALIZER_API_DECORATOR_METADATA_COLLISION';
  /**
   * Raised whenever an initializer API does not support the `.required`
   * function, but is still detected unexpectedly.
   */
  ErrorCode[(ErrorCode['INITIALIZER_API_NO_REQUIRED_FUNCTION'] = 1052)] =
    'INITIALIZER_API_NO_REQUIRED_FUNCTION';
  /**
   * Raised whenever an initializer API is used on a class member
   * and the given access modifiers (e.g. `private`) are not allowed.
   */
  ErrorCode[(ErrorCode['INITIALIZER_API_DISALLOWED_MEMBER_VISIBILITY'] = 1053)] =
    'INITIALIZER_API_DISALLOWED_MEMBER_VISIBILITY';
  /**
   * An Angular feature, like inputs, outputs or queries is incorrectly
   * declared on a static member.
   */
  ErrorCode[(ErrorCode['INCORRECTLY_DECLARED_ON_STATIC_MEMBER'] = 1100)] =
    'INCORRECTLY_DECLARED_ON_STATIC_MEMBER';
  ErrorCode[(ErrorCode['COMPONENT_MISSING_TEMPLATE'] = 2001)] = 'COMPONENT_MISSING_TEMPLATE';
  ErrorCode[(ErrorCode['PIPE_MISSING_NAME'] = 2002)] = 'PIPE_MISSING_NAME';
  ErrorCode[(ErrorCode['PARAM_MISSING_TOKEN'] = 2003)] = 'PARAM_MISSING_TOKEN';
  ErrorCode[(ErrorCode['DIRECTIVE_MISSING_SELECTOR'] = 2004)] = 'DIRECTIVE_MISSING_SELECTOR';
  /** Raised when an undecorated class is passed in as a provider to a module or a directive. */
  ErrorCode[(ErrorCode['UNDECORATED_PROVIDER'] = 2005)] = 'UNDECORATED_PROVIDER';
  /**
   * Raised when a Directive inherits its constructor from a base class without an Angular
   * decorator.
   */
  ErrorCode[(ErrorCode['DIRECTIVE_INHERITS_UNDECORATED_CTOR'] = 2006)] =
    'DIRECTIVE_INHERITS_UNDECORATED_CTOR';
  /**
   * Raised when an undecorated class that is using Angular features
   * has been discovered.
   */
  ErrorCode[(ErrorCode['UNDECORATED_CLASS_USING_ANGULAR_FEATURES'] = 2007)] =
    'UNDECORATED_CLASS_USING_ANGULAR_FEATURES';
  /**
   * Raised when an component cannot resolve an external resource, such as a template or a style
   * sheet.
   */
  ErrorCode[(ErrorCode['COMPONENT_RESOURCE_NOT_FOUND'] = 2008)] = 'COMPONENT_RESOURCE_NOT_FOUND';
  /**
   * Raised when a component uses `ShadowDom` view encapsulation, but its selector
   * does not match the shadow DOM tag name requirements.
   */
  ErrorCode[(ErrorCode['COMPONENT_INVALID_SHADOW_DOM_SELECTOR'] = 2009)] =
    'COMPONENT_INVALID_SHADOW_DOM_SELECTOR';
  /**
   * Raised when a component has `imports` but is not marked as `standalone: true`.
   */
  ErrorCode[(ErrorCode['COMPONENT_NOT_STANDALONE'] = 2010)] = 'COMPONENT_NOT_STANDALONE';
  /**
   * Raised when a type in the `imports` of a component is a directive or pipe, but is not
   * standalone.
   */
  ErrorCode[(ErrorCode['COMPONENT_IMPORT_NOT_STANDALONE'] = 2011)] =
    'COMPONENT_IMPORT_NOT_STANDALONE';
  /**
   * Raised when a type in the `imports` of a component is not a directive, pipe, or NgModule.
   */
  ErrorCode[(ErrorCode['COMPONENT_UNKNOWN_IMPORT'] = 2012)] = 'COMPONENT_UNKNOWN_IMPORT';
  /**
   * Raised when the compiler wasn't able to resolve the metadata of a host directive.
   */
  ErrorCode[(ErrorCode['HOST_DIRECTIVE_INVALID'] = 2013)] = 'HOST_DIRECTIVE_INVALID';
  /**
   * Raised when a host directive isn't standalone.
   */
  ErrorCode[(ErrorCode['HOST_DIRECTIVE_NOT_STANDALONE'] = 2014)] = 'HOST_DIRECTIVE_NOT_STANDALONE';
  /**
   * Raised when a host directive is a component.
   */
  ErrorCode[(ErrorCode['HOST_DIRECTIVE_COMPONENT'] = 2015)] = 'HOST_DIRECTIVE_COMPONENT';
  /**
   * Raised when a type with Angular decorator inherits its constructor from a base class
   * which has a constructor that is incompatible with Angular DI.
   */
  ErrorCode[(ErrorCode['INJECTABLE_INHERITS_INVALID_CONSTRUCTOR'] = 2016)] =
    'INJECTABLE_INHERITS_INVALID_CONSTRUCTOR';
  /** Raised when a host tries to alias a host directive binding that does not exist. */
  ErrorCode[(ErrorCode['HOST_DIRECTIVE_UNDEFINED_BINDING'] = 2017)] =
    'HOST_DIRECTIVE_UNDEFINED_BINDING';
  /**
   * Raised when a host tries to alias a host directive
   * binding to a pre-existing binding's public name.
   */
  ErrorCode[(ErrorCode['HOST_DIRECTIVE_CONFLICTING_ALIAS'] = 2018)] =
    'HOST_DIRECTIVE_CONFLICTING_ALIAS';
  /**
   * Raised when a host directive definition doesn't expose a
   * required binding from the host directive.
   */
  ErrorCode[(ErrorCode['HOST_DIRECTIVE_MISSING_REQUIRED_BINDING'] = 2019)] =
    'HOST_DIRECTIVE_MISSING_REQUIRED_BINDING';
  /**
   * Raised when a component specifies both a `transform` function on an input
   * and has a corresponding `ngAcceptInputType_` member for the same input.
   */
  ErrorCode[(ErrorCode['CONFLICTING_INPUT_TRANSFORM'] = 2020)] = 'CONFLICTING_INPUT_TRANSFORM';
  /** Raised when a component has both `styleUrls` and `styleUrl`. */
  ErrorCode[(ErrorCode['COMPONENT_INVALID_STYLE_URLS'] = 2021)] = 'COMPONENT_INVALID_STYLE_URLS';
  /**
   * Raised when a type in the `deferredImports` of a component is not a component, directive or
   * pipe.
   */
  ErrorCode[(ErrorCode['COMPONENT_UNKNOWN_DEFERRED_IMPORT'] = 2022)] =
    'COMPONENT_UNKNOWN_DEFERRED_IMPORT';
  /**
   * Raised when a `standalone: false` component is declared but `strictStandalone` is set.
   */
  ErrorCode[(ErrorCode['NON_STANDALONE_NOT_ALLOWED'] = 2023)] = 'NON_STANDALONE_NOT_ALLOWED';
  /**
   * Raised when a named template dependency isn't defined in the component's source file.
   */
  ErrorCode[(ErrorCode['MISSING_NAMED_TEMPLATE_DEPENDENCY'] = 2024)] =
    'MISSING_NAMED_TEMPLATE_DEPENDENCY';
  /**
   * Raised if an incorrect type is used for a named template dependency (e.g. directive
   * class used as a component).
   */
  ErrorCode[(ErrorCode['INCORRECT_NAMED_TEMPLATE_DEPENDENCY_TYPE'] = 2025)] =
    'INCORRECT_NAMED_TEMPLATE_DEPENDENCY_TYPE';
  /**
   * Raised for `@Component` fields that aren't supported in a selectorless context.
   */
  ErrorCode[(ErrorCode['UNSUPPORTED_SELECTORLESS_COMPONENT_FIELD'] = 2026)] =
    'UNSUPPORTED_SELECTORLESS_COMPONENT_FIELD';
  ErrorCode[(ErrorCode['SYMBOL_NOT_EXPORTED'] = 3001)] = 'SYMBOL_NOT_EXPORTED';
  /**
   * Raised when a relationship between directives and/or pipes would cause a cyclic import to be
   * created that cannot be handled, such as in partial compilation mode.
   */
  ErrorCode[(ErrorCode['IMPORT_CYCLE_DETECTED'] = 3003)] = 'IMPORT_CYCLE_DETECTED';
  /**
   * Raised when the compiler is unable to generate an import statement for a reference.
   */
  ErrorCode[(ErrorCode['IMPORT_GENERATION_FAILURE'] = 3004)] = 'IMPORT_GENERATION_FAILURE';
  ErrorCode[(ErrorCode['CONFIG_FLAT_MODULE_NO_INDEX'] = 4001)] = 'CONFIG_FLAT_MODULE_NO_INDEX';
  ErrorCode[(ErrorCode['CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK'] = 4002)] =
    'CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK';
  ErrorCode[(ErrorCode['CONFIG_EXTENDED_DIAGNOSTICS_IMPLIES_STRICT_TEMPLATES'] = 4003)] =
    'CONFIG_EXTENDED_DIAGNOSTICS_IMPLIES_STRICT_TEMPLATES';
  ErrorCode[(ErrorCode['CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL'] = 4004)] =
    'CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL';
  ErrorCode[(ErrorCode['CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CHECK'] = 4005)] =
    'CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CHECK';
  ErrorCode[(ErrorCode['CONFIG_EMIT_DECLARATION_ONLY_UNSUPPORTED'] = 4006)] =
    'CONFIG_EMIT_DECLARATION_ONLY_UNSUPPORTED';
  /**
   * Raised when a host expression has a parse error, such as a host listener or host binding
   * expression containing a pipe.
   */
  ErrorCode[(ErrorCode['HOST_BINDING_PARSE_ERROR'] = 5001)] = 'HOST_BINDING_PARSE_ERROR';
  /**
   * Raised when the compiler cannot parse a component's template.
   */
  ErrorCode[(ErrorCode['TEMPLATE_PARSE_ERROR'] = 5002)] = 'TEMPLATE_PARSE_ERROR';
  /**
   * Raised when an NgModule contains an invalid reference in `declarations`.
   */
  ErrorCode[(ErrorCode['NGMODULE_INVALID_DECLARATION'] = 6001)] = 'NGMODULE_INVALID_DECLARATION';
  /**
   * Raised when an NgModule contains an invalid type in `imports`.
   */
  ErrorCode[(ErrorCode['NGMODULE_INVALID_IMPORT'] = 6002)] = 'NGMODULE_INVALID_IMPORT';
  /**
   * Raised when an NgModule contains an invalid type in `exports`.
   */
  ErrorCode[(ErrorCode['NGMODULE_INVALID_EXPORT'] = 6003)] = 'NGMODULE_INVALID_EXPORT';
  /**
   * Raised when an NgModule contains a type in `exports` which is neither in `declarations` nor
   * otherwise imported.
   */
  ErrorCode[(ErrorCode['NGMODULE_INVALID_REEXPORT'] = 6004)] = 'NGMODULE_INVALID_REEXPORT';
  /**
   * Raised when a `ModuleWithProviders` with a missing
   * generic type argument is passed into an `NgModule`.
   */
  ErrorCode[(ErrorCode['NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC'] = 6005)] =
    'NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC';
  /**
   * Raised when an NgModule exports multiple directives/pipes of the same name and the compiler
   * attempts to generate private re-exports within the NgModule file.
   */
  ErrorCode[(ErrorCode['NGMODULE_REEXPORT_NAME_COLLISION'] = 6006)] =
    'NGMODULE_REEXPORT_NAME_COLLISION';
  /**
   * Raised when a directive/pipe is part of the declarations of two or more NgModules.
   */
  ErrorCode[(ErrorCode['NGMODULE_DECLARATION_NOT_UNIQUE'] = 6007)] =
    'NGMODULE_DECLARATION_NOT_UNIQUE';
  /**
   * Raised when a standalone directive/pipe is part of the declarations of an NgModule.
   */
  ErrorCode[(ErrorCode['NGMODULE_DECLARATION_IS_STANDALONE'] = 6008)] =
    'NGMODULE_DECLARATION_IS_STANDALONE';
  /**
   * Raised when a standalone component is part of the bootstrap list of an NgModule.
   */
  ErrorCode[(ErrorCode['NGMODULE_BOOTSTRAP_IS_STANDALONE'] = 6009)] =
    'NGMODULE_BOOTSTRAP_IS_STANDALONE';
  /**
   * Indicates that an NgModule is declared with `id: module.id`. This is an anti-pattern that is
   * disabled explicitly in the compiler, that was originally based on a misunderstanding of
   * `NgModule.id`.
   */
  ErrorCode[(ErrorCode['WARN_NGMODULE_ID_UNNECESSARY'] = 6100)] = 'WARN_NGMODULE_ID_UNNECESSARY';
  /**
   * 6999 was previously assigned to NGMODULE_VE_DEPENDENCY_ON_IVY_LIB
   * To prevent any confusion, let's not reassign it.
   */
  /**
   * An element name failed validation against the DOM schema.
   */
  ErrorCode[(ErrorCode['SCHEMA_INVALID_ELEMENT'] = 8001)] = 'SCHEMA_INVALID_ELEMENT';
  /**
   * An element's attribute name failed validation against the DOM schema.
   */
  ErrorCode[(ErrorCode['SCHEMA_INVALID_ATTRIBUTE'] = 8002)] = 'SCHEMA_INVALID_ATTRIBUTE';
  /**
   * No matching directive was found for a `#ref="target"` expression.
   */
  ErrorCode[(ErrorCode['MISSING_REFERENCE_TARGET'] = 8003)] = 'MISSING_REFERENCE_TARGET';
  /**
   * No matching pipe was found for a
   */
  ErrorCode[(ErrorCode['MISSING_PIPE'] = 8004)] = 'MISSING_PIPE';
  /**
   * The left-hand side of an assignment expression was a template variable. Effectively, the
   * template looked like:
   *
   * ```html
   * <ng-template let-something>
   *   <button (click)="something = ...">...</button>
   * </ng-template>
   * ```
   *
   * Template variables are read-only.
   */
  ErrorCode[(ErrorCode['WRITE_TO_READ_ONLY_VARIABLE'] = 8005)] = 'WRITE_TO_READ_ONLY_VARIABLE';
  /**
   * A template variable was declared twice. For example:
   *
   * ```html
   * <div *ngFor="let i of items; let i = index">
   * </div>
   * ```
   */
  ErrorCode[(ErrorCode['DUPLICATE_VARIABLE_DECLARATION'] = 8006)] =
    'DUPLICATE_VARIABLE_DECLARATION';
  /**
   * A template has a two way binding (two bindings created by a single syntactical element)
   * in which the input and output are going to different places.
   */
  ErrorCode[(ErrorCode['SPLIT_TWO_WAY_BINDING'] = 8007)] = 'SPLIT_TWO_WAY_BINDING';
  /**
   * A directive usage isn't binding to one or more required inputs.
   */
  ErrorCode[(ErrorCode['MISSING_REQUIRED_INPUTS'] = 8008)] = 'MISSING_REQUIRED_INPUTS';
  /**
   * The tracking expression of a `for` loop block is accessing a variable that is unavailable,
   * for example:
   *
   * ```angular-html
   * <ng-template let-ref>
   *   @for (item of items; track ref) {}
   * </ng-template>
   * ```
   */
  ErrorCode[(ErrorCode['ILLEGAL_FOR_LOOP_TRACK_ACCESS'] = 8009)] = 'ILLEGAL_FOR_LOOP_TRACK_ACCESS';
  /**
   * The trigger of a `defer` block cannot access its trigger element,
   * either because it doesn't exist or it's in a different view.
   *
   * ```angular-html
   * @defer (on interaction(trigger)) {...}
   *
   * <ng-template>
   *   <button #trigger></button>
   * </ng-template>
   * ```
   */
  ErrorCode[(ErrorCode['INACCESSIBLE_DEFERRED_TRIGGER_ELEMENT'] = 8010)] =
    'INACCESSIBLE_DEFERRED_TRIGGER_ELEMENT';
  /**
   * A control flow node is projected at the root of a component and is preventing its direct
   * descendants from being projected, because it has more than one root node.
   *
   * ```angular-html
   * <comp>
   *  @if (expr) {
   *    <div projectsIntoSlot></div>
   *    Text preventing the div from being projected
   *  }
   * </comp>
   * ```
   */
  ErrorCode[(ErrorCode['CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION'] = 8011)] =
    'CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION';
  /**
   * A pipe imported via `@Component.deferredImports` is
   * used outside of a `@defer` block in a template.
   */
  ErrorCode[(ErrorCode['DEFERRED_PIPE_USED_EAGERLY'] = 8012)] = 'DEFERRED_PIPE_USED_EAGERLY';
  /**
   * A directive/component imported via `@Component.deferredImports` is
   * used outside of a `@defer` block in a template.
   */
  ErrorCode[(ErrorCode['DEFERRED_DIRECTIVE_USED_EAGERLY'] = 8013)] =
    'DEFERRED_DIRECTIVE_USED_EAGERLY';
  /**
   * A directive/component/pipe imported via `@Component.deferredImports` is
   * also included into the `@Component.imports` list.
   */
  ErrorCode[(ErrorCode['DEFERRED_DEPENDENCY_IMPORTED_EAGERLY'] = 8014)] =
    'DEFERRED_DEPENDENCY_IMPORTED_EAGERLY';
  /** An expression is trying to write to an `@let` declaration. */
  ErrorCode[(ErrorCode['ILLEGAL_LET_WRITE'] = 8015)] = 'ILLEGAL_LET_WRITE';
  /** An expression is trying to read an `@let` before it has been defined. */
  ErrorCode[(ErrorCode['LET_USED_BEFORE_DEFINITION'] = 8016)] = 'LET_USED_BEFORE_DEFINITION';
  /** A `@let` declaration conflicts with another symbol in the same scope. */
  ErrorCode[(ErrorCode['CONFLICTING_LET_DECLARATION'] = 8017)] = 'CONFLICTING_LET_DECLARATION';
  /**
   * A binding inside selectorless directive syntax did
   * not match any inputs/outputs of the directive.
   */
  ErrorCode[(ErrorCode['UNCLAIMED_DIRECTIVE_BINDING'] = 8018)] = 'UNCLAIMED_DIRECTIVE_BINDING';
  /**
   * An `@defer` block with an implicit trigger does not have a placeholder, for example:
   *
   * ```
   * @defer(on viewport) {
   *   Hello
   * }
   * ```
   */
  ErrorCode[(ErrorCode['DEFER_IMPLICIT_TRIGGER_MISSING_PLACEHOLDER'] = 8019)] =
    'DEFER_IMPLICIT_TRIGGER_MISSING_PLACEHOLDER';
  /**
   * The `@placeholder` for an implicit `@defer` trigger is not set up correctly, for example:
   *
   * ```
   * @defer(on viewport) {
   *   Hello
   * } @placeholder {
   *   <!-- Multiple root nodes. -->
   *   <button></button>
   *   <div></div>
   * }
   * ```
   */
  ErrorCode[(ErrorCode['DEFER_IMPLICIT_TRIGGER_INVALID_PLACEHOLDER'] = 8020)] =
    'DEFER_IMPLICIT_TRIGGER_INVALID_PLACEHOLDER';
  /**
   * A two way binding in a template has an incorrect syntax,
   * parentheses outside brackets. For example:
   *
   * ```html
   * <div ([foo])="bar" />
   * ```
   */
  ErrorCode[(ErrorCode['INVALID_BANANA_IN_BOX'] = 8101)] = 'INVALID_BANANA_IN_BOX';
  /**
   * The left side of a nullish coalescing operation is not nullable.
   *
   * ```html
   * {{ foo ?? bar }}
   * ```
   * When the type of foo doesn't include `null` or `undefined`.
   */
  ErrorCode[(ErrorCode['NULLISH_COALESCING_NOT_NULLABLE'] = 8102)] =
    'NULLISH_COALESCING_NOT_NULLABLE';
  /**
   * A known control flow directive (e.g. `*ngIf`) is used in a template,
   * but the `CommonModule` is not imported.
   */
  ErrorCode[(ErrorCode['MISSING_CONTROL_FLOW_DIRECTIVE'] = 8103)] =
    'MISSING_CONTROL_FLOW_DIRECTIVE';
  /**
   * A text attribute is not interpreted as a binding but likely intended to be.
   *
   * For example:
   * ```html
   * <div
   *   attr.x="value"
   *   class.blue="true"
   *   style.margin-right.px="5">
   * </div>
   * ```
   *
   * All of the above attributes will just be static text attributes and will not be interpreted as
   * bindings by the compiler.
   */
  ErrorCode[(ErrorCode['TEXT_ATTRIBUTE_NOT_BINDING'] = 8104)] = 'TEXT_ATTRIBUTE_NOT_BINDING';
  /**
   * NgForOf is used in a template, but the user forgot to include let
   * in their statement.
   *
   * For example:
   * ```html
   * <ul><li *ngFor="item of items">{{item["name"]}};</li></ul>
   * ```
   */
  ErrorCode[(ErrorCode['MISSING_NGFOROF_LET'] = 8105)] = 'MISSING_NGFOROF_LET';
  /**
   * Indicates that the binding suffix is not supported
   *
   * Style bindings support suffixes like `style.width.px`, `.em`, and `.%`.
   * These suffixes are _not_ supported for attribute bindings.
   *
   * For example `[attr.width.px]="5"` becomes `width.px="5"` when bound.
   * This is almost certainly unintentional and this error is meant to
   * surface this mistake to the developer.
   */
  ErrorCode[(ErrorCode['SUFFIX_NOT_SUPPORTED'] = 8106)] = 'SUFFIX_NOT_SUPPORTED';
  /**
   * The left side of an optional chain operation is not nullable.
   *
   * ```html
   * {{ foo?.bar }}
   * {{ foo?.['bar'] }}
   * {{ foo?.() }}
   * ```
   * When the type of foo doesn't include `null` or `undefined`.
   */
  ErrorCode[(ErrorCode['OPTIONAL_CHAIN_NOT_NULLABLE'] = 8107)] = 'OPTIONAL_CHAIN_NOT_NULLABLE';
  /**
   * `ngSkipHydration` should not be a binding (it should be a static attribute).
   *
   * For example:
   * ```html
   * <my-cmp [ngSkipHydration]="someTruthyVar" />
   * ```
   *
   * `ngSkipHydration` cannot be a binding and can not have values other than "true" or an empty
   * value
   */
  ErrorCode[(ErrorCode['SKIP_HYDRATION_NOT_STATIC'] = 8108)] = 'SKIP_HYDRATION_NOT_STATIC';
  /**
   * Signal functions should be invoked when interpolated in templates.
   *
   * For example:
   * ```html
   * {{ mySignal() }}
   * ```
   */
  ErrorCode[(ErrorCode['INTERPOLATED_SIGNAL_NOT_INVOKED'] = 8109)] =
    'INTERPOLATED_SIGNAL_NOT_INVOKED';
  /**
   * Initializer-based APIs can only be invoked from inside of an initializer.
   *
   * ```ts
   * // Allowed
   * myInput = input();
   *
   * // Not allowed
   * function myInput() {
   *   return input();
   * }
   * ```
   */
  ErrorCode[(ErrorCode['UNSUPPORTED_INITIALIZER_API_USAGE'] = 8110)] =
    'UNSUPPORTED_INITIALIZER_API_USAGE';
  /**
   * A function in an event binding is not called.
   *
   * For example:
   * ```html
   * <button (click)="myFunc"></button>
   * ```
   *
   * This will not call `myFunc` when the button is clicked. Instead, it should be
   * `<button (click)="myFunc()"></button>`.
   */
  ErrorCode[(ErrorCode['UNINVOKED_FUNCTION_IN_EVENT_BINDING'] = 8111)] =
    'UNINVOKED_FUNCTION_IN_EVENT_BINDING';
  /**
   * A `@let` declaration in a template isn't used.
   *
   * For example:
   * ```angular-html
   * @let used = 1; <!-- Not an error -->
   * @let notUsed = 2; <!-- Error -->
   *
   * {{used}}
   * ```
   */
  ErrorCode[(ErrorCode['UNUSED_LET_DECLARATION'] = 8112)] = 'UNUSED_LET_DECLARATION';
  /**
   * A symbol referenced in `@Component.imports` isn't being used within the template.
   */
  ErrorCode[(ErrorCode['UNUSED_STANDALONE_IMPORTS'] = 8113)] = 'UNUSED_STANDALONE_IMPORTS';
  /**
   * An expression mixes nullish coalescing and logical and/or without parentheses.
   */
  ErrorCode[(ErrorCode['UNPARENTHESIZED_NULLISH_COALESCING'] = 8114)] =
    'UNPARENTHESIZED_NULLISH_COALESCING';
  /**
   * The function passed to `@for` track is not invoked.
   *
   * For example:
   * ```angular-html
   * @for (item of items; track trackByName) {}
   * ```
   *
   * For the track function to work properly, it must be invoked.
   *
   * For example:
   * ```angular-html
   * @for (item of items; track trackByName(item)) {}
   * ```
   */
  ErrorCode[(ErrorCode['UNINVOKED_TRACK_FUNCTION'] = 8115)] = 'UNINVOKED_TRACK_FUNCTION';
  /**
   * A structural directive is used in a template, but the directive is not imported.
   */
  ErrorCode[(ErrorCode['MISSING_STRUCTURAL_DIRECTIVE'] = 8116)] = 'MISSING_STRUCTURAL_DIRECTIVE';
  /**
   * A function in a text interpolation is not invoked.
   *
   * For example:
   * ```html
   * <p> {{ firstName }} </p>
   * ```
   *
   * The `firstName` function is not invoked. Instead, it should be:
   * ```html
   * <p> {{ firstName() }} </p>
   * ```
   */
  ErrorCode[(ErrorCode['UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION'] = 8117)] =
    'UNINVOKED_FUNCTION_IN_TEXT_INTERPOLATION';
  /**
   * A required initializer is being invoked in a forbidden context such as a property initializer
   * or a constructor.
   *
   * For example:
   * ```ts
   * class MyComponent {
   *  myInput = input.required();
   *  somValue = this.myInput(); // Error
   *
   *  constructor() {
   *    this.myInput(); // Error
   *  }
   */
  ErrorCode[(ErrorCode['FORBIDDEN_REQUIRED_INITIALIZER_INVOCATION'] = 8118)] =
    'FORBIDDEN_REQUIRED_INITIALIZER_INVOCATION';
  /**
   * The template type-checking engine would need to generate an inline type check block for a
   * component, but the current type-checking environment doesn't support it.
   */
  ErrorCode[(ErrorCode['INLINE_TCB_REQUIRED'] = 8900)] = 'INLINE_TCB_REQUIRED';
  /**
   * The template type-checking engine would need to generate an inline type constructor for a
   * directive or component, but the current type-checking environment doesn't support it.
   */
  ErrorCode[(ErrorCode['INLINE_TYPE_CTOR_REQUIRED'] = 8901)] = 'INLINE_TYPE_CTOR_REQUIRED';
  /**
   * An injectable already has a `ɵprov` property.
   */
  ErrorCode[(ErrorCode['INJECTABLE_DUPLICATE_PROV'] = 9001)] = 'INJECTABLE_DUPLICATE_PROV';
  // 10XXX error codes are reserved for diagnostics with categories other than
  // `ts.DiagnosticCategory.Error`. These diagnostics are generated by the compiler when configured
  // to do so by a tool such as the Language Service, or by the Language Service itself.
  /**
   * Suggest users to enable `strictTemplates` to make use of full capabilities
   * provided by Angular language service.
   */
  ErrorCode[(ErrorCode['SUGGEST_STRICT_TEMPLATES'] = 10001)] = 'SUGGEST_STRICT_TEMPLATES';
  /**
   * Indicates that a particular structural directive provides advanced type narrowing
   * functionality, but the current template type-checking configuration does not allow its usage in
   * type inference.
   */
  ErrorCode[(ErrorCode['SUGGEST_SUBOPTIMAL_TYPE_INFERENCE'] = 10002)] =
    'SUGGEST_SUBOPTIMAL_TYPE_INFERENCE';
  /**
   * In local compilation mode a const is required to be resolved statically but cannot be so since
   * it is imported from a file outside of the compilation unit. This usually happens with const
   * being used as Angular decorators parameters such as `@Component.template`,
   * `@HostListener.eventName`, etc.
   */
  ErrorCode[(ErrorCode['LOCAL_COMPILATION_UNRESOLVED_CONST'] = 11001)] =
    'LOCAL_COMPILATION_UNRESOLVED_CONST';
  /**
   * In local compilation mode a certain expression or syntax is not supported. This is usually
   * because the expression/syntax is not very common and so we did not add support for it yet. This
   * can be changed in the future and support for more expressions could be added if need be.
   * Meanwhile, this error is thrown to indicate a current unavailability.
   */
  ErrorCode[(ErrorCode['LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION'] = 11003)] =
    'LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION';
})(ErrorCode || (ErrorCode = {}));
//# sourceMappingURL=error_code.js.map
