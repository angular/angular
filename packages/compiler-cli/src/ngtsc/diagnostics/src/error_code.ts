/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @publicApi
 */
export enum ErrorCode {
  DECORATOR_ARG_NOT_LITERAL = 1001,
  DECORATOR_ARITY_WRONG = 1002,
  DECORATOR_NOT_CALLED = 1003,
  DECORATOR_UNEXPECTED = 1005,

  /**
   * This error code indicates that there are incompatible decorators on a type or a class field.
   */
  DECORATOR_COLLISION = 1006,

  VALUE_HAS_WRONG_TYPE = 1010,
  VALUE_NOT_LITERAL = 1011,

  COMPONENT_MISSING_TEMPLATE = 2001,
  PIPE_MISSING_NAME = 2002,
  PARAM_MISSING_TOKEN = 2003,
  DIRECTIVE_MISSING_SELECTOR = 2004,

  /** Raised when an undecorated class is passed in as a provider to a module or a directive. */
  UNDECORATED_PROVIDER = 2005,

  /**
   * Raised when a Directive inherits its constructor from a base class without an Angular
   * decorator.
   */
  DIRECTIVE_INHERITS_UNDECORATED_CTOR = 2006,

  /**
   * Raised when an undecorated class that is using Angular features
   * has been discovered.
   */
  UNDECORATED_CLASS_USING_ANGULAR_FEATURES = 2007,

  /**
   * Raised when an component cannot resolve an external resource, such as a template or a style
   * sheet.
   */
  COMPONENT_RESOURCE_NOT_FOUND = 2008,

  /**
   * Raised when a component uses `ShadowDom` view encapsulation, but its selector
   * does not match the shadow DOM tag name requirements.
   */
  COMPONENT_INVALID_SHADOW_DOM_SELECTOR = 2009,

  /**
   * Raised when a component has `imports` but is not marked as `standalone: true`.
   */
  COMPONENT_NOT_STANDALONE = 2010,

  /**
   * Raised when a type in the `imports` of a component is a directive or pipe, but is not
   * standalone.
   */
  COMPONENT_IMPORT_NOT_STANDALONE = 2011,

  /**
   * Raised when a type in the `imports` of a component is not a directive, pipe, or NgModule.
   */
  COMPONENT_UNKNOWN_IMPORT = 2012,

  /**
   * Raised when the compiler wasn't able to resolve the metadata of a host directive.
   */
  HOST_DIRECTIVE_INVALID = 2013,

  /**
   * Raised when a host directive isn't standalone.
   */
  HOST_DIRECTIVE_NOT_STANDALONE = 2014,

  /**
   * Raised when a host directive is a component.
   */
  HOST_DIRECTIVE_COMPONENT = 2015,

  /**
   * Raised when a type with Angular decorator inherits its constructor from a base class
   * which has a constructor that is incompatible with Angular DI.
   */
  INJECTABLE_INHERITS_INVALID_CONSTRUCTOR = 2016,

  /** Raised when a host tries to alias a host directive binding that does not exist. */
  HOST_DIRECTIVE_UNDEFINED_BINDING = 2017,

  /**
   * Raised when a host tries to alias a host directive
   * binding to a pre-existing binding's public name.
   */
  HOST_DIRECTIVE_CONFLICTING_ALIAS = 2018,

  /**
   * Raised when a host directive definition doesn't expose a
   * required binding from the host directive.
   */
  HOST_DIRECTIVE_MISSING_REQUIRED_BINDING = 2019,

  SYMBOL_NOT_EXPORTED = 3001,
  /**
   * Raised when a relationship between directives and/or pipes would cause a cyclic import to be
   * created that cannot be handled, such as in partial compilation mode.
   */
  IMPORT_CYCLE_DETECTED = 3003,

  /**
   * Raised when the compiler is unable to generate an import statement for a reference.
   */
  IMPORT_GENERATION_FAILURE = 3004,

  CONFIG_FLAT_MODULE_NO_INDEX = 4001,
  CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK = 4002,
  CONFIG_EXTENDED_DIAGNOSTICS_IMPLIES_STRICT_TEMPLATES = 4003,
  CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL = 4004,
  CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CHECK = 4005,

  /**
   * Raised when a host expression has a parse error, such as a host listener or host binding
   * expression containing a pipe.
   */
  HOST_BINDING_PARSE_ERROR = 5001,

  /**
   * Raised when the compiler cannot parse a component's template.
   */
  TEMPLATE_PARSE_ERROR = 5002,

  /**
   * Raised when an NgModule contains an invalid reference in `declarations`.
   */
  NGMODULE_INVALID_DECLARATION = 6001,

  /**
   * Raised when an NgModule contains an invalid type in `imports`.
   */
  NGMODULE_INVALID_IMPORT = 6002,

  /**
   * Raised when an NgModule contains an invalid type in `exports`.
   */
  NGMODULE_INVALID_EXPORT = 6003,

  /**
   * Raised when an NgModule contains a type in `exports` which is neither in `declarations` nor
   * otherwise imported.
   */
  NGMODULE_INVALID_REEXPORT = 6004,

  /**
   * Raised when a `ModuleWithProviders` with a missing
   * generic type argument is passed into an `NgModule`.
   */
  NGMODULE_MODULE_WITH_PROVIDERS_MISSING_GENERIC = 6005,

  /**
   * Raised when an NgModule exports multiple directives/pipes of the same name and the compiler
   * attempts to generate private re-exports within the NgModule file.
   */
  NGMODULE_REEXPORT_NAME_COLLISION = 6006,

  /**
   * Raised when a directive/pipe is part of the declarations of two or more NgModules.
   */
  NGMODULE_DECLARATION_NOT_UNIQUE = 6007,

  /**
   * Raised when a standalone directive/pipe is part of the declarations of an NgModule.
   */
  NGMODULE_DECLARATION_IS_STANDALONE = 6008,

  /**
   * Raised when a standalone component is part of the bootstrap list of an NgModule.
   */
  NGMODULE_BOOTSTRAP_IS_STANDALONE = 6009,

  /**
   * Indicates that an NgModule is declared with `id: module.id`. This is an anti-pattern that is
   * disabled explicitly in the compiler, that was originally based on a misunderstanding of
   * `NgModule.id`.
   */
  WARN_NGMODULE_ID_UNNECESSARY = 6100,

  /**
   * Not actually raised by the compiler, but reserved for documentation of a View Engine error when
   * a View Engine build depends on an Ivy-compiled NgModule.
   */
  NGMODULE_VE_DEPENDENCY_ON_IVY_LIB = 6999,

  /**
   * An element name failed validation against the DOM schema.
   */
  SCHEMA_INVALID_ELEMENT = 8001,

  /**
   * An element's attribute name failed validation against the DOM schema.
   */
  SCHEMA_INVALID_ATTRIBUTE = 8002,

  /**
   * No matching directive was found for a `#ref="target"` expression.
   */
  MISSING_REFERENCE_TARGET = 8003,

  /**
   * No matching pipe was found for a
   */
  MISSING_PIPE = 8004,

  /**
   * The left-hand side of an assignment expression was a template variable. Effectively, the
   * template looked like:
   *
   * ```
   * <ng-template let-something>
   *   <button (click)="something = ...">...</button>
   * </ng-template>
   * ```
   *
   * Template variables are read-only.
   */
  WRITE_TO_READ_ONLY_VARIABLE = 8005,

  /**
   * A template variable was declared twice. For example:
   *
   * ```html
   * <div *ngFor="let i of items; let i = index">
   * </div>
   * ```
   */
  DUPLICATE_VARIABLE_DECLARATION = 8006,

  /**
   * A template has a two way binding (two bindings created by a single syntactical element)
   * in which the input and output are going to different places.
   */
  SPLIT_TWO_WAY_BINDING = 8007,

  /**
   * A directive usage isn't binding to one or more required inputs.
   */
  MISSING_REQUIRED_INPUTS = 8008,

  /**
   * A two way binding in a template has an incorrect syntax,
   * parentheses outside brackets. For example:
   *
   * ```
   * <div ([foo])="bar" />
   * ```
   */
  INVALID_BANANA_IN_BOX = 8101,

  /**
   * The left side of a nullish coalescing operation is not nullable.
   *
   * ```
   * {{ foo ?? bar }}
   * ```
   * When the type of foo doesn't include `null` or `undefined`.
   */
  NULLISH_COALESCING_NOT_NULLABLE = 8102,

  /**
   * A known control flow directive (e.g. `*ngIf`) is used in a template,
   * but the `CommonModule` is not imported.
   */
  MISSING_CONTROL_FLOW_DIRECTIVE = 8103,

  /**
   * A text attribute is not interpreted as a binding but likely intended to be.
   *
   * For example:
   * ```
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
  TEXT_ATTRIBUTE_NOT_BINDING = 8104,

  /**
   * NgForOf is used in a template, but the user forgot to include let
   * in their statement.
   *
   * For example:
   * ```
   * <ul><li *ngFor="item of items">{{item["name"]}};</li></ul>
   * ```
   */
  MISSING_NGFOROF_LET = 8105,
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
  SUFFIX_NOT_SUPPORTED = 8106,

  /**
   * The left side of an optional chain operation is not nullable.
   *
   * ```
   * {{ foo?.bar }}
   * {{ foo?.['bar'] }}
   * {{ foo?.() }}
   * ```
   * When the type of foo doesn't include `null` or `undefined`.
   */
  OPTIONAL_CHAIN_NOT_NULLABLE = 8107,


  /**
   * `ngSkipHydration` should not be a binding (it should be a static attribute).
   *
   * For example:
   * ```
   * <my-cmp [ngSkipHydration]="someTruthyVar" />
   * ```
   *
   * `ngSkipHydration` cannot be a binding and can not have values other than "true" or an empty
   * value
   */
  SKIP_HYDRATION_NOT_STATIC = 8108,

  /**
   * The template type-checking engine would need to generate an inline type check block for a
   * component, but the current type-checking environment doesn't support it.
   */
  INLINE_TCB_REQUIRED = 8900,

  /**
   * The template type-checking engine would need to generate an inline type constructor for a
   * directive or component, but the current type-checking environment doesn't support it.
   */
  INLINE_TYPE_CTOR_REQUIRED = 8901,

  /**
   * An injectable already has a `ɵprov` property.
   */
  INJECTABLE_DUPLICATE_PROV = 9001,

  // 10XXX error codes are reserved for diagnostics with categories other than
  // `ts.DiagnosticCategory.Error`. These diagnostics are generated by the compiler when configured
  // to do so by a tool such as the Language Service, or by the Language Service itself.

  /**
   * Suggest users to enable `strictTemplates` to make use of full capabilities
   * provided by Angular language service.
   */
  SUGGEST_STRICT_TEMPLATES = 10001,

  /**
   * Indicates that a particular structural directive provides advanced type narrowing
   * functionality, but the current template type-checking configuration does not allow its usage in
   * type inference.
   */
  SUGGEST_SUBOPTIMAL_TYPE_INFERENCE = 10002,
}
