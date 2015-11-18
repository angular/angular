import { ProtoRecord } from './proto_record';
import { ChangeDetectionStrategy } from './constants';
import { BindingTarget } from './binding_record';
import { DirectiveIndex } from './directive_record';
import { SelectedPipe } from './pipes';
/**
 * Indicates that the result of a {@link PipeMetadata} transformation has changed even though the
 * reference
 * has not changed.
 *
 * The wrapped value will be unwrapped by change detection, and the unwrapped value will be stored.
 *
 * Example:
 *
 * ```
 * if (this._latestValue === this._latestReturnedValue) {
 *    return this._latestReturnedValue;
 *  } else {
 *    this._latestReturnedValue = this._latestValue;
 *    return WrappedValue.wrap(this._latestValue); // this will force update
 *  }
 * ```
 */
export declare class WrappedValue {
    wrapped: any;
    constructor(wrapped: any);
    static wrap(value: any): WrappedValue;
}
export declare class SimpleChange {
    previousValue: any;
    currentValue: any;
    constructor(previousValue: any, currentValue: any);
    isFirstChange(): boolean;
}
export declare class ChangeDetectionUtil {
    static uninitialized: Object;
    static arrayFn0(): any[];
    static arrayFn1(a1: any): any[];
    static arrayFn2(a1: any, a2: any): any[];
    static arrayFn3(a1: any, a2: any, a3: any): any[];
    static arrayFn4(a1: any, a2: any, a3: any, a4: any): any[];
    static arrayFn5(a1: any, a2: any, a3: any, a4: any, a5: any): any[];
    static arrayFn6(a1: any, a2: any, a3: any, a4: any, a5: any, a6: any): any[];
    static arrayFn7(a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any): any[];
    static arrayFn8(a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any): any[];
    static arrayFn9(a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8: any, a9: any): any[];
    static operation_negate(value: any): any;
    static operation_add(left: any, right: any): any;
    static operation_subtract(left: any, right: any): any;
    static operation_multiply(left: any, right: any): any;
    static operation_divide(left: any, right: any): any;
    static operation_remainder(left: any, right: any): any;
    static operation_equals(left: any, right: any): any;
    static operation_not_equals(left: any, right: any): any;
    static operation_identical(left: any, right: any): any;
    static operation_not_identical(left: any, right: any): any;
    static operation_less_then(left: any, right: any): any;
    static operation_greater_then(left: any, right: any): any;
    static operation_less_or_equals_then(left: any, right: any): any;
    static operation_greater_or_equals_then(left: any, right: any): any;
    static cond(cond: any, trueVal: any, falseVal: any): any;
    static mapFn(keys: any[]): any;
    static keyedAccess(obj: any, args: any): any;
    static unwrapValue(value: any): any;
    static changeDetectionMode(strategy: ChangeDetectionStrategy): ChangeDetectionStrategy;
    static simpleChange(previousValue: any, currentValue: any): SimpleChange;
    static isValueBlank(value: any): boolean;
    static s(value: any): string;
    static protoByIndex(protos: ProtoRecord[], selfIndex: number): ProtoRecord;
    static callPipeOnDestroy(selectedPipe: SelectedPipe): void;
    static bindingTarget(mode: string, elementIndex: number, name: string, unit: string, debug: string): BindingTarget;
    static directiveIndex(elementIndex: number, directiveIndex: number): DirectiveIndex;
    static looseNotIdentical(a: any, b: any): boolean;
}
