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
  CONTROL_BINDING_NAMES,
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
    for (const name of CONTROL_BINDING_NAMES) {
      let value: unknown;
      if (name === 'errors') {
        value = parent.errors();
      } else {
        value = readFieldStateBindingValue(state, name);
      }
      if (bindingUpdated(bindings, name, value)) {
        host.setInputOnDirectives(name, value);

        // If the host node is a native control, we can bind field state properties to native
        // properties for any that weren't defined as inputs on the custom control.
        if (parent.elementAcceptsNativeProperty(name) && !host.customControlHasInput(name)) {
          const domValue = formatDateForMinMax(name, value, parent.nativeFormElement.type);
          setNativeDomProperty(
            parent.renderer,
            parent.nativeFormElement,
            name,
            domValue as string | number | boolean | undefined,
          );
        }
      }
    }
  };
}
