import {DynamicProtoChangeDetector, JitProtoChangeDetector} from './proto_change_detector';
import {PipeFactory} from './pipes/pipe';
import {PipeRegistry} from './pipes/pipe_registry';
import {IterableChangesFactory} from './pipes/iterable_changes';
import {KeyValueChangesFactory} from './pipes/keyvalue_changes';
import {ObservablePipeFactory} from './pipes/observable_pipe';
import {PromisePipeFactory} from './pipes/promise_pipe';
import {UpperCaseFactory} from './pipes/uppercase_pipe';
import {LowerCaseFactory} from './pipes/lowercase_pipe';
import {JsonPipeFactory} from './pipes/json_pipe';
import {NullPipeFactory} from './pipes/null_pipe';
import {ChangeDetection, ProtoChangeDetector, ChangeDetectorDefinition} from './interfaces';
import {Injectable} from 'angular2/src/di/decorators';
import {List, StringMapWrapper} from 'angular2/src/facade/collection';
import {isPresent, BaseException} from 'angular2/src/facade/lang';

/**
 * Structural diffing for `Object`s and `Map`s.
 *
 * @exportedAs angular2/pipes
 */
export var keyValDiff: List < PipeFactory >= [new KeyValueChangesFactory(), new NullPipeFactory()];

/**
 * Structural diffing for `Iterable` types such as `Array`s.
 *
 * @exportedAs angular2/pipes
 */
export var iterableDiff: List <
    PipeFactory >= [new IterableChangesFactory(), new NullPipeFactory()];

/**
 * Async binding to such types as Observable.
 *
 * @exportedAs angular2/pipes
 */
export var async: List <
    PipeFactory >= [new ObservablePipeFactory(), new PromisePipeFactory(), new NullPipeFactory()];

/**
 * Uppercase text transform.
 *
 * @exportedAs angular2/pipes
 */
export var uppercase: List < PipeFactory >= [new UpperCaseFactory(), new NullPipeFactory()];

/**
 * Lowercase text transform.
 *
 * @exportedAs angular2/pipes
 */
export var lowercase: List < PipeFactory >= [new LowerCaseFactory(), new NullPipeFactory()];

/**
 * Json stringify transform.
 *
 * @exportedAs angular2/pipes
 */
export var json: List < PipeFactory >= [new JsonPipeFactory(), new NullPipeFactory()];

export var defaultPipes = {
  "iterableDiff": iterableDiff,
  "keyValDiff": keyValDiff,
  "async": async,
  "uppercase": uppercase,
  "lowercase": lowercase,
  "json": json
};

export var preGeneratedProtoDetectors = {};


/**
 * Implements change detection using a map of pregenerated proto detectors.
 *
 * @exportedAs angular2/change_detection
 */
export class PreGeneratedChangeDetection extends ChangeDetection {
  _dynamicChangeDetection: ChangeDetection;
  _protoChangeDetectorFactories: StringMap<string, Function>;

  constructor(private registry: PipeRegistry, protoChangeDetectors?) {
    super();
    this._dynamicChangeDetection = new DynamicChangeDetection(registry);
    this._protoChangeDetectorFactories =
        isPresent(protoChangeDetectors) ? protoChangeDetectors : preGeneratedProtoDetectors;
  }

  createProtoChangeDetector(definition: ChangeDetectorDefinition): ProtoChangeDetector {
    var id = definition.id;
    if (StringMapWrapper.contains(this._protoChangeDetectorFactories, id)) {
      return StringMapWrapper.get(this._protoChangeDetectorFactories, id)(this.registry);
    }
    return this._dynamicChangeDetection.createProtoChangeDetector(definition);
  }
}


/**
 * Implements change detection that does not require `eval()`.
 *
 * This is slower than {@link JitChangeDetection}.
 *
 * @exportedAs angular2/change_detection
 */
@Injectable()
export class DynamicChangeDetection extends ChangeDetection {
  constructor(private registry: PipeRegistry) { super(); }

  createProtoChangeDetector(definition: ChangeDetectorDefinition): ProtoChangeDetector {
    return new DynamicProtoChangeDetector(this.registry, definition);
  }
}

/**
 * Implements faster change detection, by generating source code.
 *
 * This requires `eval()`. For change detection that does not require `eval()`, see {@link
 *DynamicChangeDetection}.
 *
 * @exportedAs angular2/change_detection
 */
@Injectable()
export class JitChangeDetection extends ChangeDetection {
  constructor(public registry: PipeRegistry) { super(); }

  createProtoChangeDetector(definition: ChangeDetectorDefinition): ProtoChangeDetector {
    return new JitProtoChangeDetector(this.registry, definition);
  }
}

export var defaultPipeRegistry: PipeRegistry = new PipeRegistry(defaultPipes);
