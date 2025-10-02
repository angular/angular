/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  Directive,
  effect,
  InjectionToken,
  Injector,
  inject,
  input,
  ɵCONTROL,
  ɵControl,
} from '@angular/core';
import type {FieldNode} from '../field/node';
import type {FieldTree} from './types';

/**
 * Lightweight DI token provided by the {@link Control} directive.
 */
export const CONTROL = new InjectionToken<Control<unknown>>(
  typeof ngDevMode !== undefined && ngDevMode ? 'CONTROL' : '',
);

/**
 * Binds a form `FieldTree` to a UI control that edits it. A UI control can be one of several things:
 * 1. A native HTML input or textarea
 * 2. A signal forms custom control that implements `FormValueControl` or `FormCheckboxControl`
 * 3. TODO: https://github.com/orgs/angular/projects/60/views/1?pane=issue&itemId=131712274. A
 *    component that provides a ControlValueAccessor. This should only be used to backwards
 *    compatibility with reactive forms. Prefer options (1) and (2).
 *
 * This directive has several responsibilities:
 * 1. Two-way binds the field's value with the UI control's value
 * 2. Binds additional forms related state on the field to the UI control (disabled, required, etc.)
 * 3. Relays relevant events on the control to the field (e.g. marks field touched on blur)
 * 4. TODO: https://github.com/orgs/angular/projects/60/views/1?pane=issue&itemId=131712274.
 *    Provides a fake `NgControl` that implements a subset of the features available on the
 *    reactive forms `NgControl`. This is provided to improve interoperability with controls
 *    designed to work with reactive forms. It should not be used by controls written for signal
 *    forms.
 *
 * @category control
 * @experimental 21.0.0
 */
@Directive({selector: '[control]', providers: [{provide: CONTROL, useExisting: Control}]})
export class Control<T> implements ɵControl<T> {
  private readonly injector = inject(Injector);
  readonly field = input.required<FieldTree<T>>({alias: 'control'});
  readonly state = computed(() => this.field()());
  readonly [ɵCONTROL] = undefined;

  // TODO: https://github.com/orgs/angular/projects/60/views/1?pane=issue&itemId=131861631
  register() {
    // Register this control on the field it is currently bound to. We do this at the end of
    // initialization so that it only runs if we are actually syncing with this control
    // (as opposed to just passing the field through to its `control` input).
    effect(
      (onCleanup) => {
        const fieldNode = this.state() as FieldNode;
        fieldNode.nodeState.controls.update((controls) => [...controls, this as Control<unknown>]);
        onCleanup(() => {
          fieldNode.nodeState.controls.update((controls) => controls.filter((c) => c !== this));
        });
      },
      {injector: this.injector},
    );
  }
}
