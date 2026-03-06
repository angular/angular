/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A control directive definition that captures control-related behavior for a directive.
 *
 * This is the type of `DirectiveDef.controlDef`.
 *
 * @see ɵɵControlFeature
 */
export interface ControlDirectiveDef {
  readonly passThroughInput: string | null;
  readonly create: (instance: unknown, host: ControlDirectiveHost) => void;
  readonly update: (instance: unknown, host: ControlDirectiveHost) => void;
}

/**
 * Interface provided by the runtime to directives that act as form controls, as the argument to
 * `ɵngControlCreate` and `ɵngControlUpdate` lifecycle hooks.
 *
 * @param _TPassthroughInput if given, the name of an input which, if found on other directives,
 *   will cause the control infrastructure to recognize this usage as "pass-through". This sets
 *   the `hasPassThrough` flag. This generic is only read by the compiler on the type declaration
 *   of `ɵngControlCreate`, and has no impact on the type of the host.
 */
export interface ControlDirectiveHost<_TPassthroughInput extends string | undefined = undefined> {
  /**
   * A string that describes this control directive, used for error messages.
   */
  readonly descriptor: string;

  /**
   * Whether any other directive on the element has an input that matches this directive's
   * `_TPassThroughInput` declaration.
   */
  readonly hasPassThrough: boolean;

  /**
   * A `FormUiControl` instance that this directive is declared on.
   */
  readonly customControl: unknown | undefined;

  /** The native DOM element for the host node, if applicable. */
  readonly nativeElement: HTMLElement;

  /**
   * Registers a listener that will be called when the custom control's value changes.
   *
   * This abstracts over the fact that different types of custom controls use different model
   * names (`value` vs `checked`).
   */
  listenToCustomControlModel(listener: (value: unknown) => void): void;

  /**
   * Registers a listener that will be called when the custom control emits an output.
   */
  listenToCustomControlOutput(outputName: string, listener: () => void): void;

  /**
   * Sets the custom control's value.
   *
   * This abstracts over the fact that different types of custom controls use different model
   * names (`value` vs `checked`).
   */
  setCustomControlModelInput(value: unknown): void;

  /**
   * Checks if the custom control has an input with the given name.
   */
  customControlHasInput(inputName: string): boolean;

  /**
   * Updates a property binding on all directives on this node, aside from the control directive
   * itself.
   */
  setInputOnDirectives(inputName: string, value: unknown): boolean;

  /**
   * Listens to a DOM event on the host element.
   */
  listenToDom(eventName: string, listener: (event: Event) => void): void;
}
