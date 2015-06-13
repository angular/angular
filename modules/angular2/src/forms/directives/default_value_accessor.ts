import {Directive, Renderer, ElementRef} from 'angular2/angular2';
import {NgControl} from './ng_control';
import {ControlValueAccessor} from './control_value_accessor';
import {isBlank} from 'angular2/src/facade/lang';
import {setProperty} from './shared';

/**
 * The default accessor for writing a value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  # Example
 *  ```
 *  <input type="text" [(ng-model)]="searchQuery">
 *  ```
 *
 * @exportedAs angular2/forms
 */
@Directive({
  selector:
      'input:not([type=checkbox])[ng-control],textarea[ng-control],input:not([type=checkbox])[ng-form-control],textarea[ng-form-control],input:not([type=checkbox])[ng-model],textarea[ng-model]',
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
export class DefaultValueAccessor implements ControlValueAccessor {
  value: string = null;
  onChange: Function;
  onTouched: Function;

  constructor(private cd: NgControl, private renderer: Renderer, private elementRef: ElementRef) {
    this.onChange = (_) => {};
    this.onTouched = (_) => {};
    cd.valueAccessor = this;
  }

  writeValue(value) {
    // both this.value and setProperty are required at the moment
    // remove when a proper imperative API is provided
    this.value = isBlank(value) ? '' : value;
    setProperty(this.renderer, this.elementRef, 'value', this.value);
  }

  registerOnChange(fn): void { this.onChange = fn; }

  registerOnTouched(fn): void { this.onTouched = fn; }
}
