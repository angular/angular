/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ɵRuntimeError as RuntimeError,
  type ɵControlDirectiveHost as ControlDirectiveHost,
} from '@angular/core';
import {RuntimeErrorCode} from '../errors';
import {
  applyControlStateBindings,
  bindingUpdated,
  createBindings,
  type ControlBindingKey,
} from './bindings';
import type {FormField} from './form_field';
import {setNativeDomProperty} from './native';
import {observeSelectMutations} from './select';

export function selectMultipleControlCreate(
  host: ControlDirectiveHost,
  parent: FormField<unknown>,
): () => void {
  let updateMode = false;
  const select = parent.nativeFormElement as HTMLSelectElement;

  host.listenToDom('input', () =>
    parent.state().controlValue.set(getSelectMultipleControlValue(select)),
  );
  host.listenToDom('blur', () => parent.state().markAsTouched());

  parent.registerAsBinding();

  observeSelectMutations(
    select,
    () => {
      if (!updateMode) {
        return;
      }
      setSelectMultipleControlValue(select, parent.state().controlValue());
    },
    parent.destroyRef,
  );

  const bindings = createBindings<ControlBindingKey | 'controlValue'>();

  return () => {
    const state = parent.state();
    const controlValue = state.controlValue();
    if (bindingUpdated(bindings, 'controlValue', controlValue)) {
      setSelectMultipleControlValue(select, controlValue);
    }

    applyControlStateBindings(bindings, state, (name, value) => {
      host.setInputOnDirectives(name, value);
      if (parent.elementAcceptsNativeProperty(name)) {
        setNativeDomProperty(parent.renderer, select, name, value as string | number | undefined);
      }
    });

    updateMode = true;
  };
}

function getSelectMultipleControlValue(select: HTMLSelectElement): string[] {
  const selected: string[] = [];
  for (let i = 0; i < select.options.length; i++) {
    const option = select.options[i];
    if (option.selected) {
      selected.push(option.value);
    }
  }
  return selected;
}

function setSelectMultipleControlValue(select: HTMLSelectElement, value: unknown): void {
  if (!Array.isArray(value)) {
    throw new RuntimeError(
      RuntimeErrorCode.SELECT_MULTIPLE_NON_ARRAY_VALUE,
      ngDevMode &&
        `Expected an array value for select[multiple], but got ${typeof value}. ` +
          `Bind a signal holding a string array: e.g. form(signal<string[]>([]))`,
    );
  }
  const selectedValues = new Set<string>(value);
  for (let i = 0; i < select.options.length; i++) {
    const option = select.options[i];
    option.selected = selectedValues.has(option.value);
  }
}
