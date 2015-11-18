'use strict';var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
// The names of these fields must be kept in sync with abstract_change_detector.ts or change
// detection will fail.
var _STATE_ACCESSOR = "state";
var _CONTEXT_ACCESSOR = "context";
var _PROP_BINDING_INDEX = "propertyBindingIndex";
var _DIRECTIVES_ACCESSOR = "directiveIndices";
var _DISPATCHER_ACCESSOR = "dispatcher";
var _LOCALS_ACCESSOR = "locals";
var _MODE_ACCESSOR = "mode";
var _PIPES_ACCESSOR = "pipes";
var _PROTOS_ACCESSOR = "protos";
exports.CONTEXT_ACCESSOR = "context";
// `context` is always first.
exports.CONTEXT_INDEX = 0;
var _FIELD_PREFIX = 'this.';
var _whiteSpaceRegExp = /\W/g;
/**
 * Returns `s` with all non-identifier characters removed.
 */
function sanitizeName(s) {
    return lang_1.StringWrapper.replaceAll(s, _whiteSpaceRegExp, '');
}
exports.sanitizeName = sanitizeName;
/**
 * Class responsible for providing field and local variable names for change detector classes.
 * Also provides some convenience functions, for example, declaring variables, destroying pipes,
 * and dehydrating the detector.
 */
var CodegenNameUtil = (function () {
    function CodegenNameUtil(_records, _eventBindings, _directiveRecords, _utilName) {
        this._records = _records;
        this._eventBindings = _eventBindings;
        this._directiveRecords = _directiveRecords;
        this._utilName = _utilName;
        /** @internal */
        this._sanitizedEventNames = new collection_1.Map();
        this._sanitizedNames = collection_1.ListWrapper.createFixedSize(this._records.length + 1);
        this._sanitizedNames[exports.CONTEXT_INDEX] = exports.CONTEXT_ACCESSOR;
        for (var i = 0, iLen = this._records.length; i < iLen; ++i) {
            this._sanitizedNames[i + 1] = sanitizeName("" + this._records[i].name + i);
        }
        for (var ebIndex = 0; ebIndex < _eventBindings.length; ++ebIndex) {
            var eb = _eventBindings[ebIndex];
            var names = [exports.CONTEXT_ACCESSOR];
            for (var i = 0, iLen = eb.records.length; i < iLen; ++i) {
                names.push(sanitizeName("" + eb.records[i].name + i + "_" + ebIndex));
            }
            this._sanitizedEventNames.set(eb, names);
        }
    }
    /** @internal */
    CodegenNameUtil.prototype._addFieldPrefix = function (name) { return "" + _FIELD_PREFIX + name; };
    CodegenNameUtil.prototype.getDispatcherName = function () { return this._addFieldPrefix(_DISPATCHER_ACCESSOR); };
    CodegenNameUtil.prototype.getPipesAccessorName = function () { return this._addFieldPrefix(_PIPES_ACCESSOR); };
    CodegenNameUtil.prototype.getProtosName = function () { return this._addFieldPrefix(_PROTOS_ACCESSOR); };
    CodegenNameUtil.prototype.getDirectivesAccessorName = function () { return this._addFieldPrefix(_DIRECTIVES_ACCESSOR); };
    CodegenNameUtil.prototype.getLocalsAccessorName = function () { return this._addFieldPrefix(_LOCALS_ACCESSOR); };
    CodegenNameUtil.prototype.getStateName = function () { return this._addFieldPrefix(_STATE_ACCESSOR); };
    CodegenNameUtil.prototype.getModeName = function () { return this._addFieldPrefix(_MODE_ACCESSOR); };
    CodegenNameUtil.prototype.getPropertyBindingIndex = function () { return this._addFieldPrefix(_PROP_BINDING_INDEX); };
    CodegenNameUtil.prototype.getLocalName = function (idx) { return "l_" + this._sanitizedNames[idx]; };
    CodegenNameUtil.prototype.getEventLocalName = function (eb, idx) {
        return "l_" + this._sanitizedEventNames.get(eb)[idx];
    };
    CodegenNameUtil.prototype.getChangeName = function (idx) { return "c_" + this._sanitizedNames[idx]; };
    /**
     * Generate a statement initializing local variables used when detecting changes.
     */
    CodegenNameUtil.prototype.genInitLocals = function () {
        var declarations = [];
        var assignments = [];
        for (var i = 0, iLen = this.getFieldCount(); i < iLen; ++i) {
            if (i == exports.CONTEXT_INDEX) {
                declarations.push(this.getLocalName(i) + " = " + this.getFieldName(i));
            }
            else {
                var rec = this._records[i - 1];
                if (rec.argumentToPureFunction) {
                    var changeName = this.getChangeName(i);
                    declarations.push(this.getLocalName(i) + "," + changeName);
                    assignments.push(changeName);
                }
                else {
                    declarations.push("" + this.getLocalName(i));
                }
            }
        }
        var assignmentsCode = collection_1.ListWrapper.isEmpty(assignments) ? '' : assignments.join('=') + " = false;";
        return "var " + declarations.join(',') + ";" + assignmentsCode;
    };
    /**
     * Generate a statement initializing local variables for event handlers.
     */
    CodegenNameUtil.prototype.genInitEventLocals = function () {
        var _this = this;
        var res = [(this.getLocalName(exports.CONTEXT_INDEX) + " = " + this.getFieldName(exports.CONTEXT_INDEX))];
        this._sanitizedEventNames.forEach(function (names, eb) {
            for (var i = 0; i < names.length; ++i) {
                if (i !== exports.CONTEXT_INDEX) {
                    res.push("" + _this.getEventLocalName(eb, i));
                }
            }
        });
        return res.length > 1 ? "var " + res.join(',') + ";" : '';
    };
    CodegenNameUtil.prototype.getPreventDefaultAccesor = function () { return "preventDefault"; };
    CodegenNameUtil.prototype.getFieldCount = function () { return this._sanitizedNames.length; };
    CodegenNameUtil.prototype.getFieldName = function (idx) { return this._addFieldPrefix(this._sanitizedNames[idx]); };
    CodegenNameUtil.prototype.getAllFieldNames = function () {
        var fieldList = [];
        for (var k = 0, kLen = this.getFieldCount(); k < kLen; ++k) {
            if (k === 0 || this._records[k - 1].shouldBeChecked()) {
                fieldList.push(this.getFieldName(k));
            }
        }
        for (var i = 0, iLen = this._records.length; i < iLen; ++i) {
            var rec = this._records[i];
            if (rec.isPipeRecord()) {
                fieldList.push(this.getPipeName(rec.selfIndex));
            }
        }
        for (var j = 0, jLen = this._directiveRecords.length; j < jLen; ++j) {
            var dRec = this._directiveRecords[j];
            fieldList.push(this.getDirectiveName(dRec.directiveIndex));
            if (!dRec.isDefaultChangeDetection()) {
                fieldList.push(this.getDetectorName(dRec.directiveIndex));
            }
        }
        return fieldList;
    };
    /**
     * Generates statements which clear all fields so that the change detector is dehydrated.
     */
    CodegenNameUtil.prototype.genDehydrateFields = function () {
        var fields = this.getAllFieldNames();
        collection_1.ListWrapper.removeAt(fields, exports.CONTEXT_INDEX);
        if (collection_1.ListWrapper.isEmpty(fields))
            return '';
        // At least one assignment.
        fields.push(this._utilName + ".uninitialized;");
        return fields.join(' = ');
    };
    /**
     * Generates statements destroying all pipe variables.
     */
    CodegenNameUtil.prototype.genPipeOnDestroy = function () {
        var _this = this;
        return this._records.filter(function (r) { return r.isPipeRecord(); })
            .map(function (r) { return (_this._utilName + ".callPipeOnDestroy(" + _this.getPipeName(r.selfIndex) + ");"); })
            .join('\n');
    };
    CodegenNameUtil.prototype.getPipeName = function (idx) {
        return this._addFieldPrefix(this._sanitizedNames[idx] + "_pipe");
    };
    CodegenNameUtil.prototype.getDirectiveName = function (d) {
        return this._addFieldPrefix("directive_" + d.name);
    };
    CodegenNameUtil.prototype.getDetectorName = function (d) { return this._addFieldPrefix("detector_" + d.name); };
    return CodegenNameUtil;
})();
exports.CodegenNameUtil = CodegenNameUtil;
//# sourceMappingURL=codegen_name_util.js.map