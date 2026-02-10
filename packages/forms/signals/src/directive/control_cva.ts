/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked, type ɵControlDirectiveHost as ControlDirectiveHost} from '@angular/core';
import {
  bindingUpdated,
  CONTROL_BINDING_NAMES,
  type ControlBindingKey,
  createBindings,
  readFieldStateBindingValue,
} from './bindings';
import {setNativeDomProperty} from './native';
import type {FormField} from './form_field_directive';

export function cvaControlCreate(
  host: ControlDirectiveHost,
  parent: FormField<unknown>,
): () => void {
  parent.controlValueAccessor!.registerOnChange((value: unknown) =>
    parent.state().controlValue.set(value as any),
  );
  parent.controlValueAccessor!.registerOnTouched(() => parent.state().markAsTouched());
  parent.registerAsBinding();

  const bindings = createBindings<ControlBindingKey | 'controlValue'>();
  return () => {
    const fieldState = parent.state();
    const value = fieldState.value();
    if (bindingUpdated(bindings, 'controlValue', value)) {
      // We don't know if the interop control has underlying signals, so we must use `untracked` to
      // prevent writing to a signal in a reactive context.
      untracked(() => parent.controlValueAccessor!.writeValue(value));
    }

    for (const name of CONTROL_BINDING_NAMES) {
      const value = readFieldStateBindingValue(fieldState, name);
      if (bindingUpdated(bindings, name, value)) {
        const propertyWasSet = host.setInputOnDirectives(name, value);
        if (name === 'disabled' && parent.controlValueAccessor!.setDisabledState) {
          untracked(() => parent.controlValueAccessor!.setDisabledState!(value as boolean));
        } else if (!propertyWasSet && parent.elementAcceptsNativeProperty(name)) {
          // Fall back to native DOM properties.
          setNativeDomProperty(
            parent.renderer,
            parent.nativeFormElement,
            name,
            value as string | number | undefined,
          );
        }
      }
    }
  };
}
