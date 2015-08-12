import {JitProtoChangeDetector} from './jit_proto_change_detector';
import {PregenProtoChangeDetector} from './pregen_proto_change_detector';
import {DynamicProtoChangeDetector} from './proto_change_detector';
import {IterableDiffers, IterableDifferFactory} from './differs/iterable_differs';
import {DefaultIterableDifferFactory} from './differs/default_iterable_differ';
import {KeyValueDiffers, KeyValueDifferFactory} from './differs/keyvalue_differs';
import {DefaultKeyValueDifferFactory} from './differs/default_keyvalue_differ';
import {ChangeDetection, ProtoChangeDetector, ChangeDetectorDefinition} from './interfaces';
import {Injector, Inject, Injectable, OpaqueToken, Optional, Binding} from 'angular2/di';
import {List, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {CONST, CONST_EXPR, isPresent, BaseException} from 'angular2/src/facade/lang';

export {
  ASTWithSource,
  AST,
  AstTransformer,
  PropertyRead,
  LiteralArray,
  ImplicitReceiver
} from './parser/ast';

export {Lexer} from './parser/lexer';
export {Parser} from './parser/parser';
export {Locals} from './parser/locals';

export {
  DehydratedException,
  ExpressionChangedAfterItHasBeenCheckedException,
  ChangeDetectionError
} from './exceptions';
export {
  ProtoChangeDetector,
  ChangeDetector,
  ChangeDispatcher,
  ChangeDetection,
  ChangeDetectorDefinition,
  DebugContext
} from './interfaces';
export {CHECK_ONCE, CHECK_ALWAYS, DETACHED, CHECKED, ON_PUSH, DEFAULT} from './constants';
export {DynamicProtoChangeDetector} from './proto_change_detector';
export {BindingRecord} from './binding_record';
export {DirectiveIndex, DirectiveRecord} from './directive_record';
export {DynamicChangeDetector} from './dynamic_change_detector';
export {ChangeDetectorRef} from './change_detector_ref';
export {IterableDiffers, IterableDiffer, IterableDifferFactory} from './differs/iterable_differs';
export {KeyValueDiffers, KeyValueDiffer, KeyValueDifferFactory} from './differs/keyvalue_differs';
export {PipeTransform, PipeOnDestroy} from './pipe_transform';
export {WrappedValue} from './change_detection_util';

/**
 * Structural diffing for `Object`s and `Map`s.
 */
export const keyValDiff: KeyValueDifferFactory[] =
    CONST_EXPR([CONST_EXPR(new DefaultKeyValueDifferFactory())]);

/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
export const iterableDiff: IterableDifferFactory[] =
    CONST_EXPR([CONST_EXPR(new DefaultIterableDifferFactory())]);

export const defaultIterableDiffers = CONST_EXPR(new IterableDiffers(iterableDiff));

export const defaultKeyValueDiffers = CONST_EXPR(new KeyValueDiffers(keyValDiff));

/**
 * Map from {@link ChangeDetectorDefinition#id} to a factory method which takes a
 * {@link Pipes} and a {@link ChangeDetectorDefinition} and generates a
 * {@link ProtoChangeDetector} associated with the definition.
 */
// TODO(kegluneq): Use PregenProtoChangeDetectorFactory rather than Function once possible in
// dart2js. See https://github.com/dart-lang/sdk/issues/23630 for details.
export var preGeneratedProtoDetectors: StringMap<string, Function> = {};

export const PROTO_CHANGE_DETECTOR = CONST_EXPR(new OpaqueToken('ProtoChangeDetectors'));

/**
 * Implements change detection using a map of pregenerated proto detectors.
 */
@Injectable()
export class PreGeneratedChangeDetection extends ChangeDetection {
  _dynamicChangeDetection: ChangeDetection;
  _protoChangeDetectorFactories: StringMap<string, Function>;

  constructor(@Inject(PROTO_CHANGE_DETECTOR) @Optional() protoChangeDetectorsForTest?:
                  StringMap<string, Function>) {
    super();
    this._dynamicChangeDetection = new DynamicChangeDetection();
    this._protoChangeDetectorFactories = isPresent(protoChangeDetectorsForTest) ?
                                             protoChangeDetectorsForTest :
                                             preGeneratedProtoDetectors;
  }

  static isSupported(): boolean { return PregenProtoChangeDetector.isSupported(); }

  createProtoChangeDetector(definition: ChangeDetectorDefinition): ProtoChangeDetector {
    var id = definition.id;
    if (StringMapWrapper.contains(this._protoChangeDetectorFactories, id)) {
      return StringMapWrapper.get(this._protoChangeDetectorFactories, id)(definition);
    }
    return this._dynamicChangeDetection.createProtoChangeDetector(new ChangeDetectorDefinition(definition.id, null, [], [], [], [], false));
  }
}


/**
 * Implements change detection that does not require `eval()`.
 *
 * This is slower than {@link JitChangeDetection}.
 */
@Injectable()
export class DynamicChangeDetection extends ChangeDetection {
  createProtoChangeDetector(definition: ChangeDetectorDefinition): ProtoChangeDetector {
    return new DynamicProtoChangeDetector(definition);
  }
}

/**
 * Implements faster change detection by generating source code.
 *
 * This requires `eval()`. For change detection that does not require `eval()`, see
 * {@link DynamicChangeDetection} and {@link PreGeneratedChangeDetection}.
 */
@Injectable()
@CONST()
export class JitChangeDetection extends ChangeDetection {
  static isSupported(): boolean { return JitProtoChangeDetector.isSupported(); }

  createProtoChangeDetector(definition: ChangeDetectorDefinition): ProtoChangeDetector {
    return new JitProtoChangeDetector(definition);
  }
}
