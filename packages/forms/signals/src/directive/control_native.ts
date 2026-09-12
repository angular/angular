/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  untracked,
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
import type {FormField} from './form_field';
import {InputValidityMonitor} from './input_validity_monitor';
import {
  formatDateForMinMax,
  getNativeControlValue,
  inputRequiresValidityTracking,
  isInput,
  setNativeControlValue,
  setNativeDomProperty,
} from './native';
import {observeSelectMutations} from './select';

/**
 * Compares two control values, treating `Date`s for the same instant as equal.
 *
 * Date-like inputs are read through `valueAsDate`, which returns a fresh `Date` on every access, so
 * identity comparison alone would report a change even when the input was never touched.
 */
function controlValuesEqual(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  return Object.is(a, b);
}

export function nativeControlCreate(
  host: ControlDirectiveHost,
  parent: FormField<unknown>,
  parseErrorsSource: WritableSignal<
    Signal<readonly ValidationError.WithoutFieldTree[]> | undefined
  >,
  validityMonitor: InputValidityMonitor,
): () => void {
  let updateMode = false;
  // While true, a write that leaves the value untouched must not dirty the field.
  //
  // A native validity change isn't necessarily a user edit: the browser runs the `:valid` /
  // `:invalid` animation as soon as the input is rendered, which would otherwise dirty every
  // date-like field on load (#69632). Syncs that clear a parse error are exempt, because a parse
  // error can only exist in response to the user typing something the input couldn't parse.
  let dirtyOnlyIfValueChanged = false;
  const input = parent.nativeFormElement;

  // TODO: (perf) ok to always create this?
  const parser = createParser(
    // Read from the model value
    () => parent.state().value(),
    // Write to the buffered "control value"
    (rawValue: unknown) => {
      const state = parent.state();
      if (dirtyOnlyIfValueChanged && controlValuesEqual(untracked(state.controlValue), rawValue)) {
        return;
      }
      // Outside of `dirtyOnlyIfValueChanged` we intentionally write even when the value is
      // unchanged, so that re-entering the same value still dirties the field.
      state.controlValue.set(rawValue);
    },
    // Our parse function doesn't care about the raw value that gets passed in,
    // It just reads the newly parsed value directly off the input element.
    (_rawValue: unknown) => getNativeControlValue(input, parent.state().value, validityMonitor),
  );

  parseErrorsSource.set(parser.errors);
  parent.onReset = () => {
    parser.reset();
    const value = parent.state().value();
    bindings['controlValue'] = value;
    setNativeControlValue(input, value);
  };
  // Pass undefined as the raw value since the parse function doesn't care about it.
  host.listenToDom('input', () => {
    // An `input` event is the definitive signal of user interaction, so dirty the field up front.
    // Parsing may fail — typing `e` into a number input, or an incomplete date — in which case no
    // value reaches `controlValue` and nothing else would mark the field as edited.
    parent.state().markAsDirty();
    parser.setRawValue(undefined);
  });
  host.listenToDom('blur', () => parent.state().markAsTouched());

  // TODO: move extraction to first update pass?
  if (isInput(input) && inputRequiresValidityTracking(input)) {
    validityMonitor.watchValidity(parent.destroyRef, input, () => {
      // Resolving a parse error is always a user edit, so let those syncs dirty the field even
      // when the parsed value is unchanged.
      dirtyOnlyIfValueChanged = untracked(parser.errors).length === 0;
      try {
        parser.setRawValue(undefined);
      } finally {
        dirtyOnlyIfValueChanged = false;
      }
    });
  }

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

  const bindings = createBindings<ControlBindingKey | 'controlValue' | 'radioValue'>();

  return () => {
    const state = parent.state();

    for (const name of CONTROL_BINDING_NAMES) {
      const value = readFieldStateBindingValue(state, name);
      if (bindingUpdated(bindings, name, value)) {
        host.setInputOnDirectives(name, value);
        if (parent.elementAcceptsNativeProperty(name)) {
          const domValue = formatDateForMinMax(name, value, input.type);
          setNativeDomProperty(
            parent.renderer,
            input,
            name,
            domValue as string | number | boolean | undefined,
          );
        }
      }
    }

    // We need to update the value after setting the attributes as some attributes like min/max might prevent from setting the value
    const controlValue = state.controlValue();
    const controlValueChanged = bindingUpdated(bindings, 'controlValue', controlValue);
    const radioValueChanged =
      input.type === 'radio' && bindingUpdated(bindings, 'radioValue', input.value);

    if (controlValueChanged || radioValueChanged) {
      setNativeControlValue(input, controlValue);
    }

    updateMode = true;
  };
}
