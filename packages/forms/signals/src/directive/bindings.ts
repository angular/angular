/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ReadonlyFieldState} from '../api/types';

/**
 * Branded type for the public name of an input we bind on control components or DOM elements.
 */
export type ControlBindingKey = string & {__brand: 'ControlBindingKey'};

export interface ControlBinding {
  fieldStateKey: BoundFieldStateKey;
  customControlInput: ControlBindingKey;
  nativeProperty: ControlBindingKey;
}

/**
 * A map of field state properties to their custom control and native binding names.
 *
 * This excludes `controlValue` whose corresponding control binding name differs between control
 * types.
 *
 * The custom control and native names differ for constraint bindings so that custom controls must
 * explicitly opt into receiving them without reserving common component input names.
 */
const FIELD_STATE_KEY_TO_CONTROL_BINDING = {
  disabled: binding('disabled'),
  disabledReasons: binding('disabledReasons'),
  dirty: binding('dirty'),
  errors: binding('errors'),
  hidden: binding('hidden'),
  invalid: binding('invalid'),
  max: binding('formFieldMax', 'max'),
  maxLength: binding('formFieldMaxLength', 'maxLength'),
  min: binding('formFieldMin', 'min'),
  minLength: binding('formFieldMinLength', 'minLength'),
  name: binding('name'),
  pattern: binding('pattern'),
  pending: binding('pending'),
  readonly: binding('readonly'),
  required: binding('required'),
  touched: binding('touched'),
} as const satisfies {
  [K in keyof ReadonlyFieldState<unknown>]?: Omit<ControlBinding, 'fieldStateKey'>;
};

type BoundFieldStateKey = keyof typeof FIELD_STATE_KEY_TO_CONTROL_BINDING;

function binding(
  customControlInput: string,
  nativeProperty = customControlInput,
): Omit<ControlBinding, 'fieldStateKey'> {
  return {
    customControlInput: customControlInput as ControlBindingKey,
    nativeProperty: nativeProperty as ControlBindingKey,
  };
}

export function readFieldStateBindingValue(
  fieldState: ReadonlyFieldState<unknown>,
  binding: ControlBinding,
): unknown {
  return fieldState[binding.fieldStateKey]?.();
}

/** The bindings represented by {@link FIELD_STATE_KEY_TO_CONTROL_BINDING}. */
export const CONTROL_BINDINGS = /* @__PURE__ */ (() =>
  (
    Object.keys(FIELD_STATE_KEY_TO_CONTROL_BINDING) as Array<
      keyof typeof FIELD_STATE_KEY_TO_CONTROL_BINDING
    >
  ).map((fieldStateKey) => ({
    fieldStateKey,
    ...FIELD_STATE_KEY_TO_CONTROL_BINDING[fieldStateKey],
  })))() as ControlBinding[];

export function createBindings<TKey extends string>(): {[K in TKey]?: unknown} {
  return {};
}

export function bindingUpdated<TKey extends string>(
  bindings: {[K in TKey]?: unknown},
  key: TKey,
  value: unknown,
) {
  if (bindings[key] !== value) {
    bindings[key] = value;
    return true;
  }
  return false;
}
