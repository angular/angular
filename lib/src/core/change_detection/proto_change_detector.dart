library angular2.src.core.change_detection.proto_change_detector;

import "package:angular2/src/facade/lang.dart"
    show Type, isBlank, isPresent, isString;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper, StringMapWrapper;
import "parser/ast.dart"
    show
        PropertyRead,
        PropertyWrite,
        KeyedWrite,
        AST,
        ASTWithSource,
        AstVisitor,
        Binary,
        Chain,
        Conditional,
        BindingPipe,
        FunctionCall,
        ImplicitReceiver,
        Interpolation,
        KeyedRead,
        LiteralArray,
        LiteralMap,
        LiteralPrimitive,
        MethodCall,
        PrefixNot,
        Quote,
        SafePropertyRead,
        SafeMethodCall;
import "interfaces.dart"
    show ChangeDetector, ProtoChangeDetector, ChangeDetectorDefinition;
import "change_detection_util.dart" show ChangeDetectionUtil;
import "dynamic_change_detector.dart" show DynamicChangeDetector;
import "binding_record.dart" show BindingRecord, BindingTarget;
import "directive_record.dart" show DirectiveRecord, DirectiveIndex;
import "event_binding.dart" show EventBinding;
import "coalesce.dart" show coalesce;
import "proto_record.dart" show ProtoRecord, RecordType;

class DynamicProtoChangeDetector implements ProtoChangeDetector {
  ChangeDetectorDefinition _definition;
  /** @internal */
  List<ProtoRecord> _propertyBindingRecords;
  /** @internal */
  List<BindingTarget> _propertyBindingTargets;
  /** @internal */
  List<EventBinding> _eventBindingRecords;
  /** @internal */
  List<DirectiveIndex> _directiveIndices;
  DynamicProtoChangeDetector(this._definition) {
    this._propertyBindingRecords = createPropertyRecords(_definition);
    this._eventBindingRecords = createEventRecords(_definition);
    this._propertyBindingTargets =
        this._definition.bindingRecords.map((b) => b.target).toList();
    this._directiveIndices =
        this._definition.directiveRecords.map((d) => d.directiveIndex).toList();
  }
  ChangeDetector instantiate(dynamic dispatcher) {
    return new DynamicChangeDetector(
        this._definition.id,
        dispatcher,
        this._propertyBindingRecords.length,
        this._propertyBindingTargets,
        this._directiveIndices,
        this._definition.strategy,
        this._propertyBindingRecords,
        this._eventBindingRecords,
        this._definition.directiveRecords,
        this._definition.genConfig);
  }
}

List<ProtoRecord> createPropertyRecords(ChangeDetectorDefinition definition) {
  var recordBuilder = new ProtoRecordBuilder();
  ListWrapper.forEachWithIndex(definition.bindingRecords,
      (b, index) => recordBuilder.add(b, definition.variableNames, index));
  return coalesce(recordBuilder.records);
}

List<EventBinding> createEventRecords(ChangeDetectorDefinition definition) {
  // TODO: vsavkin: remove $event when the compiler handles render-side variables properly
  var varNames = ListWrapper.concat(["\$event"], definition.variableNames);
  return definition.eventRecords.map((er) {
    var records = _ConvertAstIntoProtoRecords.create(er, varNames);
    var dirIndex =
        er.implicitReceiver is DirectiveIndex ? er.implicitReceiver : null;
    return new EventBinding(
        er.target.name, er.target.elementIndex, dirIndex, records);
  }).toList();
}

class ProtoRecordBuilder {
  List<ProtoRecord> records = [];
  add(BindingRecord b, List<String> variableNames, num bindingIndex) {
    var oldLast = ListWrapper.last(this.records);
    if (isPresent(oldLast) &&
        oldLast.bindingRecord.directiveRecord == b.directiveRecord) {
      oldLast.lastInDirective = false;
    }
    var numberOfRecordsBefore = this.records.length;
    this._appendRecords(b, variableNames, bindingIndex);
    var newLast = ListWrapper.last(this.records);
    if (isPresent(newLast) && !identical(newLast, oldLast)) {
      newLast.lastInBinding = true;
      newLast.lastInDirective = true;
      this._setArgumentToPureFunction(numberOfRecordsBefore);
    }
  }

  /** @internal */
  void _setArgumentToPureFunction(num startIndex) {
    for (var i = startIndex; i < this.records.length; ++i) {
      var rec = this.records[i];
      if (rec.isPureFunction()) {
        rec.args.forEach((recordIndex) =>
            this.records[recordIndex - 1].argumentToPureFunction = true);
      }
      if (identical(rec.mode, RecordType.Pipe)) {
        rec.args.forEach((recordIndex) =>
            this.records[recordIndex - 1].argumentToPureFunction = true);
        this.records[rec.contextIndex - 1].argumentToPureFunction = true;
      }
    }
  }

  /** @internal */
  _appendRecords(
      BindingRecord b, List<String> variableNames, num bindingIndex) {
    if (b.isDirectiveLifecycle()) {
      this.records.add(new ProtoRecord(
          RecordType.DirectiveLifecycle,
          b.lifecycleEvent,
          null,
          [],
          [],
          -1,
          null,
          this.records.length + 1,
          b,
          false,
          false,
          false,
          false,
          null));
    } else {
      _ConvertAstIntoProtoRecords.append(
          this.records, b, variableNames, bindingIndex);
    }
  }
}

class _ConvertAstIntoProtoRecords implements AstVisitor {
  List<ProtoRecord> _records;
  BindingRecord _bindingRecord;
  List<String> _variableNames;
  num _bindingIndex;
  _ConvertAstIntoProtoRecords(this._records, this._bindingRecord,
      this._variableNames, this._bindingIndex) {}
  static append(List<ProtoRecord> records, BindingRecord b,
      List<String> variableNames, num bindingIndex) {
    var c = new _ConvertAstIntoProtoRecords(
        records, b, variableNames, bindingIndex);
    b.ast.visit(c);
  }

  static List<ProtoRecord> create(
      BindingRecord b, List<dynamic> variableNames) {
    var rec = [];
    _ConvertAstIntoProtoRecords.append(rec, b, variableNames, null);
    rec[rec.length - 1].lastInBinding = true;
    return rec;
  }

  dynamic visitImplicitReceiver(ImplicitReceiver ast) {
    return this._bindingRecord.implicitReceiver;
  }

  num visitInterpolation(Interpolation ast) {
    var args = this._visitAll(ast.expressions);
    return this._addRecord(RecordType.Interpolate, "interpolate",
        _interpolationFn(ast.strings), args, ast.strings, 0);
  }

  num visitLiteralPrimitive(LiteralPrimitive ast) {
    return this._addRecord(RecordType.Const, "literal", ast.value, [], null, 0);
  }

  num visitPropertyRead(PropertyRead ast) {
    var receiver = ast.receiver.visit(this);
    if (isPresent(this._variableNames) &&
        ListWrapper.contains(this._variableNames, ast.name) &&
        ast.receiver is ImplicitReceiver) {
      return this
          ._addRecord(RecordType.Local, ast.name, ast.name, [], null, receiver);
    } else {
      return this._addRecord(
          RecordType.PropertyRead, ast.name, ast.getter, [], null, receiver);
    }
  }

  num visitPropertyWrite(PropertyWrite ast) {
    if (isPresent(this._variableNames) &&
        ListWrapper.contains(this._variableNames, ast.name) &&
        ast.receiver is ImplicitReceiver) {
      throw new BaseException(
          '''Cannot reassign a variable binding ${ ast . name}''');
    } else {
      var receiver = ast.receiver.visit(this);
      var value = ast.value.visit(this);
      return this._addRecord(RecordType.PropertyWrite, ast.name, ast.setter,
          [value], null, receiver);
    }
  }

  num visitKeyedWrite(KeyedWrite ast) {
    var obj = ast.obj.visit(this);
    var key = ast.key.visit(this);
    var value = ast.value.visit(this);
    return this
        ._addRecord(RecordType.KeyedWrite, null, null, [key, value], null, obj);
  }

  num visitSafePropertyRead(SafePropertyRead ast) {
    var receiver = ast.receiver.visit(this);
    return this._addRecord(
        RecordType.SafeProperty, ast.name, ast.getter, [], null, receiver);
  }

  num visitMethodCall(MethodCall ast) {
    var receiver = ast.receiver.visit(this);
    var args = this._visitAll(ast.args);
    if (isPresent(this._variableNames) &&
        ListWrapper.contains(this._variableNames, ast.name)) {
      var target = this
          ._addRecord(RecordType.Local, ast.name, ast.name, [], null, receiver);
      return this._addRecord(
          RecordType.InvokeClosure, "closure", null, args, null, target);
    } else {
      return this._addRecord(
          RecordType.InvokeMethod, ast.name, ast.fn, args, null, receiver);
    }
  }

  num visitSafeMethodCall(SafeMethodCall ast) {
    var receiver = ast.receiver.visit(this);
    var args = this._visitAll(ast.args);
    return this._addRecord(
        RecordType.SafeMethodInvoke, ast.name, ast.fn, args, null, receiver);
  }

  num visitFunctionCall(FunctionCall ast) {
    var target = ast.target.visit(this);
    var args = this._visitAll(ast.args);
    return this._addRecord(
        RecordType.InvokeClosure, "closure", null, args, null, target);
  }

  num visitLiteralArray(LiteralArray ast) {
    var primitiveName = '''arrayFn${ ast . expressions . length}''';
    return this._addRecord(
        RecordType.CollectionLiteral,
        primitiveName,
        _arrayFn(ast.expressions.length),
        this._visitAll(ast.expressions),
        null,
        0);
  }

  num visitLiteralMap(LiteralMap ast) {
    return this._addRecord(
        RecordType.CollectionLiteral,
        _mapPrimitiveName(ast.keys),
        ChangeDetectionUtil.mapFn(ast.keys),
        this._visitAll(ast.values),
        null,
        0);
  }

  num visitBinary(Binary ast) {
    var left = ast.left.visit(this);
    switch (ast.operation) {
      case "&&":
        var branchEnd = [null];
        this._addRecord(RecordType.SkipRecordsIfNot, "SkipRecordsIfNot", null,
            [], branchEnd, left);
        var right = ast.right.visit(this);
        branchEnd[0] = right;
        return this._addRecord(RecordType.PrimitiveOp, "cond",
            ChangeDetectionUtil.cond, [left, right, left], null, 0);
      case "||":
        var branchEnd = [null];
        this._addRecord(RecordType.SkipRecordsIf, "SkipRecordsIf", null, [],
            branchEnd, left);
        var right = ast.right.visit(this);
        branchEnd[0] = right;
        return this._addRecord(RecordType.PrimitiveOp, "cond",
            ChangeDetectionUtil.cond, [left, left, right], null, 0);
      default:
        var right = ast.right.visit(this);
        return this._addRecord(
            RecordType.PrimitiveOp,
            _operationToPrimitiveName(ast.operation),
            _operationToFunction(ast.operation),
            [left, right],
            null,
            0);
    }
  }

  num visitPrefixNot(PrefixNot ast) {
    var exp = ast.expression.visit(this);
    return this._addRecord(RecordType.PrimitiveOp, "operation_negate",
        ChangeDetectionUtil.operation_negate, [exp], null, 0);
  }

  num visitConditional(Conditional ast) {
    var condition = ast.condition.visit(this);
    var startOfFalseBranch = [null];
    var endOfFalseBranch = [null];
    this._addRecord(RecordType.SkipRecordsIfNot, "SkipRecordsIfNot", null, [],
        startOfFalseBranch, condition);
    var whenTrue = ast.trueExp.visit(this);
    var skip = this._addRecord(
        RecordType.SkipRecords, "SkipRecords", null, [], endOfFalseBranch, 0);
    var whenFalse = ast.falseExp.visit(this);
    startOfFalseBranch[0] = skip;
    endOfFalseBranch[0] = whenFalse;
    return this._addRecord(RecordType.PrimitiveOp, "cond",
        ChangeDetectionUtil.cond, [condition, whenTrue, whenFalse], null, 0);
  }

  num visitPipe(BindingPipe ast) {
    var value = ast.exp.visit(this);
    var args = this._visitAll(ast.args);
    return this
        ._addRecord(RecordType.Pipe, ast.name, ast.name, args, null, value);
  }

  num visitKeyedRead(KeyedRead ast) {
    var obj = ast.obj.visit(this);
    var key = ast.key.visit(this);
    return this._addRecord(RecordType.KeyedRead, "keyedAccess",
        ChangeDetectionUtil.keyedAccess, [key], null, obj);
  }

  num visitChain(Chain ast) {
    var args = ast.expressions.map((e) => e.visit(this)).toList();
    return this._addRecord(RecordType.Chain, "chain", null, args, null, 0);
  }

  void visitQuote(Quote ast) {
    throw new BaseException(
        '''Caught uninterpreted expression at ${ ast . location}: ${ ast . uninterpretedExpression}. ''' +
            '''Expression prefix ${ ast . prefix} did not match a template transformer to interpret the expression.''');
  }

  _visitAll(List<dynamic> asts) {
    var res = ListWrapper.createFixedSize(asts.length);
    for (var i = 0; i < asts.length; ++i) {
      res[i] = asts[i].visit(this);
    }
    return res;
  }

  /**
   * Adds a `ProtoRecord` and returns its selfIndex.
   */
  num _addRecord(type, name, funcOrValue, args, fixedArgs, context) {
    var selfIndex = this._records.length + 1;
    if (context is DirectiveIndex) {
      this._records.add(new ProtoRecord(
          type,
          name,
          funcOrValue,
          args,
          fixedArgs,
          -1,
          context,
          selfIndex,
          this._bindingRecord,
          false,
          false,
          false,
          false,
          this._bindingIndex));
    } else {
      this._records.add(new ProtoRecord(
          type,
          name,
          funcOrValue,
          args,
          fixedArgs,
          context,
          null,
          selfIndex,
          this._bindingRecord,
          false,
          false,
          false,
          false,
          this._bindingIndex));
    }
    return selfIndex;
  }
}

Function _arrayFn(num length) {
  switch (length) {
    case 0:
      return ChangeDetectionUtil.arrayFn0;
    case 1:
      return ChangeDetectionUtil.arrayFn1;
    case 2:
      return ChangeDetectionUtil.arrayFn2;
    case 3:
      return ChangeDetectionUtil.arrayFn3;
    case 4:
      return ChangeDetectionUtil.arrayFn4;
    case 5:
      return ChangeDetectionUtil.arrayFn5;
    case 6:
      return ChangeDetectionUtil.arrayFn6;
    case 7:
      return ChangeDetectionUtil.arrayFn7;
    case 8:
      return ChangeDetectionUtil.arrayFn8;
    case 9:
      return ChangeDetectionUtil.arrayFn9;
    default:
      throw new BaseException(
          '''Does not support literal maps with more than 9 elements''');
  }
}

_mapPrimitiveName(List<dynamic> keys) {
  var stringifiedKeys = keys
      .map((k) => isString(k) ? '''"${ k}"''' : '''${ k}''')
      .toList()
      .join(", ");
  return '''mapFn([${ stringifiedKeys}])''';
}

String _operationToPrimitiveName(String operation) {
  switch (operation) {
    case "+":
      return "operation_add";
    case "-":
      return "operation_subtract";
    case "*":
      return "operation_multiply";
    case "/":
      return "operation_divide";
    case "%":
      return "operation_remainder";
    case "==":
      return "operation_equals";
    case "!=":
      return "operation_not_equals";
    case "===":
      return "operation_identical";
    case "!==":
      return "operation_not_identical";
    case "<":
      return "operation_less_then";
    case ">":
      return "operation_greater_then";
    case "<=":
      return "operation_less_or_equals_then";
    case ">=":
      return "operation_greater_or_equals_then";
    default:
      throw new BaseException('''Unsupported operation ${ operation}''');
  }
}

Function _operationToFunction(String operation) {
  switch (operation) {
    case "+":
      return ChangeDetectionUtil.operation_add;
    case "-":
      return ChangeDetectionUtil.operation_subtract;
    case "*":
      return ChangeDetectionUtil.operation_multiply;
    case "/":
      return ChangeDetectionUtil.operation_divide;
    case "%":
      return ChangeDetectionUtil.operation_remainder;
    case "==":
      return ChangeDetectionUtil.operation_equals;
    case "!=":
      return ChangeDetectionUtil.operation_not_equals;
    case "===":
      return ChangeDetectionUtil.operation_identical;
    case "!==":
      return ChangeDetectionUtil.operation_not_identical;
    case "<":
      return ChangeDetectionUtil.operation_less_then;
    case ">":
      return ChangeDetectionUtil.operation_greater_then;
    case "<=":
      return ChangeDetectionUtil.operation_less_or_equals_then;
    case ">=":
      return ChangeDetectionUtil.operation_greater_or_equals_then;
    default:
      throw new BaseException('''Unsupported operation ${ operation}''');
  }
}

String s(v) {
  return isPresent(v) ? '''${ v}''' : "";
}

_interpolationFn(List<dynamic> strings) {
  var length = strings.length;
  var c0 = length > 0 ? strings[0] : null;
  var c1 = length > 1 ? strings[1] : null;
  var c2 = length > 2 ? strings[2] : null;
  var c3 = length > 3 ? strings[3] : null;
  var c4 = length > 4 ? strings[4] : null;
  var c5 = length > 5 ? strings[5] : null;
  var c6 = length > 6 ? strings[6] : null;
  var c7 = length > 7 ? strings[7] : null;
  var c8 = length > 8 ? strings[8] : null;
  var c9 = length > 9 ? strings[9] : null;
  switch (length - 1) {
    case 1:
      return (a1) => c0 + s(a1) + c1;
    case 2:
      return (a1, a2) => c0 + s(a1) + c1 + s(a2) + c2;
    case 3:
      return (a1, a2, a3) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3;
    case 4:
      return (a1, a2, a3, a4) =>
          c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4;
    case 5:
      return (a1, a2, a3, a4, a5) =>
          c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5;
    case 6:
      return (a1, a2, a3, a4, a5, a6) => c0 +
          s(a1) +
          c1 +
          s(a2) +
          c2 +
          s(a3) +
          c3 +
          s(a4) +
          c4 +
          s(a5) +
          c5 +
          s(a6) +
          c6;
    case 7:
      return (a1, a2, a3, a4, a5, a6, a7) => c0 +
          s(a1) +
          c1 +
          s(a2) +
          c2 +
          s(a3) +
          c3 +
          s(a4) +
          c4 +
          s(a5) +
          c5 +
          s(a6) +
          c6 +
          s(a7) +
          c7;
    case 8:
      return (a1, a2, a3, a4, a5, a6, a7, a8) => c0 +
          s(a1) +
          c1 +
          s(a2) +
          c2 +
          s(a3) +
          c3 +
          s(a4) +
          c4 +
          s(a5) +
          c5 +
          s(a6) +
          c6 +
          s(a7) +
          c7 +
          s(a8) +
          c8;
    case 9:
      return (a1, a2, a3, a4, a5, a6, a7, a8, a9) => c0 +
          s(a1) +
          c1 +
          s(a2) +
          c2 +
          s(a3) +
          c3 +
          s(a4) +
          c4 +
          s(a5) +
          c5 +
          s(a6) +
          c6 +
          s(a7) +
          c7 +
          s(a8) +
          c8 +
          s(a9) +
          c9;
    default:
      throw new BaseException('''Does not support more than 9 expressions''');
  }
}
