import {Directive, Query, QueryList, Renderer, ElementRef} from 'angular2/angular2';
import {NgControl} from './ng_control';
import {ControlValueAccessor} from './control_value_accessor';
import {isPresent} from 'angular2/src/facade/lang';
import {setProperty} from './shared';

/**
 * Marks <option> as dynamic, so Angular can be notified when options change.
 *
 * #Example:
 * ```
 * <select ng-control="city">
 *   <option *ng-for="#c of cities" [value]="c"></option>
 * </select>
 * ``
 * @exportedAs angular2/forms
 */
@Directive({selector: 'option'})
export class NgSelectOption {
}

/**
 * The accessor for writing a value and listening to changes on a select element.
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector: 'select[ng-control],select[ng-form-control],select[ng-model]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
    '[value]': 'value',
    '[class.ng-untouched]': 'ngClassUntouched',
    '[class.ng-touched]': 'ngClassTouched',
    '[class.ng-pristine]': 'ngClassPristine',
    '[class.ng-dirty]': 'ngClassDirty',
    '[class.ng-valid]': 'ngClassValid',
    '[class.ng-invalid]': 'ngClassInvalid'
  }
})
export class SelectControlValueAccessor implements ControlValueAccessor {
  value = '';
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private cd: NgControl, private renderer: Renderer, private elementRef: ElementRef,
              @Query(NgSelectOption, {descendants: true}) query: QueryList<NgSelectOption>) {
    cd.valueAccessor = this;

    this._updateValueWhenListOfOptionsChanges(query);
  }

  writeValue(value) {
    // both this.value and setProperty are required at the moment
    // remove when a proper imperative API is provided
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

  registerOnChange(fn): void { this.onChange = fn; }
  registerOnTouched(fn): void { this.onTouched = fn; }

  private _updateValueWhenListOfOptionsChanges(query: QueryList<NgSelectOption>) {
    query.onChange(() => this.writeValue(this.value));
  }
}
