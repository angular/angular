/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef, InjectionToken, Provider, Renderer2 } from '@angular/core';
import { BaseControlValueAccessor, ControlValueAccessor } from './control_value_accessor';
export declare const DEFAULT_VALUE_ACCESSOR: Provider;
/**
 * @description
 * Provide this token to control if form directives buffer IME input until
 * the "compositionend" event occurs.
 * @publicApi
 */
export declare const COMPOSITION_BUFFER_MODE: InjectionToken<boolean>;
/**
 * The default `ControlValueAccessor` for writing a value and listening to changes on input
 * elements. The accessor is used by the `FormControlDirective`, `FormControlName`, and
 * `NgModel` directives.
 *
 *
 * @usageNotes
 *
 * ### Using the default value accessor
 *
 * The following example shows how to use an input element that activates the default value accessor
 * (in this case, a text field).
 *
 * ```ts
 * const firstNameControl = new FormControl();
 * ```
 *
 * ```html
 * <input type="text" [formControl]="firstNameControl">
 * ```
 *
 * This value accessor is used by default for `<input type="text">` and `<textarea>` elements, but
 * you could also use it for custom components that have similar behavior and do not require special
 * processing. In order to attach the default value accessor to a custom element, add the
 * `ngDefaultControl` attribute as shown below.
 *
 * ```html
 * <custom-input-component ngDefaultControl [(ngModel)]="value"></custom-input-component>
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export declare class DefaultValueAccessor extends BaseControlValueAccessor implements ControlValueAccessor {
    private _compositionMode;
    /** Whether the user is creating a composition string (IME events). */
    private _composing;
    constructor(renderer: Renderer2, elementRef: ElementRef, _compositionMode: boolean);
    /**
     * Sets the "value" property on the input element.
     * @docs-private
     */
    writeValue(value: any): void;
    /** @internal */
    _handleInput(value: any): void;
    /** @internal */
    _compositionStart(): void;
    /** @internal */
    _compositionEnd(value: any): void;
}
