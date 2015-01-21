export {AST} from './parser/ast';
export {Lexer} from './parser/lexer';
export {Parser} from './parser/parser';
export {ContextWithVariableBindings} from './parser/context_with_variable_bindings';

export {ExpressionChangedAfterItHasBeenChecked, ChangeDetectionError} from './exceptions';
export {ChangeRecord, ChangeDispatcher, ChangeDetector} from './interfaces';
export {ProtoChangeDetector, DynamicProtoChangeDetector, JitProtoChangeDetector} from './proto_change_detector';
export {DynamicChangeDetector} from './dynamic_change_detector';

import {ProtoChangeDetector, DynamicProtoChangeDetector, JitProtoChangeDetector} from './proto_change_detector';

export class ChangeDetection {
  createProtoChangeDetector(name:string){}
}

export class DynamicChangeDetection extends ChangeDetection {
  createProtoChangeDetector(name:string):ProtoChangeDetector{
    return new DynamicProtoChangeDetector();
  }
}

export class JitChangeDetection extends ChangeDetection {
  createProtoChangeDetector(name:string):ProtoChangeDetector{
    return new JitProtoChangeDetector();
  }
}

export var dynamicChangeDetection = new DynamicChangeDetection();
export var jitChangeDetection = new JitChangeDetection();