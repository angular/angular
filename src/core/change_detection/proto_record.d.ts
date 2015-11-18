import { BindingRecord } from './binding_record';
import { DirectiveIndex } from './directive_record';
export declare enum RecordType {
    Self = 0,
    Const = 1,
    PrimitiveOp = 2,
    PropertyRead = 3,
    PropertyWrite = 4,
    Local = 5,
    InvokeMethod = 6,
    InvokeClosure = 7,
    KeyedRead = 8,
    KeyedWrite = 9,
    Pipe = 10,
    Interpolate = 11,
    SafeProperty = 12,
    CollectionLiteral = 13,
    SafeMethodInvoke = 14,
    DirectiveLifecycle = 15,
    Chain = 16,
    SkipRecordsIf = 17,
    SkipRecordsIfNot = 18,
    SkipRecords = 19,
}
export declare class ProtoRecord {
    mode: RecordType;
    name: string;
    funcOrValue: any;
    args: any[];
    fixedArgs: any[];
    contextIndex: number;
    directiveIndex: DirectiveIndex;
    selfIndex: number;
    bindingRecord: BindingRecord;
    lastInBinding: boolean;
    lastInDirective: boolean;
    argumentToPureFunction: boolean;
    referencedBySelf: boolean;
    propertyBindingIndex: number;
    constructor(mode: RecordType, name: string, funcOrValue: any, args: any[], fixedArgs: any[], contextIndex: number, directiveIndex: DirectiveIndex, selfIndex: number, bindingRecord: BindingRecord, lastInBinding: boolean, lastInDirective: boolean, argumentToPureFunction: boolean, referencedBySelf: boolean, propertyBindingIndex: number);
    isPureFunction(): boolean;
    isUsedByOtherRecord(): boolean;
    shouldBeChecked(): boolean;
    isPipeRecord(): boolean;
    isConditionalSkipRecord(): boolean;
    isUnconditionalSkipRecord(): boolean;
    isSkipRecord(): boolean;
    isLifeCycleRecord(): boolean;
}
