/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ɵControlDirectiveHost as ControlDirectiveHost} from '@angular/core';
import type {FormField, FormFieldBindingOptions} from './form_field';
import {
  bindingUpdated,
  CONTROL_BINDINGS,
  type ControlBindingKey,
  createBindings,
  readFieldStateBindingValue,
} from './bindings';
import {formatDateForMinMax, setNativeDomProperty} from './native';

export function customControlCreate(
  host: ControlDirectiveHost,
  parent: FormField<unknown>,
): () => void {
  host.listenToCustomControlModel((value) => parent.state().controlValue.set(value));
  host.listenToCustomControlOutput('touch', () => parent.state().markAsTouched());

  parent.registerAsBinding(host.customControl as FormFieldBindingOptions);

  const bindings = createBindings<ControlBindingKey | 'controlValue'>();
  return () => {
    const state = parent.state();
    // Bind custom form control model ('value' or 'checked').
    const controlValue = state.controlValue();
    if (bindingUpdated(bindings, 'controlValue', controlValue)) {
      host.setCustomControlModelInput(controlValue);
    }

    // Bind remaining field state properties.
    for (const binding of CONTROL_BINDINGS) {
      const {customControlInput, nativeProperty} = binding;
      let value: unknown;
      if (customControlInput === 'errors') {
        value = parent.errors();
      } else {
        value = readFieldStateBindingValue(state, binding);
      }
      if (bindingUpdated(bindings, customControlInput, value)) {
        host.setInputOnDirectives(customControlInput, value);

        // If the host node is a native control, we can bind field state properties to native
        // properties for any that weren't defined as inputs on the custom control.
        if (
          parent.elementAcceptsNativeProperty(nativeProperty) &&
          !host.customControlHasInput(customControlInput)
        ) {
          const domValue = formatDateForMinMax(
            nativeProperty,
            value,
            parent.nativeFormElement.type,
          );
          setNativeDomProperty(
            parent.renderer,
            parent.nativeFormElement,
            nativeProperty,
            domValue as string | number | boolean | undefined,
          );
        }
      }
    }
  };
}
