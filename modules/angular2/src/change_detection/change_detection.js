import {DynamicProtoChangeDetector, JitProtoChangeDetector} from './proto_change_detector';
import {PipeRegistry} from './pipes/pipe_registry';
import {IterableChangesFactory} from './pipes/iterable_changes';
import {KeyValueChangesFactory} from './pipes/keyvalue_changes';
import {NullPipeFactory} from './pipes/null_pipe';
import {DEFAULT} from './constants';
import {ChangeDetection, ProtoChangeDetector} from './interfaces';
import {Injectable} from 'angular2/di';

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

/**
 * @exportedAs angular2/change_detection
 */
@Injectable()
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

/**
 * @exportedAs angular2/change_detection
 */
@Injectable()
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

export var defaultPipeRegistry = new PipeRegistry(defaultPipes);