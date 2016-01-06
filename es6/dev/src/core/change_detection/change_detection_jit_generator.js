import { assertionsEnabled, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { AbstractChangeDetector } from './abstract_change_detector';
import { ChangeDetectionUtil } from './change_detection_util';
import { RecordType } from './proto_record';
import { CodegenNameUtil, sanitizeName } from './codegen_name_util';
import { CodegenLogicUtil } from './codegen_logic_util';
import { codify } from './codegen_facade';
import { ChangeDetectorState } from './constants';
import { createPropertyRecords, createEventRecords } from './proto_change_detector';
/**
 * The code generator takes a list of proto records and creates a function/class
 * that "emulates" what the developer would write by hand to implement the same
 * kind of behaviour.
 *
 * This code should be kept in sync with the Dart transformer's
 * `angular2.transform.template_compiler.change_detector_codegen` library. If you make updates
 * here, please make equivalent changes there.
*/
const IS_CHANGED_LOCAL = "isChanged";
const CHANGES_LOCAL = "changes";
export class ChangeDetectorJITGenerator {
    constructor(definition, changeDetectionUtilVarName, abstractChangeDetectorVarName, changeDetectorStateVarName) {
        this.changeDetectionUtilVarName = changeDetectionUtilVarName;
        this.abstractChangeDetectorVarName = abstractChangeDetectorVarName;
        this.changeDetectorStateVarName = changeDetectorStateVarName;
        var propertyBindingRecords = createPropertyRecords(definition);
        var eventBindingRecords = createEventRecords(definition);
        var propertyBindingTargets = definition.bindingRecords.map(b => b.target);
        this.id = definition.id;
        this.changeDetectionStrategy = definition.strategy;
        this.genConfig = definition.genConfig;
        this.records = propertyBindingRecords;
        this.propertyBindingTargets = propertyBindingTargets;
        this.eventBindings = eventBindingRecords;
        this.directiveRecords = definition.directiveRecords;
        this._names = new CodegenNameUtil(this.records, this.eventBindings, this.directiveRecords, this.changeDetectionUtilVarName);
        this._logic =
            new CodegenLogicUtil(this._names, this.changeDetectionUtilVarName, this.changeDetectorStateVarName, this.changeDetectionStrategy);
        this.typeName = sanitizeName(`ChangeDetector_${this.id}`);
    }
    generate() {
        var factorySource = `
      ${this.generateSource()}
      return function() {
        return new ${this.typeName}();
      }
    `;
        return new Function(this.abstractChangeDetectorVarName, this.changeDetectionUtilVarName, this.changeDetectorStateVarName, factorySource)(AbstractChangeDetector, ChangeDetectionUtil, ChangeDetectorState);
    }
    generateSource() {
        return `
      var ${this.typeName} = function ${this.typeName}() {
        ${this.abstractChangeDetectorVarName}.call(
            this, ${JSON.stringify(this.id)}, ${this.records.length},
            ${this.typeName}.gen_propertyBindingTargets, ${this.typeName}.gen_directiveIndices,
            ${codify(this.changeDetectionStrategy)});
        this.dehydrateDirectives(false);
      }

      ${this.typeName}.prototype = Object.create(${this.abstractChangeDetectorVarName}.prototype);

      ${this.typeName}.prototype.detectChangesInRecordsInternal = function(throwOnChange) {
        ${this._names.genInitLocals()}
        var ${IS_CHANGED_LOCAL} = false;
        var ${CHANGES_LOCAL} = null;

        ${this._genAllRecords(this.records)}
      }

      ${this._maybeGenHandleEventInternal()}

      ${this._maybeGenAfterContentLifecycleCallbacks()}

      ${this._maybeGenAfterViewLifecycleCallbacks()}

      ${this._maybeGenHydrateDirectives()}

      ${this._maybeGenDehydrateDirectives()}

      ${this._genPropertyBindingTargets()}

      ${this._genDirectiveIndices()}
    `;
    }
    /** @internal */
    _genPropertyBindingTargets() {
        var targets = this._logic.genPropertyBindingTargets(this.propertyBindingTargets, this.genConfig.genDebugInfo);
        return `${this.typeName}.gen_propertyBindingTargets = ${targets};`;
    }
    /** @internal */
    _genDirectiveIndices() {
        var indices = this._logic.genDirectiveIndices(this.directiveRecords);
        return `${this.typeName}.gen_directiveIndices = ${indices};`;
    }
    /** @internal */
    _maybeGenHandleEventInternal() {
        if (this.eventBindings.length > 0) {
            var handlers = this.eventBindings.map(eb => this._genEventBinding(eb)).join("\n");
            return `
        ${this.typeName}.prototype.handleEventInternal = function(eventName, elIndex, locals) {
          var ${this._names.getPreventDefaultAccesor()} = false;
          ${this._names.genInitEventLocals()}
          ${handlers}
          return ${this._names.getPreventDefaultAccesor()};
        }
      `;
        }
        else {
            return '';
        }
    }
    /** @internal */
    _genEventBinding(eb) {
        let codes = [];
        this._endOfBlockIdxs = [];
        ListWrapper.forEachWithIndex(eb.records, (r, i) => {
            let code;
            if (r.isConditionalSkipRecord()) {
                code = this._genConditionalSkip(r, this._names.getEventLocalName(eb, i));
            }
            else if (r.isUnconditionalSkipRecord()) {
                code = this._genUnconditionalSkip(r);
            }
            else {
                code = this._genEventBindingEval(eb, r);
            }
            code += this._genEndOfSkipBlock(i);
            codes.push(code);
        });
        return `
    if (eventName === "${eb.eventName}" && elIndex === ${eb.elIndex}) {
      ${codes.join("\n")}
    }`;
    }
    /** @internal */
    _genEventBindingEval(eb, r) {
        if (r.lastInBinding) {
            var evalRecord = this._logic.genEventBindingEvalValue(eb, r);
            var markPath = this._genMarkPathToRootAsCheckOnce(r);
            var prevDefault = this._genUpdatePreventDefault(eb, r);
            return `${evalRecord}\n${markPath}\n${prevDefault}`;
        }
        else {
            return this._logic.genEventBindingEvalValue(eb, r);
        }
    }
    /** @internal */
    _genMarkPathToRootAsCheckOnce(r) {
        var br = r.bindingRecord;
        if (br.isDefaultChangeDetection()) {
            return "";
        }
        else {
            return `${this._names.getDetectorName(br.directiveRecord.directiveIndex)}.markPathToRootAsCheckOnce();`;
        }
    }
    /** @internal */
    _genUpdatePreventDefault(eb, r) {
        var local = this._names.getEventLocalName(eb, r.selfIndex);
        return `if (${local} === false) { ${this._names.getPreventDefaultAccesor()} = true};`;
    }
    /** @internal */
    _maybeGenDehydrateDirectives() {
        var destroyPipesCode = this._names.genPipeOnDestroy();
        var destroyDirectivesCode = this._logic.genDirectivesOnDestroy(this.directiveRecords);
        var dehydrateFieldsCode = this._names.genDehydrateFields();
        if (!destroyPipesCode && !destroyDirectivesCode && !dehydrateFieldsCode)
            return '';
        return `${this.typeName}.prototype.dehydrateDirectives = function(destroyPipes) {
        if (destroyPipes) {
          ${destroyPipesCode}
          ${destroyDirectivesCode}
        }
        ${dehydrateFieldsCode}
    }`;
    }
    /** @internal */
    _maybeGenHydrateDirectives() {
        var hydrateDirectivesCode = this._logic.genHydrateDirectives(this.directiveRecords);
        var hydrateDetectorsCode = this._logic.genHydrateDetectors(this.directiveRecords);
        if (!hydrateDirectivesCode && !hydrateDetectorsCode)
            return '';
        return `${this.typeName}.prototype.hydrateDirectives = function(directives) {
      ${hydrateDirectivesCode}
      ${hydrateDetectorsCode}
    }`;
    }
    /** @internal */
    _maybeGenAfterContentLifecycleCallbacks() {
        var notifications = this._logic.genContentLifecycleCallbacks(this.directiveRecords);
        if (notifications.length > 0) {
            var directiveNotifications = notifications.join("\n");
            return `
        ${this.typeName}.prototype.afterContentLifecycleCallbacksInternal = function() {
          ${directiveNotifications}
        }
      `;
        }
        else {
            return '';
        }
    }
    /** @internal */
    _maybeGenAfterViewLifecycleCallbacks() {
        var notifications = this._logic.genViewLifecycleCallbacks(this.directiveRecords);
        if (notifications.length > 0) {
            var directiveNotifications = notifications.join("\n");
            return `
        ${this.typeName}.prototype.afterViewLifecycleCallbacksInternal = function() {
          ${directiveNotifications}
        }
      `;
        }
        else {
            return '';
        }
    }
    /** @internal */
    _genAllRecords(rs) {
        var codes = [];
        this._endOfBlockIdxs = [];
        for (let i = 0; i < rs.length; i++) {
            let code;
            let r = rs[i];
            if (r.isLifeCycleRecord()) {
                code = this._genDirectiveLifecycle(r);
            }
            else if (r.isPipeRecord()) {
                code = this._genPipeCheck(r);
            }
            else if (r.isConditionalSkipRecord()) {
                code = this._genConditionalSkip(r, this._names.getLocalName(r.contextIndex));
            }
            else if (r.isUnconditionalSkipRecord()) {
                code = this._genUnconditionalSkip(r);
            }
            else {
                code = this._genReferenceCheck(r);
            }
            code = `
        ${this._maybeFirstInBinding(r)}
        ${code}
        ${this._maybeGenLastInDirective(r)}
        ${this._genEndOfSkipBlock(i)}
      `;
            codes.push(code);
        }
        return codes.join("\n");
    }
    /** @internal */
    _genConditionalSkip(r, condition) {
        let maybeNegate = r.mode === RecordType.SkipRecordsIf ? '!' : '';
        this._endOfBlockIdxs.push(r.fixedArgs[0] - 1);
        return `if (${maybeNegate}${condition}) {`;
    }
    /** @internal */
    _genUnconditionalSkip(r) {
        this._endOfBlockIdxs.pop();
        this._endOfBlockIdxs.push(r.fixedArgs[0] - 1);
        return `} else {`;
    }
    /** @internal */
    _genEndOfSkipBlock(protoIndex) {
        if (!ListWrapper.isEmpty(this._endOfBlockIdxs)) {
            let endOfBlock = ListWrapper.last(this._endOfBlockIdxs);
            if (protoIndex === endOfBlock) {
                this._endOfBlockIdxs.pop();
                return '}';
            }
        }
        return '';
    }
    /** @internal */
    _genDirectiveLifecycle(r) {
        if (r.name === "DoCheck") {
            return this._genOnCheck(r);
        }
        else if (r.name === "OnInit") {
            return this._genOnInit(r);
        }
        else if (r.name === "OnChanges") {
            return this._genOnChange(r);
        }
        else {
            throw new BaseException(`Unknown lifecycle event '${r.name}'`);
        }
    }
    /** @internal */
    _genPipeCheck(r) {
        var context = this._names.getLocalName(r.contextIndex);
        var argString = r.args.map((arg) => this._names.getLocalName(arg)).join(", ");
        var oldValue = this._names.getFieldName(r.selfIndex);
        var newValue = this._names.getLocalName(r.selfIndex);
        var pipe = this._names.getPipeName(r.selfIndex);
        var pipeName = r.name;
        var init = `
      if (${pipe} === ${this.changeDetectionUtilVarName}.uninitialized) {
        ${pipe} = ${this._names.getPipesAccessorName()}.get('${pipeName}');
      }
    `;
        var read = `${newValue} = ${pipe}.pipe.transform(${context}, [${argString}]);`;
        var contexOrArgCheck = r.args.map((a) => this._names.getChangeName(a));
        contexOrArgCheck.push(this._names.getChangeName(r.contextIndex));
        var condition = `!${pipe}.pure || (${contexOrArgCheck.join(" || ")})`;
        var check = `
      if (${this.changeDetectionUtilVarName}.looseNotIdentical(${oldValue}, ${newValue})) {
        ${newValue} = ${this.changeDetectionUtilVarName}.unwrapValue(${newValue})
        ${this._genChangeMarker(r)}
        ${this._genUpdateDirectiveOrElement(r)}
        ${this._genAddToChanges(r)}
        ${oldValue} = ${newValue};
      }
    `;
        var genCode = r.shouldBeChecked() ? `${read}${check}` : read;
        if (r.isUsedByOtherRecord()) {
            return `${init} if (${condition}) { ${genCode} } else { ${newValue} = ${oldValue}; }`;
        }
        else {
            return `${init} if (${condition}) { ${genCode} }`;
        }
    }
    /** @internal */
    _genReferenceCheck(r) {
        var oldValue = this._names.getFieldName(r.selfIndex);
        var newValue = this._names.getLocalName(r.selfIndex);
        var read = `
      ${this._logic.genPropertyBindingEvalValue(r)}
    `;
        var check = `
      if (${this.changeDetectionUtilVarName}.looseNotIdentical(${oldValue}, ${newValue})) {
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
            }
            else {
                return `if (${condition}) { ${genCode} }`;
            }
        }
        else {
            return genCode;
        }
    }
    /** @internal */
    _genChangeMarker(r) {
        return r.argumentToPureFunction ? `${this._names.getChangeName(r.selfIndex)} = true` : ``;
    }
    /** @internal */
    _genUpdateDirectiveOrElement(r) {
        if (!r.lastInBinding)
            return "";
        var newValue = this._names.getLocalName(r.selfIndex);
        var oldValue = this._names.getFieldName(r.selfIndex);
        var notifyDebug = this.genConfig.logBindingUpdate ? `this.logBindingUpdate(${newValue});` : "";
        var br = r.bindingRecord;
        if (br.target.isDirective()) {
            var directiveProperty = `${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.${br.target.name}`;
            return `
        ${this._genThrowOnChangeCheck(oldValue, newValue)}
        ${directiveProperty} = ${newValue};
        ${notifyDebug}
        ${IS_CHANGED_LOCAL} = true;
      `;
        }
        else {
            return `
        ${this._genThrowOnChangeCheck(oldValue, newValue)}
        this.notifyDispatcher(${newValue});
        ${notifyDebug}
      `;
        }
    }
    /** @internal */
    _genThrowOnChangeCheck(oldValue, newValue) {
        if (assertionsEnabled()) {
            return `
        if(throwOnChange) {
          this.throwOnChangeError(${oldValue}, ${newValue});
        }
        `;
        }
        else {
            return '';
        }
    }
    /** @internal */
    _genAddToChanges(r) {
        var newValue = this._names.getLocalName(r.selfIndex);
        var oldValue = this._names.getFieldName(r.selfIndex);
        if (!r.bindingRecord.callOnChanges())
            return "";
        return `${CHANGES_LOCAL} = this.addChange(${CHANGES_LOCAL}, ${oldValue}, ${newValue});`;
    }
    /** @internal */
    _maybeFirstInBinding(r) {
        var prev = ChangeDetectionUtil.protoByIndex(this.records, r.selfIndex - 1);
        var firstInBinding = isBlank(prev) || prev.bindingRecord !== r.bindingRecord;
        return firstInBinding && !r.bindingRecord.isDirectiveLifecycle() ?
            `${this._names.getPropertyBindingIndex()} = ${r.propertyBindingIndex};` :
            '';
    }
    /** @internal */
    _maybeGenLastInDirective(r) {
        if (!r.lastInDirective)
            return "";
        return `
      ${CHANGES_LOCAL} = null;
      ${this._genNotifyOnPushDetectors(r)}
      ${IS_CHANGED_LOCAL} = false;
    `;
    }
    /** @internal */
    _genOnCheck(r) {
        var br = r.bindingRecord;
        return `if (!throwOnChange) ${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.ngDoCheck();`;
    }
    /** @internal */
    _genOnInit(r) {
        var br = r.bindingRecord;
        return `if (!throwOnChange && ${this._names.getStateName()} === ${this.changeDetectorStateVarName}.NeverChecked) ${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.ngOnInit();`;
    }
    /** @internal */
    _genOnChange(r) {
        var br = r.bindingRecord;
        return `if (!throwOnChange && ${CHANGES_LOCAL}) ${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.ngOnChanges(${CHANGES_LOCAL});`;
    }
    /** @internal */
    _genNotifyOnPushDetectors(r) {
        var br = r.bindingRecord;
        if (!r.lastInDirective || br.isDefaultChangeDetection())
            return "";
        var retVal = `
      if(${IS_CHANGED_LOCAL}) {
        ${this._names.getDetectorName(br.directiveRecord.directiveIndex)}.markAsCheckOnce();
      }
    `;
        return retVal;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlX2RldGVjdGlvbl9qaXRfZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uX2ppdF9nZW5lcmF0b3IudHMiXSwibmFtZXMiOlsiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5jb25zdHJ1Y3RvciIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLmdlbmVyYXRlIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuZ2VuZXJhdGVTb3VyY2UiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuUHJvcGVydHlCaW5kaW5nVGFyZ2V0cyIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5EaXJlY3RpdmVJbmRpY2VzIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX21heWJlR2VuSGFuZGxlRXZlbnRJbnRlcm5hbCIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5FdmVudEJpbmRpbmciLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuRXZlbnRCaW5kaW5nRXZhbCIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5NYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlblVwZGF0ZVByZXZlbnREZWZhdWx0IiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX21heWJlR2VuRGVoeWRyYXRlRGlyZWN0aXZlcyIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9tYXliZUdlbkh5ZHJhdGVEaXJlY3RpdmVzIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX21heWJlR2VuQWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX21heWJlR2VuQWZ0ZXJWaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlbkFsbFJlY29yZHMiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuQ29uZGl0aW9uYWxTa2lwIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlblVuY29uZGl0aW9uYWxTa2lwIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlbkVuZE9mU2tpcEJsb2NrIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlbkRpcmVjdGl2ZUxpZmVjeWNsZSIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5QaXBlQ2hlY2siLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuUmVmZXJlbmNlQ2hlY2siLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuQ2hhbmdlTWFya2VyIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlblVwZGF0ZURpcmVjdGl2ZU9yRWxlbWVudCIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5UaHJvd09uQ2hhbmdlQ2hlY2siLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuQWRkVG9DaGFuZ2VzIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX21heWJlRmlyc3RJbkJpbmRpbmciLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fbWF5YmVHZW5MYXN0SW5EaXJlY3RpdmUiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuT25DaGVjayIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5PbkluaXQiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuT25DaGFuZ2UiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuTm90aWZ5T25QdXNoRGV0ZWN0b3JzIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFPLGlCQUFpQixFQUFFLE9BQU8sRUFB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QUNBLGNBQWNBLENBQUNBLGdCQUFnQkEsYUFBYUEsSUFBSUEsQ0FBQ0E7SUFDckpBLENBQUNBO0lBRUQ5QixnQkFBZ0JBO0lBQ2hCQSx5QkFBeUJBLENBQUNBLENBQWNBO1FBQ3RDK0IsSUFBSUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0E7UUFDekJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLGVBQWVBLElBQUlBLEVBQUVBLENBQUNBLHdCQUF3QkEsRUFBRUEsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFDbkVBLElBQUlBLE1BQU1BLEdBQUdBO1dBQ05BLGdCQUFnQkE7VUFDakJBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLGVBQWVBLENBQUNBLEVBQUVBLENBQUNBLGVBQWVBLENBQUNBLGNBQWNBLENBQUNBOztLQUVuRUEsQ0FBQ0E7UUFDRkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0FBQ0gvQixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtUeXBlLCBhc3NlcnRpb25zRW5hYmxlZCwgaXNCbGFuaywgaXNQcmVzZW50LCBTdHJpbmdXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtBYnN0cmFjdENoYW5nZURldGVjdG9yfSBmcm9tICcuL2Fic3RyYWN0X2NoYW5nZV9kZXRlY3Rvcic7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblV0aWx9IGZyb20gJy4vY2hhbmdlX2RldGVjdGlvbl91dGlsJztcbmltcG9ydCB7RGlyZWN0aXZlSW5kZXgsIERpcmVjdGl2ZVJlY29yZH0gZnJvbSAnLi9kaXJlY3RpdmVfcmVjb3JkJztcblxuaW1wb3J0IHtQcm90b1JlY29yZCwgUmVjb3JkVHlwZX0gZnJvbSAnLi9wcm90b19yZWNvcmQnO1xuaW1wb3J0IHtDb2RlZ2VuTmFtZVV0aWwsIHNhbml0aXplTmFtZX0gZnJvbSAnLi9jb2RlZ2VuX25hbWVfdXRpbCc7XG5pbXBvcnQge0NvZGVnZW5Mb2dpY1V0aWx9IGZyb20gJy4vY29kZWdlbl9sb2dpY191dGlsJztcbmltcG9ydCB7Y29kaWZ5fSBmcm9tICcuL2NvZGVnZW5fZmFjYWRlJztcbmltcG9ydCB7RXZlbnRCaW5kaW5nfSBmcm9tICcuL2V2ZW50X2JpbmRpbmcnO1xuaW1wb3J0IHtCaW5kaW5nVGFyZ2V0fSBmcm9tICcuL2JpbmRpbmdfcmVjb3JkJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JHZW5Db25maWcsIENoYW5nZURldGVjdG9yRGVmaW5pdGlvbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENoYW5nZURldGVjdG9yU3RhdGV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y3JlYXRlUHJvcGVydHlSZWNvcmRzLCBjcmVhdGVFdmVudFJlY29yZHN9IGZyb20gJy4vcHJvdG9fY2hhbmdlX2RldGVjdG9yJztcblxuLyoqXG4gKiBUaGUgY29kZSBnZW5lcmF0b3IgdGFrZXMgYSBsaXN0IG9mIHByb3RvIHJlY29yZHMgYW5kIGNyZWF0ZXMgYSBmdW5jdGlvbi9jbGFzc1xuICogdGhhdCBcImVtdWxhdGVzXCIgd2hhdCB0aGUgZGV2ZWxvcGVyIHdvdWxkIHdyaXRlIGJ5IGhhbmQgdG8gaW1wbGVtZW50IHRoZSBzYW1lXG4gKiBraW5kIG9mIGJlaGF2aW91ci5cbiAqXG4gKiBUaGlzIGNvZGUgc2hvdWxkIGJlIGtlcHQgaW4gc3luYyB3aXRoIHRoZSBEYXJ0IHRyYW5zZm9ybWVyJ3NcbiAqIGBhbmd1bGFyMi50cmFuc2Zvcm0udGVtcGxhdGVfY29tcGlsZXIuY2hhbmdlX2RldGVjdG9yX2NvZGVnZW5gIGxpYnJhcnkuIElmIHlvdSBtYWtlIHVwZGF0ZXNcbiAqIGhlcmUsIHBsZWFzZSBtYWtlIGVxdWl2YWxlbnQgY2hhbmdlcyB0aGVyZS5cbiovXG5jb25zdCBJU19DSEFOR0VEX0xPQ0FMID0gXCJpc0NoYW5nZWRcIjtcbmNvbnN0IENIQU5HRVNfTE9DQUwgPSBcImNoYW5nZXNcIjtcblxuZXhwb3J0IGNsYXNzIENoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yIHtcbiAgcHJpdmF0ZSBfbG9naWM6IENvZGVnZW5Mb2dpY1V0aWw7XG4gIHByaXZhdGUgX25hbWVzOiBDb2RlZ2VuTmFtZVV0aWw7XG4gIHByaXZhdGUgX2VuZE9mQmxvY2tJZHhzOiBudW1iZXJbXTtcbiAgcHJpdmF0ZSBpZDogc3RyaW5nO1xuICBwcml2YXRlIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTtcbiAgcHJpdmF0ZSByZWNvcmRzOiBQcm90b1JlY29yZFtdO1xuICBwcml2YXRlIHByb3BlcnR5QmluZGluZ1RhcmdldHM6IEJpbmRpbmdUYXJnZXRbXTtcbiAgcHJpdmF0ZSBldmVudEJpbmRpbmdzOiBFdmVudEJpbmRpbmdbXTtcbiAgcHJpdmF0ZSBkaXJlY3RpdmVSZWNvcmRzOiBhbnlbXTtcbiAgcHJpdmF0ZSBnZW5Db25maWc6IENoYW5nZURldGVjdG9yR2VuQ29uZmlnO1xuICB0eXBlTmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGRlZmluaXRpb246IENoYW5nZURldGVjdG9yRGVmaW5pdGlvbiwgcHJpdmF0ZSBjaGFuZ2VEZXRlY3Rpb25VdGlsVmFyTmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwcml2YXRlIGFic3RyYWN0Q2hhbmdlRGV0ZWN0b3JWYXJOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHByaXZhdGUgY2hhbmdlRGV0ZWN0b3JTdGF0ZVZhck5hbWU6IHN0cmluZykge1xuICAgIHZhciBwcm9wZXJ0eUJpbmRpbmdSZWNvcmRzID0gY3JlYXRlUHJvcGVydHlSZWNvcmRzKGRlZmluaXRpb24pO1xuICAgIHZhciBldmVudEJpbmRpbmdSZWNvcmRzID0gY3JlYXRlRXZlbnRSZWNvcmRzKGRlZmluaXRpb24pO1xuICAgIHZhciBwcm9wZXJ0eUJpbmRpbmdUYXJnZXRzID0gZGVmaW5pdGlvbi5iaW5kaW5nUmVjb3Jkcy5tYXAoYiA9PiBiLnRhcmdldCk7XG4gICAgdGhpcy5pZCA9IGRlZmluaXRpb24uaWQ7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9IGRlZmluaXRpb24uc3RyYXRlZ3k7XG4gICAgdGhpcy5nZW5Db25maWcgPSBkZWZpbml0aW9uLmdlbkNvbmZpZztcblxuICAgIHRoaXMucmVjb3JkcyA9IHByb3BlcnR5QmluZGluZ1JlY29yZHM7XG4gICAgdGhpcy5wcm9wZXJ0eUJpbmRpbmdUYXJnZXRzID0gcHJvcGVydHlCaW5kaW5nVGFyZ2V0cztcbiAgICB0aGlzLmV2ZW50QmluZGluZ3MgPSBldmVudEJpbmRpbmdSZWNvcmRzO1xuICAgIHRoaXMuZGlyZWN0aXZlUmVjb3JkcyA9IGRlZmluaXRpb24uZGlyZWN0aXZlUmVjb3JkcztcbiAgICB0aGlzLl9uYW1lcyA9IG5ldyBDb2RlZ2VuTmFtZVV0aWwodGhpcy5yZWNvcmRzLCB0aGlzLmV2ZW50QmluZGluZ3MsIHRoaXMuZGlyZWN0aXZlUmVjb3JkcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rpb25VdGlsVmFyTmFtZSk7XG4gICAgdGhpcy5fbG9naWMgPVxuICAgICAgICBuZXcgQ29kZWdlbkxvZ2ljVXRpbCh0aGlzLl9uYW1lcywgdGhpcy5jaGFuZ2VEZXRlY3Rpb25VdGlsVmFyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VEZXRlY3RvclN0YXRlVmFyTmFtZSwgdGhpcy5jaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSk7XG4gICAgdGhpcy50eXBlTmFtZSA9IHNhbml0aXplTmFtZShgQ2hhbmdlRGV0ZWN0b3JfJHt0aGlzLmlkfWApO1xuICB9XG5cbiAgZ2VuZXJhdGUoKTogRnVuY3Rpb24ge1xuICAgIHZhciBmYWN0b3J5U291cmNlID0gYFxuICAgICAgJHt0aGlzLmdlbmVyYXRlU291cmNlKCl9XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgJHt0aGlzLnR5cGVOYW1lfSgpO1xuICAgICAgfVxuICAgIGA7XG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbih0aGlzLmFic3RyYWN0Q2hhbmdlRGV0ZWN0b3JWYXJOYW1lLCB0aGlzLmNoYW5nZURldGVjdGlvblV0aWxWYXJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VEZXRlY3RvclN0YXRlVmFyTmFtZSwgZmFjdG9yeVNvdXJjZSkoXG4gICAgICAgIEFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IsIENoYW5nZURldGVjdGlvblV0aWwsIENoYW5nZURldGVjdG9yU3RhdGUpO1xuICB9XG5cbiAgZ2VuZXJhdGVTb3VyY2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFxuICAgICAgdmFyICR7dGhpcy50eXBlTmFtZX0gPSBmdW5jdGlvbiAke3RoaXMudHlwZU5hbWV9KCkge1xuICAgICAgICAke3RoaXMuYWJzdHJhY3RDaGFuZ2VEZXRlY3RvclZhck5hbWV9LmNhbGwoXG4gICAgICAgICAgICB0aGlzLCAke0pTT04uc3RyaW5naWZ5KHRoaXMuaWQpfSwgJHt0aGlzLnJlY29yZHMubGVuZ3RofSxcbiAgICAgICAgICAgICR7dGhpcy50eXBlTmFtZX0uZ2VuX3Byb3BlcnR5QmluZGluZ1RhcmdldHMsICR7dGhpcy50eXBlTmFtZX0uZ2VuX2RpcmVjdGl2ZUluZGljZXMsXG4gICAgICAgICAgICAke2NvZGlmeSh0aGlzLmNoYW5nZURldGVjdGlvblN0cmF0ZWd5KX0pO1xuICAgICAgICB0aGlzLmRlaHlkcmF0ZURpcmVjdGl2ZXMoZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICAke3RoaXMudHlwZU5hbWV9LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoJHt0aGlzLmFic3RyYWN0Q2hhbmdlRGV0ZWN0b3JWYXJOYW1lfS5wcm90b3R5cGUpO1xuXG4gICAgICAke3RoaXMudHlwZU5hbWV9LnByb3RvdHlwZS5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWwgPSBmdW5jdGlvbih0aHJvd09uQ2hhbmdlKSB7XG4gICAgICAgICR7dGhpcy5fbmFtZXMuZ2VuSW5pdExvY2FscygpfVxuICAgICAgICB2YXIgJHtJU19DSEFOR0VEX0xPQ0FMfSA9IGZhbHNlO1xuICAgICAgICB2YXIgJHtDSEFOR0VTX0xPQ0FMfSA9IG51bGw7XG5cbiAgICAgICAgJHt0aGlzLl9nZW5BbGxSZWNvcmRzKHRoaXMucmVjb3Jkcyl9XG4gICAgICB9XG5cbiAgICAgICR7dGhpcy5fbWF5YmVHZW5IYW5kbGVFdmVudEludGVybmFsKCl9XG5cbiAgICAgICR7dGhpcy5fbWF5YmVHZW5BZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3MoKX1cblxuICAgICAgJHt0aGlzLl9tYXliZUdlbkFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrcygpfVxuXG4gICAgICAke3RoaXMuX21heWJlR2VuSHlkcmF0ZURpcmVjdGl2ZXMoKX1cblxuICAgICAgJHt0aGlzLl9tYXliZUdlbkRlaHlkcmF0ZURpcmVjdGl2ZXMoKX1cblxuICAgICAgJHt0aGlzLl9nZW5Qcm9wZXJ0eUJpbmRpbmdUYXJnZXRzKCl9XG5cbiAgICAgICR7dGhpcy5fZ2VuRGlyZWN0aXZlSW5kaWNlcygpfVxuICAgIGA7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5Qcm9wZXJ0eUJpbmRpbmdUYXJnZXRzKCk6IHN0cmluZyB7XG4gICAgdmFyIHRhcmdldHMgPSB0aGlzLl9sb2dpYy5nZW5Qcm9wZXJ0eUJpbmRpbmdUYXJnZXRzKHRoaXMucHJvcGVydHlCaW5kaW5nVGFyZ2V0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5Db25maWcuZ2VuRGVidWdJbmZvKTtcbiAgICByZXR1cm4gYCR7dGhpcy50eXBlTmFtZX0uZ2VuX3Byb3BlcnR5QmluZGluZ1RhcmdldHMgPSAke3RhcmdldHN9O2A7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5EaXJlY3RpdmVJbmRpY2VzKCk6IHN0cmluZyB7XG4gICAgdmFyIGluZGljZXMgPSB0aGlzLl9sb2dpYy5nZW5EaXJlY3RpdmVJbmRpY2VzKHRoaXMuZGlyZWN0aXZlUmVjb3Jkcyk7XG4gICAgcmV0dXJuIGAke3RoaXMudHlwZU5hbWV9Lmdlbl9kaXJlY3RpdmVJbmRpY2VzID0gJHtpbmRpY2VzfTtgO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWF5YmVHZW5IYW5kbGVFdmVudEludGVybmFsKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuZXZlbnRCaW5kaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgaGFuZGxlcnMgPSB0aGlzLmV2ZW50QmluZGluZ3MubWFwKGViID0+IHRoaXMuX2dlbkV2ZW50QmluZGluZyhlYikpLmpvaW4oXCJcXG5cIik7XG4gICAgICByZXR1cm4gYFxuICAgICAgICAke3RoaXMudHlwZU5hbWV9LnByb3RvdHlwZS5oYW5kbGVFdmVudEludGVybmFsID0gZnVuY3Rpb24oZXZlbnROYW1lLCBlbEluZGV4LCBsb2NhbHMpIHtcbiAgICAgICAgICB2YXIgJHt0aGlzLl9uYW1lcy5nZXRQcmV2ZW50RGVmYXVsdEFjY2Vzb3IoKX0gPSBmYWxzZTtcbiAgICAgICAgICAke3RoaXMuX25hbWVzLmdlbkluaXRFdmVudExvY2FscygpfVxuICAgICAgICAgICR7aGFuZGxlcnN9XG4gICAgICAgICAgcmV0dXJuICR7dGhpcy5fbmFtZXMuZ2V0UHJldmVudERlZmF1bHRBY2Nlc29yKCl9O1xuICAgICAgICB9XG4gICAgICBgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuRXZlbnRCaW5kaW5nKGViOiBFdmVudEJpbmRpbmcpOiBzdHJpbmcge1xuICAgIGxldCBjb2RlczogU3RyaW5nW10gPSBbXTtcbiAgICB0aGlzLl9lbmRPZkJsb2NrSWR4cyA9IFtdO1xuXG4gICAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChlYi5yZWNvcmRzLCAociwgaSkgPT4ge1xuICAgICAgbGV0IGNvZGU7XG5cbiAgICAgIGlmIChyLmlzQ29uZGl0aW9uYWxTa2lwUmVjb3JkKCkpIHtcbiAgICAgICAgY29kZSA9IHRoaXMuX2dlbkNvbmRpdGlvbmFsU2tpcChyLCB0aGlzLl9uYW1lcy5nZXRFdmVudExvY2FsTmFtZShlYiwgaSkpO1xuICAgICAgfSBlbHNlIGlmIChyLmlzVW5jb25kaXRpb25hbFNraXBSZWNvcmQoKSkge1xuICAgICAgICBjb2RlID0gdGhpcy5fZ2VuVW5jb25kaXRpb25hbFNraXAocik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2RlID0gdGhpcy5fZ2VuRXZlbnRCaW5kaW5nRXZhbChlYiwgcik7XG4gICAgICB9XG5cbiAgICAgIGNvZGUgKz0gdGhpcy5fZ2VuRW5kT2ZTa2lwQmxvY2soaSk7XG5cbiAgICAgIGNvZGVzLnB1c2goY29kZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYFxuICAgIGlmIChldmVudE5hbWUgPT09IFwiJHtlYi5ldmVudE5hbWV9XCIgJiYgZWxJbmRleCA9PT0gJHtlYi5lbEluZGV4fSkge1xuICAgICAgJHtjb2Rlcy5qb2luKFwiXFxuXCIpfVxuICAgIH1gO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuRXZlbnRCaW5kaW5nRXZhbChlYjogRXZlbnRCaW5kaW5nLCByOiBQcm90b1JlY29yZCk6IHN0cmluZyB7XG4gICAgaWYgKHIubGFzdEluQmluZGluZykge1xuICAgICAgdmFyIGV2YWxSZWNvcmQgPSB0aGlzLl9sb2dpYy5nZW5FdmVudEJpbmRpbmdFdmFsVmFsdWUoZWIsIHIpO1xuICAgICAgdmFyIG1hcmtQYXRoID0gdGhpcy5fZ2VuTWFya1BhdGhUb1Jvb3RBc0NoZWNrT25jZShyKTtcbiAgICAgIHZhciBwcmV2RGVmYXVsdCA9IHRoaXMuX2dlblVwZGF0ZVByZXZlbnREZWZhdWx0KGViLCByKTtcbiAgICAgIHJldHVybiBgJHtldmFsUmVjb3JkfVxcbiR7bWFya1BhdGh9XFxuJHtwcmV2RGVmYXVsdH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fbG9naWMuZ2VuRXZlbnRCaW5kaW5nRXZhbFZhbHVlKGViLCByKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5NYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICB2YXIgYnIgPSByLmJpbmRpbmdSZWNvcmQ7XG4gICAgaWYgKGJyLmlzRGVmYXVsdENoYW5nZURldGVjdGlvbigpKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGAke3RoaXMuX25hbWVzLmdldERldGVjdG9yTmFtZShici5kaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpfS5tYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKCk7YDtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5VcGRhdGVQcmV2ZW50RGVmYXVsdChlYjogRXZlbnRCaW5kaW5nLCByOiBQcm90b1JlY29yZCk6IHN0cmluZyB7XG4gICAgdmFyIGxvY2FsID0gdGhpcy5fbmFtZXMuZ2V0RXZlbnRMb2NhbE5hbWUoZWIsIHIuc2VsZkluZGV4KTtcbiAgICByZXR1cm4gYGlmICgke2xvY2FsfSA9PT0gZmFsc2UpIHsgJHt0aGlzLl9uYW1lcy5nZXRQcmV2ZW50RGVmYXVsdEFjY2Vzb3IoKX0gPSB0cnVlfTtgO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWF5YmVHZW5EZWh5ZHJhdGVEaXJlY3RpdmVzKCk6IHN0cmluZyB7XG4gICAgdmFyIGRlc3Ryb3lQaXBlc0NvZGUgPSB0aGlzLl9uYW1lcy5nZW5QaXBlT25EZXN0cm95KCk7XG4gICAgdmFyIGRlc3Ryb3lEaXJlY3RpdmVzQ29kZSA9IHRoaXMuX2xvZ2ljLmdlbkRpcmVjdGl2ZXNPbkRlc3Ryb3kodGhpcy5kaXJlY3RpdmVSZWNvcmRzKTtcbiAgICB2YXIgZGVoeWRyYXRlRmllbGRzQ29kZSA9IHRoaXMuX25hbWVzLmdlbkRlaHlkcmF0ZUZpZWxkcygpO1xuICAgIGlmICghZGVzdHJveVBpcGVzQ29kZSAmJiAhZGVzdHJveURpcmVjdGl2ZXNDb2RlICYmICFkZWh5ZHJhdGVGaWVsZHNDb2RlKSByZXR1cm4gJyc7XG4gICAgcmV0dXJuIGAke3RoaXMudHlwZU5hbWV9LnByb3RvdHlwZS5kZWh5ZHJhdGVEaXJlY3RpdmVzID0gZnVuY3Rpb24oZGVzdHJveVBpcGVzKSB7XG4gICAgICAgIGlmIChkZXN0cm95UGlwZXMpIHtcbiAgICAgICAgICAke2Rlc3Ryb3lQaXBlc0NvZGV9XG4gICAgICAgICAgJHtkZXN0cm95RGlyZWN0aXZlc0NvZGV9XG4gICAgICAgIH1cbiAgICAgICAgJHtkZWh5ZHJhdGVGaWVsZHNDb2RlfVxuICAgIH1gO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWF5YmVHZW5IeWRyYXRlRGlyZWN0aXZlcygpOiBzdHJpbmcge1xuICAgIHZhciBoeWRyYXRlRGlyZWN0aXZlc0NvZGUgPSB0aGlzLl9sb2dpYy5nZW5IeWRyYXRlRGlyZWN0aXZlcyh0aGlzLmRpcmVjdGl2ZVJlY29yZHMpO1xuICAgIHZhciBoeWRyYXRlRGV0ZWN0b3JzQ29kZSA9IHRoaXMuX2xvZ2ljLmdlbkh5ZHJhdGVEZXRlY3RvcnModGhpcy5kaXJlY3RpdmVSZWNvcmRzKTtcbiAgICBpZiAoIWh5ZHJhdGVEaXJlY3RpdmVzQ29kZSAmJiAhaHlkcmF0ZURldGVjdG9yc0NvZGUpIHJldHVybiAnJztcbiAgICByZXR1cm4gYCR7dGhpcy50eXBlTmFtZX0ucHJvdG90eXBlLmh5ZHJhdGVEaXJlY3RpdmVzID0gZnVuY3Rpb24oZGlyZWN0aXZlcykge1xuICAgICAgJHtoeWRyYXRlRGlyZWN0aXZlc0NvZGV9XG4gICAgICAke2h5ZHJhdGVEZXRlY3RvcnNDb2RlfVxuICAgIH1gO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWF5YmVHZW5BZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3MoKTogc3RyaW5nIHtcbiAgICB2YXIgbm90aWZpY2F0aW9ucyA9IHRoaXMuX2xvZ2ljLmdlbkNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3ModGhpcy5kaXJlY3RpdmVSZWNvcmRzKTtcbiAgICBpZiAobm90aWZpY2F0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZGlyZWN0aXZlTm90aWZpY2F0aW9ucyA9IG5vdGlmaWNhdGlvbnMuam9pbihcIlxcblwiKTtcbiAgICAgIHJldHVybiBgXG4gICAgICAgICR7dGhpcy50eXBlTmFtZX0ucHJvdG90eXBlLmFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHtkaXJlY3RpdmVOb3RpZmljYXRpb25zfVxuICAgICAgICB9XG4gICAgICBgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWF5YmVHZW5BZnRlclZpZXdMaWZlY3ljbGVDYWxsYmFja3MoKTogc3RyaW5nIHtcbiAgICB2YXIgbm90aWZpY2F0aW9ucyA9IHRoaXMuX2xvZ2ljLmdlblZpZXdMaWZlY3ljbGVDYWxsYmFja3ModGhpcy5kaXJlY3RpdmVSZWNvcmRzKTtcbiAgICBpZiAobm90aWZpY2F0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZGlyZWN0aXZlTm90aWZpY2F0aW9ucyA9IG5vdGlmaWNhdGlvbnMuam9pbihcIlxcblwiKTtcbiAgICAgIHJldHVybiBgXG4gICAgICAgICR7dGhpcy50eXBlTmFtZX0ucHJvdG90eXBlLmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHtkaXJlY3RpdmVOb3RpZmljYXRpb25zfVxuICAgICAgICB9XG4gICAgICBgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuQWxsUmVjb3JkcyhyczogUHJvdG9SZWNvcmRbXSk6IHN0cmluZyB7XG4gICAgdmFyIGNvZGVzOiBTdHJpbmdbXSA9IFtdO1xuICAgIHRoaXMuX2VuZE9mQmxvY2tJZHhzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgY29kZTtcbiAgICAgIGxldCByID0gcnNbaV07XG5cbiAgICAgIGlmIChyLmlzTGlmZUN5Y2xlUmVjb3JkKCkpIHtcbiAgICAgICAgY29kZSA9IHRoaXMuX2dlbkRpcmVjdGl2ZUxpZmVjeWNsZShyKTtcbiAgICAgIH0gZWxzZSBpZiAoci5pc1BpcGVSZWNvcmQoKSkge1xuICAgICAgICBjb2RlID0gdGhpcy5fZ2VuUGlwZUNoZWNrKHIpO1xuICAgICAgfSBlbHNlIGlmIChyLmlzQ29uZGl0aW9uYWxTa2lwUmVjb3JkKCkpIHtcbiAgICAgICAgY29kZSA9IHRoaXMuX2dlbkNvbmRpdGlvbmFsU2tpcChyLCB0aGlzLl9uYW1lcy5nZXRMb2NhbE5hbWUoci5jb250ZXh0SW5kZXgpKTtcbiAgICAgIH0gZWxzZSBpZiAoci5pc1VuY29uZGl0aW9uYWxTa2lwUmVjb3JkKCkpIHtcbiAgICAgICAgY29kZSA9IHRoaXMuX2dlblVuY29uZGl0aW9uYWxTa2lwKHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29kZSA9IHRoaXMuX2dlblJlZmVyZW5jZUNoZWNrKHIpO1xuICAgICAgfVxuXG4gICAgICBjb2RlID0gYFxuICAgICAgICAke3RoaXMuX21heWJlRmlyc3RJbkJpbmRpbmcocil9XG4gICAgICAgICR7Y29kZX1cbiAgICAgICAgJHt0aGlzLl9tYXliZUdlbkxhc3RJbkRpcmVjdGl2ZShyKX1cbiAgICAgICAgJHt0aGlzLl9nZW5FbmRPZlNraXBCbG9jayhpKX1cbiAgICAgIGA7XG5cbiAgICAgIGNvZGVzLnB1c2goY29kZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvZGVzLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5Db25kaXRpb25hbFNraXAocjogUHJvdG9SZWNvcmQsIGNvbmRpdGlvbjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgbWF5YmVOZWdhdGUgPSByLm1vZGUgPT09IFJlY29yZFR5cGUuU2tpcFJlY29yZHNJZiA/ICchJyA6ICcnO1xuICAgIHRoaXMuX2VuZE9mQmxvY2tJZHhzLnB1c2goci5maXhlZEFyZ3NbMF0gLSAxKTtcblxuICAgIHJldHVybiBgaWYgKCR7bWF5YmVOZWdhdGV9JHtjb25kaXRpb259KSB7YDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlblVuY29uZGl0aW9uYWxTa2lwKHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICB0aGlzLl9lbmRPZkJsb2NrSWR4cy5wb3AoKTtcbiAgICB0aGlzLl9lbmRPZkJsb2NrSWR4cy5wdXNoKHIuZml4ZWRBcmdzWzBdIC0gMSk7XG4gICAgcmV0dXJuIGB9IGVsc2Uge2A7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5FbmRPZlNraXBCbG9jayhwcm90b0luZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGlmICghTGlzdFdyYXBwZXIuaXNFbXB0eSh0aGlzLl9lbmRPZkJsb2NrSWR4cykpIHtcbiAgICAgIGxldCBlbmRPZkJsb2NrID0gTGlzdFdyYXBwZXIubGFzdCh0aGlzLl9lbmRPZkJsb2NrSWR4cyk7XG4gICAgICBpZiAocHJvdG9JbmRleCA9PT0gZW5kT2ZCbG9jaykge1xuICAgICAgICB0aGlzLl9lbmRPZkJsb2NrSWR4cy5wb3AoKTtcbiAgICAgICAgcmV0dXJuICd9JztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5EaXJlY3RpdmVMaWZlY3ljbGUocjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIGlmIChyLm5hbWUgPT09IFwiRG9DaGVja1wiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2VuT25DaGVjayhyKTtcbiAgICB9IGVsc2UgaWYgKHIubmFtZSA9PT0gXCJPbkluaXRcIikge1xuICAgICAgcmV0dXJuIHRoaXMuX2dlbk9uSW5pdChyKTtcbiAgICB9IGVsc2UgaWYgKHIubmFtZSA9PT0gXCJPbkNoYW5nZXNcIikge1xuICAgICAgcmV0dXJuIHRoaXMuX2dlbk9uQ2hhbmdlKHIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5rbm93biBsaWZlY3ljbGUgZXZlbnQgJyR7ci5uYW1lfSdgKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5QaXBlQ2hlY2socjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHZhciBjb250ZXh0ID0gdGhpcy5fbmFtZXMuZ2V0TG9jYWxOYW1lKHIuY29udGV4dEluZGV4KTtcbiAgICB2YXIgYXJnU3RyaW5nID0gci5hcmdzLm1hcCgoYXJnKSA9PiB0aGlzLl9uYW1lcy5nZXRMb2NhbE5hbWUoYXJnKSkuam9pbihcIiwgXCIpO1xuXG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5fbmFtZXMuZ2V0RmllbGROYW1lKHIuc2VsZkluZGV4KTtcbiAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLl9uYW1lcy5nZXRMb2NhbE5hbWUoci5zZWxmSW5kZXgpO1xuXG4gICAgdmFyIHBpcGUgPSB0aGlzLl9uYW1lcy5nZXRQaXBlTmFtZShyLnNlbGZJbmRleCk7XG4gICAgdmFyIHBpcGVOYW1lID0gci5uYW1lO1xuXG4gICAgdmFyIGluaXQgPSBgXG4gICAgICBpZiAoJHtwaXBlfSA9PT0gJHt0aGlzLmNoYW5nZURldGVjdGlvblV0aWxWYXJOYW1lfS51bmluaXRpYWxpemVkKSB7XG4gICAgICAgICR7cGlwZX0gPSAke3RoaXMuX25hbWVzLmdldFBpcGVzQWNjZXNzb3JOYW1lKCl9LmdldCgnJHtwaXBlTmFtZX0nKTtcbiAgICAgIH1cbiAgICBgO1xuICAgIHZhciByZWFkID0gYCR7bmV3VmFsdWV9ID0gJHtwaXBlfS5waXBlLnRyYW5zZm9ybSgke2NvbnRleHR9LCBbJHthcmdTdHJpbmd9XSk7YDtcblxuICAgIHZhciBjb250ZXhPckFyZ0NoZWNrID0gci5hcmdzLm1hcCgoYSkgPT4gdGhpcy5fbmFtZXMuZ2V0Q2hhbmdlTmFtZShhKSk7XG4gICAgY29udGV4T3JBcmdDaGVjay5wdXNoKHRoaXMuX25hbWVzLmdldENoYW5nZU5hbWUoci5jb250ZXh0SW5kZXgpKTtcbiAgICB2YXIgY29uZGl0aW9uID0gYCEke3BpcGV9LnB1cmUgfHwgKCR7Y29udGV4T3JBcmdDaGVjay5qb2luKFwiIHx8IFwiKX0pYDtcblxuICAgIHZhciBjaGVjayA9IGBcbiAgICAgIGlmICgke3RoaXMuY2hhbmdlRGV0ZWN0aW9uVXRpbFZhck5hbWV9Lmxvb3NlTm90SWRlbnRpY2FsKCR7b2xkVmFsdWV9LCAke25ld1ZhbHVlfSkpIHtcbiAgICAgICAgJHtuZXdWYWx1ZX0gPSAke3RoaXMuY2hhbmdlRGV0ZWN0aW9uVXRpbFZhck5hbWV9LnVud3JhcFZhbHVlKCR7bmV3VmFsdWV9KVxuICAgICAgICAke3RoaXMuX2dlbkNoYW5nZU1hcmtlcihyKX1cbiAgICAgICAgJHt0aGlzLl9nZW5VcGRhdGVEaXJlY3RpdmVPckVsZW1lbnQocil9XG4gICAgICAgICR7dGhpcy5fZ2VuQWRkVG9DaGFuZ2VzKHIpfVxuICAgICAgICAke29sZFZhbHVlfSA9ICR7bmV3VmFsdWV9O1xuICAgICAgfVxuICAgIGA7XG5cbiAgICB2YXIgZ2VuQ29kZSA9IHIuc2hvdWxkQmVDaGVja2VkKCkgPyBgJHtyZWFkfSR7Y2hlY2t9YCA6IHJlYWQ7XG5cbiAgICBpZiAoci5pc1VzZWRCeU90aGVyUmVjb3JkKCkpIHtcbiAgICAgIHJldHVybiBgJHtpbml0fSBpZiAoJHtjb25kaXRpb259KSB7ICR7Z2VuQ29kZX0gfSBlbHNlIHsgJHtuZXdWYWx1ZX0gPSAke29sZFZhbHVlfTsgfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgJHtpbml0fSBpZiAoJHtjb25kaXRpb259KSB7ICR7Z2VuQ29kZX0gfWA7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuUmVmZXJlbmNlQ2hlY2socjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX25hbWVzLmdldEZpZWxkTmFtZShyLnNlbGZJbmRleCk7XG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5fbmFtZXMuZ2V0TG9jYWxOYW1lKHIuc2VsZkluZGV4KTtcbiAgICB2YXIgcmVhZCA9IGBcbiAgICAgICR7dGhpcy5fbG9naWMuZ2VuUHJvcGVydHlCaW5kaW5nRXZhbFZhbHVlKHIpfVxuICAgIGA7XG5cbiAgICB2YXIgY2hlY2sgPSBgXG4gICAgICBpZiAoJHt0aGlzLmNoYW5nZURldGVjdGlvblV0aWxWYXJOYW1lfS5sb29zZU5vdElkZW50aWNhbCgke29sZFZhbHVlfSwgJHtuZXdWYWx1ZX0pKSB7XG4gICAgICAgICR7dGhpcy5fZ2VuQ2hhbmdlTWFya2VyKHIpfVxuICAgICAgICAke3RoaXMuX2dlblVwZGF0ZURpcmVjdGl2ZU9yRWxlbWVudChyKX1cbiAgICAgICAgJHt0aGlzLl9nZW5BZGRUb0NoYW5nZXMocil9XG4gICAgICAgICR7b2xkVmFsdWV9ID0gJHtuZXdWYWx1ZX07XG4gICAgICB9XG4gICAgYDtcblxuICAgIHZhciBnZW5Db2RlID0gci5zaG91bGRCZUNoZWNrZWQoKSA/IGAke3JlYWR9JHtjaGVja31gIDogcmVhZDtcblxuICAgIGlmIChyLmlzUHVyZUZ1bmN0aW9uKCkpIHtcbiAgICAgIHZhciBjb25kaXRpb24gPSByLmFyZ3MubWFwKChhKSA9PiB0aGlzLl9uYW1lcy5nZXRDaGFuZ2VOYW1lKGEpKS5qb2luKFwiIHx8IFwiKTtcbiAgICAgIGlmIChyLmlzVXNlZEJ5T3RoZXJSZWNvcmQoKSkge1xuICAgICAgICByZXR1cm4gYGlmICgke2NvbmRpdGlvbn0pIHsgJHtnZW5Db2RlfSB9IGVsc2UgeyAke25ld1ZhbHVlfSA9ICR7b2xkVmFsdWV9OyB9YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBgaWYgKCR7Y29uZGl0aW9ufSkgeyAke2dlbkNvZGV9IH1gO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2VuQ29kZTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5DaGFuZ2VNYXJrZXIocjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHJldHVybiByLmFyZ3VtZW50VG9QdXJlRnVuY3Rpb24gPyBgJHt0aGlzLl9uYW1lcy5nZXRDaGFuZ2VOYW1lKHIuc2VsZkluZGV4KX0gPSB0cnVlYCA6IGBgO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuVXBkYXRlRGlyZWN0aXZlT3JFbGVtZW50KHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICBpZiAoIXIubGFzdEluQmluZGluZykgcmV0dXJuIFwiXCI7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLl9uYW1lcy5nZXRMb2NhbE5hbWUoci5zZWxmSW5kZXgpO1xuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX25hbWVzLmdldEZpZWxkTmFtZShyLnNlbGZJbmRleCk7XG4gICAgdmFyIG5vdGlmeURlYnVnID0gdGhpcy5nZW5Db25maWcubG9nQmluZGluZ1VwZGF0ZSA/IGB0aGlzLmxvZ0JpbmRpbmdVcGRhdGUoJHtuZXdWYWx1ZX0pO2AgOiBcIlwiO1xuXG4gICAgdmFyIGJyID0gci5iaW5kaW5nUmVjb3JkO1xuICAgIGlmIChici50YXJnZXQuaXNEaXJlY3RpdmUoKSkge1xuICAgICAgdmFyIGRpcmVjdGl2ZVByb3BlcnR5ID1cbiAgICAgICAgICBgJHt0aGlzLl9uYW1lcy5nZXREaXJlY3RpdmVOYW1lKGJyLmRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCl9LiR7YnIudGFyZ2V0Lm5hbWV9YDtcbiAgICAgIHJldHVybiBgXG4gICAgICAgICR7dGhpcy5fZ2VuVGhyb3dPbkNoYW5nZUNoZWNrKG9sZFZhbHVlLCBuZXdWYWx1ZSl9XG4gICAgICAgICR7ZGlyZWN0aXZlUHJvcGVydHl9ID0gJHtuZXdWYWx1ZX07XG4gICAgICAgICR7bm90aWZ5RGVidWd9XG4gICAgICAgICR7SVNfQ0hBTkdFRF9MT0NBTH0gPSB0cnVlO1xuICAgICAgYDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBcbiAgICAgICAgJHt0aGlzLl9nZW5UaHJvd09uQ2hhbmdlQ2hlY2sob2xkVmFsdWUsIG5ld1ZhbHVlKX1cbiAgICAgICAgdGhpcy5ub3RpZnlEaXNwYXRjaGVyKCR7bmV3VmFsdWV9KTtcbiAgICAgICAgJHtub3RpZnlEZWJ1Z31cbiAgICAgIGA7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuVGhyb3dPbkNoYW5nZUNoZWNrKG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChhc3NlcnRpb25zRW5hYmxlZCgpKSB7XG4gICAgICByZXR1cm4gYFxuICAgICAgICBpZih0aHJvd09uQ2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy50aHJvd09uQ2hhbmdlRXJyb3IoJHtvbGRWYWx1ZX0sICR7bmV3VmFsdWV9KTtcbiAgICAgICAgfVxuICAgICAgICBgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuQWRkVG9DaGFuZ2VzKHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLl9uYW1lcy5nZXRMb2NhbE5hbWUoci5zZWxmSW5kZXgpO1xuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX25hbWVzLmdldEZpZWxkTmFtZShyLnNlbGZJbmRleCk7XG4gICAgaWYgKCFyLmJpbmRpbmdSZWNvcmQuY2FsbE9uQ2hhbmdlcygpKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gYCR7Q0hBTkdFU19MT0NBTH0gPSB0aGlzLmFkZENoYW5nZSgke0NIQU5HRVNfTE9DQUx9LCAke29sZFZhbHVlfSwgJHtuZXdWYWx1ZX0pO2A7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXliZUZpcnN0SW5CaW5kaW5nKHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICB2YXIgcHJldiA9IENoYW5nZURldGVjdGlvblV0aWwucHJvdG9CeUluZGV4KHRoaXMucmVjb3Jkcywgci5zZWxmSW5kZXggLSAxKTtcbiAgICB2YXIgZmlyc3RJbkJpbmRpbmcgPSBpc0JsYW5rKHByZXYpIHx8IHByZXYuYmluZGluZ1JlY29yZCAhPT0gci5iaW5kaW5nUmVjb3JkO1xuICAgIHJldHVybiBmaXJzdEluQmluZGluZyAmJiAhci5iaW5kaW5nUmVjb3JkLmlzRGlyZWN0aXZlTGlmZWN5Y2xlKCkgP1xuICAgICAgICAgICAgICAgYCR7dGhpcy5fbmFtZXMuZ2V0UHJvcGVydHlCaW5kaW5nSW5kZXgoKX0gPSAke3IucHJvcGVydHlCaW5kaW5nSW5kZXh9O2AgOlxuICAgICAgICAgICAgICAgJyc7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXliZUdlbkxhc3RJbkRpcmVjdGl2ZShyOiBQcm90b1JlY29yZCk6IHN0cmluZyB7XG4gICAgaWYgKCFyLmxhc3RJbkRpcmVjdGl2ZSkgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIGBcbiAgICAgICR7Q0hBTkdFU19MT0NBTH0gPSBudWxsO1xuICAgICAgJHt0aGlzLl9nZW5Ob3RpZnlPblB1c2hEZXRlY3RvcnMocil9XG4gICAgICAke0lTX0NIQU5HRURfTE9DQUx9ID0gZmFsc2U7XG4gICAgYDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlbk9uQ2hlY2socjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHZhciBiciA9IHIuYmluZGluZ1JlY29yZDtcbiAgICByZXR1cm4gYGlmICghdGhyb3dPbkNoYW5nZSkgJHt0aGlzLl9uYW1lcy5nZXREaXJlY3RpdmVOYW1lKGJyLmRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCl9Lm5nRG9DaGVjaygpO2A7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5PbkluaXQocjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHZhciBiciA9IHIuYmluZGluZ1JlY29yZDtcbiAgICByZXR1cm4gYGlmICghdGhyb3dPbkNoYW5nZSAmJiAke3RoaXMuX25hbWVzLmdldFN0YXRlTmFtZSgpfSA9PT0gJHt0aGlzLmNoYW5nZURldGVjdG9yU3RhdGVWYXJOYW1lfS5OZXZlckNoZWNrZWQpICR7dGhpcy5fbmFtZXMuZ2V0RGlyZWN0aXZlTmFtZShici5kaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpfS5uZ09uSW5pdCgpO2A7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5PbkNoYW5nZShyOiBQcm90b1JlY29yZCk6IHN0cmluZyB7XG4gICAgdmFyIGJyID0gci5iaW5kaW5nUmVjb3JkO1xuICAgIHJldHVybiBgaWYgKCF0aHJvd09uQ2hhbmdlICYmICR7Q0hBTkdFU19MT0NBTH0pICR7dGhpcy5fbmFtZXMuZ2V0RGlyZWN0aXZlTmFtZShici5kaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpfS5uZ09uQ2hhbmdlcygke0NIQU5HRVNfTE9DQUx9KTtgO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuTm90aWZ5T25QdXNoRGV0ZWN0b3JzKHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICB2YXIgYnIgPSByLmJpbmRpbmdSZWNvcmQ7XG4gICAgaWYgKCFyLmxhc3RJbkRpcmVjdGl2ZSB8fCBici5pc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb24oKSkgcmV0dXJuIFwiXCI7XG4gICAgdmFyIHJldFZhbCA9IGBcbiAgICAgIGlmKCR7SVNfQ0hBTkdFRF9MT0NBTH0pIHtcbiAgICAgICAgJHt0aGlzLl9uYW1lcy5nZXREZXRlY3Rvck5hbWUoYnIuZGlyZWN0aXZlUmVjb3JkLmRpcmVjdGl2ZUluZGV4KX0ubWFya0FzQ2hlY2tPbmNlKCk7XG4gICAgICB9XG4gICAgYDtcbiAgICByZXR1cm4gcmV0VmFsO1xuICB9XG59XG4iXX0=