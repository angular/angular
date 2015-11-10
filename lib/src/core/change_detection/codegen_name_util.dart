library angular2.src.core.change_detection.codegen_name_util;

import "package:angular2/src/facade/lang.dart"
    show RegExpWrapper, StringWrapper;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper, Map;
import "directive_record.dart" show DirectiveIndex;
import "proto_record.dart" show ProtoRecord;
import "event_binding.dart" show EventBinding;
// The names of these fields must be kept in sync with abstract_change_detector.ts or change

// detection will fail.
const _STATE_ACCESSOR = "state";
const _CONTEXT_ACCESSOR = "context";
const _PROP_BINDING_INDEX = "propertyBindingIndex";
const _DIRECTIVES_ACCESSOR = "directiveIndices";
const _DISPATCHER_ACCESSOR = "dispatcher";
const _LOCALS_ACCESSOR = "locals";
const _MODE_ACCESSOR = "mode";
const _PIPES_ACCESSOR = "pipes";
const _PROTOS_ACCESSOR = "protos";
const CONTEXT_ACCESSOR = "context";
// `context` is always first.
const CONTEXT_INDEX = 0;
const _FIELD_PREFIX = "this.";
var _whiteSpaceRegExp = new RegExp(r'\W');
/**
 * Returns `s` with all non-identifier characters removed.
 */
String sanitizeName(String s) {
  return StringWrapper.replaceAll(s, _whiteSpaceRegExp, "");
}

/**
 * Class responsible for providing field and local variable names for change detector classes.
 * Also provides some convenience functions, for example, declaring variables, destroying pipes,
 * and dehydrating the detector.
 */
class CodegenNameUtil {
  List<ProtoRecord> _records;
  List<EventBinding> _eventBindings;
  List<dynamic> _directiveRecords;
  String _utilName;
  /**
   * Record names sanitized for use as fields.
   * See [sanitizeName] for details.
   * @internal
   */
  List<String> _sanitizedNames;
  /** @internal */
  var _sanitizedEventNames = new Map<EventBinding, List<String>>();
  CodegenNameUtil(this._records, this._eventBindings, this._directiveRecords,
      this._utilName) {
    this._sanitizedNames =
        ListWrapper.createFixedSize(this._records.length + 1);
    this._sanitizedNames[CONTEXT_INDEX] = CONTEXT_ACCESSOR;
    for (var i = 0, iLen = this._records.length; i < iLen; ++i) {
      this._sanitizedNames[i + 1] =
          sanitizeName('''${ this . _records [ i ] . name}${ i}''');
    }
    for (var ebIndex = 0; ebIndex < _eventBindings.length; ++ebIndex) {
      var eb = _eventBindings[ebIndex];
      var names = [CONTEXT_ACCESSOR];
      for (var i = 0, iLen = eb.records.length; i < iLen; ++i) {
        names.add(
            sanitizeName('''${ eb . records [ i ] . name}${ i}_${ ebIndex}'''));
      }
      this._sanitizedEventNames[eb] = names;
    }
  }
  /** @internal */
  String _addFieldPrefix(String name) {
    return '''${ _FIELD_PREFIX}${ name}''';
  }

  String getDispatcherName() {
    return this._addFieldPrefix(_DISPATCHER_ACCESSOR);
  }

  String getPipesAccessorName() {
    return this._addFieldPrefix(_PIPES_ACCESSOR);
  }

  String getProtosName() {
    return this._addFieldPrefix(_PROTOS_ACCESSOR);
  }

  String getDirectivesAccessorName() {
    return this._addFieldPrefix(_DIRECTIVES_ACCESSOR);
  }

  String getLocalsAccessorName() {
    return this._addFieldPrefix(_LOCALS_ACCESSOR);
  }

  String getStateName() {
    return this._addFieldPrefix(_STATE_ACCESSOR);
  }

  String getModeName() {
    return this._addFieldPrefix(_MODE_ACCESSOR);
  }

  String getPropertyBindingIndex() {
    return this._addFieldPrefix(_PROP_BINDING_INDEX);
  }

  String getLocalName(num idx) {
    return '''l_${ this . _sanitizedNames [ idx ]}''';
  }

  String getEventLocalName(EventBinding eb, num idx) {
    return '''l_${ this . _sanitizedEventNames [ eb ] [ idx ]}''';
  }

  String getChangeName(num idx) {
    return '''c_${ this . _sanitizedNames [ idx ]}''';
  }

  /**
   * Generate a statement initializing local variables used when detecting changes.
   */
  String genInitLocals() {
    var declarations = [];
    var assignments = [];
    for (var i = 0, iLen = this.getFieldCount(); i < iLen; ++i) {
      if (i == CONTEXT_INDEX) {
        declarations.add(
            '''${ this . getLocalName ( i )} = ${ this . getFieldName ( i )}''');
      } else {
        var rec = this._records[i - 1];
        if (rec.argumentToPureFunction) {
          var changeName = this.getChangeName(i);
          declarations.add('''${ this . getLocalName ( i )},${ changeName}''');
          assignments.add(changeName);
        } else {
          declarations.add('''${ this . getLocalName ( i )}''');
        }
      }
    }
    var assignmentsCode = ListWrapper.isEmpty(assignments)
        ? ""
        : '''${ assignments . join ( "=" )} = false;''';
    return '''var ${ declarations . join ( "," )};${ assignmentsCode}''';
  }

  /**
   * Generate a statement initializing local variables for event handlers.
   */
  String genInitEventLocals() {
    var res = [
      '''${ this . getLocalName ( CONTEXT_INDEX )} = ${ this . getFieldName ( CONTEXT_INDEX )}'''
    ];
    this._sanitizedEventNames.forEach((eb, names) {
      for (var i = 0; i < names.length; ++i) {
        if (!identical(i, CONTEXT_INDEX)) {
          res.add('''${ this . getEventLocalName ( eb , i )}''');
        }
      }
    });
    return res.length > 1 ? '''var ${ res . join ( "," )};''' : "";
  }

  String getPreventDefaultAccesor() {
    return "preventDefault";
  }

  num getFieldCount() {
    return this._sanitizedNames.length;
  }

  String getFieldName(num idx) {
    return this._addFieldPrefix(this._sanitizedNames[idx]);
  }

  List<String> getAllFieldNames() {
    var fieldList = [];
    for (var k = 0, kLen = this.getFieldCount(); k < kLen; ++k) {
      if (identical(k, 0) || this._records[k - 1].shouldBeChecked()) {
        fieldList.add(this.getFieldName(k));
      }
    }
    for (var i = 0, iLen = this._records.length; i < iLen; ++i) {
      var rec = this._records[i];
      if (rec.isPipeRecord()) {
        fieldList.add(this.getPipeName(rec.selfIndex));
      }
    }
    for (var j = 0, jLen = this._directiveRecords.length; j < jLen; ++j) {
      var dRec = this._directiveRecords[j];
      fieldList.add(this.getDirectiveName(dRec.directiveIndex));
      if (!dRec.isDefaultChangeDetection()) {
        fieldList.add(this.getDetectorName(dRec.directiveIndex));
      }
    }
    return fieldList;
  }

  /**
   * Generates statements which clear all fields so that the change detector is dehydrated.
   */
  String genDehydrateFields() {
    var fields = this.getAllFieldNames();
    ListWrapper.removeAt(fields, CONTEXT_INDEX);
    if (ListWrapper.isEmpty(fields)) return "";
    // At least one assignment.
    fields.add('''${ this . _utilName}.uninitialized;''');
    return fields.join(" = ");
  }

  /**
   * Generates statements destroying all pipe variables.
   */
  String genPipeOnDestroy() {
    return this
        ._records
        .where((r) => r.isPipeRecord())
        .toList()
        .map((r) =>
            '''${ this . _utilName}.callPipeOnDestroy(${ this . getPipeName ( r . selfIndex )});''')
        .toList()
        .join("\n");
  }

  String getPipeName(num idx) {
    return this._addFieldPrefix('''${ this . _sanitizedNames [ idx ]}_pipe''');
  }

  String getDirectiveName(DirectiveIndex d) {
    return this._addFieldPrefix('''directive_${ d . name}''');
  }

  String getDetectorName(DirectiveIndex d) {
    return this._addFieldPrefix('''detector_${ d . name}''');
  }
}
