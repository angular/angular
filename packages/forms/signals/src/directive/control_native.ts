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
import type {FormField} from './form_field';
import {InputValidityMonitor} from './input_validity_monitor';
import {
  formatDateForMinMax,
  getNativeControlValue,
  inputRequiresValidityTracking,
  isInput,
  parseDecimalNumber,
  setNativeControlValue,
  setNativeDomProperty,
} from './native';
import {observeSelectMutations} from './select';

export function nativeControlCreate(
  host: ControlDirectiveHost,
  parent: FormField<unknown>,
  parseErrorsSource: WritableSignal<
    Signal<readonly ValidationError.WithoutFieldTree[]> | undefined
  >,
  validityMonitor: InputValidityMonitor,
  document: Document,
): () => void {
  let updateMode = false;
  let hasPendingValueWrite = false;
  // Control value produced by the most recent user edit.
  let lastEditedValue: unknown;
  const input = parent.nativeFormElement;

  // TODO: (perf) ok to always create this?
  const parser = createParser(
    // Read from the model value
    () => parent.state().value(),
    // Write to the buffered "control value"
    (rawValue: unknown) => parent.state().controlValue.set(rawValue),
    // Our parse function doesn't care about the raw value that gets passed in,
    // It just reads the newly parsed value directly off the input element.
    (_rawValue: unknown) => getNativeControlValue(input, parent.state().value, validityMonitor),
  );

  parseErrorsSource.set(parser.errors);
  parent.onReset = () => {
    hasPendingValueWrite = false;
    parser.reset();
    const value = parent.state().value();
    bindings['controlValue'] = value;
    setNativeControlValue(input, value);
  };
  // Use `addEventListener` so we only trigger ticks on signal changes.
  // See https://github.com/angular/angular/issues/61839.
  const nativeEl = host.nativeElement;
  const updateFromInput = () => {
    // A newer user edit takes precedence over a deferred model update.
    hasPendingValueWrite = false;
    // Pass undefined as the raw value since the parse function doesn't care about it.
    parser.setRawValue(undefined);
    lastEditedValue = parent.state().controlValue();
  };
  nativeEl.addEventListener('input', updateFromInput);
  const onBlur = () => {
    const state = parent.state();
    state.markAsTouched();
    if (hasPendingValueWrite) {
      hasPendingValueWrite = false;
      parser.reset();
      setNativeControlValue(input, state.controlValue());
    }
  };
  nativeEl.addEventListener('blur', onBlur);

  parent.destroyRef.onDestroy(() => {
    nativeEl.removeEventListener('input', updateFromInput);
    nativeEl.removeEventListener('blur', onBlur);
  });

  // TODO: move extraction to first update pass?
  if (isInput(input) && inputRequiresValidityTracking(input)) {
    validityMonitor.watchValidity(parent.destroyRef, input, updateFromInput);
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
      // Preserve unfinished input while focused. Unfocused controls must still reflect model changes.
      const isFocused =
        document.activeElement === input ||
        (input.getRootNode?.() as Document | ShadowRoot | undefined)?.activeElement === input;
      // Chromium hides incomplete numbers (e.g. `-` or `1e`) behind an empty value and badInput,
      // so isIntermediate cannot detect them.
      const isBadInput = isFocused && isInput(input) && validityMonitor.isBadInput(input);
      if (!(isFocused && (isBadInput || isIntermediate(input.value, controlValue)))) {
        setNativeControlValue(input, controlValue);
        hasPendingValueWrite = false;
      } else {
        // Only defer external updates; the user's own edit is already displayed.
        // Assign unconditionally so a later update that restores `lastEditedValue` clears a
        // stale deferral. `Object.is` keeps -0 and +0 distinct, matching signal equality.
        hasPendingValueWrite = !Object.is(controlValue, lastEditedValue);
      }
    }

    updateMode = true;
  };
}

function isIntermediate(inputValue: string, controlValue: unknown): boolean {
  // Numeric fields use `number | null`. Any other model value, including a plain string that
  // happens to end in ".", must accept external updates immediately.
  if (typeof controlValue !== 'number' && controlValue !== null) return false;
  // Lone signs and a leading dot are not yet a parseable number.
  if (
    inputValue === '+' ||
    inputValue === '-' ||
    inputValue === '.' ||
    inputValue === '-.' ||
    inputValue === '+.'
  ) {
    return true;
  }
  // Keep spellings that parse but are not the canonical `String` form (`-0`, `1.0`, `+1`).
  // Compare against the parsed value, not the current model, so an external update does not
  // make a still-unfinished edit look complete.
  const parsed = parseDecimalNumber(inputValue);
  return parsed !== undefined && inputValue !== String(parsed);
}
