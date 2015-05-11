import {DynamicProtoChangeDetector, JitProtoChangeDetector} from './proto_change_detector';
import {PipeFactory} from './pipes/pipe';
import {PipeRegistry} from './pipes/pipe_registry';
import {IterableChangesFactory} from './pipes/iterable_changes';
import {KeyValueChangesFactory} from './pipes/keyvalue_changes';
import {ObservablePipeFactory} from './pipes/observable_pipe';
import {PromisePipeFactory} from './pipes/promise_pipe';
import {NullPipeFactory} from './pipes/null_pipe';
import {BindingRecord} from './binding_record';
import {DirectiveRecord} from './directive_record';
import {DEFAULT} from './constants';
import {ChangeDetection, ProtoChangeDetector} from './interfaces';
import {Injectable} from 'angular2/src/di/decorators';
import {List} from 'angular2/src/facade/collection';

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;

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

export var defaultPipes = {
  "iterableDiff": iterableDiff,
  "keyValDiff": keyValDiff,
  "async": async
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
  constructor(public registry: PipeRegistry) { super(); }

  createProtoChangeDetector(name: string, bindingRecords: List<BindingRecord>,
                            variableBindings: List<string>, directiveRecords: List<DirectiveRecord>,
                            changeControlStrategy: string = DEFAULT): ProtoChangeDetector {
    return new DynamicProtoChangeDetector(this.registry, bindingRecords, variableBindings,
                                          directiveRecords, changeControlStrategy);
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

  createProtoChangeDetector(name: string, bindingRecords: List<BindingRecord>,
                            variableBindings: List<string>, directiveRecords: List<DirectiveRecord>,
                            changeControlStrategy: string = DEFAULT): ProtoChangeDetector {
    return new JitProtoChangeDetector(this.registry, bindingRecords, variableBindings,
                                      directiveRecords, changeControlStrategy);
  }
}

export var defaultPipeRegistry: PipeRegistry = new PipeRegistry(defaultPipes);
