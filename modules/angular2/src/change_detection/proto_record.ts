import {List} from 'angular2/src/facade/collection';
import {BindingRecord} from './binding_record';
import {DirectiveIndex} from './directive_record';

export enum RecordType {
  SELF,
  CONST,
  PRIMITIVE_OP,
  PROPERTY_READ,
  PROPERTY_WRITE,
  LOCAL,
  INVOKE_METHOD,
  INVOKE_CLOSURE,
  KEYED_READ,
  KEYED_WRITE,
  PIPE,
  INTERPOLATE,
  SAFE_PROPERTY,
  COLLECTION_LITERAL,
  SAFE_INVOKE_METHOD,
  DIRECTIVE_LIFECYCLE,
  CHAIN
}

export class ProtoRecord {
  constructor(public mode: RecordType, public name: string, public funcOrValue,
              public args: List<any>, public fixedArgs: List<any>, public contextIndex: number,
              public directiveIndex: DirectiveIndex, public selfIndex: number,
              public bindingRecord: BindingRecord, public expressionAsString: string,
              public lastInBinding: boolean, public lastInDirective: boolean,
              public argumentToPureFunction: boolean, public referencedBySelf: boolean) {}

  isPureFunction(): boolean {
    return this.mode === RecordType.INTERPOLATE || this.mode === RecordType.COLLECTION_LITERAL;
  }

  isUsedByOtherRecord(): boolean { return !this.lastInBinding || this.referencedBySelf; }

  shouldBeChecked(): boolean {
    return this.argumentToPureFunction || this.lastInBinding || this.isPureFunction();
  }

  isPipeRecord(): boolean { return this.mode === RecordType.PIPE; }

  isLifeCycleRecord(): boolean { return this.mode === RecordType.DIRECTIVE_LIFECYCLE; }
}
