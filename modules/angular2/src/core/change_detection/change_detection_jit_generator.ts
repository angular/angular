import {BaseException, Type, isBlank, isPresent} from 'angular2/src/core/facade/lang';
import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';

import {AbstractChangeDetector} from './abstract_change_detector';
import {ChangeDetectionUtil} from './change_detection_util';
import {DirectiveIndex, DirectiveRecord} from './directive_record';

import {ProtoRecord, RecordType} from './proto_record';
import {CodegenNameUtil, sanitizeName} from './codegen_name_util';
import {CodegenLogicUtil} from './codegen_logic_util';
import {codify} from './codegen_facade';
import {EventBinding} from './event_binding';
import {BindingTarget} from './binding_record';
import {ChangeDetectorGenConfig} from './interfaces';
import {ChangeDetectionStrategy} from './constants';



/**
 * The code generator takes a list of proto records and creates a function/class
 * that "emulates" what the developer would write by hand to implement the same
 * kind of behaviour.
 *
 * This code should be kept in sync with the Dart transformer's
 * `angular2.transform.template_compiler.change_detector_codegen` library. If you make updates
 * here, please make equivalent changes there.
*/
const ABSTRACT_CHANGE_DETECTOR = "AbstractChangeDetector";
const UTIL = "ChangeDetectionUtil";
const IS_CHANGED_LOCAL = "isChanged";
const CHANGES_LOCAL = "changes";

export class ChangeDetectorJITGenerator {
  _logic: CodegenLogicUtil;
  _names: CodegenNameUtil;
  _typeName: string;

  constructor(private id: string, private changeDetectionStrategy: ChangeDetectionStrategy,
              private records: ProtoRecord[], private propertyBindingTargets: BindingTarget[],
              private eventBindings: EventBinding[], private directiveRecords: any[],
              private genConfig: ChangeDetectorGenConfig) {
    this._names =
        new CodegenNameUtil(this.records, this.eventBindings, this.directiveRecords, UTIL);
    this._logic = new CodegenLogicUtil(this._names, UTIL, changeDetectionStrategy);
    this._typeName = sanitizeName(`ChangeDetector_${this.id}`);
  }

  generate(): Function {
    var classDefinition = `
      var ${this._typeName} = function ${this._typeName}(dispatcher) {
        ${ABSTRACT_CHANGE_DETECTOR}.call(
            this, ${JSON.stringify(this.id)}, dispatcher, ${this.records.length},
            ${this._typeName}.gen_propertyBindingTargets, ${this._typeName}.gen_directiveIndices,
            ${codify(this.changeDetectionStrategy)});
        this.dehydrateDirectives(false);
      }

      ${this._typeName}.prototype = Object.create(${ABSTRACT_CHANGE_DETECTOR}.prototype);

      ${this._typeName}.prototype.detectChangesInRecordsInternal = function(throwOnChange) {
        ${this._names.genInitLocals()}
        var ${IS_CHANGED_LOCAL} = false;
        var ${CHANGES_LOCAL} = null;

        ${this.records.map((r) => this._genRecord(r)).join("\n")}
      }

      ${this._maybeGenHandleEventInternal()}

      ${this._genCheckNoChanges()}

      ${this._maybeGenAfterContentLifecycleCallbacks()}

      ${this._maybeGenAfterViewLifecycleCallbacks()}

      ${this._maybeGenHydrateDirectives()}

      ${this._maybeGenDehydrateDirectives()}

      ${this._genPropertyBindingTargets()}

      ${this._genDirectiveIndices()}

      return function(dispatcher) {
        return new ${this._typeName}(dispatcher);
      }
    `;
    return new Function(ABSTRACT_CHANGE_DETECTOR, UTIL, classDefinition)(AbstractChangeDetector,
                                                                         ChangeDetectionUtil);
  }

  _genPropertyBindingTargets(): string {
    var targets = this._logic.genPropertyBindingTargets(this.propertyBindingTargets,
                                                        this.genConfig.genDebugInfo);
    return `${this._typeName}.gen_propertyBindingTargets = ${targets};`;
  }

  _genDirectiveIndices(): string {
    var indices = this._logic.genDirectiveIndices(this.directiveRecords);
    return `${this._typeName}.gen_directiveIndices = ${indices};`;
  }

  _maybeGenHandleEventInternal(): string {
    if (this.eventBindings.length > 0) {
      var handlers = this.eventBindings.map(eb => this._genEventBinding(eb)).join("\n");
      return `
        ${this._typeName}.prototype.handleEventInternal = function(eventName, elIndex, locals) {
          var ${this._names.getPreventDefaultAccesor()} = false;
          ${this._names.genInitEventLocals()}
          ${handlers}
          return ${this._names.getPreventDefaultAccesor()};
        }
      `;
    } else {
      return '';
    }
  }

  _genEventBinding(eb: EventBinding): string {
    var recs = eb.records.map(r => this._genEventBindingEval(eb, r)).join("\n");
    return `
    if (eventName === "${eb.eventName}" && elIndex === ${eb.elIndex}) {
      ${recs}
    }`;
  }

  _genEventBindingEval(eb: EventBinding, r: ProtoRecord): string {
    if (r.lastInBinding) {
      var evalRecord = this._logic.genEventBindingEvalValue(eb, r);
      var markPath = this._genMarkPathToRootAsCheckOnce(r);
      var prevDefault = this._genUpdatePreventDefault(eb, r);
      return `${evalRecord}\n${markPath}\n${prevDefault}`;
    } else {
      return this._logic.genEventBindingEvalValue(eb, r);
    }
  }

  _genMarkPathToRootAsCheckOnce(r: ProtoRecord): string {
    var br = r.bindingRecord;
    if (br.isDefaultChangeDetection()) {
      return "";
    } else {
      return `${this._names.getDetectorName(br.directiveRecord.directiveIndex)}.markPathToRootAsCheckOnce();`;
    }
  }

  _genUpdatePreventDefault(eb: EventBinding, r: ProtoRecord): string {
    var local = this._names.getEventLocalName(eb, r.selfIndex);
    return `if (${local} === false) { ${this._names.getPreventDefaultAccesor()} = true};`;
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
    var hydrateDirectivesCode = this._logic.genHydrateDirectives(this.directiveRecords);
    var hydrateDetectorsCode = this._logic.genHydrateDetectors(this.directiveRecords);
    if (!hydrateDirectivesCode && !hydrateDetectorsCode) return '';
    return `${this._typeName}.prototype.hydrateDirectives = function(directives) {
      ${hydrateDirectivesCode}
      ${hydrateDetectorsCode}
    }`;
  }

  _maybeGenAfterContentLifecycleCallbacks(): string {
    var notifications = this._logic.genContentLifecycleCallbacks(this.directiveRecords);
    if (notifications.length > 0) {
      var directiveNotifications = notifications.join("\n");
      return `
        ${this._typeName}.prototype.afterContentLifecycleCallbacksInternal = function() {
          ${directiveNotifications}
        }
      `;
    } else {
      return '';
    }
  }

  _maybeGenAfterViewLifecycleCallbacks(): string {
    var notifications = this._logic.genViewLifecycleCallbacks(this.directiveRecords);
    if (notifications.length > 0) {
      var directiveNotifications = notifications.join("\n");
      return `
        ${this._typeName}.prototype.afterViewLifecycleCallbacksInternal = function() {
          ${directiveNotifications}
        }
      `;
    } else {
      return '';
    }
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
    return `
      ${this._maybeFirstInBinding(r)}
      ${rec}
      ${this._maybeGenLastInDirective(r)}
    `;
  }

  _genDirectiveLifecycle(r: ProtoRecord): string {
    if (r.name === "DoCheck") {
      return this._genOnCheck(r);
    } else if (r.name === "OnInit") {
      return this._genOnInit(r);
    } else if (r.name === "OnChanges") {
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
    var pipeType = r.name;
    var read = `
      if (${pipe} === ${UTIL}.uninitialized) {
        ${pipe} = ${this._names.getPipesAccessorName()}.get('${pipeType}');
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
    var read = `
      ${this._logic.genPropertyBindingEvalValue(r)}
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

  _genChangeMarker(r: ProtoRecord): string {
    return r.argumentToPureFunction ? `${this._names.getChangeName(r.selfIndex)} = true` : ``;
  }

  _genUpdateDirectiveOrElement(r: ProtoRecord): string {
    if (!r.lastInBinding) return "";

    var newValue = this._names.getLocalName(r.selfIndex);
    var oldValue = this._names.getFieldName(r.selfIndex);
    var notifyDebug = this.genConfig.logBindingUpdate ? `this.logBindingUpdate(${newValue});` : "";

    var br = r.bindingRecord;
    if (br.target.isDirective()) {
      var directiveProperty =
          `${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.${br.target.name}`;
      return `
        ${this._genThrowOnChangeCheck(oldValue, newValue)}
        ${directiveProperty} = ${newValue};
        ${notifyDebug}
        ${IS_CHANGED_LOCAL} = true;
      `;
    } else {
      return `
        ${this._genThrowOnChangeCheck(oldValue, newValue)}
        this.notifyDispatcher(${newValue});
        ${notifyDebug}
      `;
    }
  }

  _genThrowOnChangeCheck(oldValue: string, newValue: string): string {
    if (this.genConfig.genCheckNoChanges) {
      return `
        if(throwOnChange) {
          this.throwOnChangeError(${oldValue}, ${newValue});
        }
        `;
    } else {
      return '';
    }
  }

  _genCheckNoChanges(): string {
    if (this.genConfig.genCheckNoChanges) {
      return `${this._typeName}.prototype.checkNoChanges = function() { this.runDetectChanges(true); }`;
    } else {
      return '';
    }
  }

  _genAddToChanges(r: ProtoRecord): string {
    var newValue = this._names.getLocalName(r.selfIndex);
    var oldValue = this._names.getFieldName(r.selfIndex);
    if (!r.bindingRecord.callOnChanges()) return "";
    return `${CHANGES_LOCAL} = this.addChange(${CHANGES_LOCAL}, ${oldValue}, ${newValue});`;
  }

  _maybeFirstInBinding(r: ProtoRecord): string {
    var prev = ChangeDetectionUtil.protoByIndex(this.records, r.selfIndex - 1);
    var firstInBindng = isBlank(prev) || prev.bindingRecord !== r.bindingRecord;
    return firstInBindng && !r.bindingRecord.isDirectiveLifecycle() ?
               `${this._names.getPropertyBindingIndex()} = ${r.propertyBindingIndex};` :
               '';
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
    return `if (!throwOnChange) ${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.doCheck();`;
  }

  _genOnInit(r: ProtoRecord): string {
    var br = r.bindingRecord;
    return `if (!throwOnChange && !${this._names.getAlreadyCheckedName()}) ${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.onInit();`;
  }

  _genOnChange(r: ProtoRecord): string {
    var br = r.bindingRecord;
    return `if (!throwOnChange && ${CHANGES_LOCAL}) ${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.onChanges(${CHANGES_LOCAL});`;
  }

  _genNotifyOnPushDetectors(r: ProtoRecord): string {
    var br = r.bindingRecord;
    if (!r.lastInDirective || br.isDefaultChangeDetection()) return "";
    var retVal = `
      if(${IS_CHANGED_LOCAL}) {
        ${this._names.getDetectorName(br.directiveRecord.directiveIndex)}.markAsCheckOnce();
      }
    `;
    return retVal;
  }
}
