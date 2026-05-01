/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  signal,
  untracked,
  type ɵControlDirectiveHost as ControlDirectiveHost,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import {NG_VALIDATORS, Validators, type Validator, type ValidatorFn} from '@angular/forms';
import {type ValidationError} from '../api/rules';
import {reactiveErrorsToSignalErrors} from '../compat/validation_errors';
import {
  bindingUpdated,
  CONTROL_BINDING_NAMES,
  createBindings,
  readFieldStateBindingValue,
  type ControlBindingKey,
} from './bindings';
import type {FormField} from './form_field';
import {setNativeDomProperty} from './native';

function isValidatorObject(v: Function | Validator): v is Validator {
  return typeof v === 'object' && v !== null;
}

export function cvaControlCreate(
  host: ControlDirectiveHost,
  parent: FormField<unknown>,
): () => void {
  const bindings = createBindings<ControlBindingKey | 'controlValue'>();

  parent.controlValueAccessor!.registerOnChange((value: unknown) => {
    if (parent.state().isOrphaned()) return;
    // Update tracking for 'controlValue' here so that when the effect runs,
    // `bindingUpdated` sees that the model value matches the last seen view value.
    // This prevents the framework from writing the same value back to the CVA (CVA loopback).
    bindings['controlValue'] = value;
    parent.state().controlValue.set(value);
  });
  parent.controlValueAccessor!.registerOnTouched(() => {
    if (!parent.state().isOrphaned()) parent.state().markAsTouched();
  });

  const legacyValidators = parent.injector.get(NG_VALIDATORS, null, {optional: true, self: true});
  if (legacyValidators) {
    let version: WritableSignal<number> | undefined;

    for (const v of legacyValidators) {
      if (isValidatorObject(v) && v.registerOnValidatorChange) {
        version ??= signal(0);
        v.registerOnValidatorChange(() => {
          version!.update((n) => n + 1);
        });
      }
    }

    const validatorFns = legacyValidators.map((v) =>
      typeof v === 'function' ? (v as ValidatorFn) : v.validate.bind(v),
    );
    const mergedValidator = Validators.compose(validatorFns);

    const parseErrors = computed(() => {
      // Read the `version` signal to re-run the validator when legacy validators trigger their change callbacks.
      version?.();
      const errors = mergedValidator ? mergedValidator(parent.interopNgControl.control) : null;
      return reactiveErrorsToSignalErrors(errors, parent.interopNgControl.control);
    });
    // We must cast here because `CompatValidationError` claims to have `fieldTree` statically (to
    // satisfy `ValidationState` elsewhere), but at construction it is created without it and acts as
    // `WithoutFieldTree` initially.
    parent.parseErrorsSource.set(
      parseErrors as unknown as Signal<readonly ValidationError.WithoutFieldTree[]>,
    );
  }

  parent.registerAsBinding();

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
