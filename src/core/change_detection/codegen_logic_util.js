'use strict';var lang_1 = require('angular2/src/facade/lang');
var codegen_facade_1 = require('./codegen_facade');
var proto_record_1 = require('./proto_record');
var constants_1 = require('./constants');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * Class responsible for providing change detection logic for change detector classes.
 */
var CodegenLogicUtil = (function () {
    function CodegenLogicUtil(_names, _utilName, _changeDetectorStateName, _changeDetection) {
        this._names = _names;
        this._utilName = _utilName;
        this._changeDetectorStateName = _changeDetectorStateName;
        this._changeDetection = _changeDetection;
    }
    /**
     * Generates a statement which updates the local variable representing `protoRec` with the current
     * value of the record. Used by property bindings.
     */
    CodegenLogicUtil.prototype.genPropertyBindingEvalValue = function (protoRec) {
        var _this = this;
        return this._genEvalValue(protoRec, function (idx) { return _this._names.getLocalName(idx); }, this._names.getLocalsAccessorName());
    };
    /**
     * Generates a statement which updates the local variable representing `protoRec` with the current
     * value of the record. Used by event bindings.
     */
    CodegenLogicUtil.prototype.genEventBindingEvalValue = function (eventRecord, protoRec) {
        var _this = this;
        return this._genEvalValue(protoRec, function (idx) { return _this._names.getEventLocalName(eventRecord, idx); }, "locals");
    };
    CodegenLogicUtil.prototype._genEvalValue = function (protoRec, getLocalName, localsAccessor) {
        var context = (protoRec.contextIndex == -1) ?
            this._names.getDirectiveName(protoRec.directiveIndex) :
            getLocalName(protoRec.contextIndex);
        var argString = protoRec.args.map(function (arg) { return getLocalName(arg); }).join(", ");
        var rhs;
        switch (protoRec.mode) {
            case proto_record_1.RecordType.Self:
                rhs = context;
                break;
            case proto_record_1.RecordType.Const:
                rhs = codegen_facade_1.codify(protoRec.funcOrValue);
                break;
            case proto_record_1.RecordType.PropertyRead:
                rhs = this._observe(context + "." + protoRec.name, protoRec);
                break;
            case proto_record_1.RecordType.SafeProperty:
                var read = this._observe(context + "." + protoRec.name, protoRec);
                rhs =
                    this._utilName + ".isValueBlank(" + context + ") ? null : " + this._observe(read, protoRec);
                break;
            case proto_record_1.RecordType.PropertyWrite:
                rhs = context + "." + protoRec.name + " = " + getLocalName(protoRec.args[0]);
                break;
            case proto_record_1.RecordType.Local:
                rhs = this._observe(localsAccessor + ".get(" + codegen_facade_1.rawString(protoRec.name) + ")", protoRec);
                break;
            case proto_record_1.RecordType.InvokeMethod:
                rhs = this._observe(context + "." + protoRec.name + "(" + argString + ")", protoRec);
                break;
            case proto_record_1.RecordType.SafeMethodInvoke:
                var invoke = context + "." + protoRec.name + "(" + argString + ")";
                rhs =
                    this._utilName + ".isValueBlank(" + context + ") ? null : " + this._observe(invoke, protoRec);
                break;
            case proto_record_1.RecordType.InvokeClosure:
                rhs = context + "(" + argString + ")";
                break;
            case proto_record_1.RecordType.PrimitiveOp:
                rhs = this._utilName + "." + protoRec.name + "(" + argString + ")";
                break;
            case proto_record_1.RecordType.CollectionLiteral:
                rhs = this._utilName + "." + protoRec.name + "(" + argString + ")";
                break;
            case proto_record_1.RecordType.Interpolate:
                rhs = this._genInterpolation(protoRec);
                break;
            case proto_record_1.RecordType.KeyedRead:
                rhs = this._observe(context + "[" + getLocalName(protoRec.args[0]) + "]", protoRec);
                break;
            case proto_record_1.RecordType.KeyedWrite:
                rhs = context + "[" + getLocalName(protoRec.args[0]) + "] = " + getLocalName(protoRec.args[1]);
                break;
            case proto_record_1.RecordType.Chain:
                rhs = 'null';
                break;
            default:
                throw new exceptions_1.BaseException("Unknown operation " + protoRec.mode);
        }
        return getLocalName(protoRec.selfIndex) + " = " + rhs + ";";
    };
    /** @internal */
    CodegenLogicUtil.prototype._observe = function (exp, rec) {
        // This is an experimental feature. Works only in Dart.
        if (this._changeDetection === constants_1.ChangeDetectionStrategy.OnPushObserve) {
            return "this.observeValue(" + exp + ", " + rec.selfIndex + ")";
        }
        else {
            return exp;
        }
    };
    CodegenLogicUtil.prototype.genPropertyBindingTargets = function (propertyBindingTargets, genDebugInfo) {
        var _this = this;
        var bs = propertyBindingTargets.map(function (b) {
            if (lang_1.isBlank(b))
                return "null";
            var debug = genDebugInfo ? codegen_facade_1.codify(b.debug) : "null";
            return _this._utilName + ".bindingTarget(" + codegen_facade_1.codify(b.mode) + ", " + b.elementIndex + ", " + codegen_facade_1.codify(b.name) + ", " + codegen_facade_1.codify(b.unit) + ", " + debug + ")";
        });
        return "[" + bs.join(", ") + "]";
    };
    CodegenLogicUtil.prototype.genDirectiveIndices = function (directiveRecords) {
        var _this = this;
        var bs = directiveRecords.map(function (b) {
            return (_this._utilName + ".directiveIndex(" + b.directiveIndex.elementIndex + ", " + b.directiveIndex.directiveIndex + ")");
        });
        return "[" + bs.join(", ") + "]";
    };
    /** @internal */
    CodegenLogicUtil.prototype._genInterpolation = function (protoRec) {
        var iVals = [];
        for (var i = 0; i < protoRec.args.length; ++i) {
            iVals.push(codegen_facade_1.codify(protoRec.fixedArgs[i]));
            iVals.push(this._utilName + ".s(" + this._names.getLocalName(protoRec.args[i]) + ")");
        }
        iVals.push(codegen_facade_1.codify(protoRec.fixedArgs[protoRec.args.length]));
        return codegen_facade_1.combineGeneratedStrings(iVals);
    };
    CodegenLogicUtil.prototype.genHydrateDirectives = function (directiveRecords) {
        var res = [];
        for (var i = 0; i < directiveRecords.length; ++i) {
            var r = directiveRecords[i];
            res.push(this._names.getDirectiveName(r.directiveIndex) + " = " + this._genReadDirective(i) + ";");
        }
        return res.join("\n");
    };
    CodegenLogicUtil.prototype._genReadDirective = function (index) {
        // This is an experimental feature. Works only in Dart.
        if (this._changeDetection === constants_1.ChangeDetectionStrategy.OnPushObserve) {
            return "this.observeDirective(this.getDirectiveFor(directives, " + index + "), " + index + ")";
        }
        else {
            return "this.getDirectiveFor(directives, " + index + ")";
        }
    };
    CodegenLogicUtil.prototype.genHydrateDetectors = function (directiveRecords) {
        var res = [];
        for (var i = 0; i < directiveRecords.length; ++i) {
            var r = directiveRecords[i];
            if (!r.isDefaultChangeDetection()) {
                res.push(this._names.getDetectorName(r.directiveIndex) + " = this.getDetectorFor(directives, " + i + ");");
            }
        }
        return res.join("\n");
    };
    CodegenLogicUtil.prototype.genContentLifecycleCallbacks = function (directiveRecords) {
        var res = [];
        var eq = lang_1.IS_DART ? '==' : '===';
        // NOTE(kegluneq): Order is important!
        for (var i = directiveRecords.length - 1; i >= 0; --i) {
            var dir = directiveRecords[i];
            if (dir.callAfterContentInit) {
                res.push("if(" + this._names.getStateName() + " " + eq + " " + this._changeDetectorStateName + ".NeverChecked) " + this._names.getDirectiveName(dir.directiveIndex) + ".afterContentInit();");
            }
            if (dir.callAfterContentChecked) {
                res.push(this._names.getDirectiveName(dir.directiveIndex) + ".afterContentChecked();");
            }
        }
        return res;
    };
    CodegenLogicUtil.prototype.genViewLifecycleCallbacks = function (directiveRecords) {
        var res = [];
        var eq = lang_1.IS_DART ? '==' : '===';
        // NOTE(kegluneq): Order is important!
        for (var i = directiveRecords.length - 1; i >= 0; --i) {
            var dir = directiveRecords[i];
            if (dir.callAfterViewInit) {
                res.push("if(" + this._names.getStateName() + " " + eq + " " + this._changeDetectorStateName + ".NeverChecked) " + this._names.getDirectiveName(dir.directiveIndex) + ".afterViewInit();");
            }
            if (dir.callAfterViewChecked) {
                res.push(this._names.getDirectiveName(dir.directiveIndex) + ".afterViewChecked();");
            }
        }
        return res;
    };
    return CodegenLogicUtil;
})();
exports.CodegenLogicUtil = CodegenLogicUtil;
//# sourceMappingURL=codegen_logic_util.js.map