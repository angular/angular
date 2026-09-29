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

export function nativeControlCreate(
  host: ControlDirectiveHost,
  parent: FormField<unknown>,
  parseErrorsSource: WritableSignal<
    Signal<readonly ValidationError.WithoutFieldTree[]> | undefined
  >,
  validityMonitor: InputValidityMonitor,
): () => void {
  let updateMode = false;
  const input = parent.nativeFormElement;
  // The input's value as the DOM itself holds it, recorded after each write we make.
  //
  // Comparing model values can't tell a user edit from the browser reshaping what we wrote: an
  // unparseable string or a `Date` the input can't represent is rejected and leaves the value
  // empty, and a `Date` carrying more precision than the input keeps is truncated. In each case the
  // value read back differs from the model through no action of the user, which would dirty every
  // date-like field on load (#69632). The DOM's own string is the one representation both sides
  // agree on.
  let lastWrittenDomValue = input.value;

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
  // Writes to the DOM and records what the DOM ended up holding, which is not necessarily what we
  // asked for: the browser rejects values it can't parse and truncates ones carrying more precision
  // than the input type keeps.
  const writeNativeControlValue = (value: unknown) => {
    setNativeControlValue(input, value);
    lastWrittenDomValue = input.value;
  };

  parent.onReset = () => {
    parser.reset();
    const value = parent.state().value();
    bindings['controlValue'] = value;
    writeNativeControlValue(value);
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
      // The browser runs the `:valid` / `:invalid` animation as soon as the input renders, which is
      // not a user edit. If the DOM still holds exactly what we last wrote then nothing changed and
      // there is nothing to sync.
      //
      // Two states are exempt, because in both the user did edit the input while its `value` stayed
      // empty: entering text the input can't convert (`badInput`, which reports an empty `value`),
      // and clearing that text again, which resolves the parse error the previous sync recorded.
      if (
        untracked(parser.errors).length === 0 &&
        !validityMonitor.isBadInput(input) &&
        input.value === lastWrittenDomValue
      ) {
        return;
      }
      parser.setRawValue(undefined);
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
      writeNativeControlValue(controlValue);
    }

    updateMode = true;
  };
}
