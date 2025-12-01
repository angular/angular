/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InputSignal, InputSignalWithTransform, ModelSignal, OutputRef} from '@angular/core';
import type {DisabledReason} from './types';
import {ValidationError, type WithOptionalField} from './validation_errors';

/**
 * The base set of properties shared by all form control contracts.
 *
 * @category control
 * @experimental 21.0.0
 */
export interface FormUiControl {
  // TODO: `ValidationError` and `DisabledReason` are inherently tied to the signal forms system.
  // They don't make sense when using a control separately from the forms system and setting the
  // inputs individually. Given that, should they still be part of this interface?

  /**
   * An input to receive the errors for the field. If implemented, the `Field` directive will
   * automatically bind errors from the bound field to this input.
   */
  readonly errors?:
    | InputSignal<readonly WithOptionalField<ValidationError>[]>
    | InputSignalWithTransform<readonly WithOptionalField<ValidationError>[], unknown>;
  /**
   * An input to receive the disabled status for the field. If implemented, the `Field` directive
   * will automatically bind the disabled status from the bound field to this input.
   */
  readonly disabled?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown>;
  /**
   * An input to receive the reasons for the disablement of the field. If implemented, the `Field`
   * directive will automatically bind the disabled reason from the bound field to this input.
   */
  readonly disabledReasons?:
    | InputSignal<readonly WithOptionalField<DisabledReason>[]>
    | InputSignalWithTransform<readonly WithOptionalField<DisabledReason>[], unknown>;
  /**
   * An input to receive the readonly status for the field. If implemented, the `Field` directive
   * will automatically bind the readonly status from the bound field to this input.
   */
  readonly readonly?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown>;
  /**
   * An input to receive the hidden status for the field. If implemented, the `Field` directive
   * will automatically bind the hidden status from the bound field to this input.
   */
  readonly hidden?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown>;
  /**
   * An input to receive the invalid status for the field. If implemented, the `Field` directive
   * will automatically bind the invalid status from the bound field to this input.
   */
  readonly invalid?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown>;
  /**
   * An input to receive the pending status for the field. If implemented, the `Field` directive
   * will automatically bind the pending status from the bound field to this input.
   */
  readonly pending?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown>;
  /**
   * An input to receive the touched status for the field. If implemented, the `Field` directive
   * will automatically bind the touched status from the bound field to this input.
   */
  readonly touched?:
    | ModelSignal<boolean>
    | InputSignal<boolean>
    | InputSignalWithTransform<boolean, unknown>
    | OutputRef<boolean>;
  /**
   * An input to receive the dirty status for the field. If implemented, the `Field` directive
   * will automatically bind the dirty status from the bound field to this input.
   */
  readonly dirty?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown>;
  /**
   * An input to receive the name for the field. If implemented, the `Field` directive will
   * automatically bind the name from the bound field to this input.
   */
  readonly name?: InputSignal<string> | InputSignalWithTransform<string, unknown>;
  /**
   * An input to receive the required status for the field. If implemented, the `Field` directive
   * will automatically bind the required status from the bound field to this input.
   */
  readonly required?: InputSignal<boolean> | InputSignalWithTransform<boolean, unknown>;
  /**
   * An input to receive the min value for the field. If implemented, the `Field` directive will
   * automatically bind the min value from the bound field to this input.
   */
  readonly min?:
    | InputSignal<number | undefined>
    | InputSignalWithTransform<number | undefined, unknown>;
  /**
   * An input to receive the min length for the field. If implemented, the `Field` directive will
   * automatically bind the min length from the bound field to this input.
   */
  readonly minLength?:
    | InputSignal<number | undefined>
    | InputSignalWithTransform<number | undefined, unknown>;
  /**
   * An input to receive the max value for the field. If implemented, the `Field` directive will
   * automatically bind the max value from the bound field to this input.
   */
  readonly max?:
    | InputSignal<number | undefined>
    | InputSignalWithTransform<number | undefined, unknown>;
  /**
   * An input to receive the max length for the field. If implemented, the `Field` directive will
   * automatically bind the max length from the bound field to this input.
   */
  readonly maxLength?:
    | InputSignal<number | undefined>
    | InputSignalWithTransform<number | undefined, unknown>;
  /**
   * An input to receive the value patterns for the field. If implemented, the `Field` directive
   * will automatically bind the value patterns from the bound field to this input.
   */
  readonly pattern?:
    | InputSignal<readonly RegExp[]>
    | InputSignalWithTransform<readonly RegExp[], unknown>;
}

/**
 * A contract for a form control that edits a `FieldTree` of type `TValue`. Any component that
 * implements this contract can be used with the `Field` directive.
 *
 * Many of the properties declared on this contract are optional. They do not need to be
 * implemented, but if they are will be kept in sync with the field state of the field bound to the
 * `Field` directive.
 *
 * @template TValue The type of `FieldTree` that the implementing component can edit.
 *
 * @category control
 * @experimental 21.0.0
 */
export interface FormValueControl<TValue> extends FormUiControl {
  /**
   * The value is the only required property in this contract. A component that wants to integrate
   * with the `Field` directive via this contract, *must* provide a `model()` that will be kept in
   * sync with the value of the bound `FieldTree`.
   */
  readonly value: ModelSignal<TValue>;
  // TODO: We currently require that a `checked` input not be present, as we may want to introduce a
  // third kind of form control for radio buttons that defines both a `value` and `checked` input.
  // We are still evaluating whether this makes sense, but if we decide not to pursue this we can
  // remove this restriction.
  /**
   * The implementing component *must not* define a `checked` property. This is reserved for
   * components that want to integrate with the `Field` directive as a checkbox.
   */
  readonly checked?: undefined;
}

/**
 * A contract for a form control that edits a boolean checkbox `FieldTree`. Any component that
 * implements this contract can be used with the `Field` directive.
 *
 * Many of the properties declared on this contract are optional. They do not need to be
 * implemented, but if they are will be kept in sync with the field state of the field bound to the
 * `Field` directive.
 *
 * @category control
 * @experimental 21.0.0
 */
export interface FormCheckboxControl extends FormUiControl {
  /**
   * The checked is the only required property in this contract. A component that wants to integrate
   * with the `Field` directive, *must* provide a `model()` that will be kept in sync with the
   * value of the bound `FieldTree`.
   */
  readonly checked: ModelSignal<boolean>;
  // TODO: maybe this doesn't have to be strictly `undefined`? It just can't be a model signal.
  // Typescript doesn't really have a way to do any-but, but we could maybe introduce an optional
  // generic for it?
  /**
   * The implementing component *must not* define a `value` property. This is reserved for
   * components that want to integrate with the `Field` directive as a standard input.
   */
  readonly value?: undefined;
}
