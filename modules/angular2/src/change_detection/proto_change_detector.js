import {isPresent, isBlank, BaseException, Type, isString} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {
  AccessMember,
  Assignment,
  AST,
  ASTWithSource,
  AstVisitor,
  Binary,
  Chain,
  Conditional,
  Pipe,
  FunctionCall,
  ImplicitReceiver,
  Interpolation,
  KeyedAccess,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  MethodCall,
  PrefixNot
  } from './parser/ast';

import {ChangeDispatcher, ChangeDetector, ProtoChangeDetector} from './interfaces';
import {ChangeDetectionUtil} from './change_detection_util';
import {DynamicChangeDetector} from './dynamic_change_detector';
import {ChangeDetectorJITGenerator} from './change_detection_jit_generator';
import {PipeRegistry} from './pipes/pipe_registry';
import {BindingRecord} from './binding_record';
import {DirectiveIndex} from './directive_record';

import {coalesce} from './coalesce';

import {
  ProtoRecord,
  RECORD_TYPE_SELF,
  RECORD_TYPE_PROPERTY,
  RECORD_TYPE_LOCAL,
  RECORD_TYPE_INVOKE_METHOD,
  RECORD_TYPE_CONST,
  RECORD_TYPE_INVOKE_CLOSURE,
  RECORD_TYPE_PRIMITIVE_OP,
  RECORD_TYPE_KEYED_ACCESS,
  RECORD_TYPE_PIPE,
  RECORD_TYPE_BINDING_PIPE,
  RECORD_TYPE_INTERPOLATE
  } from './proto_record';

export class DynamicProtoChangeDetector extends ProtoChangeDetector {
  _pipeRegistry:PipeRegistry;
  _records:List<ProtoRecord>;
  _changeControlStrategy:string;

  constructor(pipeRegistry:PipeRegistry, changeControlStrategy:string) {
    super();
    this._pipeRegistry = pipeRegistry;
    this._changeControlStrategy = changeControlStrategy;
  }

  instantiate(dispatcher:any, bindingRecords:List, variableBindings:List, directiveRecords:List) {
    this._createRecordsIfNecessary(bindingRecords, variableBindings);
    return new DynamicChangeDetector(this._changeControlStrategy, dispatcher,
      this._pipeRegistry, this._records, directiveRecords);
  }

  _createRecordsIfNecessary(bindingRecords:List, variableBindings:List) {
    if (isBlank(this._records)) {
      var recordBuilder = new ProtoRecordBuilder();
      ListWrapper.forEach(bindingRecords, (b) => {
        recordBuilder.addAst(b, variableBindings);
      });
      this._records = coalesce(recordBuilder.records);
    }
  }
}

var _jitProtoChangeDetectorClassCounter:number = 0;
export class JitProtoChangeDetector extends ProtoChangeDetector {
  _factory:Function;
  _pipeRegistry;
  _changeControlStrategy:string;

  constructor(pipeRegistry, changeControlStrategy:string) {
    super();
    this._pipeRegistry = pipeRegistry;
    this._factory = null;
    this._changeControlStrategy = changeControlStrategy;
  }

  instantiate(dispatcher:any, bindingRecords:List, variableBindings:List, directiveRecords:List) {
    this._createFactoryIfNecessary(bindingRecords, variableBindings, directiveRecords);
    return this._factory(dispatcher, this._pipeRegistry);
  }

  _createFactoryIfNecessary(bindingRecords:List, variableBindings:List, directiveRecords:List) {
    if (isBlank(this._factory)) {
      var recordBuilder = new ProtoRecordBuilder();
      ListWrapper.forEach(bindingRecords, (b) => {
        recordBuilder.addAst(b, variableBindings);
      });
      var c = _jitProtoChangeDetectorClassCounter++;
      var records = coalesce(recordBuilder.records);
      var typeName = `ChangeDetector${c}`;
      this._factory = new ChangeDetectorJITGenerator(typeName, this._changeControlStrategy, records,
        directiveRecords).generate();
    }
  }
}

class ProtoRecordBuilder {
  records:List<ProtoRecord>;

  constructor() {
    this.records = [];
  }

  addAst(b:BindingRecord, variableBindings:List = null) {
    var last = ListWrapper.last(this.records);
    if (isPresent(last) && last.bindingRecord.directiveRecord == b.directiveRecord) {
      last.lastInDirective = false;
    }

    var pr = _ConvertAstIntoProtoRecords.convert(b, this.records.length, variableBindings);
    if (! ListWrapper.isEmpty(pr)) {
      var last = ListWrapper.last(pr);
      last.lastInBinding = true;
      last.lastInDirective = true;

      this.records = ListWrapper.concat(this.records, pr);
    }
  }
}

class _ConvertAstIntoProtoRecords {
  protoRecords:List;
  bindingRecord:BindingRecord;
  variableBindings:List;
  contextIndex:number;
  expressionAsString:string;

  constructor(bindingRecord:BindingRecord, contextIndex:number, expressionAsString:string, variableBindings:List) {
    this.protoRecords = [];
    this.bindingRecord = bindingRecord;
    this.contextIndex = contextIndex;
    this.expressionAsString = expressionAsString;
    this.variableBindings = variableBindings;
  }

  static convert(b:BindingRecord, contextIndex:number, variableBindings:List) {
    var c = new _ConvertAstIntoProtoRecords(b, contextIndex, b.ast.toString(), variableBindings);
    b.ast.visit(c);
    return c.protoRecords;
  }

  visitImplicitReceiver(ast:ImplicitReceiver) {
    return this.bindingRecord.implicitReceiver;
  }

  visitInterpolation(ast:Interpolation) {
    var args = this._visitAll(ast.expressions);
    return this._addRecord(RECORD_TYPE_INTERPOLATE, "interpolate", _interpolationFn(ast.strings),
      args, ast.strings, 0);
  }

  visitLiteralPrimitive(ast:LiteralPrimitive) {
    return this._addRecord(RECORD_TYPE_CONST, "literal", ast.value, [], null, 0);
  }

  visitAccessMember(ast:AccessMember) {
    var receiver = ast.receiver.visit(this);
    if (isPresent(this.variableBindings) && ListWrapper.contains(this.variableBindings, ast.name)) {
      return this._addRecord(RECORD_TYPE_LOCAL, ast.name, ast.name, [], null, receiver);
    } else {
      return this._addRecord(RECORD_TYPE_PROPERTY, ast.name, ast.getter, [], null, receiver);
    }
  }

  visitMethodCall(ast:MethodCall) {;
    var receiver = ast.receiver.visit(this);
    var args = this._visitAll(ast.args);
    if (isPresent(this.variableBindings) && ListWrapper.contains(this.variableBindings, ast.name)) {
      var target = this._addRecord(RECORD_TYPE_LOCAL, ast.name, ast.name, [], null, receiver);
      return this._addRecord(RECORD_TYPE_INVOKE_CLOSURE, "closure", null, args, null, target);
    } else {
      return this._addRecord(RECORD_TYPE_INVOKE_METHOD, ast.name, ast.fn, args, null, receiver);
    }
  }

  visitFunctionCall(ast:FunctionCall) {
    var target = ast.target.visit(this);
    var args = this._visitAll(ast.args);
    return this._addRecord(RECORD_TYPE_INVOKE_CLOSURE, "closure", null, args, null, target);
  }

  visitLiteralArray(ast:LiteralArray) {
    var primitiveName = `arrayFn${ast.expressions.length}`;
    return this._addRecord(RECORD_TYPE_PRIMITIVE_OP, primitiveName, _arrayFn(ast.expressions.length),
      this._visitAll(ast.expressions), null, 0);
  }

  visitLiteralMap(ast:LiteralMap) {
    return this._addRecord(RECORD_TYPE_PRIMITIVE_OP, _mapPrimitiveName(ast.keys),
      ChangeDetectionUtil.mapFn(ast.keys), this._visitAll(ast.values), null, 0);
  }

  visitBinary(ast:Binary) {
    var left = ast.left.visit(this);
    var right = ast.right.visit(this);
    return this._addRecord(RECORD_TYPE_PRIMITIVE_OP, _operationToPrimitiveName(ast.operation),
      _operationToFunction(ast.operation), [left, right], null, 0);
  }

  visitPrefixNot(ast:PrefixNot) {
    var exp = ast.expression.visit(this)
    return this._addRecord(RECORD_TYPE_PRIMITIVE_OP, "operation_negate",
      ChangeDetectionUtil.operation_negate, [exp], null, 0);
  }

  visitConditional(ast:Conditional) {
    var c = ast.condition.visit(this);
    var t = ast.trueExp.visit(this);
    var f = ast.falseExp.visit(this);
    return this._addRecord(RECORD_TYPE_PRIMITIVE_OP, "cond",
      ChangeDetectionUtil.cond, [c,t,f], null, 0);
  }

  visitPipe(ast:Pipe) {
    var value = ast.exp.visit(this);
    var type = ast.inBinding ? RECORD_TYPE_BINDING_PIPE : RECORD_TYPE_PIPE;
    return this._addRecord(type, ast.name, ast.name, [], null, value);
  }

  visitKeyedAccess(ast:KeyedAccess) {
    var obj = ast.obj.visit(this);
    var key = ast.key.visit(this);
    return this._addRecord(RECORD_TYPE_KEYED_ACCESS, "keyedAccess",
      ChangeDetectionUtil.keyedAccess, [key], null, obj);
  }

  _visitAll(asts:List) {
    var res = ListWrapper.createFixedSize(asts.length);
    for (var i = 0; i < asts.length; ++i) {
      res[i] = asts[i].visit(this);
    }
    return res;
  }

  _addRecord(type, name, funcOrValue, args, fixedArgs, context) {
    var selfIndex = ++ this.contextIndex;
    if (context instanceof DirectiveIndex) {
      ListWrapper.push(this.protoRecords,
        new ProtoRecord(type, name, funcOrValue, args, fixedArgs, -1, context, selfIndex,
          this.bindingRecord, this.expressionAsString, false, false));
    } else {
      ListWrapper.push(this.protoRecords,
        new ProtoRecord(type, name, funcOrValue, args, fixedArgs, context, null, selfIndex,
          this.bindingRecord, this.expressionAsString, false, false));
    }
    return selfIndex;
  }
}


function _arrayFn(length:number):Function {
  switch (length) {
    case 0: return ChangeDetectionUtil.arrayFn0;
    case 1: return ChangeDetectionUtil.arrayFn1;
    case 2: return ChangeDetectionUtil.arrayFn2;
    case 3: return ChangeDetectionUtil.arrayFn3;
    case 4: return ChangeDetectionUtil.arrayFn4;
    case 5: return ChangeDetectionUtil.arrayFn5;
    case 6: return ChangeDetectionUtil.arrayFn6;
    case 7: return ChangeDetectionUtil.arrayFn7;
    case 8: return ChangeDetectionUtil.arrayFn8;
    case 9: return ChangeDetectionUtil.arrayFn9;
    default: throw new BaseException(`Does not support literal maps with more than 9 elements`);
  }
}

function _mapPrimitiveName(keys:List) {
  var stringifiedKeys = ListWrapper.join(
    ListWrapper.map(keys, (k) => isString(k) ? `"${k}"` : `${k}`),
    ", ");
  return `mapFn([${stringifiedKeys}])`;
}

function _operationToPrimitiveName(operation:string):string {
  switch(operation) {
    case '+'  : return "operation_add";
    case '-'  : return "operation_subtract";
    case '*'  : return "operation_multiply";
    case '/'  : return "operation_divide";
    case '%'  : return "operation_remainder";
    case '==' : return "operation_equals";
    case '!=' : return "operation_not_equals";
    case '<'  : return "operation_less_then";
    case '>'  : return "operation_greater_then";
    case '<=' : return "operation_less_or_equals_then";
    case '>=' : return "operation_greater_or_equals_then";
    case '&&' : return "operation_logical_and";
    case '||' : return "operation_logical_or";
    default: throw new BaseException(`Unsupported operation ${operation}`);
  }
}

function _operationToFunction(operation:string):Function {
  switch(operation) {
    case '+'  : return ChangeDetectionUtil.operation_add;
    case '-'  : return ChangeDetectionUtil.operation_subtract;
    case '*'  : return ChangeDetectionUtil.operation_multiply;
    case '/'  : return ChangeDetectionUtil.operation_divide;
    case '%'  : return ChangeDetectionUtil.operation_remainder;
    case '==' : return ChangeDetectionUtil.operation_equals;
    case '!=' : return ChangeDetectionUtil.operation_not_equals;
    case '<'  : return ChangeDetectionUtil.operation_less_then;
    case '>'  : return ChangeDetectionUtil.operation_greater_then;
    case '<=' : return ChangeDetectionUtil.operation_less_or_equals_then;
    case '>=' : return ChangeDetectionUtil.operation_greater_or_equals_then;
    case '&&' : return ChangeDetectionUtil.operation_logical_and;
    case '||' : return ChangeDetectionUtil.operation_logical_or;
    default: throw new BaseException(`Unsupported operation ${operation}`);
  }
}

function s(v) {
  return isPresent(v) ? `${v}` : '';
}

function _interpolationFn(strings:List) {
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
    case 1: return (a1) => c0 + s(a1) + c1;
    case 2: return (a1, a2) =>  c0 + s(a1) + c1 + s(a2) + c2;
    case 3: return (a1, a2, a3) =>  c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3;
    case 4: return (a1, a2, a3, a4) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4;
    case 5: return (a1, a2, a3, a4, a5) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5;
    case 6: return (a1, a2, a3, a4, a5, a6) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6;
    case 7: return (a1, a2, a3, a4, a5, a6, a7) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7;
    case 8: return (a1, a2, a3, a4, a5, a6, a7, a8) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7 + s(a8) + c8;
    case 9: return (a1, a2, a3, a4, a5, a6, a7, a8, a9) => c0 + s(a1) + c1 + s(a2) + c2 + s(a3) + c3 + s(a4) + c4 + s(a5) + c5 + s(a6) + c6 + s(a7) + c7 + s(a8) + c8 + s(a9) + c9;
    default: throw new BaseException(`Does not support more than 9 expressions`);
  }
}