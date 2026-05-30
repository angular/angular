/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {InputValidityMonitor} from '../../src/directive/input_validity_monitor';

@Injectable()
export class TestInputValidityMonitor extends InputValidityMonitor {
  private state = new Map<HTMLInputElement, {badInput?: boolean; callback?: () => void}>();

  override watchValidity(element: HTMLInputElement, callback: () => void): void {
    const currentState = this.state.get(element) ?? {};
    this.state.set(element, {...currentState, callback});
  }

  override isBadInput(element: HTMLInputElement): boolean {
    return this.state.get(element)?.badInput ?? false;
  }

  setInputState(element: HTMLInputElement, value: string, badInput: boolean) {
    const currentState = this.state.get(element);
    const previousBadInput = currentState?.badInput ?? false;
    const valueChanged = element.value !== value;

    this.state.set(element, {...currentState, badInput});
    element.value = value;

    if (valueChanged) {
      element.dispatchEvent(new Event('input'));
    }
    if (previousBadInput !== badInput) {
      currentState?.callback?.();
    }
  }
}
