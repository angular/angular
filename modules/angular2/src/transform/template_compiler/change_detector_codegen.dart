library angular2.transform.template_compiler.change_detector_codegen;

import 'dart:convert' show JSON;
import 'package:angular2/src/change_detection/change_detection_util.dart';
import 'package:angular2/src/change_detection/coalesce.dart';
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
  final List<String> _localNames;
  final List<String> _changeNames;
  final List<String> _fieldNames;
  final List<String> _pipeNames;

  _CodegenState._(this._changeDetectorDefId, this._contextTypeName,
      this._changeDetectorTypeName, String changeDetectionStrategy,
      this._records, this._directiveRecords, List<String> localNames)
      : this._localNames = localNames,
        _changeNames = _getChangeNames(localNames),
        _fieldNames = _getFieldNames(localNames),
        _pipeNames = _getPipeNames(localNames),
        _changeDetectionMode = ChangeDetectionUtil
            .changeDetectionMode(changeDetectionStrategy);

  factory _CodegenState(String typeName, String changeDetectorTypeName,
      ChangeDetectorDefinition def) {
    var protoRecords = new ProtoRecordBuilder();
    def.bindingRecords
        .forEach((rec) => protoRecords.add(rec, def.variableNames));
    var records = coalesce(protoRecords.records);
    return new _CodegenState._(def.id, typeName, changeDetectorTypeName,
        def.strategy, records, def.directiveRecords, _getLocalNames(records));
  }

  /// Generates sanitized names for use as local variables.
  static List<String> _getLocalNames(List<ProtoRecord> records) {
    var whitespacePattern = new RegExp(r'\W');
    var localNames = new List<String>(records.length + 1);
    localNames[0] = 'context';
    for (var i = 0; i < records.length; ++i) {
      var sanitizedName = records[i].name.replaceAll(whitespacePattern, '');
      localNames[i + 1] = '$sanitizedName$i';
    }
    return localNames;
  }

  /// Generates names for use as local change variables.
  static List<String> _getChangeNames(List<String> localNames) =>
      localNames.map((name) => 'change_$name').toList();

  /// Generates names for use as private fields.
  static List<String> _getFieldNames(List<String> localNames) =>
      localNames.map((name) => '_$name').toList();

  /// Generates names for use as private pipe variables.
  static List<String> _getPipeNames(List<String> localNames) =>
      localNames.map((name) => '_${name}_pipe').toList();

  void _writeToBuf(StringBuffer buf) {
    buf.write('''
      class $_changeDetectorTypeName extends $_BASE_CLASS {
        final dynamic $_DISPATCHER_ACCESSOR;
        final $_GEN_PREFIX.PipeRegistry $_PIPE_REGISTRY_ACCESSOR;
        final $_GEN_PREFIX.List<$_GEN_PREFIX.ProtoRecord> $_PROTOS_ACCESSOR;
        final $_GEN_PREFIX.List<$_GEN_PREFIX.DirectiveRecord>
            $_DIRECTIVES_ACCESSOR;
        dynamic $_LOCALS_ACCESSOR = null;
        dynamic $_ALREADY_CHECKED_ACCESSOR = false;
        ${_allFields().map((f) {
          if (f == _CONTEXT_ACCESSOR) {
            return '$_contextTypeName $f = null;';
          }
          return 'dynamic $f = $_UTIL.uninitialized();';
        }).join('')}

        $_changeDetectorTypeName(
            this.$_DISPATCHER_ACCESSOR,
            this.$_PIPE_REGISTRY_ACCESSOR,
            this.$_PROTOS_ACCESSOR,
            this.$_DIRECTIVES_ACCESSOR) : super();

        void detectChangesInRecords(throwOnChange) {
          if (!hydrated()) {
            $_UTIL.throwDehydrated();
          }
          ${_genLocalDefinitions()}
          ${_genChangeDefinitons()}
          var $_IS_CHANGED_LOCAL = false;
          var $_CURRENT_PROTO;
          var $_CHANGES_LOCAL = null;

          context = $_CONTEXT_ACCESSOR;
          ${_records.map(_genRecord).join('')}

          $_ALREADY_CHECKED_ACCESSOR = true;
        }

        void callOnAllChangesDone() {
          ${_getCallOnAllChangesDoneBody()}
        }

        void hydrate($_contextTypeName context, locals, directives) {
          $_MODE_ACCESSOR = '$_changeDetectionMode';
          $_CONTEXT_ACCESSOR = context;
          $_LOCALS_ACCESSOR = locals;
          ${_genHydrateDirectives()}
          ${_genHydrateDetectors()}
          $_ALREADY_CHECKED_ACCESSOR = false;
        }

        void dehydrate() {
          ${_genPipeOnDestroy()}
          ${_allFields().map((f) {
            return f == _CONTEXT_ACCESSOR
              ? '$f = null;'
              : '$f = $_UTIL.uninitialized();';
          }).join('')}
          $_LOCALS_ACCESSOR = null;
        }

        hydrated() => $_CONTEXT_ACCESSOR != null;

        static $_GEN_PREFIX.ProtoChangeDetector
            $PROTO_CHANGE_DETECTOR_FACTORY_METHOD(
            $_GEN_PREFIX.PipeRegistry registry,
            $_GEN_PREFIX.ChangeDetectorDefinition def) {
          return new $_GEN_PREFIX.PregenProtoChangeDetector(
              (a, b, c, d) => new $_changeDetectorTypeName(a, b, c, d),
              registry, def);
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

  List<String> _genGetDirectiveFieldNames() {
    return _directiveRecords
        .map((d) => _genGetDirective(d.directiveIndex))
        .toList();
  }

  List<String> _genGetDetectorFieldNames() {
    return _directiveRecords
        .where((d) => d.isOnPushChangeDetection())
        .map((d) => _genGetDetector(d.directiveIndex))
        .toList();
  }

  String _genGetDirective(DirectiveIndex d) => '_directive_${d.name}';
  String _genGetDetector(DirectiveIndex d) => '_detector_${d.name}';

  List<String> _getNonNullPipeNames() {
    return _records
        .where((r) =>
            r.mode == RecordType.PIPE || r.mode == RecordType.BINDING_PIPE)
        .map((r) => _pipeNames[r.selfIndex])
        .toList();
  }

  List<String> _allFields() {
    return new List.from(_fieldNames)
      ..addAll(_getNonNullPipeNames())
      ..addAll(_genGetDirectiveFieldNames())
      ..addAll(_genGetDetectorFieldNames());
  }

  String _genHydrateDirectives() {
    var buf = new StringBuffer();
    var directiveFieldNames = _genGetDirectiveFieldNames();
    for (var i = 0; i < directiveFieldNames.length; ++i) {
      buf.writeln('${directiveFieldNames[i]} = directives.getDirectiveFor('
          '$_DIRECTIVES_ACCESSOR[$i].directiveIndex);');
    }
    return '$buf';
  }

  String _genHydrateDetectors() {
    var buf = new StringBuffer();
    var detectorFieldNames = _genGetDetectorFieldNames();
    for (var i = 0; i < detectorFieldNames.length; ++i) {
      buf.writeln('${detectorFieldNames[i]} = directives.getDetectorFor('
          '$_DIRECTIVES_ACCESSOR[$i].directiveIndex);');
    }
    return '$buf';
  }

  String _genPipeOnDestroy() =>
      _getNonNullPipeNames().map((p) => '$p.onDestroy();').join('');

  /// Generates calls to `onAllChangesDone` for all `Directive`s that request
  /// them.
  String _getCallOnAllChangesDoneBody() {
    // NOTE(kegluneq): Order is important!
    var directiveNotifications = _directiveRecords.reversed
        .where((rec) => rec.callOnAllChangesDone)
        .map((rec) =>
            '${_genGetDirective(rec.directiveIndex)}.onAllChangesDone();')
        .join('');
    return '''
      _dispatcher.notifyOnAllChangesDone();
      ${directiveNotifications}
    ''';
  }

  String _genLocalDefinitions() =>
      _localNames.map((name) => 'var $name = null;').join('');

  String _genChangeDefinitons() =>
      _changeNames.map((name) => 'var $name = false;').join('');

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
    var context = _localNames[r.contextIndex];
    var oldValue = _fieldNames[r.selfIndex];
    var newValue = _localNames[r.selfIndex];
    var change = _changeNames[r.selfIndex];

    var pipe = _pipeNames[r.selfIndex];
    var cdRef = r.mode == RecordType.BINDING_PIPE ? 'this.ref' : 'null';

    var protoIndex = r.selfIndex - 1;
    var pipeType = r.name;
    return '''
      $_CURRENT_PROTO = $_PROTOS_ACCESSOR[$protoIndex];
      if ($_IDENTICAL_CHECK_FN($pipe, $_UTIL.uninitialized())) {
        $pipe = $_PIPE_REGISTRY_ACCESSOR.get('$pipeType', $context, $cdRef);
      } else if (!$pipe.supports($context)) {
        $pipe.onDestroy();
        $pipe = $_PIPE_REGISTRY_ACCESSOR.get('$pipeType', $context, $cdRef);
      }

      $newValue = $pipe.transform($context);
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
    var oldValue = _fieldNames[r.selfIndex];
    var newValue = _localNames[r.selfIndex];

    var protoIndex = r.selfIndex - 1;
    var check = '''
      $_CURRENT_PROTO = $_PROTOS_ACCESSOR[$protoIndex];
      ${_genUpdateCurrentValue(r)}
      if (!$_IDENTICAL_CHECK_FN($newValue, $oldValue)) {
        ${_changeNames[r.selfIndex]} = true;
        ${_genUpdateDirectiveOrElement(r)}
        ${_genAddToChanges(r)}
        $oldValue = $newValue;
      }
    ''';
    if (r.isPureFunction()) {
      // Add an "if changed guard"
      var condition = r.args.map((a) => _changeNames[a]).join(' || ');
      return 'if ($condition) { $check }';
    } else {
      return check;
    }
  }

  String _genUpdateCurrentValue(ProtoRecord r) {
    var context = r.contextIndex == -1
        ? _genGetDirective(r.directiveIndex)
        : _localNames[r.contextIndex];

    var newValue = _localNames[r.selfIndex];
    var argString = r.args.map((arg) => _localNames[arg]).join(', ');

    var rhs;
    switch (r.mode) {
      case RecordType.SELF:
        rhs = context;
        break;

      case RecordType.CONST:
        rhs = JSON.encode(r.funcOrValue);
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
        rhs = '$context[${_localNames[r.args[0]]}]';
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
      res.write('${JSON.encode(r.fixedArgs[i])} + ${_localNames[r.args[i]]} +');
    }
    res.write(JSON.encode(r.fixedArgs[r.args.length]));
    return '$res';
  }

  String _genUpdateDirectiveOrElement(ProtoRecord r) {
    if (!r.lastInBinding) return '';

    var newValue = _localNames[r.selfIndex];
    var oldValue = _fieldNames[r.selfIndex];

    var br = r.bindingRecord;
    if (br.isDirective()) {
      var directiveProperty =
          '${_genGetDirective(br.directiveRecord.directiveIndex)}.${br.propertyName}';
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
    return '''
      if(throwOnChange) {
        $_UTIL.throwOnChange(
            $_CURRENT_PROTO, $_UTIL.simpleChange(${oldValue}, ${newValue}));
      }
    ''';
  }

  String _genAddToChanges(ProtoRecord r) {
    var newValue = _localNames[r.selfIndex];
    var oldValue = _fieldNames[r.selfIndex];
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
        '${_genGetDirective(br.directiveRecord.directiveIndex)}.onCheck();';
  }

  String _genOnInit(ProtoRecord r) {
    var br = r.bindingRecord;
    return 'if (!throwOnChange && !$_ALREADY_CHECKED_ACCESSOR) '
        '${_genGetDirective(br.directiveRecord.directiveIndex)}.onInit();';
  }

  String _genOnChange(ProtoRecord r) {
    var br = r.bindingRecord;
    return 'if (!throwOnChange && $_CHANGES_LOCAL != null) '
        '${_genGetDirective(br.directiveRecord.directiveIndex)}'
        '.onChange($_CHANGES_LOCAL);';
  }

  String _genNotifyOnPushDetectors(ProtoRecord r) {
    var br = r.bindingRecord;
    if (!r.lastInDirective || !br.isOnPushChangeDetection()) return '';
    return '''
      if($_IS_CHANGED_LOCAL) {
        ${_genGetDetector(br.directiveRecord.directiveIndex)}.markAsCheckOnce();
      }
    ''';
  }
}

const PROTO_CHANGE_DETECTOR_FACTORY_METHOD = 'newProtoChangeDetector';

const _ALREADY_CHECKED_ACCESSOR = '_alreadyChecked';
const _BASE_CLASS = '$_GEN_PREFIX.AbstractChangeDetector';
const _CHANGES_LOCAL = 'changes';
const _CONTEXT_ACCESSOR = '_context';
const _CURRENT_PROTO = 'currentProto';
const _DIRECTIVES_ACCESSOR = '_directiveRecords';
const _DISPATCHER_ACCESSOR = '_dispatcher';
const _GEN_PREFIX = '_gen';
const _GEN_RECORDS_METHOD_NAME = '_createRecords';
const _IDENTICAL_CHECK_FN = '$_GEN_PREFIX.looseIdentical';
const _IS_CHANGED_LOCAL = 'isChanged';
const _LOCALS_ACCESSOR = '_locals';
const _MODE_ACCESSOR = 'mode';
const _PREGEN_PROTO_CHANGE_DETECTOR_IMPORT =
    'package:angular2/src/change_detection/pregen_proto_change_detector.dart';
const _PIPE_REGISTRY_ACCESSOR = '_pipeRegistry';
const _PROTOS_ACCESSOR = '_protos';
const _UTIL = '$_GEN_PREFIX.ChangeDetectionUtil';
