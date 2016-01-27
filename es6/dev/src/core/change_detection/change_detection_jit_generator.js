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
      ${this._genThrowOnChangeCheck(oldValue, newValue)}
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
      ${this._genThrowOnChangeCheck(oldValue, newValue)}
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
        var notifyDebug = this.genConfig.logBindingUpdate ? `this.logBindingUpdate(${newValue});` : "";
        var br = r.bindingRecord;
        if (br.target.isDirective()) {
            var directiveProperty = `${this._names.getDirectiveName(br.directiveRecord.directiveIndex)}.${br.target.name}`;
            return `
        ${directiveProperty} = ${newValue};
        ${notifyDebug}
        ${IS_CHANGED_LOCAL} = true;
      `;
        }
        else {
            return `
        this.notifyDispatcher(${newValue});
        ${notifyDebug}
      `;
        }
    }
    /** @internal */
    _genThrowOnChangeCheck(oldValue, newValue) {
        if (assertionsEnabled()) {
            return `
        if (throwOnChange && !${this.changeDetectionUtilVarName}.devModeEqual(${oldValue}, ${newValue})) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlX2RldGVjdGlvbl9qaXRfZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uX2ppdF9nZW5lcmF0b3IudHMiXSwibmFtZXMiOlsiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5jb25zdHJ1Y3RvciIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLmdlbmVyYXRlIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuZ2VuZXJhdGVTb3VyY2UiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuUHJvcGVydHlCaW5kaW5nVGFyZ2V0cyIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5EaXJlY3RpdmVJbmRpY2VzIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX21heWJlR2VuSGFuZGxlRXZlbnRJbnRlcm5hbCIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5FdmVudEJpbmRpbmciLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuRXZlbnRCaW5kaW5nRXZhbCIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5NYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlblVwZGF0ZVByZXZlbnREZWZhdWx0IiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX21heWJlR2VuRGVoeWRyYXRlRGlyZWN0aXZlcyIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9tYXliZUdlbkh5ZHJhdGVEaXJlY3RpdmVzIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX21heWJlR2VuQWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX21heWJlR2VuQWZ0ZXJWaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlbkFsbFJlY29yZHMiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuQ29uZGl0aW9uYWxTa2lwIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlblVuY29uZGl0aW9uYWxTa2lwIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlbkVuZE9mU2tpcEJsb2NrIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlbkRpcmVjdGl2ZUxpZmVjeWNsZSIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5QaXBlQ2hlY2siLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuUmVmZXJlbmNlQ2hlY2siLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuQ2hhbmdlTWFya2VyIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX2dlblVwZGF0ZURpcmVjdGl2ZU9yRWxlbWVudCIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5UaHJvd09uQ2hhbmdlQ2hlY2siLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuQWRkVG9DaGFuZ2VzIiwiQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3IuX21heWJlRmlyc3RJbkJpbmRpbmciLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fbWF5YmVHZW5MYXN0SW5EaXJlY3RpdmUiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuT25DaGVjayIsIkNoYW5nZURldGVjdG9ySklUR2VuZXJhdG9yLl9nZW5PbkluaXQiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuT25DaGFuZ2UiLCJDaGFuZ2VEZXRlY3RvckpJVEdlbmVyYXRvci5fZ2VuTm90aWZ5T25QdXNoRGV0ZWN0b3JzIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFPLGlCQUFpQixFQUFFLE9BQU8sRUFB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QUFDQTtJQUNySkEsQ0FBQ0E7SUFFRDlCLGdCQUFnQkE7SUFDaEJBLHlCQUF5QkEsQ0FBQ0EsQ0FBY0E7UUFDdEMrQixJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUN6QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZUFBZUEsSUFBSUEsRUFBRUEsQ0FBQ0Esd0JBQXdCQSxFQUFFQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUNuRUEsSUFBSUEsTUFBTUEsR0FBR0E7V0FDTkEsZ0JBQWdCQTtVQUNqQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7O0tBRW5FQSxDQUFDQTtRQUNGQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7QUFDSC9CLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIGFzc2VydGlvbnNFbmFibGVkLCBpc0JsYW5rLCBpc1ByZXNlbnQsIFN0cmluZ1dyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge0Fic3RyYWN0Q2hhbmdlRGV0ZWN0b3J9IGZyb20gJy4vYWJzdHJhY3RfY2hhbmdlX2RldGVjdG9yJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uVXRpbH0gZnJvbSAnLi9jaGFuZ2VfZGV0ZWN0aW9uX3V0aWwnO1xuaW1wb3J0IHtEaXJlY3RpdmVJbmRleCwgRGlyZWN0aXZlUmVjb3JkfSBmcm9tICcuL2RpcmVjdGl2ZV9yZWNvcmQnO1xuXG5pbXBvcnQge1Byb3RvUmVjb3JkLCBSZWNvcmRUeXBlfSBmcm9tICcuL3Byb3RvX3JlY29yZCc7XG5pbXBvcnQge0NvZGVnZW5OYW1lVXRpbCwgc2FuaXRpemVOYW1lfSBmcm9tICcuL2NvZGVnZW5fbmFtZV91dGlsJztcbmltcG9ydCB7Q29kZWdlbkxvZ2ljVXRpbH0gZnJvbSAnLi9jb2RlZ2VuX2xvZ2ljX3V0aWwnO1xuaW1wb3J0IHtjb2RpZnl9IGZyb20gJy4vY29kZWdlbl9mYWNhZGUnO1xuaW1wb3J0IHtFdmVudEJpbmRpbmd9IGZyb20gJy4vZXZlbnRfYmluZGluZyc7XG5pbXBvcnQge0JpbmRpbmdUYXJnZXR9IGZyb20gJy4vYmluZGluZ19yZWNvcmQnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvckdlbkNvbmZpZywgQ2hhbmdlRGV0ZWN0b3JEZWZpbml0aW9ufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ2hhbmdlRGV0ZWN0b3JTdGF0ZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtjcmVhdGVQcm9wZXJ0eVJlY29yZHMsIGNyZWF0ZUV2ZW50UmVjb3Jkc30gZnJvbSAnLi9wcm90b19jaGFuZ2VfZGV0ZWN0b3InO1xuXG4vKipcbiAqIFRoZSBjb2RlIGdlbmVyYXRvciB0YWtlcyBhIGxpc3Qgb2YgcHJvdG8gcmVjb3JkcyBhbmQgY3JlYXRlcyBhIGZ1bmN0aW9uL2NsYXNzXG4gKiB0aGF0IFwiZW11bGF0ZXNcIiB3aGF0IHRoZSBkZXZlbG9wZXIgd291bGQgd3JpdGUgYnkgaGFuZCB0byBpbXBsZW1lbnQgdGhlIHNhbWVcbiAqIGtpbmQgb2YgYmVoYXZpb3VyLlxuICpcbiAqIFRoaXMgY29kZSBzaG91bGQgYmUga2VwdCBpbiBzeW5jIHdpdGggdGhlIERhcnQgdHJhbnNmb3JtZXInc1xuICogYGFuZ3VsYXIyLnRyYW5zZm9ybS50ZW1wbGF0ZV9jb21waWxlci5jaGFuZ2VfZGV0ZWN0b3JfY29kZWdlbmAgbGlicmFyeS4gSWYgeW91IG1ha2UgdXBkYXRlc1xuICogaGVyZSwgcGxlYXNlIG1ha2UgZXF1aXZhbGVudCBjaGFuZ2VzIHRoZXJlLlxuKi9cbmNvbnN0IElTX0NIQU5HRURfTE9DQUwgPSBcImlzQ2hhbmdlZFwiO1xuY29uc3QgQ0hBTkdFU19MT0NBTCA9IFwiY2hhbmdlc1wiO1xuXG5leHBvcnQgY2xhc3MgQ2hhbmdlRGV0ZWN0b3JKSVRHZW5lcmF0b3Ige1xuICBwcml2YXRlIF9sb2dpYzogQ29kZWdlbkxvZ2ljVXRpbDtcbiAgcHJpdmF0ZSBfbmFtZXM6IENvZGVnZW5OYW1lVXRpbDtcbiAgcHJpdmF0ZSBfZW5kT2ZCbG9ja0lkeHM6IG51bWJlcltdO1xuICBwcml2YXRlIGlkOiBzdHJpbmc7XG4gIHByaXZhdGUgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5O1xuICBwcml2YXRlIHJlY29yZHM6IFByb3RvUmVjb3JkW107XG4gIHByaXZhdGUgcHJvcGVydHlCaW5kaW5nVGFyZ2V0czogQmluZGluZ1RhcmdldFtdO1xuICBwcml2YXRlIGV2ZW50QmluZGluZ3M6IEV2ZW50QmluZGluZ1tdO1xuICBwcml2YXRlIGRpcmVjdGl2ZVJlY29yZHM6IGFueVtdO1xuICBwcml2YXRlIGdlbkNvbmZpZzogQ2hhbmdlRGV0ZWN0b3JHZW5Db25maWc7XG4gIHR5cGVOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZGVmaW5pdGlvbjogQ2hhbmdlRGV0ZWN0b3JEZWZpbml0aW9uLCBwcml2YXRlIGNoYW5nZURldGVjdGlvblV0aWxWYXJOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHByaXZhdGUgYWJzdHJhY3RDaGFuZ2VEZXRlY3RvclZhck5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvclN0YXRlVmFyTmFtZTogc3RyaW5nKSB7XG4gICAgdmFyIHByb3BlcnR5QmluZGluZ1JlY29yZHMgPSBjcmVhdGVQcm9wZXJ0eVJlY29yZHMoZGVmaW5pdGlvbik7XG4gICAgdmFyIGV2ZW50QmluZGluZ1JlY29yZHMgPSBjcmVhdGVFdmVudFJlY29yZHMoZGVmaW5pdGlvbik7XG4gICAgdmFyIHByb3BlcnR5QmluZGluZ1RhcmdldHMgPSBkZWZpbml0aW9uLmJpbmRpbmdSZWNvcmRzLm1hcChiID0+IGIudGFyZ2V0KTtcbiAgICB0aGlzLmlkID0gZGVmaW5pdGlvbi5pZDtcbiAgICB0aGlzLmNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID0gZGVmaW5pdGlvbi5zdHJhdGVneTtcbiAgICB0aGlzLmdlbkNvbmZpZyA9IGRlZmluaXRpb24uZ2VuQ29uZmlnO1xuXG4gICAgdGhpcy5yZWNvcmRzID0gcHJvcGVydHlCaW5kaW5nUmVjb3JkcztcbiAgICB0aGlzLnByb3BlcnR5QmluZGluZ1RhcmdldHMgPSBwcm9wZXJ0eUJpbmRpbmdUYXJnZXRzO1xuICAgIHRoaXMuZXZlbnRCaW5kaW5ncyA9IGV2ZW50QmluZGluZ1JlY29yZHM7XG4gICAgdGhpcy5kaXJlY3RpdmVSZWNvcmRzID0gZGVmaW5pdGlvbi5kaXJlY3RpdmVSZWNvcmRzO1xuICAgIHRoaXMuX25hbWVzID0gbmV3IENvZGVnZW5OYW1lVXRpbCh0aGlzLnJlY29yZHMsIHRoaXMuZXZlbnRCaW5kaW5ncywgdGhpcy5kaXJlY3RpdmVSZWNvcmRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZURldGVjdGlvblV0aWxWYXJOYW1lKTtcbiAgICB0aGlzLl9sb2dpYyA9XG4gICAgICAgIG5ldyBDb2RlZ2VuTG9naWNVdGlsKHRoaXMuX25hbWVzLCB0aGlzLmNoYW5nZURldGVjdGlvblV0aWxWYXJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZURldGVjdG9yU3RhdGVWYXJOYW1lLCB0aGlzLmNoYW5nZURldGVjdGlvblN0cmF0ZWd5KTtcbiAgICB0aGlzLnR5cGVOYW1lID0gc2FuaXRpemVOYW1lKGBDaGFuZ2VEZXRlY3Rvcl8ke3RoaXMuaWR9YCk7XG4gIH1cblxuICBnZW5lcmF0ZSgpOiBGdW5jdGlvbiB7XG4gICAgdmFyIGZhY3RvcnlTb3VyY2UgPSBgXG4gICAgICAke3RoaXMuZ2VuZXJhdGVTb3VyY2UoKX1cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyAke3RoaXMudHlwZU5hbWV9KCk7XG4gICAgICB9XG4gICAgYDtcbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKHRoaXMuYWJzdHJhY3RDaGFuZ2VEZXRlY3RvclZhck5hbWUsIHRoaXMuY2hhbmdlRGV0ZWN0aW9uVXRpbFZhck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZURldGVjdG9yU3RhdGVWYXJOYW1lLCBmYWN0b3J5U291cmNlKShcbiAgICAgICAgQWJzdHJhY3RDaGFuZ2VEZXRlY3RvciwgQ2hhbmdlRGV0ZWN0aW9uVXRpbCwgQ2hhbmdlRGV0ZWN0b3JTdGF0ZSk7XG4gIH1cblxuICBnZW5lcmF0ZVNvdXJjZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgXG4gICAgICB2YXIgJHt0aGlzLnR5cGVOYW1lfSA9IGZ1bmN0aW9uICR7dGhpcy50eXBlTmFtZX0oKSB7XG4gICAgICAgICR7dGhpcy5hYnN0cmFjdENoYW5nZURldGVjdG9yVmFyTmFtZX0uY2FsbChcbiAgICAgICAgICAgIHRoaXMsICR7SlNPTi5zdHJpbmdpZnkodGhpcy5pZCl9LCAke3RoaXMucmVjb3Jkcy5sZW5ndGh9LFxuICAgICAgICAgICAgJHt0aGlzLnR5cGVOYW1lfS5nZW5fcHJvcGVydHlCaW5kaW5nVGFyZ2V0cywgJHt0aGlzLnR5cGVOYW1lfS5nZW5fZGlyZWN0aXZlSW5kaWNlcyxcbiAgICAgICAgICAgICR7Y29kaWZ5KHRoaXMuY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kpfSk7XG4gICAgICAgIHRoaXMuZGVoeWRyYXRlRGlyZWN0aXZlcyhmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgICR7dGhpcy50eXBlTmFtZX0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSgke3RoaXMuYWJzdHJhY3RDaGFuZ2VEZXRlY3RvclZhck5hbWV9LnByb3RvdHlwZSk7XG5cbiAgICAgICR7dGhpcy50eXBlTmFtZX0ucHJvdG90eXBlLmRldGVjdENoYW5nZXNJblJlY29yZHNJbnRlcm5hbCA9IGZ1bmN0aW9uKHRocm93T25DaGFuZ2UpIHtcbiAgICAgICAgJHt0aGlzLl9uYW1lcy5nZW5Jbml0TG9jYWxzKCl9XG4gICAgICAgIHZhciAke0lTX0NIQU5HRURfTE9DQUx9ID0gZmFsc2U7XG4gICAgICAgIHZhciAke0NIQU5HRVNfTE9DQUx9ID0gbnVsbDtcblxuICAgICAgICAke3RoaXMuX2dlbkFsbFJlY29yZHModGhpcy5yZWNvcmRzKX1cbiAgICAgIH1cblxuICAgICAgJHt0aGlzLl9tYXliZUdlbkhhbmRsZUV2ZW50SW50ZXJuYWwoKX1cblxuICAgICAgJHt0aGlzLl9tYXliZUdlbkFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrcygpfVxuXG4gICAgICAke3RoaXMuX21heWJlR2VuQWZ0ZXJWaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzKCl9XG5cbiAgICAgICR7dGhpcy5fbWF5YmVHZW5IeWRyYXRlRGlyZWN0aXZlcygpfVxuXG4gICAgICAke3RoaXMuX21heWJlR2VuRGVoeWRyYXRlRGlyZWN0aXZlcygpfVxuXG4gICAgICAke3RoaXMuX2dlblByb3BlcnR5QmluZGluZ1RhcmdldHMoKX1cblxuICAgICAgJHt0aGlzLl9nZW5EaXJlY3RpdmVJbmRpY2VzKCl9XG4gICAgYDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlblByb3BlcnR5QmluZGluZ1RhcmdldHMoKTogc3RyaW5nIHtcbiAgICB2YXIgdGFyZ2V0cyA9IHRoaXMuX2xvZ2ljLmdlblByb3BlcnR5QmluZGluZ1RhcmdldHModGhpcy5wcm9wZXJ0eUJpbmRpbmdUYXJnZXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbkNvbmZpZy5nZW5EZWJ1Z0luZm8pO1xuICAgIHJldHVybiBgJHt0aGlzLnR5cGVOYW1lfS5nZW5fcHJvcGVydHlCaW5kaW5nVGFyZ2V0cyA9ICR7dGFyZ2V0c307YDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlbkRpcmVjdGl2ZUluZGljZXMoKTogc3RyaW5nIHtcbiAgICB2YXIgaW5kaWNlcyA9IHRoaXMuX2xvZ2ljLmdlbkRpcmVjdGl2ZUluZGljZXModGhpcy5kaXJlY3RpdmVSZWNvcmRzKTtcbiAgICByZXR1cm4gYCR7dGhpcy50eXBlTmFtZX0uZ2VuX2RpcmVjdGl2ZUluZGljZXMgPSAke2luZGljZXN9O2A7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXliZUdlbkhhbmRsZUV2ZW50SW50ZXJuYWwoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5ldmVudEJpbmRpbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuZXZlbnRCaW5kaW5ncy5tYXAoZWIgPT4gdGhpcy5fZ2VuRXZlbnRCaW5kaW5nKGViKSkuam9pbihcIlxcblwiKTtcbiAgICAgIHJldHVybiBgXG4gICAgICAgICR7dGhpcy50eXBlTmFtZX0ucHJvdG90eXBlLmhhbmRsZUV2ZW50SW50ZXJuYWwgPSBmdW5jdGlvbihldmVudE5hbWUsIGVsSW5kZXgsIGxvY2Fscykge1xuICAgICAgICAgIHZhciAke3RoaXMuX25hbWVzLmdldFByZXZlbnREZWZhdWx0QWNjZXNvcigpfSA9IGZhbHNlO1xuICAgICAgICAgICR7dGhpcy5fbmFtZXMuZ2VuSW5pdEV2ZW50TG9jYWxzKCl9XG4gICAgICAgICAgJHtoYW5kbGVyc31cbiAgICAgICAgICByZXR1cm4gJHt0aGlzLl9uYW1lcy5nZXRQcmV2ZW50RGVmYXVsdEFjY2Vzb3IoKX07XG4gICAgICAgIH1cbiAgICAgIGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5FdmVudEJpbmRpbmcoZWI6IEV2ZW50QmluZGluZyk6IHN0cmluZyB7XG4gICAgbGV0IGNvZGVzOiBTdHJpbmdbXSA9IFtdO1xuICAgIHRoaXMuX2VuZE9mQmxvY2tJZHhzID0gW107XG5cbiAgICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KGViLnJlY29yZHMsIChyLCBpKSA9PiB7XG4gICAgICBsZXQgY29kZTtcblxuICAgICAgaWYgKHIuaXNDb25kaXRpb25hbFNraXBSZWNvcmQoKSkge1xuICAgICAgICBjb2RlID0gdGhpcy5fZ2VuQ29uZGl0aW9uYWxTa2lwKHIsIHRoaXMuX25hbWVzLmdldEV2ZW50TG9jYWxOYW1lKGViLCBpKSk7XG4gICAgICB9IGVsc2UgaWYgKHIuaXNVbmNvbmRpdGlvbmFsU2tpcFJlY29yZCgpKSB7XG4gICAgICAgIGNvZGUgPSB0aGlzLl9nZW5VbmNvbmRpdGlvbmFsU2tpcChyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvZGUgPSB0aGlzLl9nZW5FdmVudEJpbmRpbmdFdmFsKGViLCByKTtcbiAgICAgIH1cblxuICAgICAgY29kZSArPSB0aGlzLl9nZW5FbmRPZlNraXBCbG9jayhpKTtcblxuICAgICAgY29kZXMucHVzaChjb2RlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBgXG4gICAgaWYgKGV2ZW50TmFtZSA9PT0gXCIke2ViLmV2ZW50TmFtZX1cIiAmJiBlbEluZGV4ID09PSAke2ViLmVsSW5kZXh9KSB7XG4gICAgICAke2NvZGVzLmpvaW4oXCJcXG5cIil9XG4gICAgfWA7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5FdmVudEJpbmRpbmdFdmFsKGViOiBFdmVudEJpbmRpbmcsIHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICBpZiAoci5sYXN0SW5CaW5kaW5nKSB7XG4gICAgICB2YXIgZXZhbFJlY29yZCA9IHRoaXMuX2xvZ2ljLmdlbkV2ZW50QmluZGluZ0V2YWxWYWx1ZShlYiwgcik7XG4gICAgICB2YXIgbWFya1BhdGggPSB0aGlzLl9nZW5NYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKHIpO1xuICAgICAgdmFyIHByZXZEZWZhdWx0ID0gdGhpcy5fZ2VuVXBkYXRlUHJldmVudERlZmF1bHQoZWIsIHIpO1xuICAgICAgcmV0dXJuIGAke2V2YWxSZWNvcmR9XFxuJHttYXJrUGF0aH1cXG4ke3ByZXZEZWZhdWx0fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9sb2dpYy5nZW5FdmVudEJpbmRpbmdFdmFsVmFsdWUoZWIsIHIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlbk1hcmtQYXRoVG9Sb290QXNDaGVja09uY2UocjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHZhciBiciA9IHIuYmluZGluZ1JlY29yZDtcbiAgICBpZiAoYnIuaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uKCkpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5fbmFtZXMuZ2V0RGV0ZWN0b3JOYW1lKGJyLmRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCl9Lm1hcmtQYXRoVG9Sb290QXNDaGVja09uY2UoKTtgO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlblVwZGF0ZVByZXZlbnREZWZhdWx0KGViOiBFdmVudEJpbmRpbmcsIHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICB2YXIgbG9jYWwgPSB0aGlzLl9uYW1lcy5nZXRFdmVudExvY2FsTmFtZShlYiwgci5zZWxmSW5kZXgpO1xuICAgIHJldHVybiBgaWYgKCR7bG9jYWx9ID09PSBmYWxzZSkgeyAke3RoaXMuX25hbWVzLmdldFByZXZlbnREZWZhdWx0QWNjZXNvcigpfSA9IHRydWV9O2A7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXliZUdlbkRlaHlkcmF0ZURpcmVjdGl2ZXMoKTogc3RyaW5nIHtcbiAgICB2YXIgZGVzdHJveVBpcGVzQ29kZSA9IHRoaXMuX25hbWVzLmdlblBpcGVPbkRlc3Ryb3koKTtcbiAgICB2YXIgZGVzdHJveURpcmVjdGl2ZXNDb2RlID0gdGhpcy5fbG9naWMuZ2VuRGlyZWN0aXZlc09uRGVzdHJveSh0aGlzLmRpcmVjdGl2ZVJlY29yZHMpO1xuICAgIHZhciBkZWh5ZHJhdGVGaWVsZHNDb2RlID0gdGhpcy5fbmFtZXMuZ2VuRGVoeWRyYXRlRmllbGRzKCk7XG4gICAgaWYgKCFkZXN0cm95UGlwZXNDb2RlICYmICFkZXN0cm95RGlyZWN0aXZlc0NvZGUgJiYgIWRlaHlkcmF0ZUZpZWxkc0NvZGUpIHJldHVybiAnJztcbiAgICByZXR1cm4gYCR7dGhpcy50eXBlTmFtZX0ucHJvdG90eXBlLmRlaHlkcmF0ZURpcmVjdGl2ZXMgPSBmdW5jdGlvbihkZXN0cm95UGlwZXMpIHtcbiAgICAgICAgaWYgKGRlc3Ryb3lQaXBlcykge1xuICAgICAgICAgICR7ZGVzdHJveVBpcGVzQ29kZX1cbiAgICAgICAgICAke2Rlc3Ryb3lEaXJlY3RpdmVzQ29kZX1cbiAgICAgICAgfVxuICAgICAgICAke2RlaHlkcmF0ZUZpZWxkc0NvZGV9XG4gICAgfWA7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXliZUdlbkh5ZHJhdGVEaXJlY3RpdmVzKCk6IHN0cmluZyB7XG4gICAgdmFyIGh5ZHJhdGVEaXJlY3RpdmVzQ29kZSA9IHRoaXMuX2xvZ2ljLmdlbkh5ZHJhdGVEaXJlY3RpdmVzKHRoaXMuZGlyZWN0aXZlUmVjb3Jkcyk7XG4gICAgdmFyIGh5ZHJhdGVEZXRlY3RvcnNDb2RlID0gdGhpcy5fbG9naWMuZ2VuSHlkcmF0ZURldGVjdG9ycyh0aGlzLmRpcmVjdGl2ZVJlY29yZHMpO1xuICAgIGlmICghaHlkcmF0ZURpcmVjdGl2ZXNDb2RlICYmICFoeWRyYXRlRGV0ZWN0b3JzQ29kZSkgcmV0dXJuICcnO1xuICAgIHJldHVybiBgJHt0aGlzLnR5cGVOYW1lfS5wcm90b3R5cGUuaHlkcmF0ZURpcmVjdGl2ZXMgPSBmdW5jdGlvbihkaXJlY3RpdmVzKSB7XG4gICAgICAke2h5ZHJhdGVEaXJlY3RpdmVzQ29kZX1cbiAgICAgICR7aHlkcmF0ZURldGVjdG9yc0NvZGV9XG4gICAgfWA7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXliZUdlbkFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrcygpOiBzdHJpbmcge1xuICAgIHZhciBub3RpZmljYXRpb25zID0gdGhpcy5fbG9naWMuZ2VuQ29udGVudExpZmVjeWNsZUNhbGxiYWNrcyh0aGlzLmRpcmVjdGl2ZVJlY29yZHMpO1xuICAgIGlmIChub3RpZmljYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBkaXJlY3RpdmVOb3RpZmljYXRpb25zID0gbm90aWZpY2F0aW9ucy5qb2luKFwiXFxuXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgICAgJHt0aGlzLnR5cGVOYW1lfS5wcm90b3R5cGUuYWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzSW50ZXJuYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAke2RpcmVjdGl2ZU5vdGlmaWNhdGlvbnN9XG4gICAgICAgIH1cbiAgICAgIGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXliZUdlbkFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrcygpOiBzdHJpbmcge1xuICAgIHZhciBub3RpZmljYXRpb25zID0gdGhpcy5fbG9naWMuZ2VuVmlld0xpZmVjeWNsZUNhbGxiYWNrcyh0aGlzLmRpcmVjdGl2ZVJlY29yZHMpO1xuICAgIGlmIChub3RpZmljYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBkaXJlY3RpdmVOb3RpZmljYXRpb25zID0gbm90aWZpY2F0aW9ucy5qb2luKFwiXFxuXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgICAgJHt0aGlzLnR5cGVOYW1lfS5wcm90b3R5cGUuYWZ0ZXJWaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzSW50ZXJuYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAke2RpcmVjdGl2ZU5vdGlmaWNhdGlvbnN9XG4gICAgICAgIH1cbiAgICAgIGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5BbGxSZWNvcmRzKHJzOiBQcm90b1JlY29yZFtdKTogc3RyaW5nIHtcbiAgICB2YXIgY29kZXM6IFN0cmluZ1tdID0gW107XG4gICAgdGhpcy5fZW5kT2ZCbG9ja0lkeHMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBjb2RlO1xuICAgICAgbGV0IHIgPSByc1tpXTtcblxuICAgICAgaWYgKHIuaXNMaWZlQ3ljbGVSZWNvcmQoKSkge1xuICAgICAgICBjb2RlID0gdGhpcy5fZ2VuRGlyZWN0aXZlTGlmZWN5Y2xlKHIpO1xuICAgICAgfSBlbHNlIGlmIChyLmlzUGlwZVJlY29yZCgpKSB7XG4gICAgICAgIGNvZGUgPSB0aGlzLl9nZW5QaXBlQ2hlY2socik7XG4gICAgICB9IGVsc2UgaWYgKHIuaXNDb25kaXRpb25hbFNraXBSZWNvcmQoKSkge1xuICAgICAgICBjb2RlID0gdGhpcy5fZ2VuQ29uZGl0aW9uYWxTa2lwKHIsIHRoaXMuX25hbWVzLmdldExvY2FsTmFtZShyLmNvbnRleHRJbmRleCkpO1xuICAgICAgfSBlbHNlIGlmIChyLmlzVW5jb25kaXRpb25hbFNraXBSZWNvcmQoKSkge1xuICAgICAgICBjb2RlID0gdGhpcy5fZ2VuVW5jb25kaXRpb25hbFNraXAocik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2RlID0gdGhpcy5fZ2VuUmVmZXJlbmNlQ2hlY2socik7XG4gICAgICB9XG5cbiAgICAgIGNvZGUgPSBgXG4gICAgICAgICR7dGhpcy5fbWF5YmVGaXJzdEluQmluZGluZyhyKX1cbiAgICAgICAgJHtjb2RlfVxuICAgICAgICAke3RoaXMuX21heWJlR2VuTGFzdEluRGlyZWN0aXZlKHIpfVxuICAgICAgICAke3RoaXMuX2dlbkVuZE9mU2tpcEJsb2NrKGkpfVxuICAgICAgYDtcblxuICAgICAgY29kZXMucHVzaChjb2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29kZXMuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlbkNvbmRpdGlvbmFsU2tpcChyOiBQcm90b1JlY29yZCwgY29uZGl0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBtYXliZU5lZ2F0ZSA9IHIubW9kZSA9PT0gUmVjb3JkVHlwZS5Ta2lwUmVjb3Jkc0lmID8gJyEnIDogJyc7XG4gICAgdGhpcy5fZW5kT2ZCbG9ja0lkeHMucHVzaChyLmZpeGVkQXJnc1swXSAtIDEpO1xuXG4gICAgcmV0dXJuIGBpZiAoJHttYXliZU5lZ2F0ZX0ke2NvbmRpdGlvbn0pIHtgO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuVW5jb25kaXRpb25hbFNraXAocjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHRoaXMuX2VuZE9mQmxvY2tJZHhzLnBvcCgpO1xuICAgIHRoaXMuX2VuZE9mQmxvY2tJZHhzLnB1c2goci5maXhlZEFyZ3NbMF0gLSAxKTtcbiAgICByZXR1cm4gYH0gZWxzZSB7YDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlbkVuZE9mU2tpcEJsb2NrKHByb3RvSW5kZXg6IG51bWJlcik6IHN0cmluZyB7XG4gICAgaWYgKCFMaXN0V3JhcHBlci5pc0VtcHR5KHRoaXMuX2VuZE9mQmxvY2tJZHhzKSkge1xuICAgICAgbGV0IGVuZE9mQmxvY2sgPSBMaXN0V3JhcHBlci5sYXN0KHRoaXMuX2VuZE9mQmxvY2tJZHhzKTtcbiAgICAgIGlmIChwcm90b0luZGV4ID09PSBlbmRPZkJsb2NrKSB7XG4gICAgICAgIHRoaXMuX2VuZE9mQmxvY2tJZHhzLnBvcCgpO1xuICAgICAgICByZXR1cm4gJ30nO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlbkRpcmVjdGl2ZUxpZmVjeWNsZShyOiBQcm90b1JlY29yZCk6IHN0cmluZyB7XG4gICAgaWYgKHIubmFtZSA9PT0gXCJEb0NoZWNrXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZW5PbkNoZWNrKHIpO1xuICAgIH0gZWxzZSBpZiAoci5uYW1lID09PSBcIk9uSW5pdFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2VuT25Jbml0KHIpO1xuICAgIH0gZWxzZSBpZiAoci5uYW1lID09PSBcIk9uQ2hhbmdlc1wiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2VuT25DaGFuZ2Uocik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBVbmtub3duIGxpZmVjeWNsZSBldmVudCAnJHtyLm5hbWV9J2ApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlblBpcGVDaGVjayhyOiBQcm90b1JlY29yZCk6IHN0cmluZyB7XG4gICAgdmFyIGNvbnRleHQgPSB0aGlzLl9uYW1lcy5nZXRMb2NhbE5hbWUoci5jb250ZXh0SW5kZXgpO1xuICAgIHZhciBhcmdTdHJpbmcgPSByLmFyZ3MubWFwKChhcmcpID0+IHRoaXMuX25hbWVzLmdldExvY2FsTmFtZShhcmcpKS5qb2luKFwiLCBcIik7XG5cbiAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLl9uYW1lcy5nZXRGaWVsZE5hbWUoci5zZWxmSW5kZXgpO1xuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuX25hbWVzLmdldExvY2FsTmFtZShyLnNlbGZJbmRleCk7XG5cbiAgICB2YXIgcGlwZSA9IHRoaXMuX25hbWVzLmdldFBpcGVOYW1lKHIuc2VsZkluZGV4KTtcbiAgICB2YXIgcGlwZU5hbWUgPSByLm5hbWU7XG5cbiAgICB2YXIgaW5pdCA9IGBcbiAgICAgIGlmICgke3BpcGV9ID09PSAke3RoaXMuY2hhbmdlRGV0ZWN0aW9uVXRpbFZhck5hbWV9LnVuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgJHtwaXBlfSA9ICR7dGhpcy5fbmFtZXMuZ2V0UGlwZXNBY2Nlc3Nvck5hbWUoKX0uZ2V0KCcke3BpcGVOYW1lfScpO1xuICAgICAgfVxuICAgIGA7XG4gICAgdmFyIHJlYWQgPSBgJHtuZXdWYWx1ZX0gPSAke3BpcGV9LnBpcGUudHJhbnNmb3JtKCR7Y29udGV4dH0sIFske2FyZ1N0cmluZ31dKTtgO1xuXG4gICAgdmFyIGNvbnRleE9yQXJnQ2hlY2sgPSByLmFyZ3MubWFwKChhKSA9PiB0aGlzLl9uYW1lcy5nZXRDaGFuZ2VOYW1lKGEpKTtcbiAgICBjb250ZXhPckFyZ0NoZWNrLnB1c2godGhpcy5fbmFtZXMuZ2V0Q2hhbmdlTmFtZShyLmNvbnRleHRJbmRleCkpO1xuICAgIHZhciBjb25kaXRpb24gPSBgISR7cGlwZX0ucHVyZSB8fCAoJHtjb250ZXhPckFyZ0NoZWNrLmpvaW4oXCIgfHwgXCIpfSlgO1xuXG4gICAgdmFyIGNoZWNrID0gYFxuICAgICAgJHt0aGlzLl9nZW5UaHJvd09uQ2hhbmdlQ2hlY2sob2xkVmFsdWUsIG5ld1ZhbHVlKX1cbiAgICAgIGlmICgke3RoaXMuY2hhbmdlRGV0ZWN0aW9uVXRpbFZhck5hbWV9Lmxvb3NlTm90SWRlbnRpY2FsKCR7b2xkVmFsdWV9LCAke25ld1ZhbHVlfSkpIHtcbiAgICAgICAgJHtuZXdWYWx1ZX0gPSAke3RoaXMuY2hhbmdlRGV0ZWN0aW9uVXRpbFZhck5hbWV9LnVud3JhcFZhbHVlKCR7bmV3VmFsdWV9KVxuICAgICAgICAke3RoaXMuX2dlbkNoYW5nZU1hcmtlcihyKX1cbiAgICAgICAgJHt0aGlzLl9nZW5VcGRhdGVEaXJlY3RpdmVPckVsZW1lbnQocil9XG4gICAgICAgICR7dGhpcy5fZ2VuQWRkVG9DaGFuZ2VzKHIpfVxuICAgICAgICAke29sZFZhbHVlfSA9ICR7bmV3VmFsdWV9O1xuICAgICAgfVxuICAgIGA7XG5cbiAgICB2YXIgZ2VuQ29kZSA9IHIuc2hvdWxkQmVDaGVja2VkKCkgPyBgJHtyZWFkfSR7Y2hlY2t9YCA6IHJlYWQ7XG5cbiAgICBpZiAoci5pc1VzZWRCeU90aGVyUmVjb3JkKCkpIHtcbiAgICAgIHJldHVybiBgJHtpbml0fSBpZiAoJHtjb25kaXRpb259KSB7ICR7Z2VuQ29kZX0gfSBlbHNlIHsgJHtuZXdWYWx1ZX0gPSAke29sZFZhbHVlfTsgfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgJHtpbml0fSBpZiAoJHtjb25kaXRpb259KSB7ICR7Z2VuQ29kZX0gfWA7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuUmVmZXJlbmNlQ2hlY2socjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX25hbWVzLmdldEZpZWxkTmFtZShyLnNlbGZJbmRleCk7XG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5fbmFtZXMuZ2V0TG9jYWxOYW1lKHIuc2VsZkluZGV4KTtcbiAgICB2YXIgcmVhZCA9IGBcbiAgICAgICR7dGhpcy5fbG9naWMuZ2VuUHJvcGVydHlCaW5kaW5nRXZhbFZhbHVlKHIpfVxuICAgIGA7XG5cbiAgICB2YXIgY2hlY2sgPSBgXG4gICAgICAke3RoaXMuX2dlblRocm93T25DaGFuZ2VDaGVjayhvbGRWYWx1ZSwgbmV3VmFsdWUpfVxuICAgICAgaWYgKCR7dGhpcy5jaGFuZ2VEZXRlY3Rpb25VdGlsVmFyTmFtZX0ubG9vc2VOb3RJZGVudGljYWwoJHtvbGRWYWx1ZX0sICR7bmV3VmFsdWV9KSkge1xuICAgICAgICAke3RoaXMuX2dlbkNoYW5nZU1hcmtlcihyKX1cbiAgICAgICAgJHt0aGlzLl9nZW5VcGRhdGVEaXJlY3RpdmVPckVsZW1lbnQocil9XG4gICAgICAgICR7dGhpcy5fZ2VuQWRkVG9DaGFuZ2VzKHIpfVxuICAgICAgICAke29sZFZhbHVlfSA9ICR7bmV3VmFsdWV9O1xuICAgICAgfVxuICAgIGA7XG5cbiAgICB2YXIgZ2VuQ29kZSA9IHIuc2hvdWxkQmVDaGVja2VkKCkgPyBgJHtyZWFkfSR7Y2hlY2t9YCA6IHJlYWQ7XG5cbiAgICBpZiAoci5pc1B1cmVGdW5jdGlvbigpKSB7XG4gICAgICB2YXIgY29uZGl0aW9uID0gci5hcmdzLm1hcCgoYSkgPT4gdGhpcy5fbmFtZXMuZ2V0Q2hhbmdlTmFtZShhKSkuam9pbihcIiB8fCBcIik7XG4gICAgICBpZiAoci5pc1VzZWRCeU90aGVyUmVjb3JkKCkpIHtcbiAgICAgICAgcmV0dXJuIGBpZiAoJHtjb25kaXRpb259KSB7ICR7Z2VuQ29kZX0gfSBlbHNlIHsgJHtuZXdWYWx1ZX0gPSAke29sZFZhbHVlfTsgfWA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYGlmICgke2NvbmRpdGlvbn0pIHsgJHtnZW5Db2RlfSB9YDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGdlbkNvZGU7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuQ2hhbmdlTWFya2VyKHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICByZXR1cm4gci5hcmd1bWVudFRvUHVyZUZ1bmN0aW9uID8gYCR7dGhpcy5fbmFtZXMuZ2V0Q2hhbmdlTmFtZShyLnNlbGZJbmRleCl9ID0gdHJ1ZWAgOiBgYDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlblVwZGF0ZURpcmVjdGl2ZU9yRWxlbWVudChyOiBQcm90b1JlY29yZCk6IHN0cmluZyB7XG4gICAgaWYgKCFyLmxhc3RJbkJpbmRpbmcpIHJldHVybiBcIlwiO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5fbmFtZXMuZ2V0TG9jYWxOYW1lKHIuc2VsZkluZGV4KTtcbiAgICB2YXIgbm90aWZ5RGVidWcgPSB0aGlzLmdlbkNvbmZpZy5sb2dCaW5kaW5nVXBkYXRlID8gYHRoaXMubG9nQmluZGluZ1VwZGF0ZSgke25ld1ZhbHVlfSk7YCA6IFwiXCI7XG5cbiAgICB2YXIgYnIgPSByLmJpbmRpbmdSZWNvcmQ7XG4gICAgaWYgKGJyLnRhcmdldC5pc0RpcmVjdGl2ZSgpKSB7XG4gICAgICB2YXIgZGlyZWN0aXZlUHJvcGVydHkgPVxuICAgICAgICAgIGAke3RoaXMuX25hbWVzLmdldERpcmVjdGl2ZU5hbWUoYnIuZGlyZWN0aXZlUmVjb3JkLmRpcmVjdGl2ZUluZGV4KX0uJHtici50YXJnZXQubmFtZX1gO1xuICAgICAgcmV0dXJuIGBcbiAgICAgICAgJHtkaXJlY3RpdmVQcm9wZXJ0eX0gPSAke25ld1ZhbHVlfTtcbiAgICAgICAgJHtub3RpZnlEZWJ1Z31cbiAgICAgICAgJHtJU19DSEFOR0VEX0xPQ0FMfSA9IHRydWU7XG4gICAgICBgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYFxuICAgICAgICB0aGlzLm5vdGlmeURpc3BhdGNoZXIoJHtuZXdWYWx1ZX0pO1xuICAgICAgICAke25vdGlmeURlYnVnfVxuICAgICAgYDtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5UaHJvd09uQ2hhbmdlQ2hlY2sob2xkVmFsdWU6IHN0cmluZywgbmV3VmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKGFzc2VydGlvbnNFbmFibGVkKCkpIHtcbiAgICAgIHJldHVybiBgXG4gICAgICAgIGlmICh0aHJvd09uQ2hhbmdlICYmICEke3RoaXMuY2hhbmdlRGV0ZWN0aW9uVXRpbFZhck5hbWV9LmRldk1vZGVFcXVhbCgke29sZFZhbHVlfSwgJHtuZXdWYWx1ZX0pKSB7XG4gICAgICAgICAgdGhpcy50aHJvd09uQ2hhbmdlRXJyb3IoJHtvbGRWYWx1ZX0sICR7bmV3VmFsdWV9KTtcbiAgICAgICAgfVxuICAgICAgICBgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuQWRkVG9DaGFuZ2VzKHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLl9uYW1lcy5nZXRMb2NhbE5hbWUoci5zZWxmSW5kZXgpO1xuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX25hbWVzLmdldEZpZWxkTmFtZShyLnNlbGZJbmRleCk7XG4gICAgaWYgKCFyLmJpbmRpbmdSZWNvcmQuY2FsbE9uQ2hhbmdlcygpKSByZXR1cm4gXCJcIjtcbiAgICByZXR1cm4gYCR7Q0hBTkdFU19MT0NBTH0gPSB0aGlzLmFkZENoYW5nZSgke0NIQU5HRVNfTE9DQUx9LCAke29sZFZhbHVlfSwgJHtuZXdWYWx1ZX0pO2A7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXliZUZpcnN0SW5CaW5kaW5nKHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICB2YXIgcHJldiA9IENoYW5nZURldGVjdGlvblV0aWwucHJvdG9CeUluZGV4KHRoaXMucmVjb3Jkcywgci5zZWxmSW5kZXggLSAxKTtcbiAgICB2YXIgZmlyc3RJbkJpbmRpbmcgPSBpc0JsYW5rKHByZXYpIHx8IHByZXYuYmluZGluZ1JlY29yZCAhPT0gci5iaW5kaW5nUmVjb3JkO1xuICAgIHJldHVybiBmaXJzdEluQmluZGluZyAmJiAhci5iaW5kaW5nUmVjb3JkLmlzRGlyZWN0aXZlTGlmZWN5Y2xlKCkgP1xuICAgICAgICAgICAgICAgYCR7dGhpcy5fbmFtZXMuZ2V0UHJvcGVydHlCaW5kaW5nSW5kZXgoKX0gPSAke3IucHJvcGVydHlCaW5kaW5nSW5kZXh9O2AgOlxuICAgICAgICAgICAgICAgJyc7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXliZUdlbkxhc3RJbkRpcmVjdGl2ZShyOiBQcm90b1JlY29yZCk6IHN0cmluZyB7XG4gICAgaWYgKCFyLmxhc3RJbkRpcmVjdGl2ZSkgcmV0dXJuIFwiXCI7XG4gICAgcmV0dXJuIGBcbiAgICAgICR7Q0hBTkdFU19MT0NBTH0gPSBudWxsO1xuICAgICAgJHt0aGlzLl9nZW5Ob3RpZnlPblB1c2hEZXRlY3RvcnMocil9XG4gICAgICAke0lTX0NIQU5HRURfTE9DQUx9ID0gZmFsc2U7XG4gICAgYDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dlbk9uQ2hlY2socjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHZhciBiciA9IHIuYmluZGluZ1JlY29yZDtcbiAgICByZXR1cm4gYGlmICghdGhyb3dPbkNoYW5nZSkgJHt0aGlzLl9uYW1lcy5nZXREaXJlY3RpdmVOYW1lKGJyLmRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCl9Lm5nRG9DaGVjaygpO2A7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5PbkluaXQocjogUHJvdG9SZWNvcmQpOiBzdHJpbmcge1xuICAgIHZhciBiciA9IHIuYmluZGluZ1JlY29yZDtcbiAgICByZXR1cm4gYGlmICghdGhyb3dPbkNoYW5nZSAmJiAke3RoaXMuX25hbWVzLmdldFN0YXRlTmFtZSgpfSA9PT0gJHt0aGlzLmNoYW5nZURldGVjdG9yU3RhdGVWYXJOYW1lfS5OZXZlckNoZWNrZWQpICR7dGhpcy5fbmFtZXMuZ2V0RGlyZWN0aXZlTmFtZShici5kaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpfS5uZ09uSW5pdCgpO2A7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZW5PbkNoYW5nZShyOiBQcm90b1JlY29yZCk6IHN0cmluZyB7XG4gICAgdmFyIGJyID0gci5iaW5kaW5nUmVjb3JkO1xuICAgIHJldHVybiBgaWYgKCF0aHJvd09uQ2hhbmdlICYmICR7Q0hBTkdFU19MT0NBTH0pICR7dGhpcy5fbmFtZXMuZ2V0RGlyZWN0aXZlTmFtZShici5kaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpfS5uZ09uQ2hhbmdlcygke0NIQU5HRVNfTE9DQUx9KTtgO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2VuTm90aWZ5T25QdXNoRGV0ZWN0b3JzKHI6IFByb3RvUmVjb3JkKTogc3RyaW5nIHtcbiAgICB2YXIgYnIgPSByLmJpbmRpbmdSZWNvcmQ7XG4gICAgaWYgKCFyLmxhc3RJbkRpcmVjdGl2ZSB8fCBici5pc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb24oKSkgcmV0dXJuIFwiXCI7XG4gICAgdmFyIHJldFZhbCA9IGBcbiAgICAgIGlmKCR7SVNfQ0hBTkdFRF9MT0NBTH0pIHtcbiAgICAgICAgJHt0aGlzLl9uYW1lcy5nZXREZXRlY3Rvck5hbWUoYnIuZGlyZWN0aXZlUmVjb3JkLmRpcmVjdGl2ZUluZGV4KX0ubWFya0FzQ2hlY2tPbmNlKCk7XG4gICAgICB9XG4gICAgYDtcbiAgICByZXR1cm4gcmV0VmFsO1xuICB9XG59XG4iXX0=