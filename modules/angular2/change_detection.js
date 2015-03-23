export {
  ASTWithSource, AST, AstTransformer, AccessMember, LiteralArray, ImplicitReceiver
} from './src/change_detection/parser/ast';
export {Lexer} from './src/change_detection/parser/lexer';
export {Parser} from './src/change_detection/parser/parser';
export {Locals}
  from './src/change_detection/parser/locals';
export {ExpressionChangedAfterItHasBeenChecked, ChangeDetectionError}
    from './src/change_detection/exceptions';
export {ProtoChangeDetector, ChangeRecord, ChangeDispatcher, ChangeDetector, ChangeDetection} from './src/change_detection/interfaces';
export {CHECK_ONCE, CHECK_ALWAYS, DETACHED, CHECKED, ON_PUSH, DEFAULT} from './src/change_detection/constants';
export {DynamicProtoChangeDetector, JitProtoChangeDetector, BindingRecord}
    from './src/change_detection/proto_change_detector';
export {DynamicChangeDetector}
    from './src/change_detection/dynamic_change_detector';
export {BindingPropagationConfig}
    from './src/change_detection/binding_propagation_config';
export * from './src/change_detection/pipes/pipe_registry';
export {uninitialized} from './src/change_detection/change_detection_util';
export * from './src/change_detection/pipes/pipe';

import {DynamicProtoChangeDetector, JitProtoChangeDetector}
    from './src/change_detection/proto_change_detector';
import {PipeRegistry} from './src/change_detection/pipes/pipe_registry';
import {IterableChangesFactory} from './src/change_detection/pipes/iterable_changes';
import {KeyValueChangesFactory} from './src/change_detection/pipes/keyvalue_changes';
import {NullPipeFactory} from './src/change_detection/pipes/null_pipe';
import {DEFAULT} from './src/change_detection/constants';
import {ChangeDetection, ProtoChangeDetector} from './src/change_detection/interfaces';

export var defaultPipes = {
  "iterableDiff" : [
    new IterableChangesFactory(),
    new NullPipeFactory()
  ],
  "keyValDiff" : [
    new KeyValueChangesFactory(),
    new NullPipeFactory()
  ]
};

export class DynamicChangeDetection extends ChangeDetection {
  registry:PipeRegistry;

  constructor(registry:PipeRegistry) {
    super();
    this.registry = registry;
  }

  createProtoChangeDetector(name:string, changeControlStrategy:string = DEFAULT):ProtoChangeDetector{
    return new DynamicProtoChangeDetector(this.registry, changeControlStrategy);
  }
}

export class JitChangeDetection extends ChangeDetection {
  registry:PipeRegistry;

  constructor(registry:PipeRegistry) {
    super();
    this.registry = registry;
  }

  createProtoChangeDetector(name:string, changeControlStrategy:string = DEFAULT):ProtoChangeDetector{
    return new JitProtoChangeDetector(this.registry, changeControlStrategy);
  }
}

var _registry = new PipeRegistry(defaultPipes);

export var dynamicChangeDetection = new DynamicChangeDetection(_registry);
export var jitChangeDetection = new JitChangeDetection(_registry);
