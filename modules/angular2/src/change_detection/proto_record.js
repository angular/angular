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

export class ProtoRecord {
  mode:number;
  name:string;
  funcOrValue:any;
  args:List;
  fixedArgs:List;

  contextIndex:number;
  directiveIndex:DirectiveIndex;

  selfIndex:number;
  bindingRecord:BindingRecord;
  lastInBinding:boolean;
  lastInDirective:boolean;
  expressionAsString:string;

  constructor(mode:number,
              name:string,
              funcOrValue,
              args:List,
              fixedArgs:List,
              contextIndex:number,
              directiveIndex:DirectiveIndex,
              selfIndex:number,
              bindingRecord:BindingRecord,
              expressionAsString:string,
              lastInBinding:boolean,
              lastInDirective:boolean) {

    this.mode = mode;
    this.name = name;
    this.funcOrValue = funcOrValue;
    this.args = args;
    this.fixedArgs = fixedArgs;

    this.contextIndex = contextIndex;
    this.directiveIndex = directiveIndex;

    this.selfIndex = selfIndex;
    this.bindingRecord = bindingRecord;
    this.lastInBinding = lastInBinding;
    this.lastInDirective = lastInDirective;
    this.expressionAsString = expressionAsString;
  }

  isPureFunction():boolean {
    return this.mode === RECORD_TYPE_INTERPOLATE ||
      this.mode === RECORD_TYPE_PRIMITIVE_OP;
  }
}
