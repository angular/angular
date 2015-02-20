import {isPresent, isBlank, BaseException, Type} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

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
  RECORD_TYPE_PIPE,
  RECORD_TYPE_INTERPOLATE
  } from './proto_record';

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
 *   var changes = null;
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
 *     changes = ChangeDetectionUtil.addRecord(changes,
 *       ChangeDetectionUtil.simpleChangeRecord(this.protos[1].bindingMemento, this.city1, city1));
 *     this.city1 = city1;
 *   }
 *
 *   if (changes.length > 0) {
 *     if(throwOnChange) ChangeDetectionUtil.throwOnChange(this.protos[1], changes[0]);
 *     this.dispatcher.onRecordChange('address.city', changes);
 *     changes = null;
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
var PIPE_REGISTRY_ACCESSOR = "this.pipeRegistry";

function typeTemplate(type:string, cons:string, detectChanges:string, setContext:string):string {
  return `
${cons}
${detectChanges}
${setContext};

return function(dispatcher, formatters, pipeRegistry) {
  return new ${type}(dispatcher, formatters, pipeRegistry, protos);
}
`;
}

function constructorTemplate(type:string, fieldsDefinitions:string):string {
  return `
var ${type} = function ${type}(dispatcher, formatters, pipeRegistry, protos) {
${ABSTRACT_CHANGE_DETECTOR}.call(this);
${DISPATCHER_ACCESSOR} = dispatcher;
${FORMATTERS_ACCESSOR} = formatters;
${PIPE_REGISTRY_ACCESSOR} = pipeRegistry;
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


function bodyTemplate(localDefinitions:string, changeDefinitions:string, records:string):string {
  return `
${localDefinitions}
${changeDefinitions}
var ${TEMP_LOCAL};
var ${CHANGE_LOCAL};
var ${CHANGES_LOCAL} = null;

context = this.context;
${records}
`;
}

function notifyTemplate(index:number):string{
  return  `
if (${CHANGES_LOCAL} && ${CHANGES_LOCAL}.length > 0) {
  if(throwOnChange) ${UTIL}.throwOnChange(${PROTOS_ACCESSOR}[${index}], ${CHANGES_LOCAL}[0]);
  ${DISPATCHER_ACCESSOR}.onRecordChange(${PROTOS_ACCESSOR}[${index}].directiveMemento, ${CHANGES_LOCAL});
  ${CHANGES_LOCAL} = null;
}
`;
}

function pipeCheckTemplate(context:string, pipe:string, pipeType:string,
                                  value:string, change:string, addRecord:string, notify:string):string{
  return `
if (${pipe} === ${UTIL}.unitialized() || !${pipe}.supports(${context})) {
  ${pipe} = ${PIPE_REGISTRY_ACCESSOR}.get('${pipeType}', ${context});
}

${CHANGE_LOCAL} = ${pipe}.transform(${context});
if (! ${UTIL}.noChangeMarker(${CHANGE_LOCAL})) {
  ${value} = ${CHANGE_LOCAL};
  ${change} = true;
  ${addRecord}
}
${notify}
`;
}

function referenceCheckTemplate(assignment, newValue, oldValue, change, addRecord, notify) {
  return `
${assignment}
if (${newValue} !== ${oldValue} || (${newValue} !== ${newValue}) && (${oldValue} !== ${oldValue})) {
  ${change} = true;
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

function changeDefinitionsTemplate(names:List):string {
  return names.map((n) => `var ${n} = false;`).join("\n");
}

function fieldDefinitionsTemplate(names:List):string {
  return names.map((n) => `${n} = ${UTIL}.unitialized();`).join("\n");
}

function ifChangedGuardTemplate(changeNames:List, body:string):string {
  var cond = changeNames.join(" || ");
  return `
if (${cond}) {
  ${body}
}
`;
}

function addSimpleChangeRecordTemplate(protoIndex:number, oldValue:string, newValue:string) {
  return `${CHANGES_LOCAL} = ${UTIL}.addRecord(${CHANGES_LOCAL},
    ${UTIL}.simpleChangeRecord(${PROTOS_ACCESSOR}[${protoIndex}].bindingMemento, ${oldValue}, ${newValue}));`;
}


export class ChangeDetectorJITGenerator {
  typeName:string;
  records:List<ProtoRecord>;
  localNames:List<String>;
  changeNames:List<String>;
  fieldNames:List<String>;
  pipeNames:List<String>;

  constructor(typeName:string, records:List<ProtoRecord>) {
    this.typeName = typeName;
    this.records = records;

    this.localNames = this.getLocalNames(records);
    this.changeNames = this.getChangeNames(this.localNames);
    this.fieldNames = this.getFieldNames(this.localNames);
    this.pipeNames = this.getPipeNames(this.localNames);
  }

  getLocalNames(records:List<ProtoRecord>):List<String> {
    var index = 0;
    var names = records.map((r) => {
      var sanitizedName = r.name.replace(new RegExp("\\W", "g"), '');
      return `${sanitizedName}${index++}`
    });
    return ["context"].concat(names);
  }

  getChangeNames(localNames:List<String>):List<String> {
    return localNames.map((n) => `change_${n}`);
  }

  getFieldNames(localNames:List<String>):List<String> {
    return localNames.map((n) => `this.${n}`);
  }

  getPipeNames(localNames:List<String>):List<String> {
    return localNames.map((n) => `this.${n}_pipe`);
  }

  generate():Function {
    var text = typeTemplate(this.typeName, this.genConstructor(), this.genDetectChanges(), this.genSetContext());
    return new Function('AbstractChangeDetector', 'ChangeDetectionUtil', 'ContextWithVariableBindings', 'protos', text)(AbstractChangeDetector, ChangeDetectionUtil, ContextWithVariableBindings, this.records);
  }

  genConstructor():string {
    var fields = [];
    fields = fields.concat(this.fieldNames);

    this.records.forEach((r) => {
      if (r.mode === RECORD_TYPE_PIPE) {
        fields.push(this.pipeNames[r.selfIndex]);
      }
    });

    return constructorTemplate(this.typeName, fieldDefinitionsTemplate(fields));
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
    return bodyTemplate(this.genLocalDefinitions(), this.genChangeDefinitions(), rec);
  }

  genLocalDefinitions():string {
    return localDefinitionsTemplate(this.localNames);
  }

  genChangeDefinitions():string {
    return changeDefinitionsTemplate(this.changeNames);
  }

  genRecord(r:ProtoRecord):string {
    if (r.mode === RECORD_TYPE_PIPE) {
      return this.genPipeCheck (r);
    } else {
      return this.genReferenceCheck(r);
    }
  }

  genPipeCheck(r:ProtoRecord):string {
    var context = this.localNames[r.contextIndex];
    var pipe = this.pipeNames[r.selfIndex];
    var newValue = this.localNames[r.selfIndex];
    var oldValue = this.fieldNames[r.selfIndex];
    var change = this.changeNames[r.selfIndex];

    var addRecord = addSimpleChangeRecordTemplate(r.selfIndex - 1, oldValue, newValue);
    var notify = this.genNotify(r);

    return pipeCheckTemplate(context, pipe, r.name, newValue, change, addRecord, notify);
  }

  genReferenceCheck(r:ProtoRecord):string {
    var newValue = this.localNames[r.selfIndex];
    var oldValue = this.fieldNames[r.selfIndex];
    var change = this.changeNames[r.selfIndex];
    var assignment = this.genUpdateCurrentValue(r);
    var addRecord = addSimpleChangeRecordTemplate(r.selfIndex - 1, oldValue, newValue);
    var notify = this.genNotify(r);

    var check = referenceCheckTemplate(assignment, newValue, oldValue, change, r.lastInBinding ? addRecord : '', notify);;
    if (r.isPureFunction()) {
      return this.ifChangedGuard(r, check);
    } else {
      return check;
    }
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

      case RECORD_TYPE_INVOKE_FORMATTER:
        return assignmentTemplate(newValue, `${FORMATTERS_ACCESSOR}.get("${r.name}")(${args})`);

      case RECORD_TYPE_KEYED_ACCESS:
        var key = this.localNames[r.args[0]];
        return assignmentTemplate(newValue, `${context}[${key}]`);

      default:
        throw new BaseException(`Unknown operation ${r.mode}`);
    }
  }

  ifChangedGuard(r:ProtoRecord, body:string):string {
    return ifChangedGuardTemplate(r.args.map((a) => this.changeNames[a]), body);
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
    return r.lastInDirective ? notifyTemplate(r.selfIndex - 1) : '';
  }

  genArgs(r:ProtoRecord):string {
    return r.args.map((arg) => this.localNames[arg]).join(", ");
  }
}




