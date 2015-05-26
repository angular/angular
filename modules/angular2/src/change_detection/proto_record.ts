import {List} from 'angular2/src/facade/collection';
import {BindingRecord} from './binding_record';
import {DirectiveIndex} from './directive_record';

export const RECORD_TYPE_SELF = 0;
export const RECORD_TYPE_CONST = 1;
export const RECORD_TYPE_PRIMITIVE_OP = 2;
export const RECORD_TYPE_PROPERTY = 3;
export const RECORD_TYPE_LOCAL = 4;
export const RECORD_TYPE_INVOKE_METHOD = 5;
export const RECORD_TYPE_INVOKE_CLOSURE = 6;
export const RECORD_TYPE_KEYED_ACCESS = 7;
export const RECORD_TYPE_PIPE = 8;
export const RECORD_TYPE_BINDING_PIPE = 9;
export const RECORD_TYPE_INTERPOLATE = 10;
export const RECORD_TYPE_SAFE_PROPERTY = 11;
export const RECORD_TYPE_SAFE_INVOKE_METHOD = 12;

export class ProtoRecord {
  constructor(public mode: number, public name: string, public funcOrValue, public args: List<any>,
              public fixedArgs: List<any>, public contextIndex: number,
              public directiveIndex: DirectiveIndex, public selfIndex: number,
              public bindingRecord: BindingRecord, public expressionAsString: string,
              public lastInBinding: boolean, public lastInDirective: boolean) {}

  isPureFunction(): boolean {
    return this.mode === RECORD_TYPE_INTERPOLATE || this.mode === RECORD_TYPE_PRIMITIVE_OP;
  }
}
