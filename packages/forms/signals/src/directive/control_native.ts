/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type {ɵControlDirectiveHost as ControlDirectiveHost} from '@angular/core';
import type {FormField} from './form_field_directive';
import {getNativeControlValue, setNativeControlValue, setNativeDomProperty} from './native';
import {observeSelectMutations} from './select';
import {
  bindingUpdated,
  CONTROL_BINDING_NAMES,
  type ControlBindingKey,
  createBindings,
  readFieldStateBindingValue,
} from './bindings';

export function nativeControlCreate(
  host: ControlDirectiveHost,
  parent: FormField<unknown>,
): () => void {
  let updateMode = false;
  const input = parent.nativeFormElement;

  host.listenToDom('input', () => {
    const state = parent.state();
    state.controlValue.set(getNativeControlValue(input, state.value));
  });

  host.listenToDom('blur', () => parent.state().markAsTouched());

  parent.registerAsBinding();

  // The native `<select>` tracks its `value` by keeping track of the selected `<option>`.
  // Therefore if we set the value to an arbitrary string *before* the corresponding option has been
  // created, the `<select>` will ignore it.
  //
  // This means that we need to know when an `<option>` is created, destroyed, or has its `value`
  // changed so that we can re-sync the `<select>` to the field state's value. We implement this
  // using a `MutationObserver` that we create to observe `<option>` changes.
  if (input.tagName === 'SELECT') {
    observeSelectMutations(
      input as HTMLSelectElement,
      () => {
        // It's not legal to access `parent.state()` until update mode has run, but
        // `observeSelectMutations` may fire earlier. It's okay to ignore these early notifications
        // because we'll write `input.value` in that first update pass anyway.
        if (!updateMode) {
          return;
        }
        input.value = parent.state().controlValue() as string;
      },
      parent.destroyRef,
    );
  }

  const bindings = createBindings<ControlBindingKey | 'controlValue'>();

  return () => {
    const state = parent.state();
    const controlValue = state.controlValue();
    if (bindingUpdated(bindings, 'controlValue', controlValue)) {
      setNativeControlValue(input, controlValue);
    }

    for (const name of CONTROL_BINDING_NAMES) {
      const value = readFieldStateBindingValue(state, name);
      if (bindingUpdated(bindings, name, value)) {
        host.setInputOnDirectives(name, value);
        if (parent.elementAcceptsNativeProperty(name)) {
          setNativeDomProperty(parent.renderer, input, name, value as string | number | undefined);
        }
      }
    }

    updateMode = true;
  };
}
