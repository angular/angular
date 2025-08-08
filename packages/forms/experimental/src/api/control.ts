/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InputSignal, ModelSignal, OutputRef} from '@angular/core';
import {ValidationError} from './validation_errors';

/** The base set of properties shared by all form control contracts. */
export interface FormUiControl {
  /**
   * An input to receive the errors for the field. If implemented, the `Control` directive will
   * automatically bind errors from the bound field to this input.
   */
  readonly errors?: InputSignal<readonly ValidationError[] | undefined>;
  // TODO: should we have an input for binding disabled reason?
  /**
   * An input to receive the disabled status for the field. If implemented, the `Control` directive
   * will automatically bind the disabled status from the bound field to this input.
   */
  readonly disabled?: InputSignal<boolean | undefined>;
  /**
   * An input to receive the readonly status for the field. If implemented, the `Control` directive
   * will automatically bind the readonly status from the bound field to this input.
   */
  readonly readonly?: InputSignal<boolean | undefined>;
  /**
   * An input to receive the hidden status for the field. If implemented, the `Control` directive
   * will automatically bind the hidden status from the bound field to this input.
   */
  readonly hidden?: InputSignal<boolean | undefined>;
  // TODO: what do we do about the whole valid != !invalid thing?
  // Should we bind both of them? neither? treat valid+pending as valid? some kind of combined tri-/quad-state?
  // Should we allow binding in the pending state?
  /**
   * An input to receive the valid status for the field. If implemented, the `Control` directive
   * will automatically bind the valid status from the bound field to this input.
   */
  readonly valid?: InputSignal<boolean | undefined>;
  /**
   * An input to receive the touched status for the field. If implemented, the `Control` directive
   * will automatically bind the touched status from the bound field to this input.
   */
  readonly touched?: InputSignal<boolean | undefined>;
  /**
   * An input to receive the dirty status for the field. If implemented, the `Control` directive
   * will automatically bind the dirty status from the bound field to this input.
   */
  readonly dirty?: InputSignal<boolean | undefined>;
  /**
   * An input to receive the name for the field. If implemented, the `Control` directive will
   * automatically bind the name from the bound field to this input.
   */
  readonly name?: InputSignal<string | undefined>;
  /**
   * An input to receive the required status for the field. If implemented, the `Control` directive
   * will automatically bind the required status from the bound field to this input.
   */
  readonly required?: InputSignal<boolean | undefined>;
  /**
   * An input to receive the min value for the field. If implemented, the `Control` directive will
   * automatically bind the min value from the bound field to this input.
   */
  readonly min?: InputSignal<number | undefined>;
  /**
   * An input to receive the min length for the field. If implemented, the `Control` directive will
   * automatically bind the min length from the bound field to this input.
   */
  readonly minLength?: InputSignal<number | undefined>;
  /**
   * An input to receive the max value for the field. If implemented, the `Control` directive will
   * automatically bind the max value from the bound field to this input.
   */
  readonly max?: InputSignal<number | undefined>;
  /**
   * An input to receive the max length for the field. If implemented, the `Control` directive will
   * automatically bind the max length from the bound field to this input.
   */
  readonly maxLength?: InputSignal<number | undefined>;
  /**
   * An input to receive the value patterns for the field. If implemented, the `Control` directive
   * will automatically bind the value patterns from the bound field to this input.
   */
  readonly pattern?: InputSignal<readonly RegExp[] | undefined>;
  // TODO: what should we name this output? `touch` feels weird. The rest of the inputs here are
  // named after their corresponding DOM concept (when applicable). Following that pattern, `blur`
  // might make sense, though maybe we consider this a separate thing that only happens to align
  // with blur by default. Some alternative options:
  // - blur
  // - touchEvent
  // - touched (overlaps with the input name, could make it a `InputSignal | ModelSignal | OutputRef`)
  // - just remove this and don't allow customization of this behavior
  /**
   * An output that emits when the field should be considered touched. If implemented the `Control`
   * directive will use this output to determine when to mark the field tocuhed. If not implemented,
   * the `Control` directive will mark the field touched whenever focus moves from inside the
   * component to outside (i.e. on blur / focus-out).
   */
  readonly touch?: OutputRef<void>;
}

/**
 * A contract for a form control that edits a `Field` of type `TValue`. Any component that
 * implements this contract can be used with the `Control` directive.
 *
 * Many of the properties declared on this contract are optional. They do not need to be
 * implemented, but if they are will be kept in sync with the field state of the field bound to the
 * `Control` directive.
 *
 * @template TValue The type of `Field` that the implementing component can edit.
 */
export interface FormValueControl<TValue> extends FormUiControl {
  /**
   * The value is the only required property in this contract. A component that wants to integrate
   * with the `Control` directive via this contract, *must* provide a `model()` that will be kept in
   * sync with the value of the bound `Field`.
   */
  readonly value: ModelSignal<TValue>;
  // TODO: We currently require that a `checked` input not be present, as we may want to introduce a
  // third kind of form control for radio buttons that defines both a `value` and `checked` input.
  // We are still evaluating whether this makes sense, but if we decide not to persue this we can
  // remove this restriction.
  /**
   * The implementing component *must not* define a `checked` property. This is reserved for
   * components that want to integrate with the `Control` directive as a checkbox.
   */
  readonly checked?: undefined;
}

/**
 * A contract for a form control that edits a boolean checkbox `Field`. Any component that
 * implements this contract can be used with the `Control` directive.
 *
 * Many of the properties declared on this contract are optional. They do not need to be
 * implemented, but if they are will be kept in sync with the field state of the field bound to the
 * `Control` directive.
 */
export interface FormCheckboxControl extends FormUiControl {
  /**
   * The checked is the only required property in this contract. A component that wants to integrate
   * with the `Control` directive, *must* provide a `model()` that will be kept in sync with the
   * value of the bound `Field`.
   */
  readonly checked: ModelSignal<boolean>;
  // TODO: maybe this doesn't have to be strictly `undefined`? It just can't be a model signal.
  // Typescript doesn't really have a way to do any-but, but we could maybe introduce an optional
  // generic for it?
  /**
   * The implementing component *must not* define a `value` property. This is reserved for
   * components that want to integrate with the `Control` directive as a standard input.
   */
  readonly value?: undefined;
}
