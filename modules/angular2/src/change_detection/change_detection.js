import {DynamicProtoChangeDetector, JitProtoChangeDetector} from './proto_change_detector';
import {PipeRegistry} from './pipes/pipe_registry';
import {IterableChangesFactory} from './pipes/iterable_changes';
import {KeyValueChangesFactory} from './pipes/keyvalue_changes';
import {AsyncPipeFactory} from './pipes/async_pipe';
import {NullPipeFactory} from './pipes/null_pipe';
import {DEFAULT} from './constants';
import {ChangeDetection, ProtoChangeDetector} from './interfaces';
import {Injectable} from 'angular2/di';

/**
 * Structural diffing for `Object`s and `Map`s.
 *
 * @exportedAs angular2/pipes
 */
export var keyValDiff = [
  new KeyValueChangesFactory(),
  new NullPipeFactory()
];

/**
 * Structural diffing for `Iterable` types such as `Array`s.
 *
 * @exportedAs angular2/pipes
 */
export var iterableDiff = [
  new IterableChangesFactory(),
  new NullPipeFactory()
];

/**
 * Async binding to such types as Observable.
 *
 * @exportedAs angular2/pipes
 */
export var async = [
  new AsyncPipeFactory(),
  new NullPipeFactory()
];

export var defaultPipes = {
  "iterableDiff" : iterableDiff,
  "keyValDiff" : keyValDiff,
  "async" : async
};


/**
 * Implements change detection that does not require `eval()`.
 *
 * This is slower than {@link JitChangeDetection}.
 *
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
 * Implements faster change detection, by generating source code.
 *
 * This requires `eval()`. For change detection that does not require `eval()`, see {@link DynamicChangeDetection}.
 *
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
