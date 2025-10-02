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
  ElementRef,
  EventEmitter,
  inject,
  InjectionToken,
  Injector,
  inject,
  input,
  ɵCONTROL,
  ɵControl,
} from '@angular/core';
import type {FieldNode} from '../field/node';
import {
  privateGetComponentInstance,
  privateIsModelInput,
  privateIsSignalInput,
  privateRunEffect,
  privateSetComponentInput as privateSetInputSignal,
} from '../util/private';
import {FormCheckboxControl, FormUiControl, FormValueControl} from './control';
import {AggregateProperty, MAX, MAX_LENGTH, MIN, MIN_LENGTH, PATTERN, REQUIRED} from './property';
import type {FieldTree} from './types';

/**
 * Lightweight DI token provided by the {@link Control} directive.
 */
export const CONTROL = new InjectionToken<Control<unknown>>(
  typeof ngDevMode !== undefined && ngDevMode ? 'CONTROL' : '',
);

/**
 * Binds a form `FieldTree` to a UI control that edits it. A UI control can be one of several things:
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
@Directive({
  selector: '[control]',
  providers: [
    {
      provide: NgControl,
      useFactory: () => inject(Control).ngControl,
    },
    {
      provide: CONTROL,
      useExisting: Control,
    },
  ],
})
export class Control<T> {
  /** The injector for this component. */
  private readonly injector = inject(Injector);
  private readonly renderer = inject(Renderer2);

  /** Whether state synchronization with the field has been setup yet. */
  private initialized = false;

  /** The field that is bound to this control. */
  readonly field = signal<FieldTree<T>>(undefined as any);

  // If `[control]` is applied to a custom UI control, it wants to synchronize state in the field w/
  // the inputs of that custom control. This is difficult to do in user-land. We use `effect`, but
  // effects don't run before the lifecycle hooks of the component. This is usually okay, but has
  // one significant issue: the UI control's required inputs won't be set in time for those
  // lifecycle hooks to run.
  //
  // Eventually we can build custom functionality for the `Control` directive into the framework,
  // but for now we work around this limitation with a hack. We use an `@Input` instead of a
  // signal-based `input()` for the `[control]` to hook the exact moment inputs are being set,
  // before the important lifecycle hooks of the UI control. We can then initialize all our effects
  // and force them to run immediately, ensuring all required inputs have values.
  @Input({required: true, alias: 'control'})
  set _field(value: FieldTree<T>) {
    this.field.set(value);
    if (!this.initialized) {
      this.initialize();
    }
  }

  /** The field state of the bound field. */
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
