import {isPresent, isBlank, BaseException} from 'facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'facade/collection';

import {
  AccessMember,
  Assignment,
  AST,
  ASTWithSource,
  AstVisitor,
  Binary,
  Chain,
  Structural,
  Conditional,
  Formatter,
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

import {ContextWithVariableBindings} from './parser/context_with_variable_bindings';
import {ChangeDispatcher, ChangeDetector} from './interfaces';
import {DynamicChangeDetector} from './dynamic_change_detector';

export const RECORD_TYPE_SELF = 0;
export const RECORD_TYPE_PROPERTY = 1;
export const RECORD_TYPE_INVOKE_METHOD = 2;
export const RECORD_TYPE_CONST = 3;
export const RECORD_TYPE_INVOKE_CLOSURE = 4;
export const RECORD_TYPE_INVOKE_PURE_FUNCTION = 5;
export const RECORD_TYPE_INVOKE_FORMATTER = 6;
export const RECORD_TYPE_STRUCTURAL_CHECK = 10;

export class ProtoRecord {
  mode:number;
  name:string;
  funcOrValue:any;
  args:List;
  contextIndex:number;
  record_type_selfIndex:number;
  bindingMemento:any;
  groupMemento:any;
  terminal:boolean;
  expressionAsString:string;

  constructor(mode:number,
              name:string,
              funcOrValue,
              args:List,
              contextIndex:number,
              record_type_selfIndex:number,
              bindingMemento:any,
              groupMemento:any,
              terminal:boolean,
              expressionAsString:string) {

    this.mode = mode;
    this.name = name;
    this.funcOrValue = funcOrValue;
    this.args = args;
    this.contextIndex = contextIndex;
    this.record_type_selfIndex = record_type_selfIndex;
    this.bindingMemento = bindingMemento;
    this.groupMemento = groupMemento;
    this.terminal = terminal;
    this.expressionAsString = expressionAsString;
  }
}

export class ProtoChangeDetector {
  records:List<ProtoRecord>;

  constructor() {
    this.records = [];
  }

  addAst(ast:AST, bindingMemento:any, groupMemento:any = null, structural:boolean = false) {
    if (structural) ast = new Structural(ast);

    var c = new ProtoOperationsCreator(bindingMemento, groupMemento,
      this.records.length, ast.toString());
    ast.visit(c);

    if (! ListWrapper.isEmpty(c.protoRecords)) {
      var last = ListWrapper.last(c.protoRecords);
      last.terminal = true;
      this.records = ListWrapper.concat(this.records, c.protoRecords);
    }
  }

  instantiate(dispatcher:any, formatters:Map) {
    return new DynamicChangeDetector(dispatcher, formatters, this.records);
  }
}

class ProtoOperationsCreator {
  protoRecords:List;
  bindingMemento:any;
  groupMemento:any;
  contextIndex:number;
  expressionAsString:string;

  constructor(bindingMemento:any, groupMemento:any, contextIndex:number, expressionAsString:string) {
    this.protoRecords = [];
    this.bindingMemento = bindingMemento;
    this.groupMemento = groupMemento;
    this.contextIndex = contextIndex;
    this.expressionAsString = expressionAsString;
  }

  visitImplicitReceiver(ast:ImplicitReceiver) {
    return 0;
  }

  visitInterpolation(ast:Interpolation) {
    var args = this._visitAll(ast.expressions);
    return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, "Interpolate()", _interpolationFn(ast.strings), args, 0);
  }

  visitLiteralPrimitive(ast:LiteralPrimitive) {
    return this._addRecord(RECORD_TYPE_CONST, null, ast.value, [], 0);
  }

  visitAccessMember(ast:AccessMember) {
    var receiver = ast.receiver.visit(this);
    return this._addRecord(RECORD_TYPE_PROPERTY, ast.name, ast.getter, [], receiver);
  }

  visitFormatter(ast:Formatter) {
    return this._addRecord(RECORD_TYPE_INVOKE_FORMATTER, ast.name, ast.name, this._visitAll(ast.allArgs), 0);
  }

  visitMethodCall(ast:MethodCall) {
    var receiver = ast.receiver.visit(this);
    var args = this._visitAll(ast.args);
    return this._addRecord(RECORD_TYPE_INVOKE_METHOD, ast.name, ast.fn, args, receiver);
  }

  visitFunctionCall(ast:FunctionCall) {
    var target = ast.target.visit(this);
    var args = this._visitAll(ast.args);
    return this._addRecord(RECORD_TYPE_INVOKE_CLOSURE, null, null, args, target);
  }

  visitLiteralArray(ast:LiteralArray) {
    return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, "Array()", _arrayFn(ast.expressions.length),
      this._visitAll(ast.expressions), 0);
  }

  visitLiteralMap(ast:LiteralMap) {
    return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, "Map()", _mapFn(ast.keys, ast.values.length),
      this._visitAll(ast.values), 0);
  }

  visitBinary(ast:Binary) {
    var left = ast.left.visit(this);
    var right = ast.right.visit(this);
    return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, ast.operation, _operationToFunction(ast.operation), [left, right], 0);
  }

  visitPrefixNot(ast:PrefixNot) {
    var exp = ast.expression.visit(this)
    return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, "-", _operation_negate, [exp], 0);
  }

  visitConditional(ast:Conditional) {
    var c = ast.condition.visit(this);
    var t = ast.trueExp.visit(this);
    var f = ast.falseExp.visit(this);
    return this._addRecord(RECORD_TYPE_INVOKE_PURE_FUNCTION, "?:", _cond, [c,t,f], 0);
  }

  visitStructural(ast:Structural) {
    var value = ast.value.visit(this);
    return this._addRecord(RECORD_TYPE_STRUCTURAL_CHECK, "record_type_structural_check", null, [], value);
  }

  visitKeyedAccess(ast:KeyedAccess) {
    var obj = ast.obj.visit(this);
    var key = ast.key.visit(this);
    return this._addRecord(RECORD_TYPE_INVOKE_METHOD, "[]", _keyedAccess, [key], obj);
  }

  _visitAll(asts:List) {
    var res = ListWrapper.createFixedSize(asts.length);
    for (var i = 0; i < asts.length; ++i) {
      res[i] = asts[i].visit(this);
    }
    return res;
  }

  _addRecord(type, name, funcOrValue, args, context) {
    var record_type_selfIndex = ++ this.contextIndex;
    ListWrapper.push(this.protoRecords,
      new ProtoRecord(type, name, funcOrValue, args, context, record_type_selfIndex,
        this.bindingMemento, this.groupMemento, false, this.expressionAsString));
    return record_type_selfIndex;
  }
}

function _arrayFn(length:int) {
  switch (length) {
    case 0: return () => [];
    case 1: return (a1) => [a1];
    case 2: return (a1, a2) => [a1, a2];
    case 3: return (a1, a2, a3) => [a1, a2, a3];
    case 4: return (a1, a2, a3, a4) => [a1, a2, a3, a4];
    case 5: return (a1, a2, a3, a4, a5) => [a1, a2, a3, a4, a5];
    case 6: return (a1, a2, a3, a4, a5, a6) => [a1, a2, a3, a4, a5, a6];
    case 7: return (a1, a2, a3, a4, a5, a6, a7) => [a1, a2, a3, a4, a5, a6, a7];
    case 8: return (a1, a2, a3, a4, a5, a6, a7, a8) => [a1, a2, a3, a4, a5, a6, a7, a8];
    case 9: return (a1, a2, a3, a4, a5, a6, a7, a8, a9) => [a1, a2, a3, a4, a5, a6, a7, a8, a9];
    default: throw new BaseException(`Does not support literal arrays with more than 9 elements`);
  }
}

function _mapFn(keys:List, length:int) {
  function buildMap(values) {
    var res = StringMapWrapper.create();
    for(var i = 0; i < keys.length; ++i) {
      StringMapWrapper.set(res, keys[i], values[i]);
    }
    return res;
  }

  switch (length) {
    case 0: return () => [];
    case 1: return (a1) => buildMap([a1]);
    case 2: return (a1, a2) => buildMap([a1, a2]);
    case 3: return (a1, a2, a3) => buildMap([a1, a2, a3]);
    case 4: return (a1, a2, a3, a4) => buildMap([a1, a2, a3, a4]);
    case 5: return (a1, a2, a3, a4, a5) => buildMap([a1, a2, a3, a4, a5]);
    case 6: return (a1, a2, a3, a4, a5, a6) => buildMap([a1, a2, a3, a4, a5, a6]);
    case 7: return (a1, a2, a3, a4, a5, a6, a7) => buildMap([a1, a2, a3, a4, a5, a6, a7]);
    case 8: return (a1, a2, a3, a4, a5, a6, a7, a8) => buildMap([a1, a2, a3, a4, a5, a6, a7, a8]);
    case 9: return (a1, a2, a3, a4, a5, a6, a7, a8, a9) => buildMap([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
    default: throw new BaseException(`Does not support literal maps with more than 9 elements`);
  }
}

function _operationToFunction(operation:string):Function {
  switch(operation) {
    case '+'  : return _operation_add;
    case '-'  : return _operation_subtract;
    case '*'  : return _operation_multiply;
    case '/'  : return _operation_divide;
    case '%'  : return _operation_remainder;
    case '==' : return _operation_equals;
    case '!=' : return _operation_not_equals;
    case '<'  : return _operation_less_then;
    case '>'  : return _operation_greater_then;
    case '<=' : return _operation_less_or_equals_then;
    case '>=' : return _operation_greater_or_equals_then;
    case '&&' : return _operation_logical_and;
    case '||' : return _operation_logical_or;
    default: throw new BaseException(`Unsupported operation ${operation}`);
  }
}

function _operation_negate(value)                       {return !value;}
function _operation_add(left, right)                    {return left + right;}
function _operation_subtract(left, right)               {return left - right;}
function _operation_multiply(left, right)               {return left * right;}
function _operation_divide(left, right)                 {return left / right;}
function _operation_remainder(left, right)              {return left % right;}
function _operation_equals(left, right)                 {return left == right;}
function _operation_not_equals(left, right)             {return left != right;}
function _operation_less_then(left, right)              {return left < right;}
function _operation_greater_then(left, right)           {return left > right;}
function _operation_less_or_equals_then(left, right)    {return left <= right;}
function _operation_greater_or_equals_then(left, right) {return left >= right;}
function _operation_logical_and(left, right)            {return left && right;}
function _operation_logical_or(left, right)             {return left || right;}
function _cond(cond, trueVal, falseVal)                 {return cond ? trueVal : falseVal;}

function _keyedAccess(obj, args) {
  return obj[args[0]];
}

function s(v) {
  return isPresent(v) ? '' + v : '';
}

function _interpolationFn(strings:List) {
  var length = strings.length;
  var i = -1;
  var c0 = length > ++i ? strings[i] : null;
  var c1 = length > ++i ? strings[i] : null;
  var c2 = length > ++i ? strings[i] : null;
  var c3 = length > ++i ? strings[i] : null;
  var c4 = length > ++i ? strings[i] : null;
  var c5 = length > ++i ? strings[i] : null;
  var c6 = length > ++i ? strings[i] : null;
  var c7 = length > ++i ? strings[i] : null;
  var c8 = length > ++i ? strings[i] : null;
  var c9 = length > ++i ? strings[i] : null;
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
