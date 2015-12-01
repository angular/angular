'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var abstract_change_detector_1 = require('./abstract_change_detector');
var change_detection_util_1 = require('./change_detection_util');
var proto_record_1 = require('./proto_record');
var codegen_name_util_1 = require('./codegen_name_util');
var codegen_logic_util_1 = require('./codegen_logic_util');
var codegen_facade_1 = require('./codegen_facade');
var constants_1 = require('./constants');
var proto_change_detector_1 = require('./proto_change_detector');
/**
 * The code generator takes a list of proto records and creates a function/class
 * that "emulates" what the developer would write by hand to implement the same
 * kind of behaviour.
 *
 * This code should be kept in sync with the Dart transformer's
 * `angular2.transform.template_compiler.change_detector_codegen` library. If you make updates
 * here, please make equivalent changes there.
*/
var IS_CHANGED_LOCAL = "isChanged";
var CHANGES_LOCAL = "changes";
var ChangeDetectorJITGenerator = (function () {
    function ChangeDetectorJITGenerator(definition, changeDetectionUtilVarName, abstractChangeDetectorVarName, changeDetectorStateVarName) {
        this.changeDetectionUtilVarName = changeDetectionUtilVarName;
        this.abstractChangeDetectorVarName = abstractChangeDetectorVarName;
        this.changeDetectorStateVarName = changeDetectorStateVarName;
        var propertyBindingRecords = proto_change_detector_1.createPropertyRecords(definition);
        var eventBindingRecords = proto_change_detector_1.createEventRecords(definition);
        var propertyBindingTargets = definition.bindingRecords.map(function (b) { return b.target; });
        this.id = definition.id;
        this.changeDetectionStrategy = definition.strategy;
        this.genConfig = definition.genConfig;
        this.records = propertyBindingRecords;
        this.propertyBindingTargets = propertyBindingTargets;
        this.eventBindings = eventBindingRecords;
        this.directiveRecords = definition.directiveRecords;
        this._names = new codegen_name_util_1.CodegenNameUtil(this.records, this.eventBindings, this.directiveRecords, this.changeDetectionUtilVarName);
        this._logic =
            new codegen_logic_util_1.CodegenLogicUtil(this._names, this.changeDetectionUtilVarName, this.changeDetectorStateVarName, this.changeDetectionStrategy);
        this.typeName = codegen_name_util_1.sanitizeName("ChangeDetector_" + this.id);
    }
    ChangeDetectorJITGenerator.prototype.generate = function () {
        var factorySource = "\n      " + this.generateSource() + "\n      return function(dispatcher) {\n        return new " + this.typeName + "(dispatcher);\n      }\n    ";
        return new Function(this.abstractChangeDetectorVarName, this.changeDetectionUtilVarName, this.changeDetectorStateVarName, factorySource)(abstract_change_detector_1.AbstractChangeDetector, change_detection_util_1.ChangeDetectionUtil, constants_1.ChangeDetectorState);
    };
    ChangeDetectorJITGenerator.prototype.generateSource = function () {
        return "\n      var " + this.typeName + " = function " + this.typeName + "(dispatcher) {\n        " + this.abstractChangeDetectorVarName + ".call(\n            this, " + JSON.stringify(this.id) + ", dispatcher, " + this.records.length + ",\n            " + this.typeName + ".gen_propertyBindingTargets, " + this.typeName + ".gen_directiveIndices,\n            " + codegen_facade_1.codify(this.changeDetectionStrategy) + ");\n        this.dehydrateDirectives(false);\n      }\n\n      " + this.typeName + ".prototype = Object.create(" + this.abstractChangeDetectorVarName + ".prototype);\n\n      " + this.typeName + ".prototype.detectChangesInRecordsInternal = function(throwOnChange) {\n        " + this._names.genInitLocals() + "\n        var " + IS_CHANGED_LOCAL + " = false;\n        var " + CHANGES_LOCAL + " = null;\n\n        " + this._genAllRecords(this.records) + "\n      }\n\n      " + this._maybeGenHandleEventInternal() + "\n\n      " + this._maybeGenAfterContentLifecycleCallbacks() + "\n\n      " + this._maybeGenAfterViewLifecycleCallbacks() + "\n\n      " + this._maybeGenHydrateDirectives() + "\n\n      " + this._maybeGenDehydrateDirectives() + "\n\n      " + this._genPropertyBindingTargets() + "\n\n      " + this._genDirectiveIndices() + "\n    ";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genPropertyBindingTargets = function () {
        var targets = this._logic.genPropertyBindingTargets(this.propertyBindingTargets, this.genConfig.genDebugInfo);
        return this.typeName + ".gen_propertyBindingTargets = " + targets + ";";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genDirectiveIndices = function () {
        var indices = this._logic.genDirectiveIndices(this.directiveRecords);
        return this.typeName + ".gen_directiveIndices = " + indices + ";";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._maybeGenHandleEventInternal = function () {
        var _this = this;
        if (this.eventBindings.length > 0) {
            var handlers = this.eventBindings.map(function (eb) { return _this._genEventBinding(eb); }).join("\n");
            return "\n        " + this.typeName + ".prototype.handleEventInternal = function(eventName, elIndex, locals) {\n          var " + this._names.getPreventDefaultAccesor() + " = false;\n          " + this._names.genInitEventLocals() + "\n          " + handlers + "\n          return " + this._names.getPreventDefaultAccesor() + ";\n        }\n      ";
        }
        else {
            return '';
        }
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genEventBinding = function (eb) {
        var _this = this;
        var codes = [];
        this._endOfBlockIdxs = [];
        collection_1.ListWrapper.forEachWithIndex(eb.records, function (r, i) {
            var code;
            if (r.isConditionalSkipRecord()) {
                code = _this._genConditionalSkip(r, _this._names.getEventLocalName(eb, i));
            }
            else if (r.isUnconditionalSkipRecord()) {
                code = _this._genUnconditionalSkip(r);
            }
            else {
                code = _this._genEventBindingEval(eb, r);
            }
            code += _this._genEndOfSkipBlock(i);
            codes.push(code);
        });
        return "\n    if (eventName === \"" + eb.eventName + "\" && elIndex === " + eb.elIndex + ") {\n      " + codes.join("\n") + "\n    }";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genEventBindingEval = function (eb, r) {
        if (r.lastInBinding) {
            var evalRecord = this._logic.genEventBindingEvalValue(eb, r);
            var markPath = this._genMarkPathToRootAsCheckOnce(r);
            var prevDefault = this._genUpdatePreventDefault(eb, r);
            return evalRecord + "\n" + markPath + "\n" + prevDefault;
        }
        else {
            return this._logic.genEventBindingEvalValue(eb, r);
        }
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genMarkPathToRootAsCheckOnce = function (r) {
        var br = r.bindingRecord;
        if (br.isDefaultChangeDetection()) {
            return "";
        }
        else {
            return this._names.getDetectorName(br.directiveRecord.directiveIndex) + ".markPathToRootAsCheckOnce();";
        }
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genUpdatePreventDefault = function (eb, r) {
        var local = this._names.getEventLocalName(eb, r.selfIndex);
        return "if (" + local + " === false) { " + this._names.getPreventDefaultAccesor() + " = true};";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._maybeGenDehydrateDirectives = function () {
        var destroyPipesCode = this._names.genPipeOnDestroy();
        if (destroyPipesCode) {
            destroyPipesCode = "if (destroyPipes) { " + destroyPipesCode + " }";
        }
        var dehydrateFieldsCode = this._names.genDehydrateFields();
        if (!destroyPipesCode && !dehydrateFieldsCode)
            return '';
        return this.typeName + ".prototype.dehydrateDirectives = function(destroyPipes) {\n        " + destroyPipesCode + "\n        " + dehydrateFieldsCode + "\n    }";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._maybeGenHydrateDirectives = function () {
        var hydrateDirectivesCode = this._logic.genHydrateDirectives(this.directiveRecords);
        var hydrateDetectorsCode = this._logic.genHydrateDetectors(this.directiveRecords);
        if (!hydrateDirectivesCode && !hydrateDetectorsCode)
            return '';
        return this.typeName + ".prototype.hydrateDirectives = function(directives) {\n      " + hydrateDirectivesCode + "\n      " + hydrateDetectorsCode + "\n    }";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._maybeGenAfterContentLifecycleCallbacks = function () {
        var notifications = this._logic.genContentLifecycleCallbacks(this.directiveRecords);
        if (notifications.length > 0) {
            var directiveNotifications = notifications.join("\n");
            return "\n        " + this.typeName + ".prototype.afterContentLifecycleCallbacksInternal = function() {\n          " + directiveNotifications + "\n        }\n      ";
        }
        else {
            return '';
        }
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._maybeGenAfterViewLifecycleCallbacks = function () {
        var notifications = this._logic.genViewLifecycleCallbacks(this.directiveRecords);
        if (notifications.length > 0) {
            var directiveNotifications = notifications.join("\n");
            return "\n        " + this.typeName + ".prototype.afterViewLifecycleCallbacksInternal = function() {\n          " + directiveNotifications + "\n        }\n      ";
        }
        else {
            return '';
        }
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genAllRecords = function (rs) {
        var codes = [];
        this._endOfBlockIdxs = [];
        for (var i = 0; i < rs.length; i++) {
            var code = void 0;
            var r = rs[i];
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
            code = "\n        " + this._maybeFirstInBinding(r) + "\n        " + code + "\n        " + this._maybeGenLastInDirective(r) + "\n        " + this._genEndOfSkipBlock(i) + "\n      ";
            codes.push(code);
        }
        return codes.join("\n");
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genConditionalSkip = function (r, condition) {
        var maybeNegate = r.mode === proto_record_1.RecordType.SkipRecordsIf ? '!' : '';
        this._endOfBlockIdxs.push(r.fixedArgs[0] - 1);
        return "if (" + maybeNegate + condition + ") {";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genUnconditionalSkip = function (r) {
        this._endOfBlockIdxs.pop();
        this._endOfBlockIdxs.push(r.fixedArgs[0] - 1);
        return "} else {";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genEndOfSkipBlock = function (protoIndex) {
        if (!collection_1.ListWrapper.isEmpty(this._endOfBlockIdxs)) {
            var endOfBlock = collection_1.ListWrapper.last(this._endOfBlockIdxs);
            if (protoIndex === endOfBlock) {
                this._endOfBlockIdxs.pop();
                return '}';
            }
        }
        return '';
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genDirectiveLifecycle = function (r) {
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
            throw new exceptions_1.BaseException("Unknown lifecycle event '" + r.name + "'");
        }
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genPipeCheck = function (r) {
        var _this = this;
        var context = this._names.getLocalName(r.contextIndex);
        var argString = r.args.map(function (arg) { return _this._names.getLocalName(arg); }).join(", ");
        var oldValue = this._names.getFieldName(r.selfIndex);
        var newValue = this._names.getLocalName(r.selfIndex);
        var pipe = this._names.getPipeName(r.selfIndex);
        var pipeName = r.name;
        var init = "\n      if (" + pipe + " === " + this.changeDetectionUtilVarName + ".uninitialized) {\n        " + pipe + " = " + this._names.getPipesAccessorName() + ".get('" + pipeName + "');\n      }\n    ";
        var read = newValue + " = " + pipe + ".pipe.transform(" + context + ", [" + argString + "]);";
        var contexOrArgCheck = r.args.map(function (a) { return _this._names.getChangeName(a); });
        contexOrArgCheck.push(this._names.getChangeName(r.contextIndex));
        var condition = "!" + pipe + ".pure || (" + contexOrArgCheck.join(" || ") + ")";
        var check = "\n      if (" + this.changeDetectionUtilVarName + ".looseNotIdentical(" + oldValue + ", " + newValue + ")) {\n        " + newValue + " = " + this.changeDetectionUtilVarName + ".unwrapValue(" + newValue + ")\n        " + this._genChangeMarker(r) + "\n        " + this._genUpdateDirectiveOrElement(r) + "\n        " + this._genAddToChanges(r) + "\n        " + oldValue + " = " + newValue + ";\n      }\n    ";
        var genCode = r.shouldBeChecked() ? "" + read + check : read;
        if (r.isUsedByOtherRecord()) {
            return init + " if (" + condition + ") { " + genCode + " } else { " + newValue + " = " + oldValue + "; }";
        }
        else {
            return init + " if (" + condition + ") { " + genCode + " }";
        }
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genReferenceCheck = function (r) {
        var _this = this;
        var oldValue = this._names.getFieldName(r.selfIndex);
        var newValue = this._names.getLocalName(r.selfIndex);
        var read = "\n      " + this._logic.genPropertyBindingEvalValue(r) + "\n    ";
        var check = "\n      if (" + this.changeDetectionUtilVarName + ".looseNotIdentical(" + oldValue + ", " + newValue + ")) {\n        " + this._genChangeMarker(r) + "\n        " + this._genUpdateDirectiveOrElement(r) + "\n        " + this._genAddToChanges(r) + "\n        " + oldValue + " = " + newValue + ";\n      }\n    ";
        var genCode = r.shouldBeChecked() ? "" + read + check : read;
        if (r.isPureFunction()) {
            var condition = r.args.map(function (a) { return _this._names.getChangeName(a); }).join(" || ");
            if (r.isUsedByOtherRecord()) {
                return "if (" + condition + ") { " + genCode + " } else { " + newValue + " = " + oldValue + "; }";
            }
            else {
                return "if (" + condition + ") { " + genCode + " }";
            }
        }
        else {
            return genCode;
        }
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genChangeMarker = function (r) {
        return r.argumentToPureFunction ? this._names.getChangeName(r.selfIndex) + " = true" : "";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genUpdateDirectiveOrElement = function (r) {
        if (!r.lastInBinding)
            return "";
        var newValue = this._names.getLocalName(r.selfIndex);
        var oldValue = this._names.getFieldName(r.selfIndex);
        var notifyDebug = this.genConfig.logBindingUpdate ? "this.logBindingUpdate(" + newValue + ");" : "";
        var br = r.bindingRecord;
        if (br.target.isDirective()) {
            var directiveProperty = this._names.getDirectiveName(br.directiveRecord.directiveIndex) + "." + br.target.name;
            return "\n        " + this._genThrowOnChangeCheck(oldValue, newValue) + "\n        " + directiveProperty + " = " + newValue + ";\n        " + notifyDebug + "\n        " + IS_CHANGED_LOCAL + " = true;\n      ";
        }
        else {
            return "\n        " + this._genThrowOnChangeCheck(oldValue, newValue) + "\n        this.notifyDispatcher(" + newValue + ");\n        " + notifyDebug + "\n      ";
        }
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genThrowOnChangeCheck = function (oldValue, newValue) {
        if (lang_1.assertionsEnabled()) {
            return "\n        if(throwOnChange) {\n          this.throwOnChangeError(" + oldValue + ", " + newValue + ");\n        }\n        ";
        }
        else {
            return '';
        }
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genAddToChanges = function (r) {
        var newValue = this._names.getLocalName(r.selfIndex);
        var oldValue = this._names.getFieldName(r.selfIndex);
        if (!r.bindingRecord.callOnChanges())
            return "";
        return CHANGES_LOCAL + " = this.addChange(" + CHANGES_LOCAL + ", " + oldValue + ", " + newValue + ");";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._maybeFirstInBinding = function (r) {
        var prev = change_detection_util_1.ChangeDetectionUtil.protoByIndex(this.records, r.selfIndex - 1);
        var firstInBinding = lang_1.isBlank(prev) || prev.bindingRecord !== r.bindingRecord;
        return firstInBinding && !r.bindingRecord.isDirectiveLifecycle() ?
            this._names.getPropertyBindingIndex() + " = " + r.propertyBindingIndex + ";" :
            '';
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._maybeGenLastInDirective = function (r) {
        if (!r.lastInDirective)
            return "";
        return "\n      " + CHANGES_LOCAL + " = null;\n      " + this._genNotifyOnPushDetectors(r) + "\n      " + IS_CHANGED_LOCAL + " = false;\n    ";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genOnCheck = function (r) {
        var br = r.bindingRecord;
        return "if (!throwOnChange) " + this._names.getDirectiveName(br.directiveRecord.directiveIndex) + ".doCheck();";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genOnInit = function (r) {
        var br = r.bindingRecord;
        return "if (!throwOnChange && " + this._names.getStateName() + " === " + this.changeDetectorStateVarName + ".NeverChecked) " + this._names.getDirectiveName(br.directiveRecord.directiveIndex) + ".onInit();";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genOnChange = function (r) {
        var br = r.bindingRecord;
        return "if (!throwOnChange && " + CHANGES_LOCAL + ") " + this._names.getDirectiveName(br.directiveRecord.directiveIndex) + ".onChanges(" + CHANGES_LOCAL + ");";
    };
    /** @internal */
    ChangeDetectorJITGenerator.prototype._genNotifyOnPushDetectors = function (r) {
        var br = r.bindingRecord;
        if (!r.lastInDirective || br.isDefaultChangeDetection())
            return "";
        var retVal = "\n      if(" + IS_CHANGED_LOCAL + ") {\n        " + this._names.getDetectorName(br.directiveRecord.directiveIndex) + ".markAsCheckOnce();\n      }\n    ";
        return retVal;
    };
    return ChangeDetectorJITGenerator;
})();
exports.ChangeDetectorJITGenerator = ChangeDetectorJITGenerator;
//# sourceMappingURL=change_detection_jit_generator.js.map