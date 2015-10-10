import {Type, isBlank, isPresent, isString} from 'angular2/src/core/facade/lang';
import {BaseException} from 'angular2/src/core/facade/exceptions';
import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';

import {
  PropertyRead,
  PropertyWrite,
  KeyedWrite,
  AST,
  ASTWithSource,
  AstVisitor,
  Binary,
  Chain,
  Conditional,
  If,
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
  SafePropertyRead,
  SafeMethodCall
} from './parser/ast';

import {ChangeDetector, ProtoChangeDetector, ChangeDetectorDefinition} from './interfaces';
import {ChangeDetectionUtil} from './change_detection_util';
import {DynamicChangeDetector} from './dynamic_change_detector';
import {BindingRecord, BindingTarget} from './binding_record';
import {DirectiveRecord, DirectiveIndex} from './directive_record';
import {EventBinding} from './event_binding';

import {coalesce} from './coalesce';
import {ProtoRecord, RecordType} from './proto_record';

export class DynamicProtoChangeDetector implements ProtoChangeDetector {
  /** @internal */
  _propertyBindingRecords: ProtoRecord[];
  /** @internal */
  _propertyBindingTargets: BindingTarget[];
  /** @internal */
  _eventBindingRecords: EventBinding[];
  /** @internal */
  _directiveIndices: DirectiveIndex[];

  constructor(private _definition: ChangeDetectorDefinition) {
    this._propertyBindingRecords = createPropertyRecords(_definition);
    this._eventBindingRecords = createEventRecords(_definition);
    this._propertyBindingTargets = this._definition.bindingRecords.map(b => b.target);
    this._directiveIndices = this._definition.directiveRecords.map(d => d.directiveIndex);
  }

  instantiate(dispatcher: any): ChangeDetector {
    return new DynamicChangeDetector(
        this._definition.id, dispatcher, this._propertyBindingRecords.length,
        this._propertyBindingTargets, this._directiveIndices, this._definition.strategy,
        this._propertyBindingRecords, this._eventBindingRecords, this._definition.directiveRecords,
        this._definition.genConfig);
  }
}

export function createPropertyRecords(definition: ChangeDetectorDefinition): ProtoRecord[] {
  var recordBuilder = new ProtoRecordBuilder();
  ListWrapper.forEachWithIndex(definition.bindingRecords,
                               (b, index) => recordBuilder.add(b, definition.variableNames, index));
  return coalesce(recordBuilder.records);
}

export function createEventRecords(definition: ChangeDetectorDefinition): EventBinding[] {
  // TODO: vsavkin: remove $event when the compiler handles render-side variables properly
  var varNames = ListWrapper.concat(['$event'], definition.variableNames);
  return definition.eventRecords.map(er => {
    var records = _ConvertAstIntoProtoRecords.create(er, varNames);
    var dirIndex = er.implicitReceiver instanceof DirectiveIndex ? er.implicitReceiver : null;
    return new EventBinding(er.target.name, er.target.elementIndex, dirIndex, records);
  });
}

export class ProtoRecordBuilder {
  records: ProtoRecord[];

  constructor() { this.records = []; }

  add(b: BindingRecord, variableNames: string[], bindingIndex: number) {
    var oldLast = ListWrapper.last(this.records);
    if (isPresent(oldLast) && oldLast.bindingRecord.directiveRecord == b.directiveRecord) {
      oldLast.lastInDirective = false;
    }
    var numberOfRecordsBefore = this.records.length;
    this._appendRecords(b, variableNames, bindingIndex);
    var newLast = ListWrapper.last(this.records);
    if (isPresent(newLast) && newLast !== oldLast) {
      newLast.lastInBinding = true;
      newLast.lastInDirective = true;
      this._setArgumentToPureFunction(numberOfRecordsBefore);
    }
  }

  /** @internal */
  _setArgumentToPureFunction(startIndex: number): void {
    for (var i = startIndex; i < this.records.length; ++i) {
      var rec = this.records[i];
      if (rec.isPureFunction()) {
        rec.args.forEach(recordIndex => this.records[recordIndex - 1].argumentToPureFunction =
                             true);
      }
      if (rec.mode === RecordType.Pipe) {
        rec.args.forEach(recordIndex => this.records[recordIndex - 1].argumentToPureFunction =
                             true);
        this.records[rec.contextIndex - 1].argumentToPureFunction = true;
      }
    }
  }

  /** @internal */
  _appendRecords(b: BindingRecord, variableNames: string[], bindingIndex: number) {
    if (b.isDirectiveLifecycle()) {
      this.records.push(new ProtoRecord(RecordType.DirectiveLifecycle, b.lifecycleEvent, null, [],
                                        [], -1, null, this.records.length + 1, b, false, false,
                                        false, false, null));
    } else {
      _ConvertAstIntoProtoRecords.append(this.records, b, variableNames, bindingIndex);
    }
  }
}

class _ConvertAstIntoProtoRecords implements AstVisitor {
  constructor(private _records: ProtoRecord[], private _bindingRecord: BindingRecord,
              private _variableNames: string[], private _bindingIndex: number) {}

  static append(records: ProtoRecord[], b: BindingRecord, variableNames: string[],
                bindingIndex: number) {
    var c = new _ConvertAstIntoProtoRecords(records, b, variableNames, bindingIndex);
    b.ast.visit(c);
  }

  static create(b: BindingRecord, variableNames: any[]): ProtoRecord[] {
    var rec = [];
    _ConvertAstIntoProtoRecords.append(rec, b, variableNames, null);
    rec[rec.length - 1].lastInBinding = true;
    return rec;
  }

  visitImplicitReceiver(ast: ImplicitReceiver): any { return this._bindingRecord.implicitReceiver; }

  visitInterpolation(ast: Interpolation): number {
    var args = this._visitAll(ast.expressions);
    return this._addRecord(RecordType.Interpolate, "interpolate", _interpolationFn(ast.strings),
                           args, ast.strings, 0);
  }

  visitLiteralPrimitive(ast: LiteralPrimitive): number {
    return this._addRecord(RecordType.Const, "literal", ast.value, [], null, 0);
  }

  visitPropertyRead(ast: PropertyRead): number {
    var receiver = ast.receiver.visit(this);
    if (isPresent(this._variableNames) && ListWrapper.contains(this._variableNames, ast.name) &&
        ast.receiver instanceof ImplicitReceiver) {
      return this._addRecord(RecordType.Local, ast.name, ast.name, [], null, receiver);
    } else {
      return this._addRecord(RecordType.PropertyRead, ast.name, ast.getter, [], null, receiver);
    }
  }

  visitPropertyWrite(ast: PropertyWrite): number {
    if (isPresent(this._variableNames) && ListWrapper.contains(this._variableNames, ast.name) &&
        ast.receiver instanceof ImplicitReceiver) {
      throw new BaseException(`Cannot reassign a variable binding ${ast.name}`);
    } else {
      var receiver = ast.receiver.visit(this);
      var value = ast.value.visit(this);
      return this._addRecord(RecordType.PropertyWrite, ast.name, ast.setter, [value], null,
                             receiver);
    }
  }

  visitKeyedWrite(ast: KeyedWrite): number {
    var obj = ast.obj.visit(this);
    var key = ast.key.visit(this);
    var value = ast.value.visit(this);
    return this._addRecord(RecordType.KeyedWrite, null, null, [key, value], null, obj);
  }

  visitSafePropertyRead(ast: SafePropertyRead): number {
    var receiver = ast.receiver.visit(this);
    return this._addRecord(RecordType.SafeProperty, ast.name, ast.getter, [], null, receiver);
  }

  visitMethodCall(ast: MethodCall): number {
    var receiver = ast.receiver.visit(this);
    var args = this._visitAll(ast.args);
    if (isPresent(this._variableNames) && ListWrapper.contains(this._variableNames, ast.name)) {
      var target = this._addRecord(RecordType.Local, ast.name, ast.name, [], null, receiver);
      return this._addRecord(RecordType.InvokeClosure, "closure", null, args, null, target);
    } else {
      return this._addRecord(RecordType.InvokeMethod, ast.name, ast.fn, args, null, receiver);
    }
  }

  visitSafeMethodCall(ast: SafeMethodCall): number {
    var receiver = ast.receiver.visit(this);
    var args = this._visitAll(ast.args);
    return this._addRecord(RecordType.SafeMethodInvoke, ast.name, ast.fn, args, null, receiver);
  }

  visitFunctionCall(ast: FunctionCall): number {
    var target = ast.target.visit(this);
    var args = this._visitAll(ast.args);
    return this._addRecord(RecordType.InvokeClosure, "closure", null, args, null, target);
  }

  visitLiteralArray(ast: LiteralArray): number {
    var primitiveName = `arrayFn${ast.expressions.length}`;
    return this._addRecord(RecordType.CollectionLiteral, primitiveName,
                           _arrayFn(ast.expressions.length), this._visitAll(ast.expressions), null,
                           0);
  }

  visitLiteralMap(ast: LiteralMap): number {
    return this._addRecord(RecordType.CollectionLiteral, _mapPrimitiveName(ast.keys),
                           ChangeDetectionUtil.mapFn(ast.keys), this._visitAll(ast.values), null,
                           0);
  }

  visitBinary(ast: Binary): number {
    var left = ast.left.visit(this);
    var right = ast.right.visit(this);
    return this._addRecord(RecordType.PrimitiveOp, _operationToPrimitiveName(ast.operation),
                           _operationToFunction(ast.operation), [left, right], null, 0);
  }

  visitPrefixNot(ast: PrefixNot): number {
    var exp = ast.expression.visit(this);
    return this._addRecord(RecordType.PrimitiveOp, "operation_negate",
                           ChangeDetectionUtil.operation_negate, [exp], null, 0);
  }

  visitConditional(ast: Conditional): number {
    var c = ast.condition.visit(this);
    var t = ast.trueExp.visit(this);
    var f = ast.falseExp.visit(this);
    return this._addRecord(RecordType.PrimitiveOp, "cond", ChangeDetectionUtil.cond, [c, t, f],
                           null, 0);
  }

  visitPipe(ast: BindingPipe): number {
    var value = ast.exp.visit(this);
    var args = this._visitAll(ast.args);
    return this._addRecord(RecordType.Pipe, ast.name, ast.name, args, null, value);
  }

  visitKeyedRead(ast: KeyedRead): number {
    var obj = ast.obj.visit(this);
    var key = ast.key.visit(this);
    return this._addRecord(RecordType.KeyedRead, "keyedAccess", ChangeDetectionUtil.keyedAccess,
                           [key], null, obj);
  }

  visitChain(ast: Chain): number {
    var args = ast.expressions.map(e => e.visit(this));
    return this._addRecord(RecordType.Chain, "chain", null, args, null, 0);
  }

  visitIf(ast: If) { throw new BaseException('Not supported'); }

  _visitAll(asts: any[]) {
    var res = ListWrapper.createFixedSize(asts.length);
    for (var i = 0; i < asts.length; ++i) {
      res[i] = asts[i].visit(this);
    }
    return res;
  }

  _addRecord(type, name, funcOrValue, args, fixedArgs, context) {
    var selfIndex = this._records.length + 1;
    if (context instanceof DirectiveIndex) {
      this._records.push(new ProtoRecord(type, name, funcOrValue, args, fixedArgs, -1, context,
                                         selfIndex, this._bindingRecord, false, false, false, false,
                                         this._bindingIndex));
    } else {
      this._records.push(new ProtoRecord(type, name, funcOrValue, args, fixedArgs, context, null,
                                         selfIndex, this._bindingRecord, false, false, false, false,
                                         this._bindingIndex));
    }
    return selfIndex;
  }
}


function _arrayFn(length: number): Function {
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
      throw new BaseException(`Does not support literal maps with more than 9 elements`);
  }
}

function _mapPrimitiveName(keys: any[]) {
  var stringifiedKeys = keys.map(k => isString(k) ? `"${k}"` : `${k}`).join(', ');
  return `mapFn([${stringifiedKeys}])`;
}

function _operationToPrimitiveName(operation: string): string {
  switch (operation) {
    case '+':
      return "operation_add";
    case '-':
      return "operation_subtract";
    case '*':
      return "operation_multiply";
    case '/':
      return "operation_divide";
    case '%':
      return "operation_remainder";
    case '==':
      return "operation_equals";
    case '!=':
      return "operation_not_equals";
    case '===':
      return "operation_identical";
    case '!==':
      return "operation_not_identical";
    case '<':
      return "operation_less_then";
    case '>':
      return "operation_greater_then";
    case '<=':
      return "operation_less_or_equals_then";
    case '>=':
      return "operation_greater_or_equals_then";
    case '&&':
      return "operation_logical_and";
    case '||':
      return "operation_logical_or";
    default:
      throw new BaseException(`Unsupported operation ${operation}`);
  }
}

function _operationToFunction(operation: string): Function {
  switch (operation) {
    case '+':
      return ChangeDetectionUtil.operation_add;
    case '-':
      return ChangeDetectionUtil.operation_subtract;
    case '*':
      return ChangeDetectionUtil.operation_multiply;
    case '/':
      return ChangeDetectionUtil.operation_divide;
    case '%':
      return ChangeDetectionUtil.operation_remainder;
    case '==':
      return ChangeDetectionUtil.operation_equals;
    case '!=':
      return ChangeDetectionUtil.operation_not_equals;
    case '===':
      return ChangeDetectionUtil.operation_identical;
    case '!==':
      return ChangeDetectionUtil.operation_not_identical;
    case '<':
      return ChangeDetectionUtil.operation_less_then;
    case '>':
      return ChangeDetectionUtil.operation_greater_then;
    case '<=':
      return ChangeDetectionUtil.operation_less_or_equals_then;
    case '>=':
      return ChangeDetectionUtil.operation_greater_or_equals_then;
    case '&&':
      return ChangeDetectionUtil.operation_logical_and;
    case '||':
      return ChangeDetectionUtil.operation_logical_or;
    default:
      throw new BaseException(`Unsupported operation ${operation}`);
  }
}

function s(v): string {
  return isPresent(v) ? `${v}` : '';
}

function _interpolationFn(strings: any[]) {
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
      return (a1, a2, a3, a4) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4;
    case 5:
      return (a1, a2, a3, a4, a5) =>
                 c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5;
    case 6:
      return (a1, a2, a3, a4, a5, a6) =>
                 c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6;
    case 7:
      return (a1, a2, a3, a4, a5, a6, a7) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) +
                                             c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7;
    case 8:
      return (a1, a2, a3, a4, a5, a6, a7, a8) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) +
                                                 c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7 + s(a8) +
                                                 c8;
    case 9:
      return (a1, a2, a3, a4, a5, a6, a7, a8, a9) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 +
                                                     s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) +
                                                     c7 + s(a8) + c8 + s(a9) + c9;
    default:
      throw new BaseException(`Does not support more than 9 expressions`);
  }
}
