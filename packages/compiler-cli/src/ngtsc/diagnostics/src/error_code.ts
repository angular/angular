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
  DECORATOR_ON_ANONYMOUS_CLASS = 1004,
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

  SYMBOL_NOT_EXPORTED = 3001,
  SYMBOL_EXPORTED_UNDER_DIFFERENT_NAME = 3002,
  /**
   * Raised when a relationship between directives and/or pipes would cause a cyclic import to be
   * created that cannot be handled, such as in partial compilation mode.
   */
  IMPORT_CYCLE_DETECTED = 3003,

  CONFIG_FLAT_MODULE_NO_INDEX = 4001,
  CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK = 4002,

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
   * A template has a two way binding (two bindings created by a single syntactial element)
   * in which the input and output are going to different places.
   */
  SPLIT_TWO_WAY_BINDING = 8007,

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

/**
 * @internal
 * Base URL for the error details page.
 * Keep this value in sync with a similar const in
 * `packages/core/src/render3/error_code.ts`.
 */
export const ERROR_DETAILS_PAGE_BASE_URL = 'https://angular.io/errors';

/**
 * @internal
 * Contains a set of error messages that have detailed guides at angular.io.
 * Full list of available error guides can be found at https://angular.io/errors
 */
export const COMPILER_ERRORS_WITH_GUIDES = new Set([
  ErrorCode.DECORATOR_ARG_NOT_LITERAL,
  ErrorCode.IMPORT_CYCLE_DETECTED,
  ErrorCode.PARAM_MISSING_TOKEN,
  ErrorCode.SCHEMA_INVALID_ELEMENT,
  ErrorCode.SCHEMA_INVALID_ATTRIBUTE,
  ErrorCode.MISSING_REFERENCE_TARGET,
  ErrorCode.COMPONENT_INVALID_SHADOW_DOM_SELECTOR,
]);

/**
 * @internal
 */
export function ngErrorCode(code: ErrorCode): number {
  return parseInt('-99' + code);
}
