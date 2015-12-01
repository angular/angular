library angular2.src.core.change_detection.codegen_logic_util;

import "package:angular2/src/facade/lang.dart"
    show IS_DART, Json, StringWrapper, isPresent, isBlank;
import "codegen_name_util.dart" show CodegenNameUtil;
import "codegen_facade.dart" show codify, combineGeneratedStrings, rawString;
import "proto_record.dart" show ProtoRecord, RecordType;
import "binding_record.dart" show BindingTarget;
import "directive_record.dart" show DirectiveRecord;
import "constants.dart" show ChangeDetectionStrategy;
import "package:angular2/src/facade/exceptions.dart" show BaseException;

/**
 * Class responsible for providing change detection logic for change detector classes.
 */
class CodegenLogicUtil {
  CodegenNameUtil _names;
  String _utilName;
  String _changeDetectorStateName;
  ChangeDetectionStrategy _changeDetection;
  CodegenLogicUtil(this._names, this._utilName, this._changeDetectorStateName,
      this._changeDetection) {}
  /**
   * Generates a statement which updates the local variable representing `protoRec` with the current
   * value of the record. Used by property bindings.
   */
  String genPropertyBindingEvalValue(ProtoRecord protoRec) {
    return this._genEvalValue(protoRec, (idx) => this._names.getLocalName(idx),
        this._names.getLocalsAccessorName());
  }

  /**
   * Generates a statement which updates the local variable representing `protoRec` with the current
   * value of the record. Used by event bindings.
   */
  String genEventBindingEvalValue(dynamic eventRecord, ProtoRecord protoRec) {
    return this._genEvalValue(protoRec,
        (idx) => this._names.getEventLocalName(eventRecord, idx), "locals");
  }

  String _genEvalValue(
      ProtoRecord protoRec, Function getLocalName, String localsAccessor) {
    var context = (protoRec.contextIndex == -1)
        ? this._names.getDirectiveName(protoRec.directiveIndex)
        : getLocalName(protoRec.contextIndex);
    var argString =
        protoRec.args.map((arg) => getLocalName(arg)).toList().join(", ");
    String rhs;
    switch (protoRec.mode) {
      case RecordType.Self:
        rhs = context;
        break;
      case RecordType.Const:
        rhs = codify(protoRec.funcOrValue);
        break;
      case RecordType.PropertyRead:
        rhs = this._observe('''${ context}.${ protoRec . name}''', protoRec);
        break;
      case RecordType.SafeProperty:
        var read =
            this._observe('''${ context}.${ protoRec . name}''', protoRec);
        rhs =
            '''${ this . _utilName}.isValueBlank(${ context}) ? null : ${ this . _observe ( read , protoRec )}''';
        break;
      case RecordType.PropertyWrite:
        rhs =
            '''${ context}.${ protoRec . name} = ${ getLocalName ( protoRec . args [ 0 ] )}''';
        break;
      case RecordType.Local:
        rhs = this._observe(
            '''${ localsAccessor}.get(${ rawString ( protoRec . name )})''',
            protoRec);
        break;
      case RecordType.InvokeMethod:
        rhs = this._observe(
            '''${ context}.${ protoRec . name}(${ argString})''', protoRec);
        break;
      case RecordType.SafeMethodInvoke:
        var invoke = '''${ context}.${ protoRec . name}(${ argString})''';
        rhs =
            '''${ this . _utilName}.isValueBlank(${ context}) ? null : ${ this . _observe ( invoke , protoRec )}''';
        break;
      case RecordType.InvokeClosure:
        rhs = '''${ context}(${ argString})''';
        break;
      case RecordType.PrimitiveOp:
        rhs = '''${ this . _utilName}.${ protoRec . name}(${ argString})''';
        break;
      case RecordType.CollectionLiteral:
        rhs = '''${ this . _utilName}.${ protoRec . name}(${ argString})''';
        break;
      case RecordType.Interpolate:
        rhs = this._genInterpolation(protoRec);
        break;
      case RecordType.KeyedRead:
        rhs = this._observe(
            '''${ context}[${ getLocalName ( protoRec . args [ 0 ] )}]''',
            protoRec);
        break;
      case RecordType.KeyedWrite:
        rhs =
            '''${ context}[${ getLocalName ( protoRec . args [ 0 ] )}] = ${ getLocalName ( protoRec . args [ 1 ] )}''';
        break;
      case RecordType.Chain:
        rhs = "null";
        break;
      default:
        throw new BaseException('''Unknown operation ${ protoRec . mode}''');
    }
    return '''${ getLocalName ( protoRec . selfIndex )} = ${ rhs};''';
  }

  /** @internal */
  String _observe(String exp, ProtoRecord rec) {
    // This is an experimental feature. Works only in Dart.
    if (identical(
        this._changeDetection, ChangeDetectionStrategy.OnPushObserve)) {
      return '''this.observeValue(${ exp}, ${ rec . selfIndex})''';
    } else {
      return exp;
    }
  }

  String genPropertyBindingTargets(
      List<BindingTarget> propertyBindingTargets, bool genDebugInfo) {
    var bs = propertyBindingTargets.map((b) {
      if (isBlank(b)) return "null";
      var debug = genDebugInfo ? codify(b.debug) : "null";
      return '''${ this . _utilName}.bindingTarget(${ codify ( b . mode )}, ${ b . elementIndex}, ${ codify ( b . name )}, ${ codify ( b . unit )}, ${ debug})''';
    }).toList();
    return '''[${ bs . join ( ", " )}]''';
  }

  String genDirectiveIndices(List<DirectiveRecord> directiveRecords) {
    var bs = directiveRecords
        .map((b) =>
            '''${ this . _utilName}.directiveIndex(${ b . directiveIndex . elementIndex}, ${ b . directiveIndex . directiveIndex})''')
        .toList();
    return '''[${ bs . join ( ", " )}]''';
  }

  /** @internal */
  String _genInterpolation(ProtoRecord protoRec) {
    var iVals = [];
    for (var i = 0; i < protoRec.args.length; ++i) {
      iVals.add(codify(protoRec.fixedArgs[i]));
      iVals.add(
          '''${ this . _utilName}.s(${ this . _names . getLocalName ( protoRec . args [ i ] )})''');
    }
    iVals.add(codify(protoRec.fixedArgs[protoRec.args.length]));
    return combineGeneratedStrings(iVals);
  }

  String genHydrateDirectives(List<DirectiveRecord> directiveRecords) {
    var res = [];
    for (var i = 0; i < directiveRecords.length; ++i) {
      var r = directiveRecords[i];
      res.add(
          '''${ this . _names . getDirectiveName ( r . directiveIndex )} = ${ this . _genReadDirective ( i )};''');
    }
    return res.join("\n");
  }

  _genReadDirective(num index) {
    // This is an experimental feature. Works only in Dart.
    if (identical(
        this._changeDetection, ChangeDetectionStrategy.OnPushObserve)) {
      return '''this.observeDirective(this.getDirectiveFor(directives, ${ index}), ${ index})''';
    } else {
      return '''this.getDirectiveFor(directives, ${ index})''';
    }
  }

  String genHydrateDetectors(List<DirectiveRecord> directiveRecords) {
    var res = [];
    for (var i = 0; i < directiveRecords.length; ++i) {
      var r = directiveRecords[i];
      if (!r.isDefaultChangeDetection()) {
        res.add(
            '''${ this . _names . getDetectorName ( r . directiveIndex )} = this.getDetectorFor(directives, ${ i});''');
      }
    }
    return res.join("\n");
  }

  List<String> genContentLifecycleCallbacks(
      List<DirectiveRecord> directiveRecords) {
    var res = [];
    var eq = IS_DART ? "==" : "===";
    // NOTE(kegluneq): Order is important!
    for (var i = directiveRecords.length - 1; i >= 0; --i) {
      var dir = directiveRecords[i];
      if (dir.callAfterContentInit) {
        res.add(
            '''if(${ this . _names . getStateName ( )} ${ eq} ${ this . _changeDetectorStateName}.NeverChecked) ${ this . _names . getDirectiveName ( dir . directiveIndex )}.ngAfterContentInit();''');
      }
      if (dir.callAfterContentChecked) {
        res.add(
            '''${ this . _names . getDirectiveName ( dir . directiveIndex )}.ngAfterContentChecked();''');
      }
    }
    return res;
  }

  List<String> genViewLifecycleCallbacks(
      List<DirectiveRecord> directiveRecords) {
    var res = [];
    var eq = IS_DART ? "==" : "===";
    // NOTE(kegluneq): Order is important!
    for (var i = directiveRecords.length - 1; i >= 0; --i) {
      var dir = directiveRecords[i];
      if (dir.callAfterViewInit) {
        res.add(
            '''if(${ this . _names . getStateName ( )} ${ eq} ${ this . _changeDetectorStateName}.NeverChecked) ${ this . _names . getDirectiveName ( dir . directiveIndex )}.ngAfterViewInit();''');
      }
      if (dir.callAfterViewChecked) {
        res.add(
            '''${ this . _names . getDirectiveName ( dir . directiveIndex )}.ngAfterViewChecked();''');
      }
    }
    return res;
  }
}
