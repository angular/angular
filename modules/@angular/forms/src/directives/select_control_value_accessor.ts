/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Host, Input, OnDestroy, Optional, Renderer, forwardRef} from '@angular/core';

import {MapWrapper} from '../facade/collection';
import {StringWrapper, isBlank, isPresent, isPrimitive, looseIdentical} from '../facade/lang';

import {ControlValueAccessor, NG_VALUE_ACCESSOR} from './control_value_accessor';

export const SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectControlValueAccessor),
  multi: true
};

function _buildValueString(id: string, value: any): string {
  if (isBlank(id)) return `${value}`;
  if (!isPrimitive(value)) value = 'Object';
  return StringWrapper.slice(`${id}: ${value}`, 0, 50);
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

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  writeValue(value: any): void {
    this.value = value;
    var valueString = _buildValueString(this._getOptionId(value), value);
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
  _getOptionId(value: any): string {
    for (let id of MapWrapper.keys(this._optionMap)) {
      if (looseIdentical(this._optionMap.get(id), value)) return id;
    }
    return null;
  }

  /** @internal */
  _getOptionValue(valueString: string): any {
    let value = this._optionMap.get(_extractId(valueString));
    return isPresent(value) ? value : valueString;
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
    if (isPresent(this._select)) this.id = this._select._registerOption();
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
    if (isPresent(this._select)) this._select.writeValue(this._select.value);
  }

  /** @internal */
  _setElementValue(value: string): void {
    this._renderer.setElementProperty(this._element.nativeElement, 'value', value);
  }

  ngOnDestroy() {
    if (isPresent(this._select)) {
      this._select._optionMap.delete(this.id);
      this._select.writeValue(this._select.value);
    }
  }
}
