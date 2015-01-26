import {isPresent, isBlank, BaseException, Type} from 'facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'facade/collection';

import {ContextWithVariableBindings} from './parser/context_with_variable_bindings';
import {AbstractChangeDetector} from './abstract_change_detector';
import {ChangeDetectionUtil} from './change_detection_util';

import {
  ProtoRecord,
  RECORD_TYPE_SELF,
  RECORD_TYPE_PROPERTY,
  RECORD_TYPE_INVOKE_METHOD,
  RECORD_TYPE_CONST,
  RECORD_TYPE_INVOKE_CLOSURE,
  RECORD_TYPE_PRIMITIVE_OP,
  RECORD_TYPE_KEYED_ACCESS,
  RECORD_TYPE_INVOKE_FORMATTER,
  RECORD_TYPE_STRUCTURAL_CHECK,
  RECORD_TYPE_INTERPOLATE,
  ProtoChangeDetector
  } from './proto_change_detector';

/**
 * The code generator takes a list of proto records and creates a function/class
 * that "emulates" what the developer would write by hand to implement the same
 * kind of behaviour.
 * 
 * For example: An expression `address.city` will result in the following class:
 * 
 * var ChangeDetector0 = function ChangeDetector0(dispatcher, formatters, protos) {
 *   AbstractChangeDetector.call(this);
 *   this.dispatcher = dispatcher;
 *   this.formatters = formatters;
 *   this.protos = protos;
 * 
 *   this.context = null;
 *   this.address0 = null;
 *   this.city1 = null;
 * }
 * ChangeDetector0.prototype = Object.create(AbstractChangeDetector.prototype);
 * 
 * ChangeDetector0.prototype.detectChangesInRecords = function(throwOnChange) {
 *   var address0;
 *   var city1;
 *   var change;
 *   var changes = [];
 *   var temp;
 *   var context = this.context;
 * 
 *   temp = ChangeDetectionUtil.findContext("address", context);
 *   if (temp instanceof ContextWithVariableBindings) {
 *     address0 = temp.get('address');
 *   } else {
 *     address0 = temp.address;
 *   }
 * 
 *   if (address0 !== this.address0) {
 *     this.address0 = address0;
 *   }
 * 
 *   city1 = address0.city;
 *   if (city1 !== this.city1) {
 *     changes.push(ChangeDetectionUtil.simpleChangeRecord(this.protos[1].bindingMemento, this.city1, city1));
 *     this.city1 = city1;
 *   }
 * 
 *   if (changes.length > 0) {
 *     if(throwOnChange) ChangeDetectionUtil.throwOnChange(this.protos[1], changes[0]);
 *     this.dispatcher.onRecordChange('address.city', changes);
 *     changes = [];
 *   }
 * }
 * 
 * 
 * ChangeDetector0.prototype.setContext = function(context) {
 *   this.context = context;
 * }
 * 
 * return ChangeDetector0;
 * 
 * 
 * The only thing the generated class depends on is the super class AbstractChangeDetector.
 *
 * The implementation comprises two parts:
 * * ChangeDetectorJITGenerator has the logic of how everything fits together.
 * * template functions (e.g., constructorTemplate) define what code is generated.
*/
  
var ABSTRACT_CHANGE_DETECTOR = "AbstractChangeDetector";
var UTIL = "ChangeDetectionUtil";
var DISPATCHER_ACCESSOR = "this.dispatcher";
var FORMATTERS_ACCESSOR = "this.formatters";
var PROTOS_ACCESSOR = "this.protos";
var CHANGE_LOCAL = "change";
var CHANGES_LOCAL = "changes";
var TEMP_LOCAL = "temp";

function typeTemplate(type:string, cons:string, detectChanges:string, setContext:string):string {
  return `
${cons}
${detectChanges}
${setContext};

return function(dispatcher, formatters) {
  return new ${type}(dispatcher, formatters, protos);
}
`;
}

function constructorTemplate(type:string, fieldsDefinitions:string):string {
  return `
var ${type} = function ${type}(dispatcher, formatters, protos) {
${ABSTRACT_CHANGE_DETECTOR}.call(this);
${DISPATCHER_ACCESSOR} = dispatcher;
${FORMATTERS_ACCESSOR} = formatters;
${PROTOS_ACCESSOR} = protos;
${fieldsDefinitions}
}

${type}.prototype = Object.create(${ABSTRACT_CHANGE_DETECTOR}.prototype);
`;
}

function setContextTemplate(type:string):string {
  return `
${type}.prototype.setContext = function(context) {
  this.context = context;
}
`;
}

function detectChangesTemplate(type:string, body:string):string {
  return `
${type}.prototype.detectChangesInRecords = function(throwOnChange) {
  ${body}
}
`;
}


function bodyTemplate(localDefinitions:string, records:string):string {
  return `
${localDefinitions}
var ${TEMP_LOCAL};
var ${CHANGE_LOCAL};
var ${CHANGES_LOCAL} = [];

context = this.context;
${records}
`;
}

function notifyTemplate(index:number):string{
  return  `
if (${CHANGES_LOCAL}.length > 0) {
  if(throwOnChange) ${UTIL}.throwOnChange(${PROTOS_ACCESSOR}[${index}], ${CHANGES_LOCAL}[0]);
  ${DISPATCHER_ACCESSOR}.onRecordChange(${PROTOS_ACCESSOR}[${index}].groupMemento, ${CHANGES_LOCAL});
  ${CHANGES_LOCAL} = [];
}
`;
}


function structuralCheckTemplate(selfIndex:number, field:string, context:string, notify:string):string{
  return `
${CHANGE_LOCAL} = ${UTIL}.structuralCheck(${field}, ${context});
if (${CHANGE_LOCAL}) {
  ${CHANGES_LOCAL}.push(${UTIL}.changeRecord(${PROTOS_ACCESSOR}[${selfIndex}].bindingMemento, ${CHANGE_LOCAL}));
  ${field} = ${CHANGE_LOCAL}.currentValue;
}
${notify}
`;
}

function referenceCheckTemplate(assignment, newValue, oldValue, addRecord, notify) {
  return `
${assignment}
if (${newValue} !== ${oldValue} || (${newValue} !== ${newValue}) && (${oldValue} !== ${oldValue})) {
  ${addRecord}
  ${oldValue} = ${newValue};
}
${notify}
`;
}

function assignmentTemplate(field:string, value:string) {
  return `${field} = ${value};`;
}

function propertyReadTemplate(name:string, context:string, newValue:string) {
  return `
${TEMP_LOCAL} = ${UTIL}.findContext("${name}", ${context});
if (${TEMP_LOCAL} instanceof ContextWithVariableBindings) {
  ${newValue} = ${TEMP_LOCAL}.get('${name}');
} else {
  ${newValue} = ${TEMP_LOCAL}.${name};
}
`;
}

function localDefinitionsTemplate(names:List):string {
  return names.map((n) => `var ${n};`).join("\n");
}

function fieldDefinitionsTemplate(names:List):string {
  return names.map((n) => `${n} = ${UTIL}.unitialized();`).join("\n");
}

function addSimpleChangeRecordTemplate(protoIndex:number, oldValue:string, newValue:string) {
  return `${CHANGES_LOCAL}.push(${UTIL}.simpleChangeRecord(${PROTOS_ACCESSOR}[${protoIndex}].bindingMemento, ${oldValue}, ${newValue}));`;
}


export class ChangeDetectorJITGenerator {
  typeName:string;
  records:List<ProtoRecord>;
  localNames:List<String>;
  fieldNames:List<String>;

  constructor(typeName:string, records:List<ProtoRecord>) {
    this.typeName = typeName;
    this.records = records;

    this.localNames = this.getLocalNames(records);
    this.fieldNames = this.getFieldNames(this.localNames);
  }

  getLocalNames(records:List<ProtoRecord>):List<String> {
    var index = 0;
    var names = records.map((r) => {
      var sanitizedName = r.name.replace(new RegExp("\\W", "g"), '');
      return `${sanitizedName}${index++}`
    });
    return ["context"].concat(names);
  }

  getFieldNames(localNames:List<String>):List<String> {
    return localNames.map((n) => `this.${n}`);
  }


  generate():Function {
    var text = typeTemplate(this.typeName, this.genConstructor(), this.genDetectChanges(), this.genSetContext());
    return new Function('AbstractChangeDetector', 'ChangeDetectionUtil', 'ContextWithVariableBindings', 'protos', text)(AbstractChangeDetector, ChangeDetectionUtil, ContextWithVariableBindings, this.records);
  }

  genConstructor():string {
    return constructorTemplate(this.typeName, fieldDefinitionsTemplate(this.fieldNames));
  }

  genSetContext():string {
    return setContextTemplate(this.typeName);
  }

  genDetectChanges():string {
    var body = this.genBody();
    return detectChangesTemplate(this.typeName, body);
  }

  genBody():string {
    var rec = this.records.map((r) => this.genRecord(r)).join("\n");
    return bodyTemplate(this.genLocalDefinitions(), rec);
  }

  genLocalDefinitions():string {
    return localDefinitionsTemplate(this.localNames);
  }

  genRecord(r:ProtoRecord):string {
    if (r.mode == RECORD_TYPE_STRUCTURAL_CHECK) {
      return this.getStructuralCheck(r);
    } else {
      return this.genReferenceCheck(r);
    }
  }

  getStructuralCheck(r:ProtoRecord):string {
    var field = this.fieldNames[r.selfIndex];
    var context = this.localNames[r.contextIndex];
    return structuralCheckTemplate(r.selfIndex - 1, field, context, this.genNotify(r));
  }

  genReferenceCheck(r:ProtoRecord):string {
    var newValue = this.localNames[r.selfIndex];
    var oldValue = this.fieldNames[r.selfIndex];
    var assignment = this.genUpdateCurrentValue(r);
    var addRecord = addSimpleChangeRecordTemplate(r.selfIndex - 1, oldValue, newValue);
    var notify = this.genNotify(r);
    return referenceCheckTemplate(assignment, newValue, oldValue, r.lastInBinding ? addRecord : '', notify);
  }

  genUpdateCurrentValue(r:ProtoRecord):string {
    var context = this.localNames[r.contextIndex];
    var newValue = this.localNames[r.selfIndex];
    var args = this.genArgs(r);

    switch (r.mode) {
      case RECORD_TYPE_SELF:
        return assignmentTemplate(newValue, context);

      case RECORD_TYPE_CONST:
        return `${newValue} = ${this.genLiteral(r.funcOrValue)}`;

      case RECORD_TYPE_PROPERTY:
        if (r.contextIndex == 0) { // only the first property read can be a local
          return propertyReadTemplate(r.name, context, newValue);
        } else {
          return assignmentTemplate(newValue, `${context}.${r.name}`);
        }

      case RECORD_TYPE_INVOKE_METHOD:
        return assignmentTemplate(newValue, `${context}.${r.name}(${args})`);

      case RECORD_TYPE_INVOKE_CLOSURE:
        return assignmentTemplate(newValue, `${context}(${args})`);

      case RECORD_TYPE_PRIMITIVE_OP:
        return assignmentTemplate(newValue, `${UTIL}.${r.name}(${args})`);

      case RECORD_TYPE_INTERPOLATE:
        return assignmentTemplate(newValue, this.genInterpolation(r));

      case RECORD_TYPE_KEYED_ACCESS:
        var key = this.localNames[r.args[0]];
        return assignmentTemplate(newValue, `${context}[${key}]`);

      case RECORD_TYPE_INVOKE_FORMATTER:
        return assignmentTemplate(newValue, `${FORMATTERS_ACCESSOR}.get("${r.name}")(${args})`);

      default:
        throw new BaseException(`Unknown operation ${r.mode}`);
    }
  }

  genInterpolation(r:ProtoRecord):string{
    var res = "";
    for (var i = 0; i < r.args.length; ++i) {
      res += this.genLiteral(r.fixedArgs[i]);
      res += " + ";
      res += this.localNames[r.args[i]];
      res += " + ";
    }
    res += this.genLiteral(r.fixedArgs[r.args.length]);
    return res;
  }
  
  genLiteral(value):string {
    return JSON.stringify(value);
  }

  genNotify(r):string{
    return r.lastInGroup ? notifyTemplate(r.selfIndex - 1) : '';
  }

  genArgs(r:ProtoRecord):string {
    return r.args.map((arg) => this.localNames[arg]).join(", ");
  }
}




