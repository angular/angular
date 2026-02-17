/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ɵControlDirectiveHost as ControlDirectiveHost} from '@angular/core';
import type {FormField} from './form_field_directive';
import {
  bindingUpdated,
  CONTROL_BINDING_NAMES,
  type ControlBindingKey,
  createBindings,
  readFieldStateBindingValue,
} from './bindings';
import {setNativeDomProperty} from './native';
import {FormUiControl} from '../api/control';

export function customControlCreate(
  host: ControlDirectiveHost,
  parent: FormField<unknown>,
): () => void {
  host.listenToCustomControlModel((value) => parent.state().controlValue.set(value));
  host.listenToCustomControlOutput('touchedChange', () => parent.state().markAsTouched());

  parent.registerAsBinding(host.customControl as FormUiControl);

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
          setNativeDomProperty(
            parent.renderer,
            parent.nativeFormElement!,
            name,
            value as string | number | undefined,
          );
        }
      }
    }
  };
}
