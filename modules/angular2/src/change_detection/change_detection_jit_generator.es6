import {isPresent, isBlank, BaseException, Type} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {AbstractChangeDetector} from './abstract_change_detector';
import {ChangeDetectionUtil} from './change_detection_util';

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

/**
 * The code generator takes a list of proto records and creates a function/class
 * that "emulates" what the developer would write by hand to implement the same
 * kind of behaviour.
 *
 * The implementation comprises two parts:
 * * ChangeDetectorJITGenerator has the logic of how everything fits together.
 * * template functions (e.g., constructorTemplate) define what code is generated.
*/
var ABSTRACT_CHANGE_DETECTOR = "AbstractChangeDetector";
var UTIL = "ChangeDetectionUtil";
var DISPATCHER_ACCESSOR = "this.dispatcher";
var PIPE_REGISTRY_ACCESSOR = "this.pipeRegistry";
var PROTOS_ACCESSOR = "this.protos";
var MEMENTOS_ACCESSOR = "this.directiveMementos";
var CONTEXT_ACCESSOR = "this.context";
var CHANGE_LOCAL = "change";
var CHANGES_LOCAL = "changes";
var LOCALS_ACCESSOR = "this.locals";
var MODE_ACCESSOR = "this.mode";
var TEMP_LOCAL = "temp";
var CURRENT_PROTO = "currentProto";

function typeTemplate(type:string, cons:string, detectChanges:string,
                      notifyOnAllChangesDone:string, setContext:string):string {
  return `
${cons}
${detectChanges}
${notifyOnAllChangesDone}
${setContext};

return function(dispatcher, pipeRegistry) {
  return new ${type}(dispatcher, pipeRegistry, protos, directiveMementos);
}
`;
}

function constructorTemplate(type:string, fieldsDefinitions:string):string {
  return `
var ${type} = function ${type}(dispatcher, pipeRegistry, protos, directiveMementos) {
${ABSTRACT_CHANGE_DETECTOR}.call(this);
${DISPATCHER_ACCESSOR} = dispatcher;
${PIPE_REGISTRY_ACCESSOR} = pipeRegistry;
${PROTOS_ACCESSOR} = protos;
${MEMENTOS_ACCESSOR} = directiveMementos;
${LOCALS_ACCESSOR} = null;
${fieldsDefinitions}
}

${type}.prototype = Object.create(${ABSTRACT_CHANGE_DETECTOR}.prototype);
`;
}

function pipeOnDestroyTemplate(pipeNames:List) {
  return pipeNames.map((p) => `${p}.onDestroy()`).join("\n");
}

function hydrateTemplate(type:string, mode:string, fieldsDefinitions:string, pipeOnDestroy:string):string {
  return `
${type}.prototype.hydrate = function(context, locals) {
  ${MODE_ACCESSOR} = "${mode}";
  ${CONTEXT_ACCESSOR} = context;
  ${LOCALS_ACCESSOR} = locals;
}
${type}.prototype.dehydrate = function() {
  ${pipeOnDestroy}
  ${fieldsDefinitions}
  ${LOCALS_ACCESSOR} = null;
}
${type}.prototype.hydrated = function() {
  return ${CONTEXT_ACCESSOR} !== ${UTIL}.unitialized();
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

function callOnAllChangesDoneTemplate(type:string, body:string):string {
  return `
${type}.prototype.callOnAllChangesDone = function() {
  ${body}
}
`;
}

function onAllChangesDoneTemplate(index:number):string {
  return `${DISPATCHER_ACCESSOR}.onAllChangesDone(${MEMENTOS_ACCESSOR}[${index}]);`;
}


function detectChangesBodyTemplate(localDefinitions:string, changeDefinitions:string, records:string):string {
  return `
${localDefinitions}
${changeDefinitions}
var ${TEMP_LOCAL};
var ${CHANGE_LOCAL};
var ${CURRENT_PROTO};
var ${CHANGES_LOCAL} = null;

context = ${CONTEXT_ACCESSOR};
${records}
`;
}

function pipeCheckTemplate(protoIndex:number, context:string, bindingPropagationConfig:string, pipe:string, pipeType:string,
                           oldValue:string, newValue:string, change:string, invokeMementoAndAddChange:string,
                           addToChanges, lastInDirective:string):string{
  return `
${CURRENT_PROTO} = ${PROTOS_ACCESSOR}[${protoIndex}];
if (${pipe} === ${UTIL}.unitialized()) {
  ${pipe} = ${PIPE_REGISTRY_ACCESSOR}.get('${pipeType}', ${context}, ${bindingPropagationConfig});
} else if (!${pipe}.supports(${context})) {
  ${pipe}.onDestroy();
  ${pipe} = ${PIPE_REGISTRY_ACCESSOR}.get('${pipeType}', ${context}, ${bindingPropagationConfig});
}

${newValue} = ${pipe}.transform(${context});
if (! ${UTIL}.noChangeMarker(${newValue})) {
  ${change} = true;
  ${invokeMementoAndAddChange}
  ${addToChanges}
  ${oldValue} = ${newValue};
}
${lastInDirective}
`;
}

function referenceCheckTemplate(protoIndex:number, assignment:string, oldValue:string, newValue:string, change:string,
                                invokeMementoAndAddChange:string, addToChanges:string, lastInDirective:string):string {
  return `
${CURRENT_PROTO} = ${PROTOS_ACCESSOR}[${protoIndex}];
${assignment}
if (${newValue} !== ${oldValue} || (${newValue} !== ${newValue}) && (${oldValue} !== ${oldValue})) {
  ${change} = true;
  ${invokeMementoAndAddChange}
  ${addToChanges}
  ${oldValue} = ${newValue};
}
${lastInDirective}
`;
}

function assignmentTemplate(field:string, value:string) {
  return `${field} = ${value};`;
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

function addToChangesTemplate(oldValue:string, newValue:string):string {
  return `${CHANGES_LOCAL} = ${UTIL}.addChange(${CHANGES_LOCAL}, ${CURRENT_PROTO}.bindingMemento, ${UTIL}.simpleChange(${oldValue}, ${newValue}));`;
}

function invokeBindingMemento(oldValue:string, newValue:string):string {
  return `
if(throwOnChange) ${UTIL}.throwOnChange(${CURRENT_PROTO}, ${UTIL}.simpleChange(${oldValue}, ${newValue}));

${DISPATCHER_ACCESSOR}.invokeMementoFor(${CURRENT_PROTO}.bindingMemento, ${newValue});
  `;
}

function lastInDirectiveTemplate(protoIndex:number):string{
  return  `
if (${CHANGES_LOCAL}) {
  ${DISPATCHER_ACCESSOR}.onChange(${PROTOS_ACCESSOR}[${protoIndex}].directiveMemento, ${CHANGES_LOCAL});
}
${CHANGES_LOCAL} = null;
`;
}


export class ChangeDetectorJITGenerator {
  typeName:string;
  records:List<ProtoRecord>;
  directiveMementos:List;
  localNames:List<string>;
  changeNames:List<string>;
  fieldNames:List<string>;
  pipeNames:List<string>;
  changeDetectionStrategy:stirng;

  constructor(typeName:string, changeDetectionStrategy:string, records:List<ProtoRecord>, directiveMementos:List) {
    this.typeName = typeName;
    this.changeDetectionStrategy = changeDetectionStrategy;
    this.records = records;
    this.directiveMementos = directiveMementos;

    this.localNames = this.getLocalNames(records);
    this.changeNames = this.getChangeNames(this.localNames);
    this.fieldNames = this.getFieldNames(this.localNames);
    this.pipeNames = this.getPipeNames(this.localNames);
  }

  getLocalNames(records:List<ProtoRecord>):List<string> {
    var index = 0;
    var names = records.map((r) => {
      var sanitizedName = r.name.replace(new RegExp("\\W", "g"), '');
      return `${sanitizedName}${index++}`
    });
    return ["context"].concat(names);
  }

  getChangeNames(localNames:List<string>):List<string> {
    return localNames.map((n) => `change_${n}`);
  }

  getFieldNames(localNames:List<string>):List<string> {
    return localNames.map((n) => `this.${n}`);
  }

  getPipeNames(localNames:List<string>):List<string> {
    return localNames.map((n) => `this.${n}_pipe`);
  }

  generate():Function {
    var text = typeTemplate(this.typeName, this.genConstructor(), this.genDetectChanges(),
      this.genCallOnAllChangesDone(), this.genHydrate());
    return new Function('AbstractChangeDetector', 'ChangeDetectionUtil', 'protos', 'directiveMementos', text)
      (AbstractChangeDetector, ChangeDetectionUtil, this.records, this.directiveMementos);
  }

  genConstructor():string {
    return constructorTemplate(this.typeName, this.genFieldDefinitions());
  }

  genHydrate():string {
    var mode = ChangeDetectionUtil.changeDetectionMode(this.changeDetectionStrategy);
    return hydrateTemplate(this.typeName, mode, this.genFieldDefinitions(),
      pipeOnDestroyTemplate(this.getNonNullPipeNames()));
  }

  genFieldDefinitions() {
    var fields = [];
    fields = fields.concat(this.fieldNames);
    fields = fields.concat(this.getNonNullPipeNames());
    return fieldDefinitionsTemplate(fields);
  }

  getNonNullPipeNames():List<string> {
    var pipes = [];
    this.records.forEach((r) => {
      if (r.mode === RECORD_TYPE_PIPE || r.mode === RECORD_TYPE_BINDING_PIPE) {
        pipes.push(this.pipeNames[r.selfIndex]);
      }
    });
    return pipes;
  }

  genDetectChanges():string {
    var body = this.genDetectChangesBody();
    return detectChangesTemplate(this.typeName, body);
  }

  genCallOnAllChangesDone():string {
    var notifications = [];
    var mementos = this.directiveMementos;

    for (var i = mementos.length - 1; i >= 0; --i) {
      var memento = mementos[i];
      if (memento.callOnAllChangesDone) {
        notifications.push(onAllChangesDoneTemplate(i));
      }
    }

    return callOnAllChangesDoneTemplate(this.typeName, notifications.join(";\n"));
  }

  genDetectChangesBody():string {
    var rec = this.records.map((r) => this.genRecord(r)).join("\n");
    return detectChangesBodyTemplate(this.genLocalDefinitions(), this.genChangeDefinitions(), rec);
  }

  genLocalDefinitions():string {
    return localDefinitionsTemplate(this.localNames);
  }

  genChangeDefinitions():string {
    return changeDefinitionsTemplate(this.changeNames);
  }

  genRecord(r:ProtoRecord):string {
    if (r.mode === RECORD_TYPE_PIPE || r.mode === RECORD_TYPE_BINDING_PIPE) {
      return this.genPipeCheck (r);
    } else {
      return this.genReferenceCheck(r);
    }
  }

  genPipeCheck(r:ProtoRecord):string {
    var context = this.localNames[r.contextIndex];
    var oldValue = this.fieldNames[r.selfIndex];
    var newValue = this.localNames[r.selfIndex];
    var change = this.changeNames[r.selfIndex];

    var pipe = this.pipeNames[r.selfIndex];
    var bpc = r.mode === RECORD_TYPE_BINDING_PIPE ? "this.bindingPropagationConfig" : "null";

    var invokeMemento = this.getInvokeMementoAndAddChangeTemplate(r);
    var addToChanges = this.genAddToChanges(r);
    var lastInDirective = this.genLastInDirective(r);

    return pipeCheckTemplate(r.selfIndex - 1, context, bpc, pipe, r.name, oldValue, newValue, change,
      invokeMemento, addToChanges, lastInDirective);
  }

  genReferenceCheck(r:ProtoRecord):string {
    var oldValue = this.fieldNames[r.selfIndex];
    var newValue = this.localNames[r.selfIndex];
    var change = this.changeNames[r.selfIndex];
    var assignment = this.genUpdateCurrentValue(r);

    var invokeMemento = this.getInvokeMementoAndAddChangeTemplate(r);
    var addToChanges = this.genAddToChanges(r);
    var lastInDirective = this.genLastInDirective(r);

    var check = referenceCheckTemplate(r.selfIndex - 1, assignment, oldValue, newValue, change,
      invokeMemento, addToChanges, lastInDirective);
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
        return assignmentTemplate(newValue, `${context}.${r.name}`);

      case RECORD_TYPE_LOCAL:
        return assignmentTemplate(newValue, `${LOCALS_ACCESSOR}.get('${r.name}')`);

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

  getInvokeMementoAndAddChangeTemplate(r:ProtoRecord):string {
    var newValue = this.localNames[r.selfIndex];
    var oldValue = this.fieldNames[r.selfIndex];
    return r.lastInBinding ? invokeBindingMemento(oldValue, newValue) : "";
  }

  genAddToChanges(r:ProtoRecord):string {
    var newValue = this.localNames[r.selfIndex];
    var oldValue = this.fieldNames[r.selfIndex];
    var callOnChange = r.directiveMemento && r.directiveMemento.callOnChange;
    return callOnChange ? addToChangesTemplate(oldValue, newValue) : "";
  }

  genLastInDirective(r:ProtoRecord):string{
    var callOnChange = r.directiveMemento && r.directiveMemento.callOnChange;
    return r.lastInDirective && callOnChange ? lastInDirectiveTemplate(r.selfIndex - 1) : '';
  }

  genArgs(r:ProtoRecord):string {
    return r.args.map((arg) => this.localNames[arg]).join(", ");
  }
}




