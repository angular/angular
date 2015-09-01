import {BindingRecord} from './binding_record';
import {DirectiveIndex} from './directive_record';

export enum RecordType {
  Self,
  Const,
  PrimitiveOp,
  PropertyRead,
  PropertyWrite,
  Local,
  InvokeMethod,
  InvokeClosure,
  KeyedRead,
  KeyedWrite,
  Pipe,
  Interpolate,
  SafeProperty,
  CollectionLiteral,
  SafeMethodInvoke,
  DirectiveLifecycle,
  Chain
}

export class ProtoRecord {
  constructor(public mode: RecordType, public name: string, public funcOrValue, public args: any[],
              public fixedArgs: any[], public contextIndex: number,
              public directiveIndex: DirectiveIndex, public selfIndex: number,
              public bindingRecord: BindingRecord, public lastInBinding: boolean,
              public lastInDirective: boolean, public argumentToPureFunction: boolean,
              public referencedBySelf: boolean, public propertyBindingIndex: number) {}

  isPureFunction(): boolean {
    return this.mode === RecordType.Interpolate || this.mode === RecordType.CollectionLiteral;
  }

  isUsedByOtherRecord(): boolean { return !this.lastInBinding || this.referencedBySelf; }

  shouldBeChecked(): boolean {
    return this.argumentToPureFunction || this.lastInBinding || this.isPureFunction();
  }

  isPipeRecord(): boolean { return this.mode === RecordType.Pipe; }

  isLifeCycleRecord(): boolean { return this.mode === RecordType.DirectiveLifecycle; }
}
