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
      List<ProtoRecord> records, List<DirectiveRecord> directiveRecords,
      this._generateCheckNoChanges)
      : _records = records,
        _directiveRecords = directiveRecords,
        _names = new CodegenNameUtil(records, directiveRecords, _UTIL),
        _changeDetectionMode = ChangeDetectionUtil
            .changeDetectionMode(changeDetectionStrategy);

  factory _CodegenState(String typeName, String changeDetectorTypeName,
      ChangeDetectorDefinition def) {
    var protoRecords = new ProtoRecordBuilder();
    def.bindingRecords
        .forEach((rec) => protoRecords.add(rec, def.variableNames));
    var records = coalesce(protoRecords.records);
    return new _CodegenState._(def.id, typeName, changeDetectorTypeName,
        def.strategy, records, def.directiveRecords,
        def.generateCheckNoChanges);
  }

  void _writeToBuf(StringBuffer buf) {
    buf.write('''\n
      class $_changeDetectorTypeName extends $_BASE_CLASS<$_contextTypeName> {
        ${_genDeclareFields()}

        $_changeDetectorTypeName(dispatcher, protos, directiveRecords)
          : super(${_encodeValue(_changeDetectorDefId)},
              dispatcher, protos, directiveRecords, '$_changeDetectionMode') {
          dehydrateDirectives(false);
        }

        void detectChangesInRecordsInternal(throwOnChange) {
          ${_names.getCurrentProtoName()} = null;

          ${_names.genInitLocals()}
          var $_IS_CHANGED_LOCAL = false;
          var $_CHANGES_LOCAL = null;

          ${_records.map(_genRecord).join('')}

          ${_names.getAlreadyCheckedName()} = true;
        }

        ${_genCheckNoChanges()}

        void callOnAllChangesDone() {
          ${_getCallOnAllChangesDoneBody()}
        }

        ${_maybeGenHydrateDirectives()}

        ${_maybeGenDehydrateDirectives()}

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

  String _maybeGenDehydrateDirectives() {
    var destroyPipesParamName = 'destroyPipes';
    var destroyPipesCode = _names.genPipeOnDestroy();
    if (destroyPipesCode.isNotEmpty) {
      destroyPipesCode = 'if (${destroyPipesParamName}) {${destroyPipesCode}}';
    }
    var dehydrateFieldsCode = _names.genDehydrateFields();
    if (destroyPipesCode.isEmpty && dehydrateFieldsCode.isEmpty) return '';
    return 'void dehydrateDirectives(${destroyPipesParamName}) '
        '{ ${destroyPipesCode} ${dehydrateFieldsCode} }';
  }

  String _maybeGenHydrateDirectives() {
    var hydrateDirectivesCode = _genHydrateDirectives();
    var hydrateDetectorsCode = _genHydrateDetectors();
    if (hydrateDirectivesCode.isEmpty && hydrateDetectorsCode.isEmpty) {
      return '';
    }
    return 'void hydrateDirectives(directives) '
        '{ $hydrateDirectivesCode $hydrateDetectorsCode }';
  }

  String _genHydrateDirectives() {
    var buf = new StringBuffer();
    var directiveFieldNames = _names.getAllDirectiveNames();
    for (var i = 0; i < directiveFieldNames.length; ++i) {
      buf.writeln('${directiveFieldNames[i]} = directives.getDirectiveFor('
          '${_names.getDirectivesAccessorName()}[$i].directiveIndex);');
    }
    return '$buf';
  }

  String _genHydrateDetectors() {
    var buf = new StringBuffer();
    var detectorFieldNames = _names.getAllDetectorNames();
    for (var i = 0; i < detectorFieldNames.length; ++i) {
      buf.writeln('${detectorFieldNames[i]} = directives.getDetectorFor('
          '${_names.getDirectivesAccessorName()}[$i].directiveIndex);');
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
      ${_names.getDispatcherName()}.notifyOnAllChangesDone();
      ${directiveNotifications}
    ''';
  }

  String _genDeclareFields() {
    var fields = _names.getAllFieldNames();
    // If there's only one field, it's `context`, declared in the superclass.
    if (fields.length == 1) return '';
    fields.removeAt(CONTEXT_INDEX);
    var toRemove = 'this.';
    var declareNames = fields
        .map((f) => f.startsWith(toRemove) ? f.substring(toRemove.length) : f);
    return 'var ${declareNames.join(', ')};';
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

    var pipe = _names.getPipeName(r.selfIndex);
    var cdRef = 'this.ref';

    var protoIndex = r.selfIndex - 1;
    var pipeType = r.name;

    var read = '''
      ${_names.getCurrentProtoName()} = ${_names.getProtosName()}[$protoIndex];
      if ($_IDENTICAL_CHECK_FN($pipe, $_UTIL.uninitialized)) {
        $pipe = ${_names.getPipesAccessorName()}.get('$pipeType', $context, $cdRef);
      } else if (!$pipe.supports($context)) {
        $pipe.onDestroy();
        $pipe = ${_names.getPipesAccessorName()}.get('$pipeType', $context, $cdRef);
      }
      $newValue = $pipe.transform($context, [$argString]);
    ''';

    var check = '''
      if ($_NOT_IDENTICAL_CHECK_FN($oldValue, $newValue)) {
        $newValue = $_UTIL.unwrapValue($newValue);
        ${_genChangeMarker(r)}
        ${_genUpdateDirectiveOrElement(r)}
        ${_genAddToChanges(r)}
        $oldValue = $newValue;
      }
    ''';

    return r.shouldBeChecked() ? "${read}${check}" : read;
  }

  String _genReferenceCheck(ProtoRecord r) {
    var oldValue = _names.getFieldName(r.selfIndex);
    var newValue = _names.getLocalName(r.selfIndex);

    var protoIndex = r.selfIndex - 1;

    var read = '''
      ${_names.getCurrentProtoName()} = ${_names.getProtosName()}[$protoIndex];
      ${_genUpdateCurrentValue(r)}
    ''';

    var check = '''
      if ($_NOT_IDENTICAL_CHECK_FN($newValue, $oldValue)) {
        ${_genChangeMarker(r)}
        ${_genUpdateDirectiveOrElement(r)}
        ${_genAddToChanges(r)}
        $oldValue = $newValue;
      }
    ''';

    var genCode = r.shouldBeChecked() ? "${read}${check}" : read;

    if (r.isPureFunction()) {
      // Add an "if changed guard"
      var condition = r.args.map((a) => _names.getChangeName(a)).join(' || ');
      if (r.isUsedByOtherRecord()) {
        return 'if ($condition) { $genCode } else { $newValue = $oldValue; }';
      } else  {
        return 'if ($condition) { $genCode }';
      }
    } else {
      return genCode;
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
        rhs = '${_names.getLocalsAccessorName()}.get("${r.name}")';
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

      case RecordType.COLLECTION_LITERAL:
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

  String _genChangeMarker(ProtoRecord r) {
    return r.argumentToPureFunction ? "${this._names.getChangeName(r.selfIndex)} = true;" : "";
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
      ${_names.getDispatcherName()}.notifyOnBinding(
          ${_names.getCurrentProtoName()}.bindingRecord, ${newValue});
    ''';
    }
  }

  String _genThrowOnChangeCheck(String oldValue, String newValue) {
    if (this._generateCheckNoChanges) {
      return '''
        if(throwOnChange) {
          $_UTIL.throwOnChange(
              ${_names.getCurrentProtoName()}, $_UTIL.simpleChange(${oldValue}, ${newValue}));
        }
      ''';
    } else {
      return "";
    }
  }

  String _genCheckNoChanges() {
    if (this._generateCheckNoChanges) {
      return 'void checkNoChanges() { runDetectChanges(true); }';
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
          ${_names.getCurrentProtoName()}.bindingRecord.propertyName,
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
    return 'if (!throwOnChange && !${_names.getAlreadyCheckedName()}) '
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

const _BASE_CLASS = '$_GEN_PREFIX.AbstractChangeDetector';
const _CHANGES_LOCAL = 'changes';
const _GEN_PREFIX = '_gen';
const _GEN_RECORDS_METHOD_NAME = '_createRecords';
const _IDENTICAL_CHECK_FN = '$_GEN_PREFIX.looseIdentical';
const _NOT_IDENTICAL_CHECK_FN = '$_GEN_PREFIX.looseNotIdentical';
const _IS_CHANGED_LOCAL = 'isChanged';
const _PREGEN_PROTO_CHANGE_DETECTOR_IMPORT =
    'package:angular2/src/change_detection/pregen_proto_change_detector.dart';
const _UTIL = '$_GEN_PREFIX.ChangeDetectionUtil';
