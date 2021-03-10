/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, forwardRef, Host, Input, OnDestroy, Optional, Renderer2, StaticProvider} from '@angular/core';

import {BuiltInControlValueAccessor, ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';

export const SELECT_MULTIPLE_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectMultipleControlValueAccessor),
  multi: true
};

function _buildValueString(id: string, value: any): string {
  if (id == null) return `${value}`;
  if (typeof value === 'string') value = `'${value}'`;
  if (value && typeof value === 'object') value = 'Object';
  return `${id}: ${value}`.slice(0, 50);
}

function _extractId(valueString: string): string {
  return valueString.split(':')[0];
}

/** Mock interface for HTML Options */
interface HTMLOption {
  value: string;
  selected: boolean;
}

/** Mock interface for HTMLCollection */
abstract class HTMLCollection {
  // TODO(issue/24571): remove '!'.
  length!: number;
  abstract item(_: number): HTMLOption;
}

/**
 * @description
 * The `ControlValueAccessor` for writing multi-select control values and listening to multi-select
 * control changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
 * `NgModel` directives.
 *
 * @see `SelectControlValueAccessor`
 *
 * @usageNotes
 *
 * ### Using a multi-select control
 *
 * The follow example shows you how to use a multi-select control with a reactive form.
 *
 * ```ts
 * const countryControl = new FormControl();
 * ```
 *
 * ```
 * <select multiple name="countries" [formControl]="countryControl">
 *   <option *ngFor="let country of countries" [ngValue]="country">
 *     {{ country.name }}
 *   </option>
 * </select>
 * ```
 *
 * ### Customizing option selection
 *
 * To customize the default option comparison algorithm, `<select>` supports `compareWith` input.
 * See the `SelectControlValueAccessor` for usage.
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({
  selector:
      'select[multiple][formControlName],select[multiple][formControl],select[multiple][ngModel]',
  host: {'(change)': 'onChange($event.target)', '(blur)': 'onTouched()'},
  providers: [SELECT_MULTIPLE_VALUE_ACCESSOR]
})
export class SelectMultipleControlValueAccessor extends BuiltInControlValueAccessor implements
    ControlValueAccessor {
  /**
   * The current value.
   * @nodoc
   */
  value: any;

  /** @internal */
  _optionMap: Map<string, ɵNgSelectMultipleOption> = new Map<string, ɵNgSelectMultipleOption>();

  /** @internal */
  _idCounter: number = 0;

  /**
   * The registered callback function called when a change event occurs on the input element.
   * @nodoc
   */
  onChange = (_: any) => {};

  /**
   * The registered callback function called when a blur event occurs on the input element.
   * @nodoc
   */
  onTouched = () => {};

  /**
   * @description
   * Tracks the option comparison algorithm for tracking identities when
   * checking for changes.
   */
  @Input()
  set compareWith(fn: (o1: any, o2: any) => boolean) {
    if (typeof fn !== 'function' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw new Error(`compareWith must be a function, but received ${JSON.stringify(fn)}`);
    }
    this._compareWith = fn;
  }

  private _compareWith: (o1: any, o2: any) => boolean = Object.is;

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {
    super();
  }

  /**
   * Sets the "value" property on one or of more of the select's options.
   * @nodoc
   */
  writeValue(value: any): void {
    this.value = value;
    let optionSelectedStateSetter: (opt: ɵNgSelectMultipleOption, o: any) => void;
    if (Array.isArray(value)) {
      // convert values to ids
      const ids = value.map((v) => this._getOptionId(v));
      optionSelectedStateSetter = (opt, o) => {
        opt._setSelected(ids.indexOf(o.toString()) > -1);
      };
    } else {
      optionSelectedStateSetter = (opt, o) => {
        opt._setSelected(false);
      };
    }
    this._optionMap.forEach(optionSelectedStateSetter);
  }

  /**
   * Registers a function called when the control value changes
   * and writes an array of the selected options.
   * @nodoc
   */
  registerOnChange(fn: (value: any) => any): void {
    this.onChange = (_: any) => {
      const selected: Array<any> = [];
      if (_.selectedOptions !== undefined) {
        const options: HTMLCollection = _.selectedOptions;
        for (let i = 0; i < options.length; i++) {
          const opt: any = options.item(i);
          const val: any = this._getOptionValue(opt.value);
          selected.push(val);
        }
      }
      // Degrade on IE
      else {
        const options: HTMLCollection = <HTMLCollection>_.options;
        for (let i = 0; i < options.length; i++) {
          const opt: HTMLOption = options.item(i);
          if (opt.selected) {
            const val: any = this._getOptionValue(opt.value);
            selected.push(val);
          }
        }
      }
      this.value = selected;
      fn(selected);
    };
  }

  /**
   * Registers a function called when the control is touched.
   * @nodoc
   */
  registerOnTouched(fn: () => any): void {
    this.onTouched = fn;
  }

  /**
   * Sets the "disabled" property on the select input element.
   * @nodoc
   */
  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  /** @internal */
  _registerOption(value: ɵNgSelectMultipleOption): string {
    const id: string = (this._idCounter++).toString();
    this._optionMap.set(id, value);
    return id;
  }

  /** @internal */
  _getOptionId(value: any): string|null {
    for (const id of Array.from(this._optionMap.keys())) {
      if (this._compareWith(this._optionMap.get(id)!._value, value)) return id;
    }
    return null;
  }

  /** @internal */
  _getOptionValue(valueString: string): any {
    const id: string = _extractId(valueString);
    return this._optionMap.has(id) ? this._optionMap.get(id)!._value : valueString;
  }
}

/**
 * @description
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * @see `SelectMultipleControlValueAccessor`
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({selector: 'option'})
export class ɵNgSelectMultipleOption implements OnDestroy {
  // TODO(issue/24571): remove '!'.
  id!: string;
  /** @internal */
  _value: any;

  constructor(
      private _element: ElementRef, private _renderer: Renderer2,
      @Optional() @Host() private _select: SelectMultipleControlValueAccessor) {
    if (this._select) {
      this.id = this._select._registerOption(this);
    }
  }

  /**
   * @description
   * Tracks the value bound to the option element. Unlike the value binding,
   * ngValue supports binding to objects.
   */
  @Input('ngValue')
  set ngValue(value: any) {
    if (this._select == null) return;
    this._value = value;
    this._setElementValue(_buildValueString(this.id, value));
    this._select.writeValue(this._select.value);
  }

  /**
   * @description
   * Tracks simple string values bound to the option element.
   * For objects, use the `ngValue` input binding.
   */
  @Input('value')
  set value(value: any) {
    if (this._select) {
      this._value = value;
      this._setElementValue(_buildValueString(this.id, value));
      this._select.writeValue(this._select.value);
    } else {
      this._setElementValue(value);
    }
  }

  /** @internal */
  _setElementValue(value: string): void {
    this._renderer.setProperty(this._element.nativeElement, 'value', value);
  }

  /** @internal */
  _setSelected(selected: boolean) {
    this._renderer.setProperty(this._element.nativeElement, 'selected', selected);
  }

  /** @nodoc */
  ngOnDestroy(): void {
    if (this._select) {
      this._select._optionMap.delete(this.id);
      this._select.writeValue(this._select.value);
    }
  }
}

export {ɵNgSelectMultipleOption as NgSelectMultipleOption};
