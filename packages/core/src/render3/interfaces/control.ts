/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Signal} from '../reactivity/api';
import {WritableSignal} from '../reactivity/signal';

/** A unique symbol used to identify {@link ɵControl} implementations. */
export const ɵCONTROL: unique symbol = Symbol('CONTROL');

/**
 * A directive that binds a {@link ɵFieldState} to a form control.
 */
export interface ɵControl<T> {
  readonly [ɵCONTROL]: undefined;

  /** The state of the field bound to this control. */
  readonly state: Signal<ɵFieldState<T>>;

  /**
   * Registers this directive as a control of its associated form field.
   *
   * The presence of this directive alone is not sufficient to determine whether it'll control
   * the bound field. If this directive's host is a component with a `control` input, we assume
   * the component will forward the bound field to another control directive in its own template,
   * and do nothing.
   */
  register(): void;
}

/**
 * The state of a form field to be synchronized with its bound control.
 */
export interface ɵFieldState<T> {
  /**
   * A signal containing the current errors for the field.
   */
  readonly errors: Signal<unknown>;

  /**
   * A signal indicating whether the field is currently disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * A signal containing the reasons why the field is currently disabled.
   */
  readonly disabledReasons: Signal<unknown>;

  /**
   * A signal indicating the field's maximum value, if applicable.
   *
   * Applies to `<input>` with a numeric or date `type` attribute and custom controls.
   */
  readonly max: Signal<number | undefined>;

  /**
   * A signal indicating the field's maximum string length, if applicable.
   *
   * Applies to `<input>`, `<textarea>`, and custom controls.
   */
  readonly maxLength: Signal<number | undefined>;

  /**
   * A signal indicating the field's minimum value, if applicable.
   *
   * Applies to `<input>` with a numeric or date `type` attribute and custom controls.
   */
  readonly min: Signal<number | undefined>;

  /**
   * A signal indicating the field's minimum string length, if applicable.
   *
   * Applies to `<input>`, `<textarea>`, and custom controls.
   */
  readonly minLength: Signal<number | undefined>;

  /**
   * A signal of a unique name for the field, by default based on the name of its parent field.
   */
  readonly name: Signal<string>;

  /**
   * A signal indicating the patterns the field must match.
   */
  readonly pattern: Signal<readonly RegExp[]>;

  /**
   * A signal indicating whether the field is currently readonly.
   */
  readonly readonly: Signal<boolean>;

  /**
   * A signal indicating whether the field is required.
   */
  readonly required: Signal<boolean>;

  /**
   * A signal indicating whether the field has been touched by the user.
   */
  readonly touched: Signal<boolean>;

  /**
   * A writable signal containing the value for this field. Updating this signal will update the
   * data model that the field is bound to.
   */
  readonly value: WritableSignal<T>;

  /**
   * Sets the dirty status of the field to `true`.
   */
  markAsDirty(): void;

  /**
   * Sets the touched status of the field to `true`.
   */
  markAsTouched(): void;
}
