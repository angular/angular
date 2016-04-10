library angular2.transform.template_compiler.change_detector_codegen;

import 'package:angular2/src/core/change_detection/change_detection.dart';
import 'package:angular2/src/core/change_detection/change_detection_util.dart';
import 'package:angular2/src/core/change_detection/codegen_facade.dart';
import 'package:angular2/src/core/change_detection/codegen_logic_util.dart';
import 'package:angular2/src/core/change_detection/codegen_name_util.dart';
import 'package:angular2/src/core/change_detection/directive_record.dart';
import 'package:angular2/src/core/change_detection/interfaces.dart';
import 'package:angular2/src/core/change_detection/proto_change_detector.dart';
import 'package:angular2/src/core/change_detection/proto_record.dart';
import 'package:angular2/src/core/change_detection/event_binding.dart';
import 'package:angular2/src/core/change_detection/binding_record.dart';
import 'package:angular2/src/core/change_detection/codegen_facade.dart'
    show codify;
import 'package:angular2/src/facade/exceptions.dart' show BaseException;
import 'package:angular2/src/facade/collection.dart' show ListWrapper;

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

  /// The module prefix for pregen_proto_change_detector
  final String _genPrefix;

  Codegen([this._genPrefix = _GEN_PREFIX_WITH_DOT]);

  /// Generates a change detector class with name `changeDetectorTypeName`,
  /// which must not conflict with other generated classes in the same
  /// `.template.dart` file.  The change detector is used to detect changes in
  /// Objects of type `typeName`.
  void generate(String typeName, String changeDetectorTypeName,
      ChangeDetectorDefinition def) {
    if (_names.contains(changeDetectorTypeName)) {
      throw new BaseException(
          'Change detector named "${changeDetectorTypeName}" for ${typeName} '
          'conflicts with an earlier generated change detector class.');
    }
    _names.add(changeDetectorTypeName);
    new _CodegenState(_genPrefix, typeName, changeDetectorTypeName, def)
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
  final ChangeDetectionStrategy _changeDetectionStrategy;
  final List<DirectiveRecord> _directiveRecords;
  final List<ProtoRecord> _records;
  final List<EventBinding> _eventBindings;
  final CodegenLogicUtil _logic;
  final CodegenNameUtil _names;
  final ChangeDetectorGenConfig _genConfig;
  final List<BindingTarget> _propertyBindingTargets;
  final List<int> _endOfBlockIdxs = [];

  String get _changeDetectionStrategyAsCode => _changeDetectionStrategy == null
      ? 'null'
      : '${_genPrefix}${_changeDetectionStrategy}';

  /// The module prefix for pregen_proto_change_detector
  final String _genPrefix;

  _CodegenState._(
      this._genPrefix,
      this._changeDetectorDefId,
      this._contextTypeName,
      this._changeDetectorTypeName,
      this._changeDetectionStrategy,
      this._records,
      this._propertyBindingTargets,
      this._eventBindings,
      this._directiveRecords,
      this._logic,
      this._names,
      this._genConfig);

  factory _CodegenState(String genPrefix, String typeName,
      String changeDetectorTypeName, ChangeDetectorDefinition def) {
    var protoRecords = createPropertyRecords(def);
    var eventBindings = createEventRecords(def);
    var propertyBindingTargets =
        def.bindingRecords.map((b) => b.target).toList();

    var names = new CodegenNameUtil(
        protoRecords, eventBindings, def.directiveRecords, '$genPrefix$_UTIL');
    var logic = new CodegenLogicUtil(
        names, '$genPrefix$_UTIL', '$genPrefix$_STATE');
    return new _CodegenState._(
        genPrefix,
        def.id,
        typeName,
        changeDetectorTypeName,
        def.strategy,
        protoRecords,
        propertyBindingTargets,
        eventBindings,
        def.directiveRecords,
        logic,
        names,
        def.genConfig);
  }

  void _writeToBuf(StringBuffer buf) {
    buf.write('''\n
      class $_changeDetectorTypeName extends ${_genPrefix}$_BASE_CLASS<$_contextTypeName> {
        ${_genDeclareFields()}

        $_changeDetectorTypeName()
          : super(${codify(_changeDetectorDefId)},
              ${_records.length},
              ${_changeDetectorTypeName}.${_GEN_PROPERTY_BINDING_TARGETS_NAME},
              ${_changeDetectorTypeName}.${_GEN_DIRECTIVE_INDICES_NAME},
              ${_changeDetectionStrategyAsCode}) {
          dehydrateDirectives(false);
        }

        void detectChangesInRecordsInternal(throwOnChange) {
          ${_names.genInitLocals()}
          var $_IS_CHANGED_LOCAL = false;
          var $_CHANGES_LOCAL = null;

          ${_genAllRecords()}
        }

        ${_maybeGenHandleEventInternal()}

        ${_maybeGenAfterContentLifecycleCallbacks()}

        ${_maybeGenAfterViewLifecycleCallbacks()}

        ${_maybeGenHydrateDirectives()}

        ${_maybeGenDehydrateDirectives()}

        ${_genPropertyBindingTargets()};

        ${_genDirectiveIndices()};

        static ${_genPrefix}ChangeDetector
            $CHANGE_DETECTOR_FACTORY_METHOD() {
          return new $_changeDetectorTypeName();
        }
      }
    ''');
  }

  String _genAllRecords() {
    _endOfBlockIdxs.clear();
    List<String> res = [];
    for (int i = 0; i < _records.length; i++) {
      res.add(_genRecord(_records[i], i));
    }
    return res.join('');
  }

  String _genPropertyBindingTargets() {
    var targets = _logic.genPropertyBindingTargets(
        _propertyBindingTargets, this._genConfig.genDebugInfo);
    return "static final ${_GEN_PROPERTY_BINDING_TARGETS_NAME} = ${targets}";
  }

  String _genDirectiveIndices() {
    var indices = _logic.genDirectiveIndices(_directiveRecords);
    return "static final ${_GEN_DIRECTIVE_INDICES_NAME} = ${indices}";
  }

  String _maybeGenHandleEventInternal() {
    if (_eventBindings.length > 0) {
      var handlers =
          _eventBindings.map((eb) => _genEventBinding(eb)).join("\n");
      return '''
        handleEventInternal(eventName, elIndex, locals) {
          var ${this._names.getPreventDefaultAccesor()} = false;
          ${this._names.genInitEventLocals()}
          ${handlers}
          return ${this._names.getPreventDefaultAccesor()};
        }
      ''';
    } else {
      return '';
    }
  }

  String _genEventBinding(EventBinding eb) {
    List<String> codes = [];
    _endOfBlockIdxs.clear();

    ListWrapper.forEachWithIndex(eb.records, (ProtoRecord _, int i) {
      var code;
      var r = eb.records[i];

      if (r.isConditionalSkipRecord()) {
        code = _genConditionalSkip(r, _names.getEventLocalName(eb, i));
      } else if (r.isUnconditionalSkipRecord()) {
        code = _genUnconditionalSkip(r);
      } else {
        code = _genEventBindingEval(eb, r);
      }

      code += this._genEndOfSkipBlock(i);

      codes.add(code);
    });

    return '''
    if (eventName == "${eb.eventName}" && elIndex == ${eb.elIndex}) {
    ${codes.join("\n")}
    }''';
  }

  String _genEventBindingEval(EventBinding eb, ProtoRecord r) {
    if (r.lastInBinding) {
      var evalRecord = _logic.genEventBindingEvalValue(eb, r);
      var markPath = _genMarkPathToRootAsCheckOnce(r);
      var prevDefault = _genUpdatePreventDefault(eb, r);
      return "${markPath}\n${evalRecord}\n${prevDefault}";
    } else {
      return _logic.genEventBindingEvalValue(eb, r);
    }
  }

  String _genMarkPathToRootAsCheckOnce(ProtoRecord r) {
    var br = r.bindingRecord;
    if (!br.isDefaultChangeDetection()) {
      return "${_names.getDetectorName(br.directiveRecord.directiveIndex)}.markPathToRootAsCheckOnce();";
    } else {
      return "";
    }
  }

  String _genUpdatePreventDefault(EventBinding eb, ProtoRecord r) {
    var local = this._names.getEventLocalName(eb, r.selfIndex);
    return """if (${local} == false) { ${_names.getPreventDefaultAccesor()} = true; }""";
  }

  void _writeInitToBuf(StringBuffer buf) {
    buf.write('''
      ${_genPrefix}preGeneratedProtoDetectors['$_changeDetectorDefId'] =
          $_changeDetectorTypeName.newProtoChangeDetector;
    ''');
  }

  String _maybeGenDehydrateDirectives() {
    var destroyPipesParamName = 'destroyPipes';
    var destroyPipesCode = _names.genPipeOnDestroy();
    var dehydrateFieldsCode = _names.genDehydrateFields();
    var destroyDirectivesCode =
        _logic.genDirectivesOnDestroy(this._directiveRecords);
    if (destroyPipesCode.isEmpty &&
        dehydrateFieldsCode.isEmpty &&
        destroyDirectivesCode.isEmpty) return '';
    return '''void dehydrateDirectives(${destroyPipesParamName}) {
      if (${destroyPipesParamName}) {
        ${destroyPipesCode}
        ${destroyDirectivesCode}
      }
      ${dehydrateFieldsCode}
    }''';
  }

  String _maybeGenHydrateDirectives() {
    var hydrateDirectivesCode = _logic.genHydrateDirectives(_directiveRecords);
    var hydrateDetectorsCode = _logic.genHydrateDetectors(_directiveRecords);
    if (hydrateDirectivesCode.isEmpty && hydrateDetectorsCode.isEmpty) {
      return '';
    }
    return 'void hydrateDirectives(directives) '
        '{ $hydrateDirectivesCode $hydrateDetectorsCode }';
  }

  String _maybeGenAfterContentLifecycleCallbacks() {
    var directiveNotifications =
        _logic.genContentLifecycleCallbacks(_directiveRecords);
    if (directiveNotifications.isNotEmpty) {
      return '''
        void afterContentLifecycleCallbacksInternal() {
          ${directiveNotifications.join('')}
        }
      ''';
    } else {
      return '';
    }
  }

  String _maybeGenAfterViewLifecycleCallbacks() {
    var directiveNotifications =
        _logic.genViewLifecycleCallbacks(_directiveRecords);
    if (directiveNotifications.isNotEmpty) {
      return '''
        void afterViewLifecycleCallbacksInternal() {
          ${directiveNotifications.join('')}
        }
      ''';
    } else {
      return '';
    }
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

  String _genRecord(ProtoRecord r, int index) {
    var code = null;
    if (r.isLifeCycleRecord()) {
      code = _genDirectiveLifecycle(r);
    } else if (r.isPipeRecord()) {
      code = _genPipeCheck(r);
    } else if (r.isConditionalSkipRecord()) {
      code = _genConditionalSkip(r, _names.getLocalName(r.contextIndex));
    } else if (r.isUnconditionalSkipRecord()) {
      code = _genUnconditionalSkip(r);
    } else {
      code = _genReferenceCheck(r);
    }

    code = '''
      ${this._maybeFirstInBinding(r)}
      ${code}
      ${this._maybeGenLastInDirective(r)}
      ${this._genEndOfSkipBlock(index)}
    ''';

    return code;
  }

  String _genConditionalSkip(ProtoRecord r, String condition) {
    var maybeNegate = r.mode == RecordType.SkipRecordsIf ? '!' : '';
    _endOfBlockIdxs.add(r.fixedArgs[0] - 1);

    return 'if ($maybeNegate$condition) {';
  }

  String _genUnconditionalSkip(ProtoRecord r) {
    _endOfBlockIdxs.removeLast();
    _endOfBlockIdxs.add(r.fixedArgs[0] - 1);
    return '} else {';
  }

  String _genEndOfSkipBlock(int protoIndex) {
    if (!ListWrapper.isEmpty(this._endOfBlockIdxs)) {
      var endOfBlock = ListWrapper.last(this._endOfBlockIdxs);
      if (protoIndex == endOfBlock) {
        this._endOfBlockIdxs.removeLast();
        return '}';
      }
    }

    return '';
  }

  String _genDirectiveLifecycle(ProtoRecord r) {
    if (r.name == 'DoCheck') {
      return _genDoCheck(r);
    } else if (r.name == 'OnInit') {
      return _genOnInit(r);
    } else if (r.name == 'OnChanges') {
      return _genOnChanges(r);
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
    var pipeType = r.name;

    var init = '''
      if ($pipe == ${_genPrefix}$_UTIL.uninitialized) {
        $pipe = ${_names.getPipesAccessorName()}.get('$pipeType');
      }
    ''';

    var read = '''
      $newValue = $pipe.pipe.transform($context, [$argString]);
    ''';

    var contexOrArgCheck = r.args.map((a) => _names.getChangeName(a)).toList();
    contexOrArgCheck.add(_names.getChangeName(r.contextIndex));
    var condition = '''!${pipe}.pure || (${contexOrArgCheck.join(" || ")})''';

    var check = '''
      ${_genThrowOnChangeCheck(oldValue, newValue)}
      if (${_genPrefix}$_UTIL.looseNotIdentical($oldValue, $newValue)) {
        $newValue = ${_genPrefix}$_UTIL.unwrapValue($newValue);
        ${_genChangeMarker(r)}
        ${_genUpdateDirectiveOrElement(r)}
        ${_genAddToChanges(r)}
        $oldValue = $newValue;
      }
    ''';

    var genCode = r.shouldBeChecked() ? '''${read}${check}''' : read;

    if (r.isUsedByOtherRecord()) {
      return '''${init} if (${condition}) { ${genCode} } else { ${newValue} = ${oldValue}; }''';
    } else {
      return '''${init} if (${condition}) { ${genCode} }''';
    }
  }

  String _genReferenceCheck(ProtoRecord r) {
    var oldValue = _names.getFieldName(r.selfIndex);
    var newValue = _names.getLocalName(r.selfIndex);
    var read = '''
      ${_logic.genPropertyBindingEvalValue(r)}
    ''';

    var check = '''
      ${_genThrowOnChangeCheck(oldValue, newValue)}
      if (${_genPrefix}$_UTIL.looseNotIdentical($newValue, $oldValue)) {
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
      } else {
        return 'if ($condition) { $genCode }';
      }
    } else {
      return genCode;
    }
  }

  String _genChangeMarker(ProtoRecord r) {
    return r.argumentToPureFunction
        ? "${this._names.getChangeName(r.selfIndex)} = true;"
        : "";
  }

  String _genUpdateDirectiveOrElement(ProtoRecord r) {
    if (!r.lastInBinding) return '';

    var newValue = _names.getLocalName(r.selfIndex);
    var notifyDebug = _genConfig.logBindingUpdate
        ? "this.logBindingUpdate(${newValue});"
        : "";

    var br = r.bindingRecord;
    if (br.target.isDirective()) {
      var directiveProperty =
          '${_names.getDirectiveName(br.directiveRecord.directiveIndex)}.${br.target.name}';
      return '''
      $directiveProperty = $newValue;
      ${notifyDebug}
      $_IS_CHANGED_LOCAL = true;
    ''';
    } else {
      return '''
      this.notifyDispatcher(${newValue});
      ${notifyDebug}
    ''';
    }
  }

  String _genThrowOnChangeCheck(String oldValue, String newValue) {
    return '''
      if(${_genPrefix}assertionsEnabled() && throwOnChange && !${_genPrefix}${_UTIL}.devModeEqual(${oldValue}, ${newValue})) {
        this.throwOnChangeError(${oldValue}, ${newValue});
      }
    ''';
  }

  String _maybeFirstInBinding(ProtoRecord r) {
    var prev = ChangeDetectionUtil.protoByIndex(_records, r.selfIndex - 1);
    var firstInBindng = prev == null || prev.bindingRecord != r.bindingRecord;
    return firstInBindng && !r.bindingRecord.isDirectiveLifecycle()
        ? "${_names.getPropertyBindingIndex()} = ${r.propertyBindingIndex};"
        : '';
  }

  String _genAddToChanges(ProtoRecord r) {
    var newValue = _names.getLocalName(r.selfIndex);
    var oldValue = _names.getFieldName(r.selfIndex);
    if (!r.bindingRecord.callOnChanges()) return '';
    return "$_CHANGES_LOCAL = addChange($_CHANGES_LOCAL, $oldValue, $newValue);";
  }

  String _maybeGenLastInDirective(ProtoRecord r) {
    if (!r.lastInDirective) return '';
    return '''
      $_CHANGES_LOCAL = null;
      ${_genNotifyOnPushDetectors(r)}
      $_IS_CHANGED_LOCAL = false;
    ''';
  }

  String _genDoCheck(ProtoRecord r) {
    var br = r.bindingRecord;
    return 'if (!throwOnChange) '
        '${_names.getDirectiveName(br.directiveRecord.directiveIndex)}.ngDoCheck();';
  }

  String _genOnInit(ProtoRecord r) {
    var br = r.bindingRecord;
    return 'if (!throwOnChange && ${_names.getStateName()} == ${_genPrefix}$_STATE.NeverChecked) '
        '${_names.getDirectiveName(br.directiveRecord.directiveIndex)}.ngOnInit();';
  }

  String _genOnChanges(ProtoRecord r) {
    var br = r.bindingRecord;
    return 'if (!throwOnChange && $_CHANGES_LOCAL != null) '
        '${_names.getDirectiveName(br.directiveRecord.directiveIndex)}'
        '.ngOnChanges($_CHANGES_LOCAL);';
  }

  String _genNotifyOnPushDetectors(ProtoRecord r) {
    var br = r.bindingRecord;
    if (!r.lastInDirective || br.isDefaultChangeDetection()) return '';
    return '''
      if($_IS_CHANGED_LOCAL) {
        ${_names.getDetectorName(br.directiveRecord.directiveIndex)}.markAsCheckOnce();
      }
    ''';
  }
}

const CHANGE_DETECTOR_FACTORY_METHOD = 'newChangeDetector';

const _BASE_CLASS = 'AbstractChangeDetector';
const _CHANGES_LOCAL = 'changes';
const _GEN_PREFIX = '_gen';
const _GEN_PREFIX_WITH_DOT = _GEN_PREFIX + '.';
const _GEN_RECORDS_METHOD_NAME = '_createRecords';
const _IS_CHANGED_LOCAL = 'isChanged';
const _PREGEN_PROTO_CHANGE_DETECTOR_IMPORT =
    'package:angular2/src/core/change_detection/pregen_proto_change_detector.dart';
const _GEN_PROPERTY_BINDING_TARGETS_NAME =
    '${_GEN_PREFIX}_propertyBindingTargets';
const _GEN_DIRECTIVE_INDICES_NAME = '${_GEN_PREFIX}_directiveIndices';
const _UTIL = 'ChangeDetectionUtil';
const _STATE = 'ChangeDetectorState';
