import {Self} from 'angular2/src/core/di';
import {Renderer} from 'angular2/src/core/render';
import {ElementRef, QueryList} from 'angular2/src/core/compiler';
import {Query, Directive, HostListener, HostBinding} from 'angular2/src/core/metadata';

import {NgControl} from './ng_control';
import {ControlValueAccessor} from './control_value_accessor';
import {isPresent} from 'angular2/src/core/facade/lang';
import {ObservableWrapper} from 'angular2/src/core/facade/async';
import {setProperty} from './shared';

/**
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
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
@Directive({selector: 'select[ng-control],select[ng-form-control],select[ng-model]'})
export class SelectControlValueAccessor implements ControlValueAccessor {
  private _cd: NgControl;
  value: string;
  @HostListener('change', ['$event.target.value'])
  @HostListener('input', ['$event.target.value'])
  onChange = (_) => {};
  @HostListener('blur') onTouched = () => {};

  constructor(@Self() cd: NgControl, private _renderer: Renderer, private _elementRef: ElementRef,
              @Query(NgSelectOption, {descendants: true}) query: QueryList<NgSelectOption>) {
    this._cd = cd;
    cd.valueAccessor = this;
    this._updateValueWhenListOfOptionsChanges(query);
  }

  writeValue(value: any): void {
    this.value = value;
    setProperty(this._renderer, this._elementRef, "value", value);
  }

  @HostBinding('class.ng-untouched')
  get ngClassUntouched(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.untouched : false;
  }

  @HostBinding('class.ng-touched')
  get ngClassTouched(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.touched : false;
  }

  @HostBinding('class.ng-pristine')
  get ngClassPristine(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.pristine : false;
  }

  @HostBinding('class.ng-dirty')
  get ngClassDirty(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.dirty : false;
  }

  @HostBinding('class.ng-valid')
  get ngClassValid(): boolean {
    return isPresent(this._cd.control) ? this._cd.control.valid : false;
  }

  @HostBinding('class.ng-invalid')
  get ngClassInvalid(): boolean {
    return isPresent(this._cd.control) ? !this._cd.control.valid : false;
  }

  registerOnChange(fn: () => any): void { this.onChange = fn; }
  registerOnTouched(fn: () => any): void { this.onTouched = fn; }

  private _updateValueWhenListOfOptionsChanges(query: QueryList<NgSelectOption>) {
    ObservableWrapper.subscribe(query.changes, (_) => this.writeValue(this.value));
  }
}
