import {isPresent, isBlank, BaseException, Type} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {AbstractChangeDetector} from './abstract_change_detector';
import {ChangeDetectionUtil} from './change_detection_util';
import {DirectiveIndex, DirectiveRecord} from './directive_record';

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
var DIRECTIVES_ACCESSOR = "this.directiveRecords";
var CONTEXT_ACCESSOR = "this.context";
var IS_CHANGED_LOCAL = "isChanged";
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
  return new ${type}(dispatcher, pipeRegistry, protos, directiveRecords);
}
`;
}

function constructorTemplate(type:string, fieldsDefinitions:string):string {
  return `
var ${type} = function ${type}(dispatcher, pipeRegistry, protos, directiveRecords) {
${ABSTRACT_CHANGE_DETECTOR}.call(this);
${DISPATCHER_ACCESSOR} = dispatcher;
${PIPE_REGISTRY_ACCESSOR} = pipeRegistry;
${PROTOS_ACCESSOR} = protos;
${DIRECTIVES_ACCESSOR} = directiveRecords;
${LOCALS_ACCESSOR} = null;
${fieldsDefinitions}
}

${type}.prototype = Object.create(${ABSTRACT_CHANGE_DETECTOR}.prototype);
`;
}

function pipeOnDestroyTemplate(pipeNames:List) {
  return pipeNames.map((p) => `${p}.onDestroy()`).join("\n");
}

function hydrateTemplate(type:string, mode:string, fieldDefinitions:string, pipeOnDestroy:string,
                         directiveFieldNames:List<String>, detectorFieldNames:List<String>):string {
  var directiveInit = "";
  for(var i = 0; i < directiveFieldNames.length; ++i) {
    directiveInit += `${directiveFieldNames[i]} = directives.getDirectiveFor(this.directiveRecords[${i}].directiveIndex);\n`;
  }

  var detectorInit = "";
  for(var i = 0; i < detectorFieldNames.length; ++i) {
    detectorInit += `${detectorFieldNames[i]} = directives.getDetectorFor(this.directiveRecords[${i}].directiveIndex);\n`;
  }

  return `
${type}.prototype.hydrate = function(context, locals, directives) {
  ${MODE_ACCESSOR} = "${mode}";
  ${CONTEXT_ACCESSOR} = context;
  ${LOCALS_ACCESSOR} = locals;
  ${directiveInit}
  ${detectorInit}
}
${type}.prototype.dehydrate = function() {
  ${pipeOnDestroy}
  ${fieldDefinitions}
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

function onAllChangesDoneTemplate(directive:string):string {
  return `${directive}.onAllChangesDone();`;
}


function detectChangesBodyTemplate(localDefinitions:string, changeDefinitions:string, records:string):string {
  return `
${localDefinitions}
${changeDefinitions}
var ${TEMP_LOCAL};
var ${IS_CHANGED_LOCAL} = false;
var ${CURRENT_PROTO};
var ${CHANGES_LOCAL} = null;

context = ${CONTEXT_ACCESSOR};
${records}
`;
}

function pipeCheckTemplate(protoIndex:number, context:string, bindingPropagationConfig:string, pipe:string, pipeType:string,
                           oldValue:string, newValue:string, change:string, update:string,
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
  ${update}
  ${addToChanges}
  ${oldValue} = ${newValue};
}
${lastInDirective}
`;
}

function referenceCheckTemplate(protoIndex:number, assignment:string, oldValue:string, newValue:string, change:string,
                                update:string, addToChanges:string, lastInDirective:string):string {
  return `
${CURRENT_PROTO} = ${PROTOS_ACCESSOR}[${protoIndex}];
${assignment}
if (${newValue} !== ${oldValue} || (${newValue} !== ${newValue}) && (${oldValue} !== ${oldValue})) {
  ${change} = true;
  ${update}
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
  return `${CHANGES_LOCAL} = ${UTIL}.addChange(${CHANGES_LOCAL}, ${CURRENT_PROTO}.bindingRecord.propertyName, ${UTIL}.simpleChange(${oldValue}, ${newValue}));`;
}

function updateDirectiveTemplate(oldValue:string, newValue:string, directiveProperty:string):string {
  return `
if(throwOnChange) ${UTIL}.throwOnChange(${CURRENT_PROTO}, ${UTIL}.simpleChange(${oldValue}, ${newValue}));
${directiveProperty} = ${newValue};
${IS_CHANGED_LOCAL} = true;
  `;
}

function updateElementTemplate(oldValue:string, newValue:string):string {
  return `
if(throwOnChange) ${UTIL}.throwOnChange(${CURRENT_PROTO}, ${UTIL}.simpleChange(${oldValue}, ${newValue}));
${DISPATCHER_ACCESSOR}.notifyOnBinding(${CURRENT_PROTO}.bindingRecord, ${newValue});
  `;
}

function notifyOnChangesTemplate(directive:string):string{
  return  `
if(${CHANGES_LOCAL}) {
  ${directive}.onChange(${CHANGES_LOCAL});
  ${CHANGES_LOCAL} = null;
}
`;
}

function notifyOnPushDetectorsTemplate(detector:string):string{
  return  `
if(${IS_CHANGED_LOCAL}) {
  ${detector}.markAsCheckOnce();
}
`;
}

function lastInDirectiveTemplate(notifyOnChanges:string, notifyOnPush:string):string{
  return  `
${notifyOnChanges}
${notifyOnPush}
${IS_CHANGED_LOCAL} = false;
`;
}


export class ChangeDetectorJITGenerator {
  typeName:string;
  records:List<ProtoRecord>;
  directiveRecords:List;
  localNames:List<string>;
  changeNames:List<string>;
  fieldNames:List<string>;
  pipeNames:List<string>;
  changeDetectionStrategy:stirng;

  constructor(typeName:string, changeDetectionStrategy:string, records:List<ProtoRecord>, directiveRecords:List) {
    this.typeName = typeName;
    this.changeDetectionStrategy = changeDetectionStrategy;
    this.records = records;
    this.directiveRecords = directiveRecords;

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
    return new Function('AbstractChangeDetector', 'ChangeDetectionUtil', 'protos', 'directiveRecords', text)
      (AbstractChangeDetector, ChangeDetectionUtil, this.records, this.directiveRecords);
  }

  genConstructor():string {
    return constructorTemplate(this.typeName, this.genFieldDefinitions());
  }

  genHydrate():string {
    var mode = ChangeDetectionUtil.changeDetectionMode(this.changeDetectionStrategy);
    return hydrateTemplate(this.typeName, mode, this.genFieldDefinitions(),
      pipeOnDestroyTemplate(this.getNonNullPipeNames()),
      this.getDirectiveFieldNames(), this.getDetectorFieldNames());
  }

  getDirectiveFieldNames():List<string> {
    return this.directiveRecords.map((d) => this.getDirective(d.directiveIndex));
  }

  getDetectorFieldNames():List<string> {
    return this.directiveRecords.filter(r => r.isOnPushChangeDetection()).map((d) => this.getDetector(d.directiveIndex));
  }

  getDirective(d:DirectiveIndex) {
    return `this.directive_${d.name}`;
  }

  getDetector(d:DirectiveIndex) {
    return `this.detector_${d.name}`;
  }

  genFieldDefinitions() {
    var fields = [];
    fields = fields.concat(this.fieldNames);
    fields = fields.concat(this.getNonNullPipeNames());
    fields = fields.concat(this.getDirectiveFieldNames());
    fields = fields.concat(this.getDetectorFieldNames());
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
    var dirs = this.directiveRecords;

    for (var i = dirs.length - 1; i >= 0; --i) {
      var dir = dirs[i];
      if (dir.callOnAllChangesDone) {
        var directive = `this.directive_${dir.directiveIndex.name}`;
        notifications.push(onAllChangesDoneTemplate(directive));
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
    var cdRef = r.mode === RECORD_TYPE_BINDING_PIPE ? "this.ref" : "null";

    var update = this.genUpdateDirectiveOrElement(r);
    var addToChanges = this.genAddToChanges(r);
    var lastInDirective = this.genLastInDirective(r);

    return pipeCheckTemplate(r.selfIndex - 1, context, cdRef, pipe, r.name, oldValue, newValue, change,
      update, addToChanges, lastInDirective);
  }

  genReferenceCheck(r:ProtoRecord):string {
    var oldValue = this.fieldNames[r.selfIndex];
    var newValue = this.localNames[r.selfIndex];
    var change = this.changeNames[r.selfIndex];
    var assignment = this.genUpdateCurrentValue(r);

    var update = this.genUpdateDirectiveOrElement(r);
    var addToChanges = this.genAddToChanges(r);
    var lastInDirective = this.genLastInDirective(r);

    var check = referenceCheckTemplate(r.selfIndex - 1, assignment, oldValue, newValue, change,
      update, addToChanges, lastInDirective);
    if (r.isPureFunction()) {
      return this.ifChangedGuard(r, check);
    } else {
      return check;
    }
  }

  genUpdateCurrentValue(r:ProtoRecord):string {
    var context = this.getContext(r);
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

  getContext(r:ProtoRecord):string {
    if (r.contextIndex == -1) {
      return this.getDirective(r.directiveIndex);
    } else {
      return this.localNames[r.contextIndex];
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

  genUpdateDirectiveOrElement(r:ProtoRecord):string {
    if (! r.lastInBinding) return "";

    var newValue = this.localNames[r.selfIndex];
    var oldValue = this.fieldNames[r.selfIndex];

    var br = r.bindingRecord;
    if (br.isDirective()) {
      var directiveProperty = `${this.getDirective(br.directiveRecord.directiveIndex)}.${br.propertyName}`;
      return updateDirectiveTemplate(oldValue, newValue, directiveProperty);
    } else {
      return updateElementTemplate(oldValue, newValue);
    }
  }

  genAddToChanges(r:ProtoRecord):string {
    var newValue = this.localNames[r.selfIndex];
    var oldValue = this.fieldNames[r.selfIndex];
    return r.bindingRecord.callOnChange() ? addToChangesTemplate(oldValue, newValue) : "";
  }

  genLastInDirective(r:ProtoRecord):string{
    var onChanges = this.genNotifyOnChanges(r);
    var onPush = this.genNotifyOnPushDetectors(r);
    return lastInDirectiveTemplate(onChanges, onPush);
  }

  genNotifyOnChanges(r:ProtoRecord):string{
    var br = r.bindingRecord;
    if (r.lastInDirective && br.callOnChange()) {
      return notifyOnChangesTemplate(this.getDirective(br.directiveRecord.directiveIndex));
    } else {
      return "";
    }
  }

  genNotifyOnPushDetectors(r:ProtoRecord):string{
    var br = r.bindingRecord;
    if (r.lastInDirective && br.isOnPushChangeDetection()) {
      return notifyOnPushDetectorsTemplate(this.getDetector(br.directiveRecord.directiveIndex));
    } else {
      return "";
    }
  }

  genArgs(r:ProtoRecord):string {
    return r.args.map((arg) => this.localNames[arg]).join(", ");
  }
}




