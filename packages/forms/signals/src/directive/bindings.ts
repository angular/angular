/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type ɵControlDirectiveHost as ControlDirectiveHost, type Renderer2} from '@angular/core';
import type {ReadonlyFieldState} from '../api/types';
import {setNativeDomProperty, type NativeFormControl} from './native';

/**
 * Branded type for the public name of an input we bind on control components or DOM elements.
 */
export type ControlBindingKey = string & {__brand: 'ControlBindingKey'};

/**
 * A map of field state properties to control binding name.
 *
 * This excludes `controlValue` whose corresponding control binding name differs between control
 * types.
 *
 * The control binding name can be used for inputs or attributes (since DOM attributes are case
 * insensitive).
 */
const FIELD_STATE_KEY_TO_CONTROL_BINDING = {
  disabled: 'disabled' as ControlBindingKey,
  disabledReasons: 'disabledReasons' as ControlBindingKey,
  dirty: 'dirty' as ControlBindingKey,
  errors: 'errors' as ControlBindingKey,
  hidden: 'hidden' as ControlBindingKey,
  invalid: 'invalid' as ControlBindingKey,
  max: 'max' as ControlBindingKey,
  maxLength: 'maxLength' as ControlBindingKey,
  min: 'min' as ControlBindingKey,
  minLength: 'minLength' as ControlBindingKey,
  name: 'name' as ControlBindingKey,
  pattern: 'pattern' as ControlBindingKey,
  pending: 'pending' as ControlBindingKey,
  readonly: 'readonly' as ControlBindingKey,
  required: 'required' as ControlBindingKey,
  touched: 'touched' as ControlBindingKey,
} as const satisfies {[K in keyof ReadonlyFieldState<unknown>]?: ControlBindingKey};

/**
 * Inverts `FIELD_STATE_KEY_TO_CONTROL_BINDING` to look up the minified name of the corresponding
 * field state property from its control binding name.
 */
const CONTROL_BINDING_TO_FIELD_STATE_KEY = /* @__PURE__ */ (() => {
  const map = {} as Record<ControlBindingKey, keyof typeof FIELD_STATE_KEY_TO_CONTROL_BINDING>;
  for (const key of Object.keys(FIELD_STATE_KEY_TO_CONTROL_BINDING) as Array<
    keyof typeof FIELD_STATE_KEY_TO_CONTROL_BINDING
  >) {
    map[FIELD_STATE_KEY_TO_CONTROL_BINDING[key]] = key;
  }
  return map;
})();

export function readFieldStateBindingValue(
  fieldState: ReadonlyFieldState<unknown>,
  key: ControlBindingKey,
): unknown {
  const property = CONTROL_BINDING_TO_FIELD_STATE_KEY[key];
  return fieldState[property]?.();
}

/** The keys of {@link FIELD_STATE_KEY_TO_CONTROL_BINDING} */
export const CONTROL_BINDING_NAMES = /* @__PURE__ */ (() =>
  Object.values(FIELD_STATE_KEY_TO_CONTROL_BINDING))() as Array<ControlBindingKey>;

/** The subset of native property names that Signal Forms can write via the Renderer. */
type NativeDomPropertyName = Parameters<typeof setNativeDomProperty>[2];

/**
 * Structural interface describing the pieces of `FormField` that `applyControlStateBindings`
 * needs. Using a structural type avoids a circular import between `bindings.ts` and
 * `form_field.ts`.
 */
export interface ControlStateBindingTarget {
  readonly renderer: Renderer2;
  readonly nativeFormElement: NativeFormControl;
  elementAcceptsNativeProperty(
    name: ControlBindingKey,
  ): name is ControlBindingKey & NativeDomPropertyName;
}

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

/**
 * Iterates over all control binding names, computes each value from field state, and applies
 * any changed bindings to both the directive inputs and the native DOM element. Shared by
 * native and select-multiple control implementations.
 */
export function applyControlStateBindings(
  bindings: {[key: string]: unknown},
  state: ReadonlyFieldState<unknown>,
  host: ControlDirectiveHost,
  parent: ControlStateBindingTarget,
): void {
  for (const name of CONTROL_BINDING_NAMES) {
    const value = readFieldStateBindingValue(state, name);
    if (bindingUpdated(bindings, name, value)) {
      host.setInputOnDirectives(name, value);
      if (parent.elementAcceptsNativeProperty(name)) {
        setNativeDomProperty(
          parent.renderer,
          parent.nativeFormElement,
          name,
          value as string | number | undefined,
        );
      }
    }
  }
}
