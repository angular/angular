import {Directive} from 'angular2/src/core/metadata';
import {ElementRef} from 'angular2/src/core/linker';
import {Renderer} from 'angular2/src/core/render';
import {Self, forwardRef, Provider} from 'angular2/src/core/di';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from './control_value_accessor';
import {isBlank, CONST_EXPR} from 'angular2/src/core/facade/lang';
import {setProperty} from './shared';

const DEFAULT_VALUE_ACCESSOR = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => DefaultValueAccessor), multi: true}));

/**
 * The default accessor for writing a value and listening to changes that is used by the
 * {@link NgModel}, {@link NgFormControl}, and {@link NgControlName} directives.
 *
 *  # Example
 *  ```
 *  <input type="text" [(ng-model)]="searchQuery">
 *  ```
 */
@Directive({
  selector: '[ng-control],[ng-model],[ng-form-control]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()'
  },
  bindings: [DEFAULT_VALUE_ACCESSOR]
})
export class DefaultValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  writeValue(value: any): void {
    var normalizedValue = isBlank(value) ? '' : value;
    setProperty(this._renderer, this._elementRef, 'value', normalizedValue);
  }

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
