import {List} from 'angular2/src/facade/collection';
import {BindingRecord} from './binding_record';
import {DirectiveIndex} from './directive_record';

export enum RecordType {
  SELF,
  CONST,
  PRIMITIVE_OP,
  PROPERTY,
  LOCAL,
  INVOKE_METHOD,
  INVOKE_CLOSURE,
  KEYED_ACCESS,
  PIPE,
  BINDING_PIPE,
  INTERPOLATE,
  SAFE_PROPERTY,
  SAFE_INVOKE_METHOD,
  DIRECTIVE_LIFECYCLE
}

export class ProtoRecord {
  constructor(public mode: RecordType, public name: string, public funcOrValue,
              public args: List<any>, public fixedArgs: List<any>, public contextIndex: number,
              public directiveIndex: DirectiveIndex, public selfIndex: number,
              public bindingRecord: BindingRecord, public expressionAsString: string,
              public lastInBinding: boolean, public lastInDirective: boolean) {}

  isPureFunction(): boolean {
    return this.mode === RecordType.INTERPOLATE || this.mode === RecordType.PRIMITIVE_OP;
  }

  isPipeRecord(): boolean {
    return this.mode === RecordType.PIPE || this.mode === RecordType.BINDING_PIPE;
  }

  isLifeCycleRecord(): boolean { return this.mode === RecordType.DIRECTIVE_LIFECYCLE; }
}
