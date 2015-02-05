export {AST} from './src/parser/ast';
export {Lexer} from './src/parser/lexer';
export {Parser} from './src/parser/parser';
export {ContextWithVariableBindings} from './src/parser/context_with_variable_bindings';

export {ExpressionChangedAfterItHasBeenChecked, ChangeDetectionError} from './src/exceptions';
export {ChangeRecord, ChangeDispatcher, ChangeDetector,
  CHECK_ONCE, CHECK_ALWAYS, DETACHED, CHECKED} from './src/interfaces';
export {ProtoChangeDetector, DynamicProtoChangeDetector, JitProtoChangeDetector} from './src/proto_change_detector';
export {DynamicChangeDetector} from './src/dynamic_change_detector';

import {ProtoChangeDetector, DynamicProtoChangeDetector, JitProtoChangeDetector} from './src/proto_change_detector';

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