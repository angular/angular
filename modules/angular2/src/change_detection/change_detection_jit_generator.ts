import {BaseException, Type, isBlank, isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {AbstractChangeDetector} from './abstract_change_detector';
import {ChangeDetectionUtil} from './change_detection_util';
import {DirectiveIndex, DirectiveRecord} from './directive_record';

import {ProtoRecord, RecordType} from './proto_record';
import {CONTEXT_INDEX, CodegenNameUtil, sanitizeName} from './codegen_name_util';


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
var IS_CHANGED_LOCAL = "isChanged";
var CHANGES_LOCAL = "changes";

export class ChangeDetectorJITGenerator {
  _names: CodegenNameUtil;
  _typeName: string;

  constructor(public id: string, public changeDetectionStrategy: string,
              public records: List<ProtoRecord>, public directiveRecords: List<any>,
              private generateCheckNoChanges: boolean) {
    this._names = new CodegenNameUtil(this.records, this.directiveRecords, UTIL);
    this._typeName = sanitizeName(`ChangeDetector_${this.id}`);
  }

  generate(): Function {
    var classDefinition = `
      var ${this._typeName} = function ${this._typeName}(dispatcher, protos, directiveRecords) {
        ${ABSTRACT_CHANGE_DETECTOR}.call(this, ${JSON.stringify(this.id)}, dispatcher, protos, directiveRecords);
        this.dehydrateDirectives(false);
      }

      ${this._typeName}.prototype = Object.create(${ABSTRACT_CHANGE_DETECTOR}.prototype);

      ${this._typeName}.prototype.detectChangesInRecords = function(throwOnChange) {
        if (!this.hydrated()) {
          ${UTIL}.throwDehydrated();
        }
        try {
          this.__detectChangesInRecords(throwOnChange);
        } catch (e) {
          this.throwError(${this._names.getCurrentProtoName()}, e, e.stack);
        }
      }

      ${this._typeName}.prototype.__detectChangesInRecords = function(throwOnChange) {
        ${this._names.getCurrentProtoName()} = null;

        ${this._names.genInitLocals()}
        var ${IS_CHANGED_LOCAL} = false;
        var ${CHANGES_LOCAL} = null;

        ${this.records.map((r) => this._genRecord(r)).join("\n")}

        ${this._names.getAlreadyCheckedName()} = true;
      }

      ${this._genCheckNoChanges()}

      ${this._typeName}.prototype.callOnAllChangesDone = function() {
        ${this._genCallOnAllChangesDoneBody()}
      }

      ${this._typeName}.prototype.hydrate = function(context, locals, directives, pipes) {
        ${this._names.getModeName()} =
            "${ChangeDetectionUtil.changeDetectionMode(this.changeDetectionStrategy)}";
        ${this._names.getFieldName(CONTEXT_INDEX)} = context;
        ${this._names.getLocalsAccessorName()} = locals;
        this.hydrateDirectives(directives);
        ${this._names.getPipesAccessorName()} = pipes;
        ${this._names.getAlreadyCheckedName()} = false;
      }

      ${this._maybeGenHydrateDirectives()}

      ${this._typeName}.prototype.dehydrate = function() {
        this.dehydrateDirectives(true);
        ${this._names.getLocalsAccessorName()} = null;
        ${this._names.getPipesAccessorName()} = null;
      }

      ${this._maybeGenDehydrateDirectives()}

      ${this._typeName}.prototype.hydrated = function() {
        return ${this._names.getFieldName(CONTEXT_INDEX)} !== null;
      }

      return function(dispatcher) {
        return new ${this._typeName}(dispatcher, protos, directiveRecords);
      }
    `;
    return new Function('AbstractChangeDetector', 'ChangeDetectionUtil', 'protos',
                        'directiveRecords', classDefinition)(
        AbstractChangeDetector, ChangeDetectionUtil, this.records, this.directiveRecords);
  }

  _maybeGenDehydrateDirectives(): string {
    var destroyPipesCode = this._names.genPipeOnDestroy();
    if (destroyPipesCode) {
      destroyPipesCode = `if (destroyPipes) { ${destroyPipesCode} }`;
    }
    var dehydrateFieldsCode = this._names.genDehydrateFields();
    if (!destroyPipesCode && !dehydrateFieldsCode) return '';
    return `${this._typeName}.prototype.dehydrateDirectives = function(destroyPipes) {
        ${destroyPipesCode}
        ${dehydrateFieldsCode}
    }`;
  }

  _maybeGenHydrateDirectives(): string {
    var hydrateDirectivesCode = this._genHydrateDirectives();
    var hydrateDetectorsCode = this._genHydrateDetectors();
    if (!hydrateDirectivesCode && !hydrateDetectorsCode) return '';
    return `${this._typeName}.prototype.hydrateDirectives = function(directives) {
      ${hydrateDirectivesCode}
      ${hydrateDetectorsCode}
    }`;
  }

  _genHydrateDirectives(): string {
    var directiveFieldNames = this._names.getAllDirectiveNames();
    var lines = ListWrapper.createFixedSize(directiveFieldNames.length);
    for (var i = 0, iLen = directiveFieldNames.length; i < iLen; ++i) {
      lines[i] = `${directiveFieldNames[i]} = directives.getDirectiveFor(
          ${this._names.getDirectivesAccessorName()}[${i}].directiveIndex);`;
    }
    return lines.join('\n');
  }

  _genHydrateDetectors(): string {
    var detectorFieldNames = this._names.getAllDetectorNames();
    var lines = ListWrapper.createFixedSize(detectorFieldNames.length);
    for (var i = 0, iLen = detectorFieldNames.length; i < iLen; ++i) {
      lines[i] = `${detectorFieldNames[i]} = directives.getDetectorFor(
          ${this._names.getDirectivesAccessorName()}[${i}].directiveIndex);`;
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
      ${this._names.getDispatcherName()}.notifyOnAllChangesDone();
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

    var pipe = this._names.getPipeName(r.selfIndex);
    var cdRef = "this.ref";

    var protoIndex = r.selfIndex - 1;
    var pipeType = r.name;

    var read = `
      ${this._names.getCurrentProtoName()} = ${this._names.getProtosName()}[${protoIndex}];
      if (${pipe} === ${UTIL}.uninitialized) {
        ${pipe} = ${this._names.getPipesAccessorName()}.get('${pipeType}', ${context}, ${cdRef});
      } else if (!${pipe}.supports(${context})) {
        ${pipe}.onDestroy();
        ${pipe} = ${this._names.getPipesAccessorName()}.get('${pipeType}', ${context}, ${cdRef});
      }
      ${newValue} = ${pipe}.transform(${context}, [${argString}]);
    `;

    var check = `
      if (${oldValue} !== ${newValue}) {
        ${newValue} = ${UTIL}.unwrapValue(${newValue})
        ${this._genChangeMarker(r)}
        ${this._genUpdateDirectiveOrElement(r)}
        ${this._genAddToChanges(r)}
        ${oldValue} = ${newValue};
      }
    `;

    return r.shouldBeChecked() ? `${read}${check}` : read;
  }

  _genReferenceCheck(r: ProtoRecord): string {
    var oldValue = this._names.getFieldName(r.selfIndex);
    var newValue = this._names.getLocalName(r.selfIndex);

    var protoIndex = r.selfIndex - 1;

    var read = `
      ${this._names.getCurrentProtoName()} = ${this._names.getProtosName()}[${protoIndex}];
      ${this._genUpdateCurrentValue(r)}
    `;

    var check = `
      if (${newValue} !== ${oldValue}) {
        ${this._genChangeMarker(r)}
        ${this._genUpdateDirectiveOrElement(r)}
        ${this._genAddToChanges(r)}
        ${oldValue} = ${newValue};
      }
    `;

    var genCode = r.shouldBeChecked() ? `${read}${check}` : read;

    if (r.isPureFunction()) {
      var condition = r.args.map((a) => this._names.getChangeName(a)).join(" || ");
      if (r.isUsedByOtherRecord()) {
        return `if (${condition}) { ${genCode} } else { ${newValue} = ${oldValue}; }`;
      } else {
        return `if (${condition}) { ${genCode} }`;
      }
    } else {
      return genCode;
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
        rhs = `${this._names.getLocalsAccessorName()}.get('${r.name}')`;
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

      case RecordType.COLLECTION_LITERAL:
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

  _genChangeMarker(r: ProtoRecord): string {
    return r.argumentToPureFunction ? `${this._names.getChangeName(r.selfIndex)} = true` : ``;
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
        ${this._names.getDispatcherName()}.notifyOnBinding(
            ${this._names.getCurrentProtoName()}.bindingRecord, ${newValue});
      `;
    }
  }

  _genThrowOnChangeCheck(oldValue: string, newValue: string): string {
    if (this.generateCheckNoChanges) {
      return `
        if(throwOnChange) {
          ${UTIL}.throwOnChange(${this._names.getCurrentProtoName()}, ${UTIL}.simpleChange(${oldValue}, ${newValue}));
        }
        `;
    } else {
      return '';
    }
  }

  _genCheckNoChanges(): string {
    if (this.generateCheckNoChanges) {
      return `${this._typeName}.prototype.checkNoChanges = function() { this.runDetectChanges(true); }`;
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
          ${CHANGES_LOCAL}, ${this._names.getCurrentProtoName()}.bindingRecord.propertyName,
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
    return `if (!throwOnChange && !${this._names.getAlreadyCheckedName()}) ${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.onInit();`;
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
