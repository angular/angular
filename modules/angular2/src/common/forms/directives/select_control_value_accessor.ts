import {
  Directive,
  Renderer,
  forwardRef,
  Provider,
  ElementRef,
  Input,
  Host,
  OnDestroy,
  Optional
} from 'angular2/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from './control_value_accessor';
import {
  CONST_EXPR,
  StringWrapper,
  isPrimitive,
  isPresent,
  isBlank,
  looseIdentical
} from 'angular2/src/facade/lang';

import {MapWrapper} from 'angular2/src/facade/collection';

const SELECT_VALUE_ACCESSOR = CONST_EXPR(new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => SelectControlValueAccessor), multi: true}));

function _buildValueString(id: string, value: any): string {
  if (isBlank(id)) return `${value}`;
  if (!isPrimitive(value)) value = "Object";
  return StringWrapper.slice(`${id}: ${value}`, 0, 50);
}

function _extractId(valueString: string): string {
  return valueString.split(":")[0];
}

/**
 * The accessor for writing a value and listening to changes on a select element.
 */
@Directive({
  selector: 'select[ngControl],select[ngFormControl],select[ngModel]',
  host: {'(input)': 'onChange($event.target.value)', '(blur)': 'onTouched()'},
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
    this.onChange = (valueString: string) => { fn(this._getOptionValue(valueString)); };
  }
  registerOnTouched(fn: () => any): void { this.onTouched = fn; }

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
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * ### Example
 *
 * ```
 * <select ngControl="city">
 *   <option *ngFor="#c of cities" [value]="c"></option>
 * </select>
 * ```
 */
@Directive({selector: 'option'})
export class NgSelectOption implements OnDestroy {
  id: string;

  constructor(private _element: ElementRef, private _renderer: Renderer,
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
