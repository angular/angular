import {Renderer} from 'angular2/render';
import {ElementRef, QueryList} from 'angular2/core';
import {Self} from 'angular2/di';
import {Query, Directive} from 'angular2/metadata';

import {NgControl} from './ng_control';
import {ControlValueAccessor} from './control_value_accessor';
import {isPresent} from 'angular2/src/core/facade/lang';
import {setProperty} from './shared';

/**
 * Marks <option> as dynamic, so Angular can be notified when options change.
 *
 * #Example:
 *
 * ```
 * <select ng-control="city">
 *   <option *ng-for="#c of cities" [value]="c"></option>
 * </select>
 * ```
 */
@Directive({selector: 'option'})
export class NgSelectOption {
}

/**
 * The accessor for writing a value and listening to changes on a select element.
 */
@Directive({
  selector: 'select[ng-control],select[ng-form-control],select[ng-model]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
    '[class.ng-untouched]': 'ngClassUntouched',
    '[class.ng-touched]': 'ngClassTouched',
    '[class.ng-pristine]': 'ngClassPristine',
    '[class.ng-dirty]': 'ngClassDirty',
    '[class.ng-valid]': 'ngClassValid',
    '[class.ng-invalid]': 'ngClassInvalid'
  }
})
export class SelectControlValueAccessor implements ControlValueAccessor {
  private cd: NgControl;
  value: string;
  onChange = (_) => {};
  onTouched = () => {};

  constructor(@Self() cd: NgControl, private renderer: Renderer, private elementRef: ElementRef,
              @Query(NgSelectOption, {descendants: true}) query: QueryList<NgSelectOption>) {
    this.cd = cd;
    cd.valueAccessor = this;
    this._updateValueWhenListOfOptionsChanges(query);
  }

  writeValue(value: any) {
    this.value = value;
    setProperty(this.renderer, this.elementRef, "value", value);
  }

  get ngClassUntouched(): boolean {
    return isPresent(this.cd.control) ? this.cd.control.untouched : false;
  }
  get ngClassTouched(): boolean {
    return isPresent(this.cd.control) ? this.cd.control.touched : false;
  }
  get ngClassPristine(): boolean {
    return isPresent(this.cd.control) ? this.cd.control.pristine : false;
  }
  get ngClassDirty(): boolean { return isPresent(this.cd.control) ? this.cd.control.dirty : false; }
  get ngClassValid(): boolean { return isPresent(this.cd.control) ? this.cd.control.valid : false; }
  get ngClassInvalid(): boolean {
    return isPresent(this.cd.control) ? !this.cd.control.valid : false;
  }

  registerOnChange(fn: () => any): void { this.onChange = fn; }
  registerOnTouched(fn: () => any): void { this.onTouched = fn; }

  private _updateValueWhenListOfOptionsChanges(query: QueryList<NgSelectOption>) {
    query.onChange(() => this.writeValue(this.value));
  }
}
