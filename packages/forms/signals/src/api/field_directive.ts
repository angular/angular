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
  inject,
  InjectionToken,
  Injector,
  input,
  ɵCONTROL,
  ɵControl,
  ɵInteropControl,
} from '@angular/core';
import {NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {InteropNgControl} from '../controls/interop_ng_control';
import {SIGNAL_FORMS_CONFIG} from '../field/di';
import type {FieldNode} from '../field/node';
import type {FieldTree} from './types';

/**
 * Lightweight DI token provided by the {@link Field} directive.
 *
 * @category control
 * @experimental 21.0.0
 */
export const FIELD = new InjectionToken<Field<unknown>>(
  typeof ngDevMode !== undefined && ngDevMode ? 'FIELD' : '',
);

/**
 * Binds a form `FieldTree` to a UI control that edits it. A UI control can be one of several things:
 * 1. A native HTML input or textarea
 * 2. A signal forms custom control that implements `FormValueControl` or `FormCheckboxControl`
 * 3. A component that provides a `ControlValueAccessor`. This should only be used for backwards
 *    compatibility with reactive forms. Prefer options (1) and (2).
 *
 * This directive has several responsibilities:
 * 1. Two-way binds the field's value with the UI control's value
 * 2. Binds additional forms related state on the field to the UI control (disabled, required, etc.)
 * 3. Relays relevant events on the control to the field (e.g. marks field touched on blur)
 * 4. Provides a fake `NgControl` that implements a subset of the features available on the
 *    reactive forms `NgControl`. This is provided to improve interoperability with controls
 *    designed to work with reactive forms. It should not be used by controls written for signal
 *    forms.
 *
 * @category control
 * @experimental 21.0.0
 */
@Directive({
  selector: '[field]',
  providers: [
    {provide: FIELD, useExisting: Field},
    {provide: NgControl, useFactory: () => inject(Field).getOrCreateNgControl()},
  ],
})
export class Field<T> implements ɵControl<T> {
  private readonly injector = inject(Injector);
  private config = inject(SIGNAL_FORMS_CONFIG, {optional: true});
  readonly classes = Object.entries(this.config?.classes ?? {}).map(
    ([className, computation]) => [className, computed(() => computation(this.state()))] as const,
  );
  readonly field = input.required<FieldTree<T>>();
  readonly state = computed(() => this.field()());
  readonly [ɵCONTROL] = undefined;

  /** Any `ControlValueAccessor` instances provided on the host element. */
  private readonly controlValueAccessors = inject(NG_VALUE_ACCESSOR, {optional: true, self: true});

  /** A lazily instantiated fake `NgControl`. */
  private interopNgControl: InteropNgControl | undefined;

  /** A `ControlValueAccessor`, if configured, for the host component. */
  get ɵinteropControl(): ɵInteropControl | undefined {
    return this.controlValueAccessors?.[0] ?? this.interopNgControl?.valueAccessor ?? undefined;
  }

  /** Lazily instantiates a fake `NgControl` for this field. */
  protected getOrCreateNgControl(): InteropNgControl {
    return (this.interopNgControl ??= new InteropNgControl(this.state));
  }

  // TODO: https://github.com/orgs/angular/projects/60/views/1?pane=issue&itemId=131861631
  ɵregister() {
    // Register this control on the field it is currently bound to. We do this at the end of
    // initialization so that it only runs if we are actually syncing with this control
    // (as opposed to just passing the field through to its `field` input).
    effect(
      (onCleanup) => {
        const fieldNode = this.state() as unknown as FieldNode;
        fieldNode.nodeState.fieldBindings.update((controls) => [
          ...controls,
          this as Field<unknown>,
        ]);
        onCleanup(() => {
          fieldNode.nodeState.fieldBindings.update((controls) =>
            controls.filter((c) => c !== this),
          );
        });
      },
      {injector: this.injector},
    );
  }
}
