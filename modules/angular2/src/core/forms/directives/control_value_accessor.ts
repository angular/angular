import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {OpaqueToken} from 'angular2/src/core/di';

/**
 * A bridge between a control and a native element.
 *
 * Please see {@link DefaultValueAccessor} for more information.
 */
export interface ControlValueAccessor {
  writeValue(obj: any): void;
  registerOnChange(fn: any): void;
  registerOnTouched(fn: any): void;
}

export const NG_VALUE_ACCESSOR: OpaqueToken = CONST_EXPR(new OpaqueToken("NgValueAccessor"));