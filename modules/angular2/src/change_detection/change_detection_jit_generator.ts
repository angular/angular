import {BaseException, Type, isBlank, isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {AbstractChangeDetector} from './abstract_change_detector';
import {ChangeDetectionUtil} from './change_detection_util';
import {DirectiveIndex, DirectiveRecord} from './directive_record';

import {ProtoRecord, RecordType} from './proto_record';
import {CodegenNameUtil, sanitizeName} from './codegen_name_util';


/**
 * The code generator takes a list of proto records and creates a function/class
 * that "emulates" what the developer would write by hand to implement the same
 * kind of behaviour.
 *
 * This code should be kept in sync with the Dart transformer's
 * `angular2.transform.template_compiler.change_detector_codegen` library. If you make updates
 * here, please make equivalent changes there.
*/
var ABSTRACT_CHANGE_DETECTOR = "AbstractChangeDetector";
var UTIL = "ChangeDetectionUtil";
var DISPATCHER_ACCESSOR = "this.dispatcher";
var PIPES_ACCESSOR = "this.pipes";
var PROTOS_ACCESSOR = "this.protos";
var DIRECTIVES_ACCESSOR = "this.directiveRecords";
var IS_CHANGED_LOCAL = "isChanged";
var CHANGES_LOCAL = "changes";
var LOCALS_ACCESSOR = "this.locals";
var MODE_ACCESSOR = "this.mode";
var CURRENT_PROTO = "this.currentProto";
var ALREADY_CHECKED_ACCESSOR = "this.alreadyChecked";

export class ChangeDetectorJITGenerator {
  _names: CodegenNameUtil;

  constructor(public id: string, public changeDetectionStrategy: string,
              public records: List<ProtoRecord>, public directiveRecords: List<any>,
              private generateCheckNoChanges: boolean) {
    this._names = new CodegenNameUtil(this.records, this.directiveRecords, 'this._', UTIL);
  }

  generate(): Function {
    var typeName = sanitizeName(`ChangeDetector_${this.id}`);
    var classDefinition = `
      var ${typeName} = function ${typeName}(dispatcher, protos, directiveRecords) {
        ${ABSTRACT_CHANGE_DETECTOR}.call(this, ${JSON.stringify(this.id)}, dispatcher);
        ${PROTOS_ACCESSOR} = protos;
        ${DIRECTIVES_ACCESSOR} = directiveRecords;
        ${LOCALS_ACCESSOR} = null;
        ${CURRENT_PROTO} = null;
        ${PIPES_ACCESSOR} = null;
        ${ALREADY_CHECKED_ACCESSOR} = false;
        ${this._names.genDehydrateFields()}
      }

      ${typeName}.prototype = Object.create(${ABSTRACT_CHANGE_DETECTOR}.prototype);

      ${typeName}.prototype.detectChangesInRecords = function(throwOnChange) {
        if (!this.hydrated()) {
          ${UTIL}.throwDehydrated();
        }
        try {
          this.__detectChangesInRecords(throwOnChange);
        } catch (e) {
          this.throwError(${CURRENT_PROTO}, e, e.stack);
        }
      }

      ${typeName}.prototype.__detectChangesInRecords = function(throwOnChange) {
        ${CURRENT_PROTO} = null;

        ${this._names.genInitLocals()}
        var ${IS_CHANGED_LOCAL} = false;
        var ${CHANGES_LOCAL} = null;

        context = ${this._names.getContextName()};

        ${this.records.map((r) => this._genRecord(r)).join("\n")}

        ${ALREADY_CHECKED_ACCESSOR} = true;
      }

      ${this._genCheckNoChanges(typeName)}

      ${typeName}.prototype.callOnAllChangesDone = function() {
        ${this._genCallOnAllChangesDoneBody()}
      }

      ${typeName}.prototype.hydrate = function(context, locals, directives, pipes) {
        ${MODE_ACCESSOR} = "${ChangeDetectionUtil.changeDetectionMode(this.changeDetectionStrategy)}";
        ${this._names.getContextName()} = context;
        ${LOCALS_ACCESSOR} = locals;
        ${this._genHydrateDirectives()}
        ${this._genHydrateDetectors()}
        ${PIPES_ACCESSOR} = pipes;
        ${ALREADY_CHECKED_ACCESSOR} = false;
      }

      ${typeName}.prototype.dehydrate = function() {
        ${this._names.genPipeOnDestroy()}
        ${this._names.genDehydrateFields()}
        ${LOCALS_ACCESSOR} = null;
        ${PIPES_ACCESSOR} = null;
      }

      ${typeName}.prototype.hydrated = function() {
        return ${this._names.getContextName()} !== null;
      }

      return function(dispatcher) {
        return new ${typeName}(dispatcher, protos, directiveRecords);
      }
    `;

    return new Function('AbstractChangeDetector', 'ChangeDetectionUtil', 'protos',
                        'directiveRecords', classDefinition)(
        AbstractChangeDetector, ChangeDetectionUtil, this.records, this.directiveRecords);
  }

  _genHydrateDirectives(): string {
    var directiveFieldNames = this._names.getAllDirectiveNames();
    var lines = ListWrapper.createFixedSize(directiveFieldNames.length);
    for (var i = 0, iLen = directiveFieldNames.length; i < iLen; ++i) {
      lines[i] =
          `${directiveFieldNames[i]} = directives.getDirectiveFor(${DIRECTIVES_ACCESSOR}[${i}].directiveIndex);`;
    }
    return lines.join('\n');
  }

  _genHydrateDetectors(): string {
    var detectorFieldNames = this._names.getAllDetectorNames();
    var lines = ListWrapper.createFixedSize(detectorFieldNames.length);
    for (var i = 0, iLen = detectorFieldNames.length; i < iLen; ++i) {
      lines[i] = `${detectorFieldNames[i]} =
          directives.getDetectorFor(${DIRECTIVES_ACCESSOR}[${i}].directiveIndex);`;
    }
    return lines.join('\n');
  }

  _genCallOnAllChangesDoneBody(): string {
    var notifications = [];
    var dirs = this.directiveRecords;

    for (var i = dirs.length - 1; i >= 0; --i) {
      var dir = dirs[i];
      if (dir.callOnAllChangesDone) {
        notifications.push(
            `${this._names.getDirectiveName(dir.directiveIndex)}.onAllChangesDone();`);
      }
    }

    var directiveNotifications = notifications.join("\n");

    return `
      this.dispatcher.notifyOnAllChangesDone();
      ${directiveNotifications}
    `;
  }

  _genRecord(r: ProtoRecord): string {
    var rec;
    if (r.isLifeCycleRecord()) {
      rec = this._genDirectiveLifecycle(r);
    } else if (r.isPipeRecord()) {
      rec = this._genPipeCheck(r);
    } else {
      rec = this._genReferenceCheck(r);
    }
    return `${rec}${this._maybeGenLastInDirective(r)}`;
  }

  _genDirectiveLifecycle(r: ProtoRecord): string {
    if (r.name === "onCheck") {
      return this._genOnCheck(r);
    } else if (r.name === "onInit") {
      return this._genOnInit(r);
    } else if (r.name === "onChange") {
      return this._genOnChange(r);
    } else {
      throw new BaseException(`Unknown lifecycle event '${r.name}'`);
    }
  }

  _genPipeCheck(r: ProtoRecord): string {
    var context = this._names.getLocalName(r.contextIndex);
    var argString = r.args.map((arg) => this._names.getLocalName(arg)).join(", ");

    var oldValue = this._names.getFieldName(r.selfIndex);
    var newValue = this._names.getLocalName(r.selfIndex);
    var change = this._names.getChangeName(r.selfIndex);

    var pipe = this._names.getPipeName(r.selfIndex);
    var cdRef = "this.ref";

    var protoIndex = r.selfIndex - 1;
    var pipeType = r.name;

    return `
      ${CURRENT_PROTO} = ${PROTOS_ACCESSOR}[${protoIndex}];
      if (${pipe} === ${UTIL}.uninitialized) {
        ${pipe} = ${PIPES_ACCESSOR}.get('${pipeType}', ${context}, ${cdRef});
      } else if (!${pipe}.supports(${context})) {
        ${pipe}.onDestroy();
        ${pipe} = ${PIPES_ACCESSOR}.get('${pipeType}', ${context}, ${cdRef});
      }

      ${newValue} = ${pipe}.transform(${context}, [${argString}]);
      if (${oldValue} !== ${newValue}) {
        ${newValue} = ${UTIL}.unwrapValue(${newValue});
        ${change} = true;
        ${this._genUpdateDirectiveOrElement(r)}
        ${this._genAddToChanges(r)}
        ${oldValue} = ${newValue};
      }
    `;
  }

  _genReferenceCheck(r: ProtoRecord): string {
    var oldValue = this._names.getFieldName(r.selfIndex);
    var newValue = this._names.getLocalName(r.selfIndex);

    var protoIndex = r.selfIndex - 1;
    var check = `
      ${CURRENT_PROTO} = ${PROTOS_ACCESSOR}[${protoIndex}];
      ${this._genUpdateCurrentValue(r)}
      if (${newValue} !== ${oldValue}) {
        ${this._names.getChangeName(r.selfIndex)} = true;
        ${this._genUpdateDirectiveOrElement(r)}
        ${this._genAddToChanges(r)}
        ${oldValue} = ${newValue};
      }
    `;

    if (r.isPureFunction()) {
      var condition = r.args.map((a) => this._names.getChangeName(a)).join(" || ");
      return `if (${condition}) { ${check} } else { ${newValue} = ${oldValue}; }`;
    } else {
      return check;
    }
  }

  _genUpdateCurrentValue(r: ProtoRecord): string {
    var context = (r.contextIndex == -1) ? this._names.getDirectiveName(r.directiveIndex) :
                                           this._names.getLocalName(r.contextIndex);
    var newValue = this._names.getLocalName(r.selfIndex);
    var argString = r.args.map((arg) => this._names.getLocalName(arg)).join(", ");

    var rhs;
    switch (r.mode) {
      case RecordType.SELF:
        rhs = context;
        break;

      case RecordType.CONST:
        rhs = JSON.stringify(r.funcOrValue);
        break;

      case RecordType.PROPERTY:
        rhs = `${context}.${r.name}`;
        break;

      case RecordType.SAFE_PROPERTY:
        rhs = `${UTIL}.isValueBlank(${context}) ? null : ${context}.${r.name}`;
        break;

      case RecordType.LOCAL:
        rhs = `${LOCALS_ACCESSOR}.get('${r.name}')`;
        break;

      case RecordType.INVOKE_METHOD:
        rhs = `${context}.${r.name}(${argString})`;
        break;

      case RecordType.SAFE_INVOKE_METHOD:
        rhs = `${UTIL}.isValueBlank(${context}) ? null : ${context}.${r.name}(${argString})`;
        break;

      case RecordType.INVOKE_CLOSURE:
        rhs = `${context}(${argString})`;
        break;

      case RecordType.PRIMITIVE_OP:
        rhs = `${UTIL}.${r.name}(${argString})`;
        break;

      case RecordType.INTERPOLATE:
        rhs = this._genInterpolation(r);
        break;

      case RecordType.KEYED_ACCESS:
        rhs = `${context}[${this._names.getLocalName(r.args[0])}]`;
        break;

      default:
        throw new BaseException(`Unknown operation ${r.mode}`);
    }
    return `${newValue} = ${rhs}`;
  }

  _genInterpolation(r: ProtoRecord): string {
    var res = "";
    for (var i = 0; i < r.args.length; ++i) {
      res += JSON.stringify(r.fixedArgs[i]);
      res += " + ";
      res += `${UTIL}.s(${this._names.getLocalName(r.args[i])})`;
      res += " + ";
    }
    res += JSON.stringify(r.fixedArgs[r.args.length]);
    return res;
  }

  _genUpdateDirectiveOrElement(r: ProtoRecord): string {
    if (!r.lastInBinding) return "";

    var newValue = this._names.getLocalName(r.selfIndex);
    var oldValue = this._names.getFieldName(r.selfIndex);

    var br = r.bindingRecord;
    if (br.isDirective()) {
      var directiveProperty =
          `${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.${br.propertyName}`;
      return `
        ${this._genThrowOnChangeCheck(oldValue, newValue)}
        ${directiveProperty} = ${newValue};
        ${IS_CHANGED_LOCAL} = true;
      `;
    } else {
      return `
        ${this._genThrowOnChangeCheck(oldValue, newValue)}
        ${DISPATCHER_ACCESSOR}.notifyOnBinding(${CURRENT_PROTO}.bindingRecord, ${newValue});
      `;
    }
  }

  _genThrowOnChangeCheck(oldValue: string, newValue: string): string {
    if (this.generateCheckNoChanges) {
      return `
        if(throwOnChange) {
          ${UTIL}.throwOnChange(${CURRENT_PROTO}, ${UTIL}.simpleChange(${oldValue}, ${newValue}));
        }
        `;
    } else {
      return '';
    }
  }

  _genCheckNoChanges(typeName: string): string {
    if (this.generateCheckNoChanges) {
      return `${typeName}.prototype.checkNoChanges = function() { this.runDetectChanges(true); }`;
    } else {
      return '';
    }
  }

  _genAddToChanges(r: ProtoRecord): string {
    var newValue = this._names.getLocalName(r.selfIndex);
    var oldValue = this._names.getFieldName(r.selfIndex);
    if (!r.bindingRecord.callOnChange()) return "";
    return `
      ${CHANGES_LOCAL} = ${UTIL}.addChange(
          ${CHANGES_LOCAL}, ${CURRENT_PROTO}.bindingRecord.propertyName,
          ${UTIL}.simpleChange(${oldValue}, ${newValue}));
    `;
  }

  _maybeGenLastInDirective(r: ProtoRecord): string {
    if (!r.lastInDirective) return "";
    return `
      ${CHANGES_LOCAL} = null;
      ${this._genNotifyOnPushDetectors(r)}
      ${IS_CHANGED_LOCAL} = false;
    `;
  }

  _genOnCheck(r: ProtoRecord): string {
    var br = r.bindingRecord;
    return `if (!throwOnChange) ${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.onCheck();`;
  }

  _genOnInit(r: ProtoRecord): string {
    var br = r.bindingRecord;
    return `if (!throwOnChange && !${ALREADY_CHECKED_ACCESSOR}) ${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.onInit();`;
  }

  _genOnChange(r: ProtoRecord): string {
    var br = r.bindingRecord;
    return `if (!throwOnChange && ${CHANGES_LOCAL}) ${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.onChange(${CHANGES_LOCAL});`;
  }

  _genNotifyOnPushDetectors(r: ProtoRecord): string {
    var br = r.bindingRecord;
    if (!r.lastInDirective || !br.isOnPushChangeDetection()) return "";
    var retVal = `
      if(${IS_CHANGED_LOCAL}) {
        ${this._names.getDetectorName(br.directiveRecord.directiveIndex)}.markAsCheckOnce();
      }
    `;
    return retVal;
  }
}
