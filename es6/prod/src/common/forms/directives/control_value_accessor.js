import { OpaqueToken } from 'angular2/core';
import { CONST_EXPR } from 'angular2/src/facade/lang';
/**
 * Used to provide a {@link ControlValueAccessor} for form controls.
 *
 * See {@link DefaultValueAccessor} for how to implement one.
 */
export const NG_VALUE_ACCESSOR = CONST_EXPR(new OpaqueToken("NgValueAccessor"));
