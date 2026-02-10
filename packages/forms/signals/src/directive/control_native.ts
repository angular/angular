/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  type ɵControlDirectiveHost as ControlDirectiveHost,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import type {ValidationError} from '../api/rules';
import {createParser} from '../util/parser';
import {
  bindingUpdated,
  CONTROL_BINDING_NAMES,
  createBindings,
  readFieldStateBindingValue,
  type ControlBindingKey,
} from './bindings';
import type {FormField} from './form_field_directive';
import {getNativeControlValue, setNativeControlValue, setNativeDomProperty} from './native';
import {observeSelectMutations} from './select';

export function nativeControlCreate(
  host: ControlDirectiveHost,
  parent: FormField<unknown>,
  parseErrorsSource: WritableSignal<
    Signal<readonly ValidationError.WithoutFieldTree[]> | undefined
  >,
): () => void {
  let updateMode = false;
  const input = parent.nativeFormElement;

  // TODO: (perf) ok to always create this?
  const parser = createParser(
    // Read from the model value
    () => parent.state().value(),
    // Write to the buffered "control value"
    (rawValue: unknown) => parent.state().controlValue.set(rawValue),
    // Our parse function doesn't care about the raw value that gets passed in,
    // It just reads the newly parsed value directly off the input element.
    () => getNativeControlValue(input, parent.state().value),
  );

  parseErrorsSource.set(parser.errors);
  // Pass undefined as the raw value since the parse function doesn't care about it.
  host.listenToDom('input', () => parser.setRawValue(undefined));
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
