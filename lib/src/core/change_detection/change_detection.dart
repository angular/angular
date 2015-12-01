library angular2.src.core.change_detection.change_detection;

import "differs/iterable_differs.dart"
    show IterableDiffers, IterableDifferFactory;
import "differs/default_iterable_differ.dart" show DefaultIterableDifferFactory;
import "differs/keyvalue_differs.dart"
    show KeyValueDiffers, KeyValueDifferFactory;
import "differs/default_keyvalue_differ.dart" show DefaultKeyValueDifferFactory;
import "package:angular2/src/facade/lang.dart" show isPresent;
export "parser/ast.dart"
    show
        ASTWithSource,
        AST,
        AstTransformer,
        PropertyRead,
        LiteralArray,
        ImplicitReceiver;
export "parser/lexer.dart" show Lexer;
export "parser/parser.dart" show Parser;
export "parser/locals.dart" show Locals;
export "exceptions.dart"
    show
        DehydratedException,
        ExpressionChangedAfterItHasBeenCheckedException,
        ChangeDetectionError;
export "interfaces.dart"
    show
        ProtoChangeDetector,
        ChangeDetector,
        ChangeDispatcher,
        ChangeDetectorDefinition,
        DebugContext,
        ChangeDetectorGenConfig;
export "constants.dart"
    show ChangeDetectionStrategy, CHANGE_DETECTION_STRATEGY_VALUES;
export "proto_change_detector.dart" show DynamicProtoChangeDetector;
export "jit_proto_change_detector.dart" show JitProtoChangeDetector;
export "binding_record.dart" show BindingRecord, BindingTarget;
export "directive_record.dart" show DirectiveIndex, DirectiveRecord;
export "dynamic_change_detector.dart" show DynamicChangeDetector;
export "change_detector_ref.dart" show ChangeDetectorRef;
export "differs/iterable_differs.dart"
    show IterableDiffers, IterableDiffer, IterableDifferFactory;
export "differs/keyvalue_differs.dart"
    show KeyValueDiffers, KeyValueDiffer, KeyValueDifferFactory;
export "pipe_transform.dart" show PipeTransform, PipeOnDestroy;
export "change_detection_util.dart" show WrappedValue, SimpleChange;

/**
 * Structural diffing for `Object`s and `Map`s.
 */
const List<KeyValueDifferFactory> keyValDiff = const [
  const DefaultKeyValueDifferFactory()
];
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
const List<IterableDifferFactory> iterableDiff = const [
  const DefaultIterableDifferFactory()
];
const defaultIterableDiffers = const IterableDiffers(iterableDiff);
const defaultKeyValueDiffers = const KeyValueDiffers(keyValDiff);
