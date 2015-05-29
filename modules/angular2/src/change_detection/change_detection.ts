import {JitProtoChangeDetector} from './jit_proto_change_detector';
import {PregenProtoChangeDetector} from './pregen_proto_change_detector';
import {DynamicProtoChangeDetector} from './proto_change_detector';
import {PipeFactory, Pipe} from './pipes/pipe';
import {PipeRegistry} from './pipes/pipe_registry';
import {IterableChangesFactory} from './pipes/iterable_changes';
import {KeyValueChangesFactory} from './pipes/keyvalue_changes';
import {ObservablePipeFactory} from './pipes/observable_pipe';
import {PromisePipeFactory} from './pipes/promise_pipe';
import {UpperCaseFactory} from './pipes/uppercase_pipe';
import {LowerCaseFactory} from './pipes/lowercase_pipe';
import {JsonPipe} from './pipes/json_pipe';
import {NullPipeFactory} from './pipes/null_pipe';
import {ChangeDetection, ProtoChangeDetector, ChangeDetectorDefinition} from './interfaces';
import {Inject, Injectable, OpaqueToken, Optional} from 'angular2/di';
import {List, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {CONST_EXPR, isPresent, BaseException} from 'angular2/src/facade/lang';

/**
 * Structural diffing for `Object`s and `Map`s.
 *
 * @exportedAs angular2/pipes
 */
export var keyValDiff: List<PipeFactory> = [new KeyValueChangesFactory(), new NullPipeFactory()];

/**
 * Structural diffing for `Iterable` types such as `Array`s.
 *
 * @exportedAs angular2/pipes
 */
export var iterableDiff: List<PipeFactory> = [new IterableChangesFactory(), new NullPipeFactory()];

/**
 * Async binding to such types as Observable.
 *
 * @exportedAs angular2/pipes
 */
export var async: List<PipeFactory> =
    [new ObservablePipeFactory(), new PromisePipeFactory(), new NullPipeFactory()];

/**
 * Uppercase text transform.
 *
 * @exportedAs angular2/pipes
 */
export var uppercase: List<PipeFactory> = [new UpperCaseFactory(), new NullPipeFactory()];

/**
 * Lowercase text transform.
 *
 * @exportedAs angular2/pipes
 */
export var lowercase: List<PipeFactory> = [new LowerCaseFactory(), new NullPipeFactory()];

/**
 * Json stringify transform.
 *
 * @exportedAs angular2/pipes
 */
export var json: List<PipeFactory | Pipe> = [new JsonPipe(), new NullPipeFactory()];

export var defaultPipes = {
  "iterableDiff": iterableDiff,
  "keyValDiff": keyValDiff,
  "async": async,
  "uppercase": uppercase,
  "lowercase": lowercase,
  "json": json
};

/**
 * Map from {@link ChangeDetectorDefinition#id} to a factory method which takes a
 * {@link PipeRegistry} and a {@link ChangeDetectorDefinition} and generates a
 * {@link ProtoChangeDetector} associated with the definition.
 */
// TODO(kegluneq): Use PregenProtoChangeDetectorFactory rather than Function once possible in
// dart2js. See https://github.com/dart-lang/sdk/issues/23630 for details.
export var preGeneratedProtoDetectors: StringMap<string, Function> = {};

export const PROTO_CHANGE_DETECTOR_KEY = CONST_EXPR(new OpaqueToken('ProtoChangeDetectors'));

/**
 * Implements change detection using a map of pregenerated proto detectors.
 *
 * @exportedAs angular2/change_detection
 */
@Injectable()
export class PreGeneratedChangeDetection extends ChangeDetection {
  _dynamicChangeDetection: ChangeDetection;
  _protoChangeDetectorFactories: StringMap<string, Function>;

  constructor(private registry: PipeRegistry,
              @Inject(PROTO_CHANGE_DETECTOR_KEY) @Optional()
              protoChangeDetectorsForTest?: StringMap<string, Function>) {
    super();
    this._dynamicChangeDetection = new DynamicChangeDetection(registry);
    this._protoChangeDetectorFactories = isPresent(protoChangeDetectorsForTest) ?
                                             protoChangeDetectorsForTest :
                                             preGeneratedProtoDetectors;
  }

  static isSupported(): boolean { return PregenProtoChangeDetector.isSupported(); }

  createProtoChangeDetector(definition: ChangeDetectorDefinition): ProtoChangeDetector {
    var id = definition.id;
    if (StringMapWrapper.contains(this._protoChangeDetectorFactories, id)) {
      return StringMapWrapper.get(this._protoChangeDetectorFactories, id)(this.registry,
                                                                          definition);
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
 * Implements faster change detection by generating source code.
 *
 * This requires `eval()`. For change detection that does not require `eval()`, see
 * {@link DynamicChangeDetection} and {@link PreGeneratedChangeDetection}.
 *
 * @exportedAs angular2/change_detection
 */
@Injectable()
export class JitChangeDetection extends ChangeDetection {
  constructor(public registry: PipeRegistry) { super(); }

  static isSupported(): boolean { return JitProtoChangeDetector.isSupported(); }

  createProtoChangeDetector(definition: ChangeDetectorDefinition): ProtoChangeDetector {
    return new JitProtoChangeDetector(this.registry, definition);
  }
}

export var defaultPipeRegistry: PipeRegistry = new PipeRegistry(defaultPipes);
