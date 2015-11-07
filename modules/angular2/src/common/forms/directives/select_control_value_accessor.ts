import {Self, forwardRef, Provider} from 'angular2/src/core/di';
import {Renderer} from 'angular2/src/core/render';
import {ElementRef, QueryList} from 'angular2/src/core/linker';
import {Query, Directive} from 'angular2/src/core/metadata';

import {ObservableWrapper} from 'angular2/src/facade/async';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from './control_value_accessor';
import {CONST_EXPR} from 'angular2/src/facade/lang';
import {setProperty} from './shared';

const SELECT_VALUE_ACCESSOR = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => SelectControlValueAccessor), multi: true}));

/**
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * ### Example
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
    '(blur)': 'onTouched()'
  },
  bindings: [SELECT_VALUE_ACCESSOR]
})
export class SelectControlValueAccessor implements ControlValueAccessor {
  value: string;
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private _renderer: Renderer, private _elementRef: ElementRef,
              @Query(NgSelectOption, {descendants: true}) query: QueryList<NgSelectOption>) {
    this._updateValueWhenListOfOptionsChanges(query);
  }

  writeValue(value: any): void {
    this.value = value;
    setProperty(this._renderer, this._elementRef, "value", value);
  }

  registerOnChange(fn: () => any): void { this.onChange = fn; }
  registerOnTouched(fn: () => any): void { this.onTouched = fn; }

  private _updateValueWhenListOfOptionsChanges(query: QueryList<NgSelectOption>) {
    ObservableWrapper.subscribe(query.changes, (_) => this.writeValue(this.value));
  }
}
