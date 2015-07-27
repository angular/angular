library angular2.transform.template_compiler.change_detector_codegen;

import 'dart:convert' show JSON;
import 'package:angular2/src/change_detection/change_detection_util.dart';
import 'package:angular2/src/change_detection/coalesce.dart';
import 'package:angular2/src/change_detection/codegen_name_util.dart';
import 'package:angular2/src/change_detection/directive_record.dart';
import 'package:angular2/src/change_detection/interfaces.dart';
import 'package:angular2/src/change_detection/proto_change_detector.dart';
import 'package:angular2/src/change_detection/proto_record.dart';
import 'package:angular2/src/facade/lang.dart' show BaseException;

/// Responsible for generating change detector classes for Angular 2.
///
/// This code should be kept in sync with the `ChangeDetectorJITGenerator`
/// class. If you make updates here, please make equivalent changes there.
class Codegen {
  /// Stores the generated class definitions.
  final StringBuffer _buf = new StringBuffer();
  /// Stores all generated initialization code.
  final StringBuffer _initBuf = new StringBuffer();
  /// The names of already generated classes.
  final Set<String> _names = new Set<String>();

  /// Generates a change detector class with name `changeDetectorTypeName`,
  /// which must not conflict with other generated classes in the same
  /// `.ng_deps.dart` file.  The change detector is used to detect changes in
  /// Objects of type `typeName`.
  void generate(String typeName, String changeDetectorTypeName,
      ChangeDetectorDefinition def) {
    if (_names.contains(changeDetectorTypeName)) {
      throw new BaseException(
          'Change detector named "${changeDetectorTypeName}" for ${typeName} '
          'conflicts with an earlier generated change detector class.');
    }
    _names.add(changeDetectorTypeName);
    new _CodegenState(typeName, changeDetectorTypeName, def)
      .._writeToBuf(_buf)
      .._writeInitToBuf(_initBuf);
  }

  /// Gets all imports necessary for the generated code.
  String get imports {
    return _buf.isEmpty
        ? ''
        : '''import '$_PREGEN_PROTO_CHANGE_DETECTOR_IMPORT' as $_GEN_PREFIX;''';
  }

  bool get isEmpty => _buf.isEmpty;

  /// Gets the initilization code that registers the generated classes with
  /// the Angular 2 change detection system.
  String get initialize => '$_initBuf';

  @override
  String toString() => '$_buf';
}

/// The state needed to generate a change detector for a single `Component`.
class _CodegenState {
  /// The `id` of the `ChangeDetectorDefinition` we are generating this class
  /// for.
  final String _changeDetectorDefId;

  /// The name of the `Type` this change detector is generated for. For example,
  /// this is `MyComponent` if the generated class will detect changes in
  /// `MyComponent` objects.
  final String _contextTypeName;

  /// The name of the generated change detector class. This is an implementation
  /// detail and should not be visible to users.
  final String _changeDetectorTypeName;
  final String _changeDetectionMode;
  final List<ProtoRecord> _records;
  final List<DirectiveRecord> _directiveRecords;
  final CodegenNameUtil _names;
  final bool _generateCheckNoChanges;

  _CodegenState._(this._changeDetectorDefId, this._contextTypeName,
      this._changeDetectorTypeName, String changeDetectionStrategy,
      List<ProtoRecord> records, List<DirectiveRecord> directiveRecords, this._generateCheckNoChanges)
      : _records = records,
        _directiveRecords = directiveRecords,
        _names = new CodegenNameUtil(records, directiveRecords, '_', _UTIL),
        _changeDetectionMode = ChangeDetectionUtil
            .changeDetectionMode(changeDetectionStrategy);

  factory _CodegenState(String typeName, String changeDetectorTypeName,
      ChangeDetectorDefinition def) {
    var protoRecords = new ProtoRecordBuilder();
    def.bindingRecords
        .forEach((rec) => protoRecords.add(rec, def.variableNames));
    var records = coalesce(protoRecords.records);
    return new _CodegenState._(def.id, typeName, changeDetectorTypeName,
        def.strategy, records, def.directiveRecords, def.generateCheckNoChanges);
  }

  void _writeToBuf(StringBuffer buf) {
    buf.write('''\n
      class $_changeDetectorTypeName extends $_BASE_CLASS {
        $_GEN_PREFIX.Pipes $_PIPES_ACCESSOR;
        final $_GEN_PREFIX.List<$_GEN_PREFIX.ProtoRecord> $_PROTOS_ACCESSOR;
        final $_GEN_PREFIX.List<$_GEN_PREFIX.DirectiveRecord>
            $_DIRECTIVES_ACCESSOR;
        dynamic $_LOCALS_ACCESSOR = null;
        dynamic $_ALREADY_CHECKED_ACCESSOR = false;
        dynamic $_CURRENT_PROTO = null;
        $_contextTypeName ${_names.getContextName()};
        ${_names.genDeclareFields()}

        $_changeDetectorTypeName(
            dynamic $_DISPATCHER_ACCESSOR,
            this.$_PROTOS_ACCESSOR,
            this.$_DIRECTIVES_ACCESSOR)
          : super(${_encodeValue(_changeDetectorDefId)}, $_DISPATCHER_ACCESSOR) {
          ${_names.genDehydrateFields()}
        }

        void detectChangesInRecords(throwOnChange) {
          if (!hydrated()) {
            $_UTIL.throwDehydrated();
          }
          try {
            this.__detectChangesInRecords(throwOnChange);
          } catch (e, s) {
            this.throwError($_CURRENT_PROTO, e, s);
          }
        }

        void __detectChangesInRecords(throwOnChange) {
          ${_names.genInitLocals()}
          var $_IS_CHANGED_LOCAL = false;
          $_CURRENT_PROTO = null;
          var $_CHANGES_LOCAL = null;

          context = ${_names.getContextName()};
          ${_records.map(_genRecord).join('')}

          $_ALREADY_CHECKED_ACCESSOR = true;
        }

        ${_genCheckNoChanges()}

        void callOnAllChangesDone() {
          ${_getCallOnAllChangesDoneBody()}
        }

        void hydrate($_contextTypeName context, locals, directives, pipes) {
          $_MODE_ACCESSOR = '$_changeDetectionMode';
          ${_names.getContextName()} = context;
          $_LOCALS_ACCESSOR = locals;
          ${_genHydrateDirectives()}
          ${_genHydrateDetectors()}
          $_ALREADY_CHECKED_ACCESSOR = false;
          $_PIPES_ACCESSOR = pipes;
        }

        void dehydrate() {
          ${_names.genPipeOnDestroy()}
          ${_names.genDehydrateFields()}
          $_LOCALS_ACCESSOR = null;
          $_PIPES_ACCESSOR = null;
        }

        hydrated() => ${_names.getContextName()} != null;

        static $_GEN_PREFIX.ProtoChangeDetector
            $PROTO_CHANGE_DETECTOR_FACTORY_METHOD(
            $_GEN_PREFIX.ChangeDetectorDefinition def) {
          return new $_GEN_PREFIX.PregenProtoChangeDetector(
              (a, b, c) => new $_changeDetectorTypeName(a, b, c),
              def);
        }
      }
    ''');
  }

  void _writeInitToBuf(StringBuffer buf) {
    buf.write('''
      $_GEN_PREFIX.preGeneratedProtoDetectors['$_changeDetectorDefId'] =
          $_changeDetectorTypeName.newProtoChangeDetector;
    ''');
  }

  String _genHydrateDirectives() {
    var buf = new StringBuffer();
    var directiveFieldNames = _names.getAllDirectiveNames();
    for (var i = 0; i < directiveFieldNames.length; ++i) {
      buf.writeln('${directiveFieldNames[i]} = directives.getDirectiveFor('
          '$_DIRECTIVES_ACCESSOR[$i].directiveIndex);');
    }
    return '$buf';
  }

  String _genHydrateDetectors() {
    var buf = new StringBuffer();
    var detectorFieldNames = _names.getAllDetectorNames();
    for (var i = 0; i < detectorFieldNames.length; ++i) {
      buf.writeln('${detectorFieldNames[i]} = directives.getDetectorFor('
          '$_DIRECTIVES_ACCESSOR[$i].directiveIndex);');
    }
    return '$buf';
  }

  /// Generates calls to `onAllChangesDone` for all `Directive`s that request
  /// them.
  String _getCallOnAllChangesDoneBody() {
    // NOTE(kegluneq): Order is important!
    var directiveNotifications = _directiveRecords.reversed
        .where((rec) => rec.callOnAllChangesDone)
        .map((rec) =>
            '${_names.getDirectiveName(rec.directiveIndex)}.onAllChangesDone();')
        .join('');
    return '''
      $_DISPATCHER_ACCESSOR.notifyOnAllChangesDone();
      ${directiveNotifications}
    ''';
  }

  String _genRecord(ProtoRecord r) {
    var rec = null;
    if (r.isLifeCycleRecord()) {
      rec = _genDirectiveLifecycle(r);
    } else if (r.isPipeRecord()) {
      rec = _genPipeCheck(r);
    } else {
      rec = _genReferenceCheck(r);
    }
    return '$rec${_maybeGenLastInDirective(r)}';
  }

  String _genDirectiveLifecycle(ProtoRecord r) {
    if (r.name == 'onCheck') {
      return _genOnCheck(r);
    } else if (r.name == 'onInit') {
      return _genOnInit(r);
    } else if (r.name == 'onChange') {
      return _genOnChange(r);
    } else {
      throw new BaseException("Unknown lifecycle event '${r.name}'");
    }
  }

  String _genPipeCheck(ProtoRecord r) {
    var context = _names.getLocalName(r.contextIndex);
    var argString = r.args.map((arg) => _names.getLocalName(arg)).join(", ");

    var oldValue = _names.getFieldName(r.selfIndex);
    var newValue = _names.getLocalName(r.selfIndex);
    var change = _names.getChangeName(r.selfIndex);

    var pipe = _names.getPipeName(r.selfIndex);
    var cdRef = 'this.ref';

    var protoIndex = r.selfIndex - 1;
    var pipeType = r.name;
    return '''
      $_CURRENT_PROTO = $_PROTOS_ACCESSOR[$protoIndex];
      if ($_IDENTICAL_CHECK_FN($pipe, $_UTIL.uninitialized())) {
        $pipe = $_PIPES_ACCESSOR.get('$pipeType', $context, $cdRef);
      } else if (!$pipe.supports($context)) {
        $pipe.onDestroy();
        $pipe = $_PIPES_ACCESSOR.get('$pipeType', $context, $cdRef);
      }

      $newValue = $pipe.transform($context, [$argString]);
      if (!$_IDENTICAL_CHECK_FN($oldValue, $newValue)) {
        $newValue = $_UTIL.unwrapValue($newValue);
        $change = true;
        ${_genUpdateDirectiveOrElement(r)}
        ${_genAddToChanges(r)}
        $oldValue = $newValue;
      }
    ''';
  }

  String _genReferenceCheck(ProtoRecord r) {
    var oldValue = _names.getFieldName(r.selfIndex);
    var newValue = _names.getLocalName(r.selfIndex);

    var protoIndex = r.selfIndex - 1;
    var check = '''
      $_CURRENT_PROTO = $_PROTOS_ACCESSOR[$protoIndex];
      ${_genUpdateCurrentValue(r)}
      if (!$_IDENTICAL_CHECK_FN($newValue, $oldValue)) {
        ${_names.getChangeName(r.selfIndex)} = true;
        ${_genUpdateDirectiveOrElement(r)}
        ${_genAddToChanges(r)}
        $oldValue = $newValue;
      }
    ''';
    if (r.isPureFunction()) {
      // Add an "if changed guard"
      var condition = r.args.map((a) => _names.getChangeName(a)).join(' || ');
      return 'if ($condition) { $check } else { $newValue = $oldValue; }';
    } else {
      return check;
    }
  }

  String _genUpdateCurrentValue(ProtoRecord r) {
    var context = r.contextIndex == -1
        ? _names.getDirectiveName(r.directiveIndex)
        : _names.getLocalName(r.contextIndex);

    var newValue = _names.getLocalName(r.selfIndex);
    var argString = r.args.map((arg) => _names.getLocalName(arg)).join(', ');

    var rhs;
    switch (r.mode) {
      case RecordType.SELF:
        rhs = context;
        break;

      case RecordType.CONST:
        rhs = _encodeValue(r.funcOrValue);
        break;

      case RecordType.PROPERTY:
        rhs = '$context.${r.name}';
        break;

      case RecordType.SAFE_PROPERTY:
        rhs = '${_UTIL}.isValueBlank(${context}) ? null : ${context}.${r.name}';
        break;

      case RecordType.LOCAL:
        rhs = '$_LOCALS_ACCESSOR.get("${r.name}")';
        break;

      case RecordType.INVOKE_METHOD:
        rhs = '$context.${r.name}($argString)';
        break;

      case RecordType.SAFE_INVOKE_METHOD:
        rhs = '${_UTIL}.isValueBlank(${context}) '
            '? null : ${context}.${r.name}(${argString})';
        break;

      case RecordType.INVOKE_CLOSURE:
        rhs = '$context($argString)';
        break;

      case RecordType.PRIMITIVE_OP:
        rhs = '$_UTIL.${r.name}($argString)';
        break;

      case RecordType.INTERPOLATE:
        rhs = _genInterpolation(r);
        break;

      case RecordType.KEYED_ACCESS:
        rhs = '$context[${_names.getLocalName(r.args[0])}]';
        break;

      default:
        throw new FormatException(
            'Unknown operation ${r.mode}', r.expressionAsString);
    }
    return '$newValue = $rhs;';
  }

  String _genInterpolation(ProtoRecord r) {
    var res = new StringBuffer();
    for (var i = 0; i < r.args.length; ++i) {
      var name = _names.getLocalName(r.args[i]);
      res.write(
          '${_encodeValue(r.fixedArgs[i])} "\$\{$name == null ? "" : $name\}" ');
    }
    res.write(_encodeValue(r.fixedArgs[r.args.length]));
    return '$res';
  }

  String _genUpdateDirectiveOrElement(ProtoRecord r) {
    if (!r.lastInBinding) return '';

    var newValue = _names.getLocalName(r.selfIndex);
    var oldValue = _names.getFieldName(r.selfIndex);

    var br = r.bindingRecord;
    if (br.isDirective()) {
      var directiveProperty =
          '${_names.getDirectiveName(br.directiveRecord.directiveIndex)}.${br.propertyName}';
      return '''
      ${_genThrowOnChangeCheck(oldValue, newValue)}
      $directiveProperty = $newValue;
      $_IS_CHANGED_LOCAL = true;
    ''';
    } else {
      return '''
      ${_genThrowOnChangeCheck(oldValue, newValue)}
      $_DISPATCHER_ACCESSOR.notifyOnBinding(
          $_CURRENT_PROTO.bindingRecord, ${newValue});
    ''';
    }
  }

  String _genThrowOnChangeCheck(String oldValue, String newValue) {
    if (this._generateCheckNoChanges) {
      return '''
        if(throwOnChange) {
          $_UTIL.throwOnChange(
              $_CURRENT_PROTO, $_UTIL.simpleChange(${oldValue}, ${newValue}));
        }
      ''';
    } else {
      return "";
    }
  }

  String _genCheckNoChanges() {
    if (this._generateCheckNoChanges) {
      return 'void checkNoChanges() { this.runDetectChanges(true); }';
    } else {
      return '';
    }
  }

  String _genAddToChanges(ProtoRecord r) {
    var newValue = _names.getLocalName(r.selfIndex);
    var oldValue = _names.getFieldName(r.selfIndex);
    if (!r.bindingRecord.callOnChange()) return '';
    return '''
      $_CHANGES_LOCAL = $_UTIL.addChange(
          $_CHANGES_LOCAL,
          $_CURRENT_PROTO.bindingRecord.propertyName,
          $_UTIL.simpleChange($oldValue, $newValue));
    ''';
  }

  String _maybeGenLastInDirective(ProtoRecord r) {
    if (!r.lastInDirective) return '';
    return '''
      $_CHANGES_LOCAL = null;
      ${_genNotifyOnPushDetectors(r)}
      $_IS_CHANGED_LOCAL = false;
    ''';
  }

  String _genOnCheck(ProtoRecord r) {
    var br = r.bindingRecord;
    return 'if (!throwOnChange) '
        '${_names.getDirectiveName(br.directiveRecord.directiveIndex)}.onCheck();';
  }

  String _genOnInit(ProtoRecord r) {
    var br = r.bindingRecord;
    return 'if (!throwOnChange && !$_ALREADY_CHECKED_ACCESSOR) '
        '${_names.getDirectiveName(br.directiveRecord.directiveIndex)}.onInit();';
  }

  String _genOnChange(ProtoRecord r) {
    var br = r.bindingRecord;
    return 'if (!throwOnChange && $_CHANGES_LOCAL != null) '
        '${_names.getDirectiveName(br.directiveRecord.directiveIndex)}'
        '.onChange($_CHANGES_LOCAL);';
  }

  String _genNotifyOnPushDetectors(ProtoRecord r) {
    var br = r.bindingRecord;
    if (!r.lastInDirective || !br.isOnPushChangeDetection()) return '';
    return '''
      if($_IS_CHANGED_LOCAL) {
        ${_names.getDetectorName(br.directiveRecord.directiveIndex)}.markAsCheckOnce();
      }
    ''';
  }

  String _encodeValue(funcOrValue) =>
      JSON.encode(funcOrValue).replaceAll(r'$', r'\$');
}

const PROTO_CHANGE_DETECTOR_FACTORY_METHOD = 'newProtoChangeDetector';

const _ALREADY_CHECKED_ACCESSOR = '_alreadyChecked';
const _BASE_CLASS = '$_GEN_PREFIX.AbstractChangeDetector';
const _CHANGES_LOCAL = 'changes';
const _CURRENT_PROTO = 'currentProto';
const _DIRECTIVES_ACCESSOR = '_directiveRecords';
const _DISPATCHER_ACCESSOR = 'dispatcher';
const _GEN_PREFIX = '_gen';
const _GEN_RECORDS_METHOD_NAME = '_createRecords';
const _IDENTICAL_CHECK_FN = '$_GEN_PREFIX.looseIdentical';
const _IS_CHANGED_LOCAL = 'isChanged';
const _LOCALS_ACCESSOR = '_locals';
const _MODE_ACCESSOR = 'mode';
const _PREGEN_PROTO_CHANGE_DETECTOR_IMPORT =
    'package:angular2/src/change_detection/pregen_proto_change_detector.dart';
const _PIPES_ACCESSOR = '_pipes';
const _PROTOS_ACCESSOR = '_protos';
const _UTIL = '$_GEN_PREFIX.ChangeDetectionUtil';
