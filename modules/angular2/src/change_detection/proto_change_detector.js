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
import {ChangeRecord, ChangeDispatcher, ChangeDetector} from './interfaces';
import {ChangeDetectionUtil} from './change_detection_util';
import {DynamicChangeDetector} from './dynamic_change_detector';
import {ChangeDetectorJITGenerator} from './change_detection_jit_generator';

import {ArrayChanges} from './array_changes';
import {KeyValueChanges} from './keyvalue_changes';
import {coalesce} from './coalesce';

export const RECORD_TYPE_SELF = 0;
export const RECORD_TYPE_CONST = 1;
export const RECORD_TYPE_PRIMITIVE_OP = 2;
export const RECORD_TYPE_PROPERTY = 3;
export const RECORD_TYPE_INVOKE_METHOD = 4;
export const RECORD_TYPE_INVOKE_CLOSURE = 5;
export const RECORD_TYPE_KEYED_ACCESS = 6;
export const RECORD_TYPE_INVOKE_FORMATTER = 7;
export const RECORD_TYPE_STRUCTURAL_CHECK = 8;
export const RECORD_TYPE_INTERPOLATE = 9;

export class ProtoRecord {
  mode:number;
  name:string;
  funcOrValue:any;
  args:List;
  fixedArgs:List;
  contextIndex:number;
  selfIndex:number;
  bindingMemento:any;
  directiveMemento:any;
  lastInBinding:boolean;
  lastInDirective:boolean;
  expressionAsString:string;

  constructor(mode:number,
              name:string,
              funcOrValue,
              args:List,
              fixedArgs:List,
              contextIndex:number,
              selfIndex:number,
              bindingMemento:any,
              directiveMemento:any,
              expressionAsString:string,
              lastInBinding:boolean,
              lastInDirective:boolean) {

    this.mode = mode;
    this.name = name;
    this.funcOrValue = funcOrValue;
    this.args = args;
    this.fixedArgs = fixedArgs;
    this.contextIndex = contextIndex;
    this.selfIndex = selfIndex;
    this.bindingMemento = bindingMemento;
    this.directiveMemento = directiveMemento;
    this.lastInBinding = lastInBinding;
    this.lastInDirective = lastInDirective;
    this.expressionAsString = expressionAsString;
  }

  isPureFunction():boolean {
    return this.mode === RECORD_TYPE_INTERPOLATE ||
      this.mode === RECORD_TYPE_INVOKE_FORMATTER ||
      this.mode === RECORD_TYPE_PRIMITIVE_OP;
  }
}

export class ProtoChangeDetector  {
  addAst(ast:AST, bindingMemento:any, directiveMemento:any = null, structural:boolean = false){}
  instantiate(dispatcher:any, formatters:Map):ChangeDetector{
    return null;
  }
}

export class DynamicProtoChangeDetector extends ProtoChangeDetector {
  _records:List<ProtoRecord>;
  _recordBuilder:ProtoRecordBuilder;

  constructor() {
    this._records = null;
    this._recordBuilder = new ProtoRecordBuilder();
  }

  addAst(ast:AST, bindingMemento:any, directiveMemento:any = null, structural:boolean = false) {
    this._recordBuilder.addAst(ast, bindingMemento, directiveMemento, structural);
  }

  instantiate(dispatcher:any, formatters:Map) {
    this._createRecordsIfNecessary();
    return new DynamicChangeDetector(dispatcher, formatters, this._records);
  }

  _createRecordsIfNecessary() {
    if (isBlank(this._records)) {
      var records = this._recordBuilder.records;
      this._records = coalesce(records);
    }
  }
}

var _jitProtoChangeDetectorClassCounter:number = 0;
export class JitProtoChangeDetector extends ProtoChangeDetector {
  _factory:Function;
  _recordBuilder:ProtoRecordBuilder;

  constructor() {
    this._factory = null;
    this._recordBuilder = new ProtoRecordBuilder();
  }

  addAst(ast:AST, bindingMemento:any, directiveMemento:any = null, structural:boolean = false) {
    this._recordBuilder.addAst(ast, bindingMemento, directiveMemento, structural);
  }

  instantiate(dispatcher:any, formatters:Map) {
    this._createFactoryIfNecessary();
    return this._factory(dispatcher, formatters);
  }

  _createFactoryIfNecessary() {
    if (isBlank(this._factory)) {
      var c = _jitProtoChangeDetectorClassCounter++;
      var records = coalesce(this._recordBuilder.records);
      var typeName = `ChangeDetector${c}`;
      this._factory = new ChangeDetectorJITGenerator(typeName, records).generate();
    }
  }
}

class ProtoRecordBuilder {
  records:List<ProtoRecord>;

  constructor() {
    this.records = [];
  }

  addAst(ast:AST, bindingMemento:any, directiveMemento:any = null, structural:boolean = false) {
    if (structural) ast = new Structural(ast);

    var last = ListWrapper.last(this.records);
    if (isPresent(last) && last.directiveMemento == directiveMemento) {
      last.lastInDirective = false;
    }

    var pr = _ConvertAstIntoProtoRecords.convert(ast, bindingMemento, directiveMemento, this.records.length);
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
  bindingMemento:any;
  directiveMemento:any;
  contextIndex:number;
  expressionAsString:string;

  constructor(bindingMemento:any, directiveMemento:any, contextIndex:number, expressionAsString:string) {
    this.protoRecords = [];
    this.bindingMemento = bindingMemento;
    this.directiveMemento = directiveMemento;
    this.contextIndex = contextIndex;
    this.expressionAsString = expressionAsString;
  }

  static convert(ast:AST, bindingMemento:any, directiveMemento:any, contextIndex:number) {
    var c = new _ConvertAstIntoProtoRecords(bindingMemento, directiveMemento, contextIndex, ast.toString());
    ast.visit(c);
    return c.protoRecords;
  }

  visitImplicitReceiver(ast:ImplicitReceiver) {
    return 0;
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
    return this._addRecord(RECORD_TYPE_PROPERTY, ast.name, ast.getter, [], null, receiver);
  }

  visitFormatter(ast:Formatter) {
    return this._addRecord(RECORD_TYPE_INVOKE_FORMATTER, ast.name, ast.name, this._visitAll(ast.allArgs), null, 0);
  }

  visitMethodCall(ast:MethodCall) {
    var receiver = ast.receiver.visit(this);
    var args = this._visitAll(ast.args);
    return this._addRecord(RECORD_TYPE_INVOKE_METHOD, ast.name, ast.fn, args, null, receiver);
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

  visitStructural(ast:Structural) {
    var value = ast.value.visit(this);
    return this._addRecord(RECORD_TYPE_STRUCTURAL_CHECK, "structural", null, [], null, value);
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
    ListWrapper.push(this.protoRecords,
      new ProtoRecord(type, name, funcOrValue, args, fixedArgs, context, selfIndex,
        this.bindingMemento, this.directiveMemento, this.expressionAsString, false, false));
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