'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var abstract_change_detector_1 = require('./abstract_change_detector');
var change_detection_util_1 = require('./change_detection_util');
var constants_1 = require('./constants');
var proto_record_1 = require('./proto_record');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var async_1 = require('angular2/src/facade/async');
var DynamicChangeDetector = (function (_super) {
    __extends(DynamicChangeDetector, _super);
    function DynamicChangeDetector(id, numberOfPropertyProtoRecords, propertyBindingTargets, directiveIndices, strategy, _records, _eventBindings, _directiveRecords, _genConfig) {
        _super.call(this, id, numberOfPropertyProtoRecords, propertyBindingTargets, directiveIndices, strategy);
        this._records = _records;
        this._eventBindings = _eventBindings;
        this._directiveRecords = _directiveRecords;
        this._genConfig = _genConfig;
        var len = _records.length + 1;
        this.values = collection_1.ListWrapper.createFixedSize(len);
        this.localPipes = collection_1.ListWrapper.createFixedSize(len);
        this.prevContexts = collection_1.ListWrapper.createFixedSize(len);
        this.changes = collection_1.ListWrapper.createFixedSize(len);
        this.dehydrateDirectives(false);
    }
    DynamicChangeDetector.prototype.handleEventInternal = function (eventName, elIndex, locals) {
        var _this = this;
        var preventDefault = false;
        this._matchingEventBindings(eventName, elIndex)
            .forEach(function (rec) {
            var res = _this._processEventBinding(rec, locals);
            if (res === false) {
                preventDefault = true;
            }
        });
        return preventDefault;
    };
    /** @internal */
    DynamicChangeDetector.prototype._processEventBinding = function (eb, locals) {
        var values = collection_1.ListWrapper.createFixedSize(eb.records.length);
        values[0] = this.values[0];
        for (var protoIdx = 0; protoIdx < eb.records.length; ++protoIdx) {
            var proto = eb.records[protoIdx];
            if (proto.isSkipRecord()) {
                protoIdx += this._computeSkipLength(protoIdx, proto, values);
            }
            else {
                var res = this._calculateCurrValue(proto, values, locals);
                if (proto.lastInBinding) {
                    this._markPathAsCheckOnce(proto);
                    return res;
                }
                else {
                    this._writeSelf(proto, res, values);
                }
            }
        }
        throw new exceptions_1.BaseException("Cannot be reached");
    };
    DynamicChangeDetector.prototype._computeSkipLength = function (protoIndex, proto, values) {
        if (proto.mode === proto_record_1.RecordType.SkipRecords) {
            return proto.fixedArgs[0] - protoIndex - 1;
        }
        if (proto.mode === proto_record_1.RecordType.SkipRecordsIf) {
            var condition = this._readContext(proto, values);
            return condition ? proto.fixedArgs[0] - protoIndex - 1 : 0;
        }
        if (proto.mode === proto_record_1.RecordType.SkipRecordsIfNot) {
            var condition = this._readContext(proto, values);
            return condition ? 0 : proto.fixedArgs[0] - protoIndex - 1;
        }
        throw new exceptions_1.BaseException("Cannot be reached");
    };
    /** @internal */
    DynamicChangeDetector.prototype._markPathAsCheckOnce = function (proto) {
        if (!proto.bindingRecord.isDefaultChangeDetection()) {
            var dir = proto.bindingRecord.directiveRecord;
            this._getDetectorFor(dir.directiveIndex).markPathToRootAsCheckOnce();
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._matchingEventBindings = function (eventName, elIndex) {
        return this._eventBindings.filter(function (eb) { return eb.eventName == eventName && eb.elIndex === elIndex; });
    };
    DynamicChangeDetector.prototype.hydrateDirectives = function (dispatcher) {
        var _this = this;
        this.values[0] = this.context;
        this.dispatcher = dispatcher;
        if (this.strategy === constants_1.ChangeDetectionStrategy.OnPushObserve) {
            for (var i = 0; i < this.directiveIndices.length; ++i) {
                var index = this.directiveIndices[i];
                _super.prototype.observeDirective.call(this, this._getDirectiveFor(index), i);
            }
        }
        this.outputSubscriptions = [];
        for (var i = 0; i < this._directiveRecords.length; ++i) {
            var r = this._directiveRecords[i];
            if (lang_1.isPresent(r.outputs)) {
                r.outputs.forEach(function (output) {
                    var eventHandler = _this._createEventHandler(r.directiveIndex.elementIndex, output[1]);
                    var directive = _this._getDirectiveFor(r.directiveIndex);
                    var getter = reflection_1.reflector.getter(output[0]);
                    _this.outputSubscriptions.push(async_1.ObservableWrapper.subscribe(getter(directive), eventHandler));
                });
            }
        }
    };
    DynamicChangeDetector.prototype._createEventHandler = function (boundElementIndex, eventName) {
        var _this = this;
        return function (event) { return _this.handleEvent(eventName, boundElementIndex, event); };
    };
    DynamicChangeDetector.prototype.dehydrateDirectives = function (destroyPipes) {
        if (destroyPipes) {
            this._destroyPipes();
            this._destroyDirectives();
        }
        this.values[0] = null;
        collection_1.ListWrapper.fill(this.values, change_detection_util_1.ChangeDetectionUtil.uninitialized, 1);
        collection_1.ListWrapper.fill(this.changes, false);
        collection_1.ListWrapper.fill(this.localPipes, null);
        collection_1.ListWrapper.fill(this.prevContexts, change_detection_util_1.ChangeDetectionUtil.uninitialized);
    };
    /** @internal */
    DynamicChangeDetector.prototype._destroyPipes = function () {
        for (var i = 0; i < this.localPipes.length; ++i) {
            if (lang_1.isPresent(this.localPipes[i])) {
                change_detection_util_1.ChangeDetectionUtil.callPipeOnDestroy(this.localPipes[i]);
            }
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._destroyDirectives = function () {
        for (var i = 0; i < this._directiveRecords.length; ++i) {
            var record = this._directiveRecords[i];
            if (record.callOnDestroy) {
                this._getDirectiveFor(record.directiveIndex).ngOnDestroy();
            }
        }
    };
    DynamicChangeDetector.prototype.checkNoChanges = function () { this.runDetectChanges(true); };
    DynamicChangeDetector.prototype.detectChangesInRecordsInternal = function (throwOnChange) {
        var protos = this._records;
        var changes = null;
        var isChanged = false;
        for (var protoIdx = 0; protoIdx < protos.length; ++protoIdx) {
            var proto = protos[protoIdx];
            var bindingRecord = proto.bindingRecord;
            var directiveRecord = bindingRecord.directiveRecord;
            if (this._firstInBinding(proto)) {
                this.propertyBindingIndex = proto.propertyBindingIndex;
            }
            if (proto.isLifeCycleRecord()) {
                if (proto.name === "DoCheck" && !throwOnChange) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).ngDoCheck();
                }
                else if (proto.name === "OnInit" && !throwOnChange &&
                    this.state == constants_1.ChangeDetectorState.NeverChecked) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).ngOnInit();
                }
                else if (proto.name === "OnChanges" && lang_1.isPresent(changes) && !throwOnChange) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).ngOnChanges(changes);
                }
            }
            else if (proto.isSkipRecord()) {
                protoIdx += this._computeSkipLength(protoIdx, proto, this.values);
            }
            else {
                var change = this._check(proto, throwOnChange, this.values, this.locals);
                if (lang_1.isPresent(change)) {
                    this._updateDirectiveOrElement(change, bindingRecord);
                    isChanged = true;
                    changes = this._addChange(bindingRecord, change, changes);
                }
            }
            if (proto.lastInDirective) {
                changes = null;
                if (isChanged && !bindingRecord.isDefaultChangeDetection()) {
                    this._getDetectorFor(directiveRecord.directiveIndex).markAsCheckOnce();
                }
                isChanged = false;
            }
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._firstInBinding = function (r) {
        var prev = change_detection_util_1.ChangeDetectionUtil.protoByIndex(this._records, r.selfIndex - 1);
        return lang_1.isBlank(prev) || prev.bindingRecord !== r.bindingRecord;
    };
    DynamicChangeDetector.prototype.afterContentLifecycleCallbacksInternal = function () {
        var dirs = this._directiveRecords;
        for (var i = dirs.length - 1; i >= 0; --i) {
            var dir = dirs[i];
            if (dir.callAfterContentInit && this.state == constants_1.ChangeDetectorState.NeverChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterContentInit();
            }
            if (dir.callAfterContentChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterContentChecked();
            }
        }
    };
    DynamicChangeDetector.prototype.afterViewLifecycleCallbacksInternal = function () {
        var dirs = this._directiveRecords;
        for (var i = dirs.length - 1; i >= 0; --i) {
            var dir = dirs[i];
            if (dir.callAfterViewInit && this.state == constants_1.ChangeDetectorState.NeverChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterViewInit();
            }
            if (dir.callAfterViewChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterViewChecked();
            }
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._updateDirectiveOrElement = function (change, bindingRecord) {
        if (lang_1.isBlank(bindingRecord.directiveRecord)) {
            _super.prototype.notifyDispatcher.call(this, change.currentValue);
        }
        else {
            var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
            bindingRecord.setter(this._getDirectiveFor(directiveIndex), change.currentValue);
        }
        if (this._genConfig.logBindingUpdate) {
            _super.prototype.logBindingUpdate.call(this, change.currentValue);
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._addChange = function (bindingRecord, change, changes) {
        if (bindingRecord.callOnChanges()) {
            return _super.prototype.addChange.call(this, changes, change.previousValue, change.currentValue);
        }
        else {
            return changes;
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._getDirectiveFor = function (directiveIndex) {
        return this.dispatcher.getDirectiveFor(directiveIndex);
    };
    /** @internal */
    DynamicChangeDetector.prototype._getDetectorFor = function (directiveIndex) {
        return this.dispatcher.getDetectorFor(directiveIndex);
    };
    /** @internal */
    DynamicChangeDetector.prototype._check = function (proto, throwOnChange, values, locals) {
        if (proto.isPipeRecord()) {
            return this._pipeCheck(proto, throwOnChange, values);
        }
        else {
            return this._referenceCheck(proto, throwOnChange, values, locals);
        }
    };
    /** @internal */
    DynamicChangeDetector.prototype._referenceCheck = function (proto, throwOnChange, values, locals) {
        if (this._pureFuncAndArgsDidNotChange(proto)) {
            this._setChanged(proto, false);
            return null;
        }
        var currValue = this._calculateCurrValue(proto, values, locals);
        if (this.strategy === constants_1.ChangeDetectionStrategy.OnPushObserve) {
            _super.prototype.observeValue.call(this, currValue, proto.selfIndex);
        }
        if (proto.shouldBeChecked()) {
            var prevValue = this._readSelf(proto, values);
            var detectedChange = throwOnChange ?
                !change_detection_util_1.ChangeDetectionUtil.devModeEqual(prevValue, currValue) :
                change_detection_util_1.ChangeDetectionUtil.looseNotIdentical(prevValue, currValue);
            if (detectedChange) {
                if (proto.lastInBinding) {
                    var change = change_detection_util_1.ChangeDetectionUtil.simpleChange(prevValue, currValue);
                    if (throwOnChange)
                        this.throwOnChangeError(prevValue, currValue);
                    this._writeSelf(proto, currValue, values);
                    this._setChanged(proto, true);
                    return change;
                }
                else {
                    this._writeSelf(proto, currValue, values);
                    this._setChanged(proto, true);
                    return null;
                }
            }
            else {
                this._setChanged(proto, false);
                return null;
            }
        }
        else {
            this._writeSelf(proto, currValue, values);
            this._setChanged(proto, true);
            return null;
        }
    };
    DynamicChangeDetector.prototype._calculateCurrValue = function (proto, values, locals) {
        switch (proto.mode) {
            case proto_record_1.RecordType.Self:
                return this._readContext(proto, values);
            case proto_record_1.RecordType.Const:
                return proto.funcOrValue;
            case proto_record_1.RecordType.PropertyRead:
                var context = this._readContext(proto, values);
                return proto.funcOrValue(context);
            case proto_record_1.RecordType.SafeProperty:
                var context = this._readContext(proto, values);
                return lang_1.isBlank(context) ? null : proto.funcOrValue(context);
            case proto_record_1.RecordType.PropertyWrite:
                var context = this._readContext(proto, values);
                var value = this._readArgs(proto, values)[0];
                proto.funcOrValue(context, value);
                return value;
            case proto_record_1.RecordType.KeyedWrite:
                var context = this._readContext(proto, values);
                var key = this._readArgs(proto, values)[0];
                var value = this._readArgs(proto, values)[1];
                context[key] = value;
                return value;
            case proto_record_1.RecordType.Local:
                return locals.get(proto.name);
            case proto_record_1.RecordType.InvokeMethod:
                var context = this._readContext(proto, values);
                var args = this._readArgs(proto, values);
                return proto.funcOrValue(context, args);
            case proto_record_1.RecordType.SafeMethodInvoke:
                var context = this._readContext(proto, values);
                if (lang_1.isBlank(context)) {
                    return null;
                }
                var args = this._readArgs(proto, values);
                return proto.funcOrValue(context, args);
            case proto_record_1.RecordType.KeyedRead:
                var arg = this._readArgs(proto, values)[0];
                return this._readContext(proto, values)[arg];
            case proto_record_1.RecordType.Chain:
                var args = this._readArgs(proto, values);
                return args[args.length - 1];
            case proto_record_1.RecordType.InvokeClosure:
                return lang_1.FunctionWrapper.apply(this._readContext(proto, values), this._readArgs(proto, values));
            case proto_record_1.RecordType.Interpolate:
            case proto_record_1.RecordType.PrimitiveOp:
            case proto_record_1.RecordType.CollectionLiteral:
                return lang_1.FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto, values));
            default:
                throw new exceptions_1.BaseException("Unknown operation " + proto.mode);
        }
    };
    DynamicChangeDetector.prototype._pipeCheck = function (proto, throwOnChange, values) {
        var context = this._readContext(proto, values);
        var selectedPipe = this._pipeFor(proto, context);
        if (!selectedPipe.pure || this._argsOrContextChanged(proto)) {
            var args = this._readArgs(proto, values);
            var currValue = selectedPipe.pipe.transform(context, args);
            if (proto.shouldBeChecked()) {
                var prevValue = this._readSelf(proto, values);
                var detectedChange = throwOnChange ?
                    !change_detection_util_1.ChangeDetectionUtil.devModeEqual(prevValue, currValue) :
                    change_detection_util_1.ChangeDetectionUtil.looseNotIdentical(prevValue, currValue);
                if (detectedChange) {
                    currValue = change_detection_util_1.ChangeDetectionUtil.unwrapValue(currValue);
                    if (proto.lastInBinding) {
                        var change = change_detection_util_1.ChangeDetectionUtil.simpleChange(prevValue, currValue);
                        if (throwOnChange)
                            this.throwOnChangeError(prevValue, currValue);
                        this._writeSelf(proto, currValue, values);
                        this._setChanged(proto, true);
                        return change;
                    }
                    else {
                        this._writeSelf(proto, currValue, values);
                        this._setChanged(proto, true);
                        return null;
                    }
                }
                else {
                    this._setChanged(proto, false);
                    return null;
                }
            }
            else {
                this._writeSelf(proto, currValue, values);
                this._setChanged(proto, true);
                return null;
            }
        }
    };
    DynamicChangeDetector.prototype._pipeFor = function (proto, context) {
        var storedPipe = this._readPipe(proto);
        if (lang_1.isPresent(storedPipe))
            return storedPipe;
        var pipe = this.pipes.get(proto.name);
        this._writePipe(proto, pipe);
        return pipe;
    };
    DynamicChangeDetector.prototype._readContext = function (proto, values) {
        if (proto.contextIndex == -1) {
            return this._getDirectiveFor(proto.directiveIndex);
        }
        return values[proto.contextIndex];
    };
    DynamicChangeDetector.prototype._readSelf = function (proto, values) { return values[proto.selfIndex]; };
    DynamicChangeDetector.prototype._writeSelf = function (proto, value, values) { values[proto.selfIndex] = value; };
    DynamicChangeDetector.prototype._readPipe = function (proto) { return this.localPipes[proto.selfIndex]; };
    DynamicChangeDetector.prototype._writePipe = function (proto, value) { this.localPipes[proto.selfIndex] = value; };
    DynamicChangeDetector.prototype._setChanged = function (proto, value) {
        if (proto.argumentToPureFunction)
            this.changes[proto.selfIndex] = value;
    };
    DynamicChangeDetector.prototype._pureFuncAndArgsDidNotChange = function (proto) {
        return proto.isPureFunction() && !this._argsChanged(proto);
    };
    DynamicChangeDetector.prototype._argsChanged = function (proto) {
        var args = proto.args;
        for (var i = 0; i < args.length; ++i) {
            if (this.changes[args[i]]) {
                return true;
            }
        }
        return false;
    };
    DynamicChangeDetector.prototype._argsOrContextChanged = function (proto) {
        return this._argsChanged(proto) || this.changes[proto.contextIndex];
    };
    DynamicChangeDetector.prototype._readArgs = function (proto, values) {
        var res = collection_1.ListWrapper.createFixedSize(proto.args.length);
        var args = proto.args;
        for (var i = 0; i < args.length; ++i) {
            res[i] = values[args[i]];
        }
        return res;
    };
    return DynamicChangeDetector;
})(abstract_change_detector_1.AbstractChangeDetector);
exports.DynamicChangeDetector = DynamicChangeDetector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pY19jaGFuZ2VfZGV0ZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2R5bmFtaWNfY2hhbmdlX2RldGVjdG9yLnRzIl0sIm5hbWVzIjpbIkR5bmFtaWNDaGFuZ2VEZXRlY3RvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5jb25zdHJ1Y3RvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5oYW5kbGVFdmVudEludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9wcm9jZXNzRXZlbnRCaW5kaW5nIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jb21wdXRlU2tpcExlbmd0aCIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fbWFya1BhdGhBc0NoZWNrT25jZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fbWF0Y2hpbmdFdmVudEJpbmRpbmdzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmh5ZHJhdGVEaXJlY3RpdmVzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jcmVhdGVFdmVudEhhbmRsZXIiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuZGVoeWRyYXRlRGlyZWN0aXZlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fZGVzdHJveVBpcGVzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9kZXN0cm95RGlyZWN0aXZlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5jaGVja05vQ2hhbmdlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWwiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2ZpcnN0SW5CaW5kaW5nIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl91cGRhdGVEaXJlY3RpdmVPckVsZW1lbnQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2FkZENoYW5nZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fZ2V0RGlyZWN0aXZlRm9yIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9nZXREZXRlY3RvckZvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fY2hlY2siLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlZmVyZW5jZUNoZWNrIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jYWxjdWxhdGVDdXJyVmFsdWUiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3BpcGVDaGVjayIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fcGlwZUZvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fcmVhZENvbnRleHQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlYWRTZWxmIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl93cml0ZVNlbGYiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlYWRQaXBlIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl93cml0ZVBpcGUiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3NldENoYW5nZWQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3B1cmVGdW5jQW5kQXJnc0RpZE5vdENoYW5nZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fYXJnc0NoYW5nZWQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2FyZ3NPckNvbnRleHRDaGFuZ2VkIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9yZWFkQXJncyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQkFBaUUsMEJBQTBCLENBQUMsQ0FBQTtBQUM1RiwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCwyQkFBd0QsZ0NBQWdDLENBQUMsQ0FBQTtBQUV6Rix5Q0FBcUMsNEJBQTRCLENBQUMsQ0FBQTtBQU1sRSxzQ0FBZ0QseUJBQXlCLENBQUMsQ0FBQTtB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QUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDL0NBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNyQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0JBQ2RBLENBQUNBO2dCQUNEQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDekNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1lBRTFDQSxLQUFLQSx5QkFBVUEsQ0FBQ0EsU0FBU0E7Z0JBQ3ZCQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDM0NBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBRS9DQSxLQUFLQSx5QkFBVUEsQ0FBQ0EsS0FBS0E7Z0JBQ25CQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDekNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBRS9CQSxLQUFLQSx5QkFBVUEsQ0FBQ0EsYUFBYUE7Z0JBQzNCQSxNQUFNQSxDQUFDQSxzQkFBZUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsRUFDaENBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBRTlEQSxLQUFLQSx5QkFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFDNUJBLEtBQUtBLHlCQUFVQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUM1QkEsS0FBS0EseUJBQVVBLENBQUNBLGlCQUFpQkE7Z0JBQy9CQSxNQUFNQSxDQUFDQSxzQkFBZUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFFakZBO2dCQUNFQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsdUJBQXFCQSxLQUFLQSxDQUFDQSxJQUFNQSxDQUFDQSxDQUFDQTtRQUMvREEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT3ZCLDBDQUFVQSxHQUFsQkEsVUFBbUJBLEtBQWtCQSxFQUFFQSxhQUFzQkEsRUFBRUEsTUFBYUE7UUFDMUV3QixJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUMvQ0EsSUFBSUEsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDakRBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNURBLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1lBQ3pDQSxJQUFJQSxTQUFTQSxHQUFHQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUUzREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsZUFBZUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDOUNBLElBQUlBLGNBQWNBLEdBQUdBLGFBQWFBO29CQUNUQSxDQUFDQSwyQ0FBbUJBLENBQUNBLFlBQVlBLENBQUNBLFNBQVNBLEVBQUVBLFNBQVNBLENBQUNBO29CQUN2REEsMkNBQW1CQSxDQUFDQSxpQkFBaUJBLENBQUNBLFNBQVNBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO2dCQUNyRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ25CQSxTQUFTQSxHQUFHQSwyQ0FBbUJBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO29CQUV2REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQ3hCQSxJQUFJQSxNQUFNQSxHQUFHQSwyQ0FBbUJBLENBQUNBLFlBQVlBLENBQUNBLFNBQVNBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO3dCQUNwRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0E7NEJBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsU0FBU0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7d0JBRWpFQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTt3QkFDMUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO3dCQUU5QkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7b0JBRWhCQSxDQUFDQTtvQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7d0JBQ05BLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO3dCQUMxQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7d0JBQzlCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtvQkFDZEEsQ0FBQ0E7Z0JBQ0hBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDTkEsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7b0JBQy9CQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtnQkFDZEEsQ0FBQ0E7WUFDSEEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO2dCQUMxQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzlCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNkQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVPeEIsd0NBQVFBLEdBQWhCQSxVQUFpQkEsS0FBa0JBLEVBQUVBLE9BQU9BO1FBQzFDeUIsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUU3Q0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDdENBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQzdCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVPekIsNENBQVlBLEdBQXBCQSxVQUFxQkEsS0FBa0JBLEVBQUVBLE1BQWFBO1FBQ3BEMEIsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsWUFBWUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFDckRBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO0lBQ3BDQSxDQUFDQTtJQUVPMUIseUNBQVNBLEdBQWpCQSxVQUFrQkEsS0FBa0JBLEVBQUVBLE1BQWFBLElBQUkyQixNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoRjNCLDBDQUFVQSxHQUFsQkEsVUFBbUJBLEtBQWtCQSxFQUFFQSxLQUFLQSxFQUFFQSxNQUFhQSxJQUFJNEIsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFekY1Qix5Q0FBU0EsR0FBakJBLFVBQWtCQSxLQUFrQkEsSUFBSTZCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTFFN0IsMENBQVVBLEdBQWxCQSxVQUFtQkEsS0FBa0JBLEVBQUVBLEtBQUtBLElBQUk4QixJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVuRjlCLDJDQUFXQSxHQUFuQkEsVUFBb0JBLEtBQWtCQSxFQUFFQSxLQUFjQTtRQUNwRCtCLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLHNCQUFzQkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDMUVBLENBQUNBO0lBRU8vQiw0REFBNEJBLEdBQXBDQSxVQUFxQ0EsS0FBa0JBO1FBQ3JEZ0MsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsY0FBY0EsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRU9oQyw0Q0FBWUEsR0FBcEJBLFVBQXFCQSxLQUFrQkE7UUFDckNpQyxJQUFJQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUN0QkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDckNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDZEEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFFT2pDLHFEQUFxQkEsR0FBN0JBLFVBQThCQSxLQUFrQkE7UUFDOUNrQyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtJQUN0RUEsQ0FBQ0E7SUFFT2xDLHlDQUFTQSxHQUFqQkEsVUFBa0JBLEtBQWtCQSxFQUFFQSxNQUFhQTtRQUNqRG1DLElBQUlBLEdBQUdBLEdBQUdBLHdCQUFXQSxDQUFDQSxlQUFlQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN6REEsSUFBSUEsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO1lBQ3JDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7SUFDYkEsQ0FBQ0E7SUFDSG5DLDRCQUFDQTtBQUFEQSxDQUFDQSxBQWhlRCxFQUEyQyxpREFBc0IsRUFnZWhFO0FBaGVZLDZCQUFxQix3QkFnZWpDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgRnVuY3Rpb25XcmFwcGVyLCBTdHJpbmdXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtBYnN0cmFjdENoYW5nZURldGVjdG9yfSBmcm9tICcuL2Fic3RyYWN0X2NoYW5nZV9kZXRlY3Rvcic7XG5pbXBvcnQge0V2ZW50QmluZGluZ30gZnJvbSAnLi9ldmVudF9iaW5kaW5nJztcbmltcG9ydCB7QmluZGluZ1JlY29yZCwgQmluZGluZ1RhcmdldH0gZnJvbSAnLi9iaW5kaW5nX3JlY29yZCc7XG5pbXBvcnQge0RpcmVjdGl2ZVJlY29yZCwgRGlyZWN0aXZlSW5kZXh9IGZyb20gJy4vZGlyZWN0aXZlX3JlY29yZCc7XG5pbXBvcnQge0xvY2Fsc30gZnJvbSAnLi9wYXJzZXIvbG9jYWxzJztcbmltcG9ydCB7Q2hhbmdlRGlzcGF0Y2hlciwgQ2hhbmdlRGV0ZWN0b3JHZW5Db25maWd9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblV0aWwsIFNpbXBsZUNoYW5nZX0gZnJvbSAnLi9jaGFuZ2VfZGV0ZWN0aW9uX3V0aWwnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ2hhbmdlRGV0ZWN0b3JTdGF0ZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtQcm90b1JlY29yZCwgUmVjb3JkVHlwZX0gZnJvbSAnLi9wcm90b19yZWNvcmQnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZXhwb3J0IGNsYXNzIER5bmFtaWNDaGFuZ2VEZXRlY3RvciBleHRlbmRzIEFic3RyYWN0Q2hhbmdlRGV0ZWN0b3I8YW55PiB7XG4gIHZhbHVlczogYW55W107XG4gIGNoYW5nZXM6IGFueVtdO1xuICBsb2NhbFBpcGVzOiBhbnlbXTtcbiAgcHJldkNvbnRleHRzOiBhbnlbXTtcblxuICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBudW1iZXJPZlByb3BlcnR5UHJvdG9SZWNvcmRzOiBudW1iZXIsXG4gICAgICAgICAgICAgIHByb3BlcnR5QmluZGluZ1RhcmdldHM6IEJpbmRpbmdUYXJnZXRbXSwgZGlyZWN0aXZlSW5kaWNlczogRGlyZWN0aXZlSW5kZXhbXSxcbiAgICAgICAgICAgICAgc3RyYXRlZ3k6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBwcml2YXRlIF9yZWNvcmRzOiBQcm90b1JlY29yZFtdLFxuICAgICAgICAgICAgICBwcml2YXRlIF9ldmVudEJpbmRpbmdzOiBFdmVudEJpbmRpbmdbXSwgcHJpdmF0ZSBfZGlyZWN0aXZlUmVjb3JkczogRGlyZWN0aXZlUmVjb3JkW10sXG4gICAgICAgICAgICAgIHByaXZhdGUgX2dlbkNvbmZpZzogQ2hhbmdlRGV0ZWN0b3JHZW5Db25maWcpIHtcbiAgICBzdXBlcihpZCwgbnVtYmVyT2ZQcm9wZXJ0eVByb3RvUmVjb3JkcywgcHJvcGVydHlCaW5kaW5nVGFyZ2V0cywgZGlyZWN0aXZlSW5kaWNlcywgc3RyYXRlZ3kpO1xuICAgIHZhciBsZW4gPSBfcmVjb3Jkcy5sZW5ndGggKyAxO1xuICAgIHRoaXMudmFsdWVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG4gICAgdGhpcy5sb2NhbFBpcGVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG4gICAgdGhpcy5wcmV2Q29udGV4dHMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGVuKTtcbiAgICB0aGlzLmNoYW5nZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGVuKTtcblxuICAgIHRoaXMuZGVoeWRyYXRlRGlyZWN0aXZlcyhmYWxzZSk7XG4gIH1cblxuICBoYW5kbGVFdmVudEludGVybmFsKGV2ZW50TmFtZTogc3RyaW5nLCBlbEluZGV4OiBudW1iZXIsIGxvY2FsczogTG9jYWxzKTogYm9vbGVhbiB7XG4gICAgdmFyIHByZXZlbnREZWZhdWx0ID0gZmFsc2U7XG5cbiAgICB0aGlzLl9tYXRjaGluZ0V2ZW50QmluZGluZ3MoZXZlbnROYW1lLCBlbEluZGV4KVxuICAgICAgICAuZm9yRWFjaChyZWMgPT4ge1xuICAgICAgICAgIHZhciByZXMgPSB0aGlzLl9wcm9jZXNzRXZlbnRCaW5kaW5nKHJlYywgbG9jYWxzKTtcbiAgICAgICAgICBpZiAocmVzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICByZXR1cm4gcHJldmVudERlZmF1bHQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wcm9jZXNzRXZlbnRCaW5kaW5nKGViOiBFdmVudEJpbmRpbmcsIGxvY2FsczogTG9jYWxzKTogYW55IHtcbiAgICB2YXIgdmFsdWVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGViLnJlY29yZHMubGVuZ3RoKTtcbiAgICB2YWx1ZXNbMF0gPSB0aGlzLnZhbHVlc1swXTtcblxuICAgIGZvciAodmFyIHByb3RvSWR4ID0gMDsgcHJvdG9JZHggPCBlYi5yZWNvcmRzLmxlbmd0aDsgKytwcm90b0lkeCkge1xuICAgICAgdmFyIHByb3RvID0gZWIucmVjb3Jkc1twcm90b0lkeF07XG5cbiAgICAgIGlmIChwcm90by5pc1NraXBSZWNvcmQoKSkge1xuICAgICAgICBwcm90b0lkeCArPSB0aGlzLl9jb21wdXRlU2tpcExlbmd0aChwcm90b0lkeCwgcHJvdG8sIHZhbHVlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzID0gdGhpcy5fY2FsY3VsYXRlQ3VyclZhbHVlKHByb3RvLCB2YWx1ZXMsIGxvY2Fscyk7XG4gICAgICAgIGlmIChwcm90by5sYXN0SW5CaW5kaW5nKSB7XG4gICAgICAgICAgdGhpcy5fbWFya1BhdGhBc0NoZWNrT25jZShwcm90byk7XG4gICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIHJlcywgdmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQ2Fubm90IGJlIHJlYWNoZWRcIik7XG4gIH1cblxuICBwcml2YXRlIF9jb21wdXRlU2tpcExlbmd0aChwcm90b0luZGV4OiBudW1iZXIsIHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWVzOiBhbnlbXSk6IG51bWJlciB7XG4gICAgaWYgKHByb3RvLm1vZGUgPT09IFJlY29yZFR5cGUuU2tpcFJlY29yZHMpIHtcbiAgICAgIHJldHVybiBwcm90by5maXhlZEFyZ3NbMF0gLSBwcm90b0luZGV4IC0gMTtcbiAgICB9XG5cbiAgICBpZiAocHJvdG8ubW9kZSA9PT0gUmVjb3JkVHlwZS5Ta2lwUmVjb3Jkc0lmKSB7XG4gICAgICBsZXQgY29uZGl0aW9uID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICByZXR1cm4gY29uZGl0aW9uID8gcHJvdG8uZml4ZWRBcmdzWzBdIC0gcHJvdG9JbmRleCAtIDEgOiAwO1xuICAgIH1cblxuICAgIGlmIChwcm90by5tb2RlID09PSBSZWNvcmRUeXBlLlNraXBSZWNvcmRzSWZOb3QpIHtcbiAgICAgIGxldCBjb25kaXRpb24gPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgIHJldHVybiBjb25kaXRpb24gPyAwIDogcHJvdG8uZml4ZWRBcmdzWzBdIC0gcHJvdG9JbmRleCAtIDE7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJDYW5ub3QgYmUgcmVhY2hlZFwiKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX21hcmtQYXRoQXNDaGVja09uY2UocHJvdG86IFByb3RvUmVjb3JkKTogdm9pZCB7XG4gICAgaWYgKCFwcm90by5iaW5kaW5nUmVjb3JkLmlzRGVmYXVsdENoYW5nZURldGVjdGlvbigpKSB7XG4gICAgICB2YXIgZGlyID0gcHJvdG8uYmluZGluZ1JlY29yZC5kaXJlY3RpdmVSZWNvcmQ7XG4gICAgICB0aGlzLl9nZXREZXRlY3RvckZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm1hcmtQYXRoVG9Sb290QXNDaGVja09uY2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXRjaGluZ0V2ZW50QmluZGluZ3MoZXZlbnROYW1lOiBzdHJpbmcsIGVsSW5kZXg6IG51bWJlcik6IEV2ZW50QmluZGluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRCaW5kaW5ncy5maWx0ZXIoZWIgPT4gZWIuZXZlbnROYW1lID09IGV2ZW50TmFtZSAmJiBlYi5lbEluZGV4ID09PSBlbEluZGV4KTtcbiAgfVxuXG4gIGh5ZHJhdGVEaXJlY3RpdmVzKGRpc3BhdGNoZXI6IENoYW5nZURpc3BhdGNoZXIpOiB2b2lkIHtcbiAgICB0aGlzLnZhbHVlc1swXSA9IHRoaXMuY29udGV4dDtcbiAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gICAgaWYgKHRoaXMuc3RyYXRlZ3kgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaE9ic2VydmUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXJlY3RpdmVJbmRpY2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuZGlyZWN0aXZlSW5kaWNlc1tpXTtcbiAgICAgICAgc3VwZXIub2JzZXJ2ZURpcmVjdGl2ZSh0aGlzLl9nZXREaXJlY3RpdmVGb3IoaW5kZXgpLCBpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5vdXRwdXRTdWJzY3JpcHRpb25zID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9kaXJlY3RpdmVSZWNvcmRzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgciA9IHRoaXMuX2RpcmVjdGl2ZVJlY29yZHNbaV07XG4gICAgICBpZiAoaXNQcmVzZW50KHIub3V0cHV0cykpIHtcbiAgICAgICAgci5vdXRwdXRzLmZvckVhY2gob3V0cHV0ID0+IHtcbiAgICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID1cbiAgICAgICAgICAgICAgPGFueT50aGlzLl9jcmVhdGVFdmVudEhhbmRsZXIoci5kaXJlY3RpdmVJbmRleC5lbGVtZW50SW5kZXgsIG91dHB1dFsxXSk7XG4gICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IHRoaXMuX2dldERpcmVjdGl2ZUZvcihyLmRpcmVjdGl2ZUluZGV4KTtcbiAgICAgICAgICB2YXIgZ2V0dGVyID0gcmVmbGVjdG9yLmdldHRlcihvdXRwdXRbMF0pO1xuICAgICAgICAgIHRoaXMub3V0cHV0U3Vic2NyaXB0aW9ucy5wdXNoKFxuICAgICAgICAgICAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoZ2V0dGVyKGRpcmVjdGl2ZSksIGV2ZW50SGFuZGxlcikpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVFdmVudEhhbmRsZXIoYm91bmRFbGVtZW50SW5kZXg6IG51bWJlciwgZXZlbnROYW1lOiBzdHJpbmcpOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIChldmVudCkgPT4gdGhpcy5oYW5kbGVFdmVudChldmVudE5hbWUsIGJvdW5kRWxlbWVudEluZGV4LCBldmVudCk7XG4gIH1cblxuXG4gIGRlaHlkcmF0ZURpcmVjdGl2ZXMoZGVzdHJveVBpcGVzOiBib29sZWFuKSB7XG4gICAgaWYgKGRlc3Ryb3lQaXBlcykge1xuICAgICAgdGhpcy5fZGVzdHJveVBpcGVzKCk7XG4gICAgICB0aGlzLl9kZXN0cm95RGlyZWN0aXZlcygpO1xuICAgIH1cbiAgICB0aGlzLnZhbHVlc1swXSA9IG51bGw7XG4gICAgTGlzdFdyYXBwZXIuZmlsbCh0aGlzLnZhbHVlcywgQ2hhbmdlRGV0ZWN0aW9uVXRpbC51bmluaXRpYWxpemVkLCAxKTtcbiAgICBMaXN0V3JhcHBlci5maWxsKHRoaXMuY2hhbmdlcywgZmFsc2UpO1xuICAgIExpc3RXcmFwcGVyLmZpbGwodGhpcy5sb2NhbFBpcGVzLCBudWxsKTtcbiAgICBMaXN0V3JhcHBlci5maWxsKHRoaXMucHJldkNvbnRleHRzLCBDaGFuZ2VEZXRlY3Rpb25VdGlsLnVuaW5pdGlhbGl6ZWQpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGVzdHJveVBpcGVzKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sb2NhbFBpcGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMubG9jYWxQaXBlc1tpXSkpIHtcbiAgICAgICAgQ2hhbmdlRGV0ZWN0aW9uVXRpbC5jYWxsUGlwZU9uRGVzdHJveSh0aGlzLmxvY2FsUGlwZXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Rlc3Ryb3lEaXJlY3RpdmVzKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZGlyZWN0aXZlUmVjb3Jkcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHJlY29yZCA9IHRoaXMuX2RpcmVjdGl2ZVJlY29yZHNbaV07XG4gICAgICBpZiAocmVjb3JkLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKHJlY29yZC5kaXJlY3RpdmVJbmRleCkubmdPbkRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjaGVja05vQ2hhbmdlcygpOiB2b2lkIHsgdGhpcy5ydW5EZXRlY3RDaGFuZ2VzKHRydWUpOyB9XG5cbiAgZGV0ZWN0Q2hhbmdlc0luUmVjb3Jkc0ludGVybmFsKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pIHtcbiAgICB2YXIgcHJvdG9zID0gdGhpcy5fcmVjb3JkcztcblxuICAgIHZhciBjaGFuZ2VzID0gbnVsbDtcbiAgICB2YXIgaXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgZm9yICh2YXIgcHJvdG9JZHggPSAwOyBwcm90b0lkeCA8IHByb3Rvcy5sZW5ndGg7ICsrcHJvdG9JZHgpIHtcbiAgICAgIHZhciBwcm90bzogUHJvdG9SZWNvcmQgPSBwcm90b3NbcHJvdG9JZHhdO1xuICAgICAgdmFyIGJpbmRpbmdSZWNvcmQgPSBwcm90by5iaW5kaW5nUmVjb3JkO1xuICAgICAgdmFyIGRpcmVjdGl2ZVJlY29yZCA9IGJpbmRpbmdSZWNvcmQuZGlyZWN0aXZlUmVjb3JkO1xuXG4gICAgICBpZiAodGhpcy5fZmlyc3RJbkJpbmRpbmcocHJvdG8pKSB7XG4gICAgICAgIHRoaXMucHJvcGVydHlCaW5kaW5nSW5kZXggPSBwcm90by5wcm9wZXJ0eUJpbmRpbmdJbmRleDtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3RvLmlzTGlmZUN5Y2xlUmVjb3JkKCkpIHtcbiAgICAgICAgaWYgKHByb3RvLm5hbWUgPT09IFwiRG9DaGVja1wiICYmICF0aHJvd09uQ2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCkubmdEb0NoZWNrKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvdG8ubmFtZSA9PT0gXCJPbkluaXRcIiAmJiAhdGhyb3dPbkNoYW5nZSAmJlxuICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQpIHtcbiAgICAgICAgICB0aGlzLl9nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlUmVjb3JkLmRpcmVjdGl2ZUluZGV4KS5uZ09uSW5pdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHByb3RvLm5hbWUgPT09IFwiT25DaGFuZ2VzXCIgJiYgaXNQcmVzZW50KGNoYW5nZXMpICYmICF0aHJvd09uQ2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCkubmdPbkNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocHJvdG8uaXNTa2lwUmVjb3JkKCkpIHtcbiAgICAgICAgcHJvdG9JZHggKz0gdGhpcy5fY29tcHV0ZVNraXBMZW5ndGgocHJvdG9JZHgsIHByb3RvLCB0aGlzLnZhbHVlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgY2hhbmdlID0gdGhpcy5fY2hlY2socHJvdG8sIHRocm93T25DaGFuZ2UsIHRoaXMudmFsdWVzLCB0aGlzLmxvY2Fscyk7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoY2hhbmdlKSkge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZURpcmVjdGl2ZU9yRWxlbWVudChjaGFuZ2UsIGJpbmRpbmdSZWNvcmQpO1xuICAgICAgICAgIGlzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgY2hhbmdlcyA9IHRoaXMuX2FkZENoYW5nZShiaW5kaW5nUmVjb3JkLCBjaGFuZ2UsIGNoYW5nZXMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm90by5sYXN0SW5EaXJlY3RpdmUpIHtcbiAgICAgICAgY2hhbmdlcyA9IG51bGw7XG4gICAgICAgIGlmIChpc0NoYW5nZWQgJiYgIWJpbmRpbmdSZWNvcmQuaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uKCkpIHtcbiAgICAgICAgICB0aGlzLl9nZXREZXRlY3RvckZvcihkaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpLm1hcmtBc0NoZWNrT25jZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmlyc3RJbkJpbmRpbmcocjogUHJvdG9SZWNvcmQpOiBib29sZWFuIHtcbiAgICB2YXIgcHJldiA9IENoYW5nZURldGVjdGlvblV0aWwucHJvdG9CeUluZGV4KHRoaXMuX3JlY29yZHMsIHIuc2VsZkluZGV4IC0gMSk7XG4gICAgcmV0dXJuIGlzQmxhbmsocHJldikgfHwgcHJldi5iaW5kaW5nUmVjb3JkICE9PSByLmJpbmRpbmdSZWNvcmQ7XG4gIH1cblxuICBhZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3NJbnRlcm5hbCgpIHtcbiAgICB2YXIgZGlycyA9IHRoaXMuX2RpcmVjdGl2ZVJlY29yZHM7XG4gICAgZm9yICh2YXIgaSA9IGRpcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHZhciBkaXIgPSBkaXJzW2ldO1xuICAgICAgaWYgKGRpci5jYWxsQWZ0ZXJDb250ZW50SW5pdCAmJiB0aGlzLnN0YXRlID09IENoYW5nZURldGVjdG9yU3RhdGUuTmV2ZXJDaGVja2VkKSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyLmNhbGxBZnRlckNvbnRlbnRDaGVja2VkKSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsKCkge1xuICAgIHZhciBkaXJzID0gdGhpcy5fZGlyZWN0aXZlUmVjb3JkcztcbiAgICBmb3IgKHZhciBpID0gZGlycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdmFyIGRpciA9IGRpcnNbaV07XG4gICAgICBpZiAoZGlyLmNhbGxBZnRlclZpZXdJbml0ICYmIHRoaXMuc3RhdGUgPT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQpIHtcbiAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpci5kaXJlY3RpdmVJbmRleCkubmdBZnRlclZpZXdJbml0KCk7XG4gICAgICB9XG4gICAgICBpZiAoZGlyLmNhbGxBZnRlclZpZXdDaGVja2VkKSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm5nQWZ0ZXJWaWV3Q2hlY2tlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlRGlyZWN0aXZlT3JFbGVtZW50KGNoYW5nZSwgYmluZGluZ1JlY29yZCkge1xuICAgIGlmIChpc0JsYW5rKGJpbmRpbmdSZWNvcmQuZGlyZWN0aXZlUmVjb3JkKSkge1xuICAgICAgc3VwZXIubm90aWZ5RGlzcGF0Y2hlcihjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRpcmVjdGl2ZUluZGV4ID0gYmluZGluZ1JlY29yZC5kaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXg7XG4gICAgICBiaW5kaW5nUmVjb3JkLnNldHRlcih0aGlzLl9nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlSW5kZXgpLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZ2VuQ29uZmlnLmxvZ0JpbmRpbmdVcGRhdGUpIHtcbiAgICAgIHN1cGVyLmxvZ0JpbmRpbmdVcGRhdGUoY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9hZGRDaGFuZ2UoYmluZGluZ1JlY29yZDogQmluZGluZ1JlY29yZCwgY2hhbmdlLCBjaGFuZ2VzKSB7XG4gICAgaWYgKGJpbmRpbmdSZWNvcmQuY2FsbE9uQ2hhbmdlcygpKSB7XG4gICAgICByZXR1cm4gc3VwZXIuYWRkQ2hhbmdlKGNoYW5nZXMsIGNoYW5nZS5wcmV2aW91c1ZhbHVlLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNoYW5nZXM7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlSW5kZXg6IERpcmVjdGl2ZUluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hlci5nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlSW5kZXgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9nZXREZXRlY3RvckZvcihkaXJlY3RpdmVJbmRleDogRGlyZWN0aXZlSW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaGVyLmdldERldGVjdG9yRm9yKGRpcmVjdGl2ZUluZGV4KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfY2hlY2socHJvdG86IFByb3RvUmVjb3JkLCB0aHJvd09uQ2hhbmdlOiBib29sZWFuLCB2YWx1ZXM6IGFueVtdLFxuICAgICAgICAgICAgICAgICBsb2NhbHM6IExvY2Fscyk6IFNpbXBsZUNoYW5nZSB7XG4gICAgaWYgKHByb3RvLmlzUGlwZVJlY29yZCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGlwZUNoZWNrKHByb3RvLCB0aHJvd09uQ2hhbmdlLCB2YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlQ2hlY2socHJvdG8sIHRocm93T25DaGFuZ2UsIHZhbHVlcywgbG9jYWxzKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3JlZmVyZW5jZUNoZWNrKHByb3RvOiBQcm90b1JlY29yZCwgdGhyb3dPbkNoYW5nZTogYm9vbGVhbiwgdmFsdWVzOiBhbnlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxzOiBMb2NhbHMpIHtcbiAgICBpZiAodGhpcy5fcHVyZUZ1bmNBbmRBcmdzRGlkTm90Q2hhbmdlKHByb3RvKSkge1xuICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgZmFsc2UpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGN1cnJWYWx1ZSA9IHRoaXMuX2NhbGN1bGF0ZUN1cnJWYWx1ZShwcm90bywgdmFsdWVzLCBsb2NhbHMpO1xuICAgIGlmICh0aGlzLnN0cmF0ZWd5ID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hPYnNlcnZlKSB7XG4gICAgICBzdXBlci5vYnNlcnZlVmFsdWUoY3VyclZhbHVlLCBwcm90by5zZWxmSW5kZXgpO1xuICAgIH1cblxuICAgIGlmIChwcm90by5zaG91bGRCZUNoZWNrZWQoKSkge1xuICAgICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuX3JlYWRTZWxmKHByb3RvLCB2YWx1ZXMpO1xuICAgICAgdmFyIGRldGVjdGVkQ2hhbmdlID0gdGhyb3dPbkNoYW5nZSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIUNoYW5nZURldGVjdGlvblV0aWwuZGV2TW9kZUVxdWFsKHByZXZWYWx1ZSwgY3VyclZhbHVlKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2hhbmdlRGV0ZWN0aW9uVXRpbC5sb29zZU5vdElkZW50aWNhbChwcmV2VmFsdWUsIGN1cnJWYWx1ZSk7XG4gICAgICBpZiAoZGV0ZWN0ZWRDaGFuZ2UpIHtcbiAgICAgICAgaWYgKHByb3RvLmxhc3RJbkJpbmRpbmcpIHtcbiAgICAgICAgICB2YXIgY2hhbmdlID0gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5zaW1wbGVDaGFuZ2UocHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuICAgICAgICAgIGlmICh0aHJvd09uQ2hhbmdlKSB0aGlzLnRocm93T25DaGFuZ2VFcnJvcihwcmV2VmFsdWUsIGN1cnJWYWx1ZSk7XG5cbiAgICAgICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIGN1cnJWYWx1ZSwgdmFsdWVzKTtcbiAgICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCB0cnVlKTtcbiAgICAgICAgICByZXR1cm4gY2hhbmdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3dyaXRlU2VsZihwcm90bywgY3VyclZhbHVlLCB2YWx1ZXMpO1xuICAgICAgICAgIHRoaXMuX3NldENoYW5nZWQocHJvdG8sIHRydWUpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3dyaXRlU2VsZihwcm90bywgY3VyclZhbHVlLCB2YWx1ZXMpO1xuICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgdHJ1ZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jYWxjdWxhdGVDdXJyVmFsdWUocHJvdG86IFByb3RvUmVjb3JkLCB2YWx1ZXM6IGFueVtdLCBsb2NhbHM6IExvY2Fscykge1xuICAgIHN3aXRjaCAocHJvdG8ubW9kZSkge1xuICAgICAgY2FzZSBSZWNvcmRUeXBlLlNlbGY6XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkNvbnN0OlxuICAgICAgICByZXR1cm4gcHJvdG8uZnVuY09yVmFsdWU7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5Qcm9wZXJ0eVJlYWQ6XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBwcm90by5mdW5jT3JWYWx1ZShjb250ZXh0KTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLlNhZmVQcm9wZXJ0eTpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIGlzQmxhbmsoY29udGV4dCkgPyBudWxsIDogcHJvdG8uZnVuY09yVmFsdWUoY29udGV4dCk7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5Qcm9wZXJ0eVdyaXRlOlxuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKVswXTtcbiAgICAgICAgcHJvdG8uZnVuY09yVmFsdWUoY29udGV4dCwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5LZXllZFdyaXRlOlxuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICB2YXIga2V5ID0gdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcylbMF07XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpWzFdO1xuICAgICAgICBjb250ZXh0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuTG9jYWw6XG4gICAgICAgIHJldHVybiBsb2NhbHMuZ2V0KHByb3RvLm5hbWUpO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuSW52b2tlTWV0aG9kOlxuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICB2YXIgYXJncyA9IHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gcHJvdG8uZnVuY09yVmFsdWUoY29udGV4dCwgYXJncyk7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5TYWZlTWV0aG9kSW52b2tlOlxuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICBpZiAoaXNCbGFuayhjb250ZXh0KSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcmdzID0gdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBwcm90by5mdW5jT3JWYWx1ZShjb250ZXh0LCBhcmdzKTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLktleWVkUmVhZDpcbiAgICAgICAgdmFyIGFyZyA9IHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpWzBdO1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcylbYXJnXTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkNoYWluOlxuICAgICAgICB2YXIgYXJncyA9IHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuSW52b2tlQ2xvc3VyZTpcbiAgICAgICAgcmV0dXJuIEZ1bmN0aW9uV3JhcHBlci5hcHBseSh0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKSk7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5JbnRlcnBvbGF0ZTpcbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5QcmltaXRpdmVPcDpcbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5Db2xsZWN0aW9uTGl0ZXJhbDpcbiAgICAgICAgcmV0dXJuIEZ1bmN0aW9uV3JhcHBlci5hcHBseShwcm90by5mdW5jT3JWYWx1ZSwgdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcykpO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5rbm93biBvcGVyYXRpb24gJHtwcm90by5tb2RlfWApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BpcGVDaGVjayhwcm90bzogUHJvdG9SZWNvcmQsIHRocm93T25DaGFuZ2U6IGJvb2xlYW4sIHZhbHVlczogYW55W10pIHtcbiAgICB2YXIgY29udGV4dCA9IHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuICAgIHZhciBzZWxlY3RlZFBpcGUgPSB0aGlzLl9waXBlRm9yKHByb3RvLCBjb250ZXh0KTtcbiAgICBpZiAoIXNlbGVjdGVkUGlwZS5wdXJlIHx8IHRoaXMuX2FyZ3NPckNvbnRleHRDaGFuZ2VkKHByb3RvKSkge1xuICAgICAgdmFyIGFyZ3MgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKTtcbiAgICAgIHZhciBjdXJyVmFsdWUgPSBzZWxlY3RlZFBpcGUucGlwZS50cmFuc2Zvcm0oY29udGV4dCwgYXJncyk7XG5cbiAgICAgIGlmIChwcm90by5zaG91bGRCZUNoZWNrZWQoKSkge1xuICAgICAgICB2YXIgcHJldlZhbHVlID0gdGhpcy5fcmVhZFNlbGYocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIHZhciBkZXRlY3RlZENoYW5nZSA9IHRocm93T25DaGFuZ2UgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIUNoYW5nZURldGVjdGlvblV0aWwuZGV2TW9kZUVxdWFsKHByZXZWYWx1ZSwgY3VyclZhbHVlKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDaGFuZ2VEZXRlY3Rpb25VdGlsLmxvb3NlTm90SWRlbnRpY2FsKHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgICAgaWYgKGRldGVjdGVkQ2hhbmdlKSB7XG4gICAgICAgICAgY3VyclZhbHVlID0gQ2hhbmdlRGV0ZWN0aW9uVXRpbC51bndyYXBWYWx1ZShjdXJyVmFsdWUpO1xuXG4gICAgICAgICAgaWYgKHByb3RvLmxhc3RJbkJpbmRpbmcpIHtcbiAgICAgICAgICAgIHZhciBjaGFuZ2UgPSBDaGFuZ2VEZXRlY3Rpb25VdGlsLnNpbXBsZUNoYW5nZShwcmV2VmFsdWUsIGN1cnJWYWx1ZSk7XG4gICAgICAgICAgICBpZiAodGhyb3dPbkNoYW5nZSkgdGhpcy50aHJvd09uQ2hhbmdlRXJyb3IocHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuXG4gICAgICAgICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIGN1cnJWYWx1ZSwgdmFsdWVzKTtcbiAgICAgICAgICAgIHRoaXMuX3NldENoYW5nZWQocHJvdG8sIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gY2hhbmdlO1xuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3dyaXRlU2VsZihwcm90bywgY3VyclZhbHVlLCB2YWx1ZXMpO1xuICAgICAgICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgZmFsc2UpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIGN1cnJWYWx1ZSwgdmFsdWVzKTtcbiAgICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BpcGVGb3IocHJvdG86IFByb3RvUmVjb3JkLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0b3JlZFBpcGUgPSB0aGlzLl9yZWFkUGlwZShwcm90byk7XG4gICAgaWYgKGlzUHJlc2VudChzdG9yZWRQaXBlKSkgcmV0dXJuIHN0b3JlZFBpcGU7XG5cbiAgICB2YXIgcGlwZSA9IHRoaXMucGlwZXMuZ2V0KHByb3RvLm5hbWUpO1xuICAgIHRoaXMuX3dyaXRlUGlwZShwcm90bywgcGlwZSk7XG4gICAgcmV0dXJuIHBpcGU7XG4gIH1cblxuICBwcml2YXRlIF9yZWFkQ29udGV4dChwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlczogYW55W10pIHtcbiAgICBpZiAocHJvdG8uY29udGV4dEluZGV4ID09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKHByb3RvLmRpcmVjdGl2ZUluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlc1twcm90by5jb250ZXh0SW5kZXhdO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVhZFNlbGYocHJvdG86IFByb3RvUmVjb3JkLCB2YWx1ZXM6IGFueVtdKSB7IHJldHVybiB2YWx1ZXNbcHJvdG8uc2VsZkluZGV4XTsgfVxuXG4gIHByaXZhdGUgX3dyaXRlU2VsZihwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlLCB2YWx1ZXM6IGFueVtdKSB7IHZhbHVlc1twcm90by5zZWxmSW5kZXhdID0gdmFsdWU7IH1cblxuICBwcml2YXRlIF9yZWFkUGlwZShwcm90bzogUHJvdG9SZWNvcmQpIHsgcmV0dXJuIHRoaXMubG9jYWxQaXBlc1twcm90by5zZWxmSW5kZXhdOyB9XG5cbiAgcHJpdmF0ZSBfd3JpdGVQaXBlKHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWUpIHsgdGhpcy5sb2NhbFBpcGVzW3Byb3RvLnNlbGZJbmRleF0gPSB2YWx1ZTsgfVxuXG4gIHByaXZhdGUgX3NldENoYW5nZWQocHJvdG86IFByb3RvUmVjb3JkLCB2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmIChwcm90by5hcmd1bWVudFRvUHVyZUZ1bmN0aW9uKSB0aGlzLmNoYW5nZXNbcHJvdG8uc2VsZkluZGV4XSA9IHZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcHVyZUZ1bmNBbmRBcmdzRGlkTm90Q2hhbmdlKHByb3RvOiBQcm90b1JlY29yZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBwcm90by5pc1B1cmVGdW5jdGlvbigpICYmICF0aGlzLl9hcmdzQ2hhbmdlZChwcm90byk7XG4gIH1cblxuICBwcml2YXRlIF9hcmdzQ2hhbmdlZChwcm90bzogUHJvdG9SZWNvcmQpOiBib29sZWFuIHtcbiAgICB2YXIgYXJncyA9IHByb3RvLmFyZ3M7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAodGhpcy5jaGFuZ2VzW2FyZ3NbaV1dKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9hcmdzT3JDb250ZXh0Q2hhbmdlZChwcm90bzogUHJvdG9SZWNvcmQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYXJnc0NoYW5nZWQocHJvdG8pIHx8IHRoaXMuY2hhbmdlc1twcm90by5jb250ZXh0SW5kZXhdO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVhZEFyZ3MocHJvdG86IFByb3RvUmVjb3JkLCB2YWx1ZXM6IGFueVtdKSB7XG4gICAgdmFyIHJlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShwcm90by5hcmdzLmxlbmd0aCk7XG4gICAgdmFyIGFyZ3MgPSBwcm90by5hcmdzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgcmVzW2ldID0gdmFsdWVzW2FyZ3NbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9XG59XG4iXX0=