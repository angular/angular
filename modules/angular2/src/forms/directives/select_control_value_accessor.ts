import {Directive, Query, QueryList, Renderer, ElementRef} from 'angular2/angular2';
import {NgControl} from './ng_control';
import {ControlValueAccessor} from './control_value_accessor';
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
    '[class.ng-untouched]': 'cd.control?.untouched == true',
    '[class.ng-touched]': 'cd.control?.touched == true',
    '[class.ng-pristine]': 'cd.control?.pristine == true',
    '[class.ng-dirty]': 'cd.control?.dirty == true',
    '[class.ng-valid]': 'cd.control?.valid == true',
    '[class.ng-invalid]': 'cd.control?.valid == false'
  }
})
export class SelectControlValueAccessor implements ControlValueAccessor {
  value = '';
  onChange: Function;
  onTouched: Function;

  constructor(private cd: NgControl, private renderer: Renderer, private elementRef: ElementRef,
              @Query(NgSelectOption, {descendants: true}) query: QueryList<NgSelectOption>) {
    this.onChange = (_) => {};
    this.onTouched = (_) => {};
    cd.valueAccessor = this;

    this._updateValueWhenListOfOptionsChanges(query);
  }

  writeValue(value) {
    // both this.value and setProperty are required at the moment
    // remove when a proper imperative API is provided
    this.value = value;
    setProperty(this.renderer, this.elementRef, "value", value);
  }

  registerOnChange(fn): void { this.onChange = fn; }
  registerOnTouched(fn): void { this.onTouched = fn; }

  private _updateValueWhenListOfOptionsChanges(query: QueryList<NgSelectOption>) {
    query.onChange(() => this.writeValue(this.value));
  }
}
