'use strict';var iterable_differs_1 = require('./differs/iterable_differs');
var default_iterable_differ_1 = require('./differs/default_iterable_differ');
var keyvalue_differs_1 = require('./differs/keyvalue_differs');
var default_keyvalue_differ_1 = require('./differs/default_keyvalue_differ');
var lang_1 = require('angular2/src/facade/lang');
var ast_1 = require('./parser/ast');
exports.ASTWithSource = ast_1.ASTWithSource;
exports.AST = ast_1.AST;
exports.AstTransformer = ast_1.AstTransformer;
exports.PropertyRead = ast_1.PropertyRead;
exports.LiteralArray = ast_1.LiteralArray;
exports.ImplicitReceiver = ast_1.ImplicitReceiver;
var lexer_1 = require('./parser/lexer');
exports.Lexer = lexer_1.Lexer;
var parser_1 = require('./parser/parser');
exports.Parser = parser_1.Parser;
var locals_1 = require('./parser/locals');
exports.Locals = locals_1.Locals;
var exceptions_1 = require('./exceptions');
exports.DehydratedException = exceptions_1.DehydratedException;
exports.ExpressionChangedAfterItHasBeenCheckedException = exceptions_1.ExpressionChangedAfterItHasBeenCheckedException;
exports.ChangeDetectionError = exceptions_1.ChangeDetectionError;
var interfaces_1 = require('./interfaces');
exports.ChangeDetectorDefinition = interfaces_1.ChangeDetectorDefinition;
exports.DebugContext = interfaces_1.DebugContext;
exports.ChangeDetectorGenConfig = interfaces_1.ChangeDetectorGenConfig;
var constants_1 = require('./constants');
exports.ChangeDetectionStrategy = constants_1.ChangeDetectionStrategy;
exports.CHANGE_DETECTION_STRATEGY_VALUES = constants_1.CHANGE_DETECTION_STRATEGY_VALUES;
var proto_change_detector_1 = require('./proto_change_detector');
exports.DynamicProtoChangeDetector = proto_change_detector_1.DynamicProtoChangeDetector;
var jit_proto_change_detector_1 = require('./jit_proto_change_detector');
exports.JitProtoChangeDetector = jit_proto_change_detector_1.JitProtoChangeDetector;
var binding_record_1 = require('./binding_record');
exports.BindingRecord = binding_record_1.BindingRecord;
exports.BindingTarget = binding_record_1.BindingTarget;
var directive_record_1 = require('./directive_record');
exports.DirectiveIndex = directive_record_1.DirectiveIndex;
exports.DirectiveRecord = directive_record_1.DirectiveRecord;
var dynamic_change_detector_1 = require('./dynamic_change_detector');
exports.DynamicChangeDetector = dynamic_change_detector_1.DynamicChangeDetector;
var change_detector_ref_1 = require('./change_detector_ref');
exports.ChangeDetectorRef = change_detector_ref_1.ChangeDetectorRef;
var iterable_differs_2 = require('./differs/iterable_differs');
exports.IterableDiffers = iterable_differs_2.IterableDiffers;
var keyvalue_differs_2 = require('./differs/keyvalue_differs');
exports.KeyValueDiffers = keyvalue_differs_2.KeyValueDiffers;
var change_detection_util_1 = require('./change_detection_util');
exports.WrappedValue = change_detection_util_1.WrappedValue;
exports.SimpleChange = change_detection_util_1.SimpleChange;
/**
 * Structural diffing for `Object`s and `Map`s.
 */
exports.keyValDiff = lang_1.CONST_EXPR([lang_1.CONST_EXPR(new default_keyvalue_differ_1.DefaultKeyValueDifferFactory())]);
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
exports.iterableDiff = lang_1.CONST_EXPR([lang_1.CONST_EXPR(new default_iterable_differ_1.DefaultIterableDifferFactory())]);
exports.defaultIterableDiffers = lang_1.CONST_EXPR(new iterable_differs_1.IterableDiffers(exports.iterableDiff));
exports.defaultKeyValueDiffers = lang_1.CONST_EXPR(new keyvalue_differs_1.KeyValueDiffers(exports.keyValDiff));
//# sourceMappingURL=change_detection.js.map