/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Host, Input, OnDestroy, Optional, Provider, Renderer, forwardRef, ɵlooseIdentical as looseIdentical} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';

export const SELECT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectControlValueAccessor),
  multi: true
};

function _buildValueString(id: string | null, value: any): string {
  if (id == null) return `${value}`;
  if (value && typeof value === 'object') value = 'Object';
  return `${id}: ${value}`.slice(0, 50);
}

function _extractId(valueString: string): string {
  return valueString.split(':')[0];
}

/**
 * @whatItDoes Writes values and listens to changes on a select element.
 *
 * Used by {@link NgModel}, {@link FormControlDirective}, and {@link FormControlName}
 * to keep the view synced with the {@link FormControl} model.
 *
 * @howToUse
 *
 * If you have imported the {@link FormsModule} or the {@link ReactiveFormsModule}, this
 * value accessor will be active on any select control that has a form directive. You do
 * **not** need to add a special selector to activate it.
 *
 * ### How to use select controls with form directives
 *
 * To use a select in a template-driven form, simply add an `ngModel` and a `name`
 * attribute to the main `<select>` tag.
 *
 * If your option values are simple strings, you can bind to the normal `value` property
 * on the option.  If your option values happen to be objects (and you'd like to save the
 * selection in your form as an object), use `ngValue` instead:
 *
 * {@example forms/ts/selectControl/select_control_example.ts region='Component'}
 *
 * In reactive forms, you'll also want to add your form directive (`formControlName` or
 * `formControl`) on the main `<select>` tag. Like in the former example, you have the
 * choice of binding to the  `value` or `ngValue` property on the select's options.
 *
 * {@example forms/ts/reactiveSelectControl/reactive_select_control_example.ts region='Component'}
 *
 * ### Caveat: Option selection
 *
 * Angular uses object identity to select option. It's possible for the identities of items
 * to change while the data does not. This can happen, for example, if the items are produced
 * from an RPC to the server, and that RPC is re-run. Even if the data hasn't changed, the
 * second response will produce objects with different identities.
 *
 * To customize the default option comparison algorithm, `<select>` supports `compareWith` input.
 * `compareWith` takes a **function** which has two arguments: `option1` and `option2`.
 * If `compareWith` is given, Angular selects option by the return value of the function.
 *
 * #### Syntax
 *
 * ```
 * <select [compareWith]="compareFn"  [(ngModel)]="selectedCountries">
 *     <option *ngFor="let country of countries" [ngValue]="country">
 *         {{country.name}}
 *     </option>
 * </select>
 *
 * compareFn(c1: Country, c2: Country): boolean {
 *     return c1 && c2 ? c1.id === c2.id : c1 === c2;
 * }
 * ```
 *
 * Note: We listen to the 'change' event because 'input' events aren't fired
 * for selects in Firefox and IE:
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1024350
 * https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4660045/
 *
 * * **npm package**: `@angular/forms`
 *
 * @stable
 */
@Directive({
  selector:
      'select:not([multiple])[formControlName],select:not([multiple])[formControl],select:not([multiple])[ngModel]',
  host: {'(change)': 'onChange($event.target.value)', '(blur)': 'onTouched()'},
  providers: [SELECT_VALUE_ACCESSOR]
})
export class SelectControlValueAccessor implements ControlValueAccessor {
  value: any;
  /** @internal */
  _optionMap: Map<string, any> = new Map<string, any>();
  /** @internal */
  _idCounter: number = 0;

  onChange = (_: any) => {};
  onTouched = () => {};

  @Input()
  set compareWith(fn: (o1: any, o2: any) => boolean) {
    if (typeof fn !== 'function') {
      throw new Error(`compareWith must be a function, but received ${JSON.stringify(fn)}`);
    }
    this._compareWith = fn;
  }

  private _compareWith: (o1: any, o2: any) => boolean = looseIdentical;

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  writeValue(value: any): void {
    this.value = value;
    const id: string|null = this._getOptionId(value);
    if (id == null) {
      this._renderer.setElementProperty(this._elementRef.nativeElement, 'selectedIndex', -1);
    }
    const valueString = _buildValueString(id, value);
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', valueString);
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = (valueString: string) => {
      this.value = valueString;
      fn(this._getOptionValue(valueString));
    };
  }
  registerOnTouched(fn: () => any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }

  /** @internal */
  _registerOption(): string { return (this._idCounter++).toString(); }

  /** @internal */
  _getOptionId(value: any): string|null {
    for (const id of Array.from(this._optionMap.keys())) {
      if (this._compareWith(this._optionMap.get(id), value)) return id;
    }
    return null;
  }

  /** @internal */
  _getOptionValue(valueString: string): any {
    const id: string = _extractId(valueString);
    return this._optionMap.has(id) ? this._optionMap.get(id) : valueString;
  }
}

/**
 * @whatItDoes Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * @howToUse
 *
 * See docs for {@link SelectControlValueAccessor} for usage examples.
 *
 * @stable
 */
@Directive({selector: 'option'})
export class NgSelectOption implements OnDestroy {
  id: string;

  constructor(
      private _element: ElementRef, private _renderer: Renderer,
      @Optional() @Host() private _select: SelectControlValueAccessor) {
    if (this._select) this.id = this._select._registerOption();
  }

  @Input('ngValue')
  set ngValue(value: any) {
    if (this._select == null) return;
    this._select._optionMap.set(this.id, value);
    this._setElementValue(_buildValueString(this.id, value));
    this._select.writeValue(this._select.value);
  }

  @Input('value')
  set value(value: any) {
    this._setElementValue(value);
    if (this._select) this._select.writeValue(this._select.value);
  }

  /** @internal */
  _setElementValue(value: string): void {
    this._renderer.setElementProperty(this._element.nativeElement, 'value', value);
  }

  ngOnDestroy(): void {
    if (this._select) {
      this._select._optionMap.delete(this.id);
      this._select.writeValue(this._select.value);
    }
  }
}
