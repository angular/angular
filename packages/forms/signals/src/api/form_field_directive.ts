/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  ɵɵcontrolCreate as createControlBinding,
  Directive,
  effect,
  ElementRef,
  inject,
  InjectionToken,
  Injector,
  input,
  signal,
  untracked,
  ɵcontrolUpdate as updateControlBinding,
  ɵCONTROL,
  ɵInteropControl,
  type ɵFormFieldDirective,
} from '@angular/core';
import {NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {InteropNgControl} from '../controls/interop_ng_control';
import {SIGNAL_FORMS_CONFIG} from '../field/di';
import type {FieldNode} from '../field/node';
import type {FormUiControlBase} from './control';
import type {FieldTree} from './types';

/**
 * Lightweight DI token provided by the {@link FormField} directive.
 *
 * @category control
 * @experimental 21.0.0
 */
export const FORM_FIELD = new InjectionToken<FormField<unknown>>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'FORM_FIELD' : '',
);

/**
 * Instructions for dynamically binding a {@link FormField} to a form control.
 */
const controlInstructions = {
  create: createControlBinding,
  update: updateControlBinding,
} as const;

/**
 * Binds a form `FieldTree` to a UI control that edits it. A UI control can be one of several things:
 * 1. A native HTML input or textarea
 * 2. A signal forms custom control that implements `FormValueControl` or `FormCheckboxControl`
 * 3. A component that provides a `ControlValueAccessor`. This should only be used for backwards
 *    compatibility with reactive forms. Prefer options (1) and (2).
 *
 * This directive has several responsibilities:
 * 1. Two-way binds the field state's value with the UI control's value
 * 2. Binds additional forms related state on the field state to the UI control (disabled, required, etc.)
 * 3. Relays relevant events on the control to the field state (e.g. marks touched on blur)
 * 4. Provides a fake `NgControl` that implements a subset of the features available on the
 *    reactive forms `NgControl`. This is provided to improve interoperability with controls
 *    designed to work with reactive forms. It should not be used by controls written for signal
 *    forms.
 *
 * @category control
 * @experimental 21.0.0
 */
@Directive({
  selector: '[formField]',
  providers: [
    {provide: FORM_FIELD, useExisting: FormField},
    {provide: NgControl, useFactory: () => inject(FormField).getOrCreateNgControl()},
  ],
})
// This directive should `implements ɵFormFieldDirective<T>`, but actually adding that breaks people's
// builds because part of the public API is marked `@internal` and stripped.
// Instead we have an type check below that enforces this in a non-breaking way.
export class FormField<T> {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly injector = inject(Injector);
  readonly formField = input.required<FieldTree<T>>();
  readonly state = computed(() => this.formField()());
  private readonly uiControl = signal<FormUiControlBase | undefined>(undefined);

  readonly [ɵCONTROL] = controlInstructions;

  private config = inject(SIGNAL_FORMS_CONFIG, {optional: true});
  /** @internal */
  readonly classes = Object.entries(this.config?.classes ?? {}).map(
    ([className, computation]) =>
      [className, computed(() => computation(this as FormField<unknown>))] as const,
  );

  /** Any `ControlValueAccessor` instances provided on the host element. */
  private readonly controlValueAccessors = inject(NG_VALUE_ACCESSOR, {optional: true, self: true});

  /** A lazily instantiated fake `NgControl`. */
  private interopNgControl: InteropNgControl | undefined;

  /**
   * A `ControlValueAccessor`, if configured, for the host component.
   *
   * @internal
   */
  get ɵinteropControl(): ɵInteropControl | undefined {
    return this.controlValueAccessors?.[0] ?? this.interopNgControl?.valueAccessor ?? undefined;
  }

  /** Lazily instantiates a fake `NgControl` for this form field. */
  protected getOrCreateNgControl(): InteropNgControl {
    return (this.interopNgControl ??= new InteropNgControl(this.state));
  }

  /**
   * Registers a custom control as bound to this `FormField`.
   *
   * This method should be called at most once for a given `FormField`. A `FormField` placed on a
   * Directive or Component that implements the `FormUiControl` interface automatically registers
   * that Directive/Component with as the custom control.
   */
  registerCustomControl(uiControl?: FormUiControlBase) {
    if (untracked(this.uiControl)) {
      throw Error('Custom control already registered on this FormField.');
    }

    this.uiControl.set(uiControl);
    // Register this control on the field state it is currently bound to. We do this at the end of
    // initialization so that it only runs if we are actually syncing with this control
    // (as opposed to just passing the field state through to its `formField` input).
    effect(
      (onCleanup) => {
        const fieldNode = this.state() as unknown as FieldNode;
        fieldNode.nodeState.formFieldBindings.update((controls) => [
          ...controls,
          this as FormField<unknown>,
        ]);
        onCleanup(() => {
          fieldNode.nodeState.formFieldBindings.update((controls) =>
            controls.filter((c) => c !== this),
          );
        });
      },
      {injector: this.injector},
    );
  }

  /** Focuses this UI control. */
  focus() {
    const uiControl = untracked(this.uiControl);
    if (uiControl?.focus) {
      uiControl.focus();
    } else {
      this.element.focus();
    }
  }
}

// We can't add `implements ɵFormFieldDirective<T>` to `Field` even though it should conform to the interface.
// Instead we enforce it here through some utility types.
type Check<T extends true> = T;
type FormFieldImplementsɵFormFieldDirective = Check<
  FormField<any> extends ɵFormFieldDirective<any> ? true : false
>;
