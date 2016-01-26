import { isPresent, isBlank, FunctionWrapper } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { AbstractChangeDetector } from './abstract_change_detector';
import { ChangeDetectionUtil } from './change_detection_util';
import { ChangeDetectionStrategy, ChangeDetectorState } from './constants';
import { RecordType } from './proto_record';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { ObservableWrapper } from 'angular2/src/facade/async';
export class DynamicChangeDetector extends AbstractChangeDetector {
    constructor(id, numberOfPropertyProtoRecords, propertyBindingTargets, directiveIndices, strategy, _records, _eventBindings, _directiveRecords, _genConfig) {
        super(id, numberOfPropertyProtoRecords, propertyBindingTargets, directiveIndices, strategy);
        this._records = _records;
        this._eventBindings = _eventBindings;
        this._directiveRecords = _directiveRecords;
        this._genConfig = _genConfig;
        var len = _records.length + 1;
        this.values = ListWrapper.createFixedSize(len);
        this.localPipes = ListWrapper.createFixedSize(len);
        this.prevContexts = ListWrapper.createFixedSize(len);
        this.changes = ListWrapper.createFixedSize(len);
        this.dehydrateDirectives(false);
    }
    handleEventInternal(eventName, elIndex, locals) {
        var preventDefault = false;
        this._matchingEventBindings(eventName, elIndex)
            .forEach(rec => {
            var res = this._processEventBinding(rec, locals);
            if (res === false) {
                preventDefault = true;
            }
        });
        return preventDefault;
    }
    /** @internal */
    _processEventBinding(eb, locals) {
        var values = ListWrapper.createFixedSize(eb.records.length);
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
        throw new BaseException("Cannot be reached");
    }
    _computeSkipLength(protoIndex, proto, values) {
        if (proto.mode === RecordType.SkipRecords) {
            return proto.fixedArgs[0] - protoIndex - 1;
        }
        if (proto.mode === RecordType.SkipRecordsIf) {
            let condition = this._readContext(proto, values);
            return condition ? proto.fixedArgs[0] - protoIndex - 1 : 0;
        }
        if (proto.mode === RecordType.SkipRecordsIfNot) {
            let condition = this._readContext(proto, values);
            return condition ? 0 : proto.fixedArgs[0] - protoIndex - 1;
        }
        throw new BaseException("Cannot be reached");
    }
    /** @internal */
    _markPathAsCheckOnce(proto) {
        if (!proto.bindingRecord.isDefaultChangeDetection()) {
            var dir = proto.bindingRecord.directiveRecord;
            this._getDetectorFor(dir.directiveIndex).markPathToRootAsCheckOnce();
        }
    }
    /** @internal */
    _matchingEventBindings(eventName, elIndex) {
        return this._eventBindings.filter(eb => eb.eventName == eventName && eb.elIndex === elIndex);
    }
    hydrateDirectives(dispatcher) {
        this.values[0] = this.context;
        this.dispatcher = dispatcher;
        if (this.strategy === ChangeDetectionStrategy.OnPushObserve) {
            for (var i = 0; i < this.directiveIndices.length; ++i) {
                var index = this.directiveIndices[i];
                super.observeDirective(this._getDirectiveFor(index), i);
            }
        }
        this.outputSubscriptions = [];
        for (var i = 0; i < this._directiveRecords.length; ++i) {
            var r = this._directiveRecords[i];
            if (isPresent(r.outputs)) {
                r.outputs.forEach(output => {
                    var eventHandler = this._createEventHandler(r.directiveIndex.elementIndex, output[1]);
                    var directive = this._getDirectiveFor(r.directiveIndex);
                    var getter = reflector.getter(output[0]);
                    this.outputSubscriptions.push(ObservableWrapper.subscribe(getter(directive), eventHandler));
                });
            }
        }
    }
    _createEventHandler(boundElementIndex, eventName) {
        return (event) => this.handleEvent(eventName, boundElementIndex, event);
    }
    dehydrateDirectives(destroyPipes) {
        if (destroyPipes) {
            this._destroyPipes();
            this._destroyDirectives();
        }
        this.values[0] = null;
        ListWrapper.fill(this.values, ChangeDetectionUtil.uninitialized, 1);
        ListWrapper.fill(this.changes, false);
        ListWrapper.fill(this.localPipes, null);
        ListWrapper.fill(this.prevContexts, ChangeDetectionUtil.uninitialized);
    }
    /** @internal */
    _destroyPipes() {
        for (var i = 0; i < this.localPipes.length; ++i) {
            if (isPresent(this.localPipes[i])) {
                ChangeDetectionUtil.callPipeOnDestroy(this.localPipes[i]);
            }
        }
    }
    /** @internal */
    _destroyDirectives() {
        for (var i = 0; i < this._directiveRecords.length; ++i) {
            var record = this._directiveRecords[i];
            if (record.callOnDestroy) {
                this._getDirectiveFor(record.directiveIndex).ngOnDestroy();
            }
        }
    }
    checkNoChanges() { this.runDetectChanges(true); }
    detectChangesInRecordsInternal(throwOnChange) {
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
                    this.state == ChangeDetectorState.NeverChecked) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).ngOnInit();
                }
                else if (proto.name === "OnChanges" && isPresent(changes) && !throwOnChange) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).ngOnChanges(changes);
                }
            }
            else if (proto.isSkipRecord()) {
                protoIdx += this._computeSkipLength(protoIdx, proto, this.values);
            }
            else {
                var change = this._check(proto, throwOnChange, this.values, this.locals);
                if (isPresent(change)) {
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
    }
    /** @internal */
    _firstInBinding(r) {
        var prev = ChangeDetectionUtil.protoByIndex(this._records, r.selfIndex - 1);
        return isBlank(prev) || prev.bindingRecord !== r.bindingRecord;
    }
    afterContentLifecycleCallbacksInternal() {
        var dirs = this._directiveRecords;
        for (var i = dirs.length - 1; i >= 0; --i) {
            var dir = dirs[i];
            if (dir.callAfterContentInit && this.state == ChangeDetectorState.NeverChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterContentInit();
            }
            if (dir.callAfterContentChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterContentChecked();
            }
        }
    }
    afterViewLifecycleCallbacksInternal() {
        var dirs = this._directiveRecords;
        for (var i = dirs.length - 1; i >= 0; --i) {
            var dir = dirs[i];
            if (dir.callAfterViewInit && this.state == ChangeDetectorState.NeverChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterViewInit();
            }
            if (dir.callAfterViewChecked) {
                this._getDirectiveFor(dir.directiveIndex).ngAfterViewChecked();
            }
        }
    }
    /** @internal */
    _updateDirectiveOrElement(change, bindingRecord) {
        if (isBlank(bindingRecord.directiveRecord)) {
            super.notifyDispatcher(change.currentValue);
        }
        else {
            var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
            bindingRecord.setter(this._getDirectiveFor(directiveIndex), change.currentValue);
        }
        if (this._genConfig.logBindingUpdate) {
            super.logBindingUpdate(change.currentValue);
        }
    }
    /** @internal */
    _addChange(bindingRecord, change, changes) {
        if (bindingRecord.callOnChanges()) {
            return super.addChange(changes, change.previousValue, change.currentValue);
        }
        else {
            return changes;
        }
    }
    /** @internal */
    _getDirectiveFor(directiveIndex) {
        return this.dispatcher.getDirectiveFor(directiveIndex);
    }
    /** @internal */
    _getDetectorFor(directiveIndex) {
        return this.dispatcher.getDetectorFor(directiveIndex);
    }
    /** @internal */
    _check(proto, throwOnChange, values, locals) {
        if (proto.isPipeRecord()) {
            return this._pipeCheck(proto, throwOnChange, values);
        }
        else {
            return this._referenceCheck(proto, throwOnChange, values, locals);
        }
    }
    /** @internal */
    _referenceCheck(proto, throwOnChange, values, locals) {
        if (this._pureFuncAndArgsDidNotChange(proto)) {
            this._setChanged(proto, false);
            return null;
        }
        var currValue = this._calculateCurrValue(proto, values, locals);
        if (this.strategy === ChangeDetectionStrategy.OnPushObserve) {
            super.observeValue(currValue, proto.selfIndex);
        }
        if (proto.shouldBeChecked()) {
            var prevValue = this._readSelf(proto, values);
            if (ChangeDetectionUtil.looseNotIdentical(prevValue, currValue)) {
                if (proto.lastInBinding) {
                    var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
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
    _calculateCurrValue(proto, values, locals) {
        switch (proto.mode) {
            case RecordType.Self:
                return this._readContext(proto, values);
            case RecordType.Const:
                return proto.funcOrValue;
            case RecordType.PropertyRead:
                var context = this._readContext(proto, values);
                return proto.funcOrValue(context);
            case RecordType.SafeProperty:
                var context = this._readContext(proto, values);
                return isBlank(context) ? null : proto.funcOrValue(context);
            case RecordType.PropertyWrite:
                var context = this._readContext(proto, values);
                var value = this._readArgs(proto, values)[0];
                proto.funcOrValue(context, value);
                return value;
            case RecordType.KeyedWrite:
                var context = this._readContext(proto, values);
                var key = this._readArgs(proto, values)[0];
                var value = this._readArgs(proto, values)[1];
                context[key] = value;
                return value;
            case RecordType.Local:
                return locals.get(proto.name);
            case RecordType.InvokeMethod:
                var context = this._readContext(proto, values);
                var args = this._readArgs(proto, values);
                return proto.funcOrValue(context, args);
            case RecordType.SafeMethodInvoke:
                var context = this._readContext(proto, values);
                if (isBlank(context)) {
                    return null;
                }
                var args = this._readArgs(proto, values);
                return proto.funcOrValue(context, args);
            case RecordType.KeyedRead:
                var arg = this._readArgs(proto, values)[0];
                return this._readContext(proto, values)[arg];
            case RecordType.Chain:
                var args = this._readArgs(proto, values);
                return args[args.length - 1];
            case RecordType.InvokeClosure:
                return FunctionWrapper.apply(this._readContext(proto, values), this._readArgs(proto, values));
            case RecordType.Interpolate:
            case RecordType.PrimitiveOp:
            case RecordType.CollectionLiteral:
                return FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto, values));
            default:
                throw new BaseException(`Unknown operation ${proto.mode}`);
        }
    }
    _pipeCheck(proto, throwOnChange, values) {
        var context = this._readContext(proto, values);
        var selectedPipe = this._pipeFor(proto, context);
        if (!selectedPipe.pure || this._argsOrContextChanged(proto)) {
            var args = this._readArgs(proto, values);
            var currValue = selectedPipe.pipe.transform(context, args);
            if (proto.shouldBeChecked()) {
                var prevValue = this._readSelf(proto, values);
                if (ChangeDetectionUtil.looseNotIdentical(prevValue, currValue)) {
                    currValue = ChangeDetectionUtil.unwrapValue(currValue);
                    if (proto.lastInBinding) {
                        var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
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
    }
    _pipeFor(proto, context) {
        var storedPipe = this._readPipe(proto);
        if (isPresent(storedPipe))
            return storedPipe;
        var pipe = this.pipes.get(proto.name);
        this._writePipe(proto, pipe);
        return pipe;
    }
    _readContext(proto, values) {
        if (proto.contextIndex == -1) {
            return this._getDirectiveFor(proto.directiveIndex);
        }
        return values[proto.contextIndex];
    }
    _readSelf(proto, values) { return values[proto.selfIndex]; }
    _writeSelf(proto, value, values) { values[proto.selfIndex] = value; }
    _readPipe(proto) { return this.localPipes[proto.selfIndex]; }
    _writePipe(proto, value) { this.localPipes[proto.selfIndex] = value; }
    _setChanged(proto, value) {
        if (proto.argumentToPureFunction)
            this.changes[proto.selfIndex] = value;
    }
    _pureFuncAndArgsDidNotChange(proto) {
        return proto.isPureFunction() && !this._argsChanged(proto);
    }
    _argsChanged(proto) {
        var args = proto.args;
        for (var i = 0; i < args.length; ++i) {
            if (this.changes[args[i]]) {
                return true;
            }
        }
        return false;
    }
    _argsOrContextChanged(proto) {
        return this._argsChanged(proto) || this.changes[proto.contextIndex];
    }
    _readArgs(proto, values) {
        var res = ListWrapper.createFixedSize(proto.args.length);
        var args = proto.args;
        for (var i = 0; i < args.length; ++i) {
            res[i] = values[args[i]];
        }
        return res;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pY19jaGFuZ2VfZGV0ZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2R5bmFtaWNfY2hhbmdlX2RldGVjdG9yLnRzIl0sIm5hbWVzIjpbIkR5bmFtaWNDaGFuZ2VEZXRlY3RvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5jb25zdHJ1Y3RvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5oYW5kbGVFdmVudEludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9wcm9jZXNzRXZlbnRCaW5kaW5nIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jb21wdXRlU2tpcExlbmd0aCIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fbWFya1BhdGhBc0NoZWNrT25jZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fbWF0Y2hpbmdFdmVudEJpbmRpbmdzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmh5ZHJhdGVEaXJlY3RpdmVzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jcmVhdGVFdmVudEhhbmRsZXIiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuZGVoeWRyYXRlRGlyZWN0aXZlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fZGVzdHJveVBpcGVzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9kZXN0cm95RGlyZWN0aXZlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5jaGVja05vQ2hhbmdlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWwiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2ZpcnN0SW5CaW5kaW5nIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl91cGRhdGVEaXJlY3RpdmVPckVsZW1lbnQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2FkZENoYW5nZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fZ2V0RGlyZWN0aXZlRm9yIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9nZXREZXRlY3RvckZvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fY2hlY2siLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlZmVyZW5jZUNoZWNrIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jYWxjdWxhdGVDdXJyVmFsdWUiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3BpcGVDaGVjayIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fcGlwZUZvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fcmVhZENvbnRleHQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlYWRTZWxmIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl93cml0ZVNlbGYiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlYWRQaXBlIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl93cml0ZVBpcGUiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3NldENoYW5nZWQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3B1cmVGdW5jQW5kQXJnc0RpZE5vdENoYW5nZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fYXJnc0NoYW5nZWQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2FyZ3NPckNvbnRleHRDaGFuZ2VkIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9yZWFkQXJncyJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBZ0IsTUFBTSwwQkFBMEI7T0FDcEYsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxXQUFXLEVBQStCLE1BQU0sZ0NBQWdDO09BRWpGLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSw0QkFBNEI7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QUFNQSxDQUFDQSxDQUFDQTtnQkFDL0NBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBRXBDQSxLQUFLQSxVQUFVQSxDQUFDQSxZQUFZQTtnQkFDMUJBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO2dCQUMvQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFFOURBLEtBQUtBLFVBQVVBLENBQUNBLGFBQWFBO2dCQUMzQkEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQy9DQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDN0NBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNsQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFFZkEsS0FBS0EsVUFBVUEsQ0FBQ0EsVUFBVUE7Z0JBQ3hCQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDL0NBLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMzQ0EsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FB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Q0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFFT2pDLHFCQUFxQkEsQ0FBQ0EsS0FBa0JBO1FBQzlDa0MsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDdEVBLENBQUNBO0lBRU9sQyxTQUFTQSxDQUFDQSxLQUFrQkEsRUFBRUEsTUFBYUE7UUFDakRtQyxJQUFJQSxHQUFHQSxHQUFHQSxXQUFXQSxDQUFDQSxlQUFlQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN6REEsSUFBSUEsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO1lBQ3JDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7SUFDYkEsQ0FBQ0E7QUFDSG5DLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgRnVuY3Rpb25XcmFwcGVyLCBTdHJpbmdXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtBYnN0cmFjdENoYW5nZURldGVjdG9yfSBmcm9tICcuL2Fic3RyYWN0X2NoYW5nZV9kZXRlY3Rvcic7XG5pbXBvcnQge0V2ZW50QmluZGluZ30gZnJvbSAnLi9ldmVudF9iaW5kaW5nJztcbmltcG9ydCB7QmluZGluZ1JlY29yZCwgQmluZGluZ1RhcmdldH0gZnJvbSAnLi9iaW5kaW5nX3JlY29yZCc7XG5pbXBvcnQge0RpcmVjdGl2ZVJlY29yZCwgRGlyZWN0aXZlSW5kZXh9IGZyb20gJy4vZGlyZWN0aXZlX3JlY29yZCc7XG5pbXBvcnQge0xvY2Fsc30gZnJvbSAnLi9wYXJzZXIvbG9jYWxzJztcbmltcG9ydCB7Q2hhbmdlRGlzcGF0Y2hlciwgQ2hhbmdlRGV0ZWN0b3JHZW5Db25maWd9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblV0aWwsIFNpbXBsZUNoYW5nZX0gZnJvbSAnLi9jaGFuZ2VfZGV0ZWN0aW9uX3V0aWwnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ2hhbmdlRGV0ZWN0b3JTdGF0ZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtQcm90b1JlY29yZCwgUmVjb3JkVHlwZX0gZnJvbSAnLi9wcm90b19yZWNvcmQnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZXhwb3J0IGNsYXNzIER5bmFtaWNDaGFuZ2VEZXRlY3RvciBleHRlbmRzIEFic3RyYWN0Q2hhbmdlRGV0ZWN0b3I8YW55PiB7XG4gIHZhbHVlczogYW55W107XG4gIGNoYW5nZXM6IGFueVtdO1xuICBsb2NhbFBpcGVzOiBhbnlbXTtcbiAgcHJldkNvbnRleHRzOiBhbnlbXTtcblxuICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBudW1iZXJPZlByb3BlcnR5UHJvdG9SZWNvcmRzOiBudW1iZXIsXG4gICAgICAgICAgICAgIHByb3BlcnR5QmluZGluZ1RhcmdldHM6IEJpbmRpbmdUYXJnZXRbXSwgZGlyZWN0aXZlSW5kaWNlczogRGlyZWN0aXZlSW5kZXhbXSxcbiAgICAgICAgICAgICAgc3RyYXRlZ3k6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBwcml2YXRlIF9yZWNvcmRzOiBQcm90b1JlY29yZFtdLFxuICAgICAgICAgICAgICBwcml2YXRlIF9ldmVudEJpbmRpbmdzOiBFdmVudEJpbmRpbmdbXSwgcHJpdmF0ZSBfZGlyZWN0aXZlUmVjb3JkczogRGlyZWN0aXZlUmVjb3JkW10sXG4gICAgICAgICAgICAgIHByaXZhdGUgX2dlbkNvbmZpZzogQ2hhbmdlRGV0ZWN0b3JHZW5Db25maWcpIHtcbiAgICBzdXBlcihpZCwgbnVtYmVyT2ZQcm9wZXJ0eVByb3RvUmVjb3JkcywgcHJvcGVydHlCaW5kaW5nVGFyZ2V0cywgZGlyZWN0aXZlSW5kaWNlcywgc3RyYXRlZ3kpO1xuICAgIHZhciBsZW4gPSBfcmVjb3Jkcy5sZW5ndGggKyAxO1xuICAgIHRoaXMudmFsdWVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG4gICAgdGhpcy5sb2NhbFBpcGVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG4gICAgdGhpcy5wcmV2Q29udGV4dHMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGVuKTtcbiAgICB0aGlzLmNoYW5nZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGVuKTtcblxuICAgIHRoaXMuZGVoeWRyYXRlRGlyZWN0aXZlcyhmYWxzZSk7XG4gIH1cblxuICBoYW5kbGVFdmVudEludGVybmFsKGV2ZW50TmFtZTogc3RyaW5nLCBlbEluZGV4OiBudW1iZXIsIGxvY2FsczogTG9jYWxzKTogYm9vbGVhbiB7XG4gICAgdmFyIHByZXZlbnREZWZhdWx0ID0gZmFsc2U7XG5cbiAgICB0aGlzLl9tYXRjaGluZ0V2ZW50QmluZGluZ3MoZXZlbnROYW1lLCBlbEluZGV4KVxuICAgICAgICAuZm9yRWFjaChyZWMgPT4ge1xuICAgICAgICAgIHZhciByZXMgPSB0aGlzLl9wcm9jZXNzRXZlbnRCaW5kaW5nKHJlYywgbG9jYWxzKTtcbiAgICAgICAgICBpZiAocmVzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICByZXR1cm4gcHJldmVudERlZmF1bHQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9wcm9jZXNzRXZlbnRCaW5kaW5nKGViOiBFdmVudEJpbmRpbmcsIGxvY2FsczogTG9jYWxzKTogYW55IHtcbiAgICB2YXIgdmFsdWVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGViLnJlY29yZHMubGVuZ3RoKTtcbiAgICB2YWx1ZXNbMF0gPSB0aGlzLnZhbHVlc1swXTtcblxuICAgIGZvciAodmFyIHByb3RvSWR4ID0gMDsgcHJvdG9JZHggPCBlYi5yZWNvcmRzLmxlbmd0aDsgKytwcm90b0lkeCkge1xuICAgICAgdmFyIHByb3RvID0gZWIucmVjb3Jkc1twcm90b0lkeF07XG5cbiAgICAgIGlmIChwcm90by5pc1NraXBSZWNvcmQoKSkge1xuICAgICAgICBwcm90b0lkeCArPSB0aGlzLl9jb21wdXRlU2tpcExlbmd0aChwcm90b0lkeCwgcHJvdG8sIHZhbHVlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzID0gdGhpcy5fY2FsY3VsYXRlQ3VyclZhbHVlKHByb3RvLCB2YWx1ZXMsIGxvY2Fscyk7XG4gICAgICAgIGlmIChwcm90by5sYXN0SW5CaW5kaW5nKSB7XG4gICAgICAgICAgdGhpcy5fbWFya1BhdGhBc0NoZWNrT25jZShwcm90byk7XG4gICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIHJlcywgdmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQ2Fubm90IGJlIHJlYWNoZWRcIik7XG4gIH1cblxuICBwcml2YXRlIF9jb21wdXRlU2tpcExlbmd0aChwcm90b0luZGV4OiBudW1iZXIsIHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWVzOiBhbnlbXSk6IG51bWJlciB7XG4gICAgaWYgKHByb3RvLm1vZGUgPT09IFJlY29yZFR5cGUuU2tpcFJlY29yZHMpIHtcbiAgICAgIHJldHVybiBwcm90by5maXhlZEFyZ3NbMF0gLSBwcm90b0luZGV4IC0gMTtcbiAgICB9XG5cbiAgICBpZiAocHJvdG8ubW9kZSA9PT0gUmVjb3JkVHlwZS5Ta2lwUmVjb3Jkc0lmKSB7XG4gICAgICBsZXQgY29uZGl0aW9uID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICByZXR1cm4gY29uZGl0aW9uID8gcHJvdG8uZml4ZWRBcmdzWzBdIC0gcHJvdG9JbmRleCAtIDEgOiAwO1xuICAgIH1cblxuICAgIGlmIChwcm90by5tb2RlID09PSBSZWNvcmRUeXBlLlNraXBSZWNvcmRzSWZOb3QpIHtcbiAgICAgIGxldCBjb25kaXRpb24gPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgIHJldHVybiBjb25kaXRpb24gPyAwIDogcHJvdG8uZml4ZWRBcmdzWzBdIC0gcHJvdG9JbmRleCAtIDE7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJDYW5ub3QgYmUgcmVhY2hlZFwiKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX21hcmtQYXRoQXNDaGVja09uY2UocHJvdG86IFByb3RvUmVjb3JkKTogdm9pZCB7XG4gICAgaWYgKCFwcm90by5iaW5kaW5nUmVjb3JkLmlzRGVmYXVsdENoYW5nZURldGVjdGlvbigpKSB7XG4gICAgICB2YXIgZGlyID0gcHJvdG8uYmluZGluZ1JlY29yZC5kaXJlY3RpdmVSZWNvcmQ7XG4gICAgICB0aGlzLl9nZXREZXRlY3RvckZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm1hcmtQYXRoVG9Sb290QXNDaGVja09uY2UoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXRjaGluZ0V2ZW50QmluZGluZ3MoZXZlbnROYW1lOiBzdHJpbmcsIGVsSW5kZXg6IG51bWJlcik6IEV2ZW50QmluZGluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5fZXZlbnRCaW5kaW5ncy5maWx0ZXIoZWIgPT4gZWIuZXZlbnROYW1lID09IGV2ZW50TmFtZSAmJiBlYi5lbEluZGV4ID09PSBlbEluZGV4KTtcbiAgfVxuXG4gIGh5ZHJhdGVEaXJlY3RpdmVzKGRpc3BhdGNoZXI6IENoYW5nZURpc3BhdGNoZXIpOiB2b2lkIHtcbiAgICB0aGlzLnZhbHVlc1swXSA9IHRoaXMuY29udGV4dDtcbiAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuXG4gICAgaWYgKHRoaXMuc3RyYXRlZ3kgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaE9ic2VydmUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaXJlY3RpdmVJbmRpY2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuZGlyZWN0aXZlSW5kaWNlc1tpXTtcbiAgICAgICAgc3VwZXIub2JzZXJ2ZURpcmVjdGl2ZSh0aGlzLl9nZXREaXJlY3RpdmVGb3IoaW5kZXgpLCBpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5vdXRwdXRTdWJzY3JpcHRpb25zID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9kaXJlY3RpdmVSZWNvcmRzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgciA9IHRoaXMuX2RpcmVjdGl2ZVJlY29yZHNbaV07XG4gICAgICBpZiAoaXNQcmVzZW50KHIub3V0cHV0cykpIHtcbiAgICAgICAgci5vdXRwdXRzLmZvckVhY2gob3V0cHV0ID0+IHtcbiAgICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID1cbiAgICAgICAgICAgICAgPGFueT50aGlzLl9jcmVhdGVFdmVudEhhbmRsZXIoci5kaXJlY3RpdmVJbmRleC5lbGVtZW50SW5kZXgsIG91dHB1dFsxXSk7XG4gICAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IHRoaXMuX2dldERpcmVjdGl2ZUZvcihyLmRpcmVjdGl2ZUluZGV4KTtcbiAgICAgICAgICB2YXIgZ2V0dGVyID0gcmVmbGVjdG9yLmdldHRlcihvdXRwdXRbMF0pO1xuICAgICAgICAgIHRoaXMub3V0cHV0U3Vic2NyaXB0aW9ucy5wdXNoKFxuICAgICAgICAgICAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoZ2V0dGVyKGRpcmVjdGl2ZSksIGV2ZW50SGFuZGxlcikpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVFdmVudEhhbmRsZXIoYm91bmRFbGVtZW50SW5kZXg6IG51bWJlciwgZXZlbnROYW1lOiBzdHJpbmcpOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIChldmVudCkgPT4gdGhpcy5oYW5kbGVFdmVudChldmVudE5hbWUsIGJvdW5kRWxlbWVudEluZGV4LCBldmVudCk7XG4gIH1cblxuXG4gIGRlaHlkcmF0ZURpcmVjdGl2ZXMoZGVzdHJveVBpcGVzOiBib29sZWFuKSB7XG4gICAgaWYgKGRlc3Ryb3lQaXBlcykge1xuICAgICAgdGhpcy5fZGVzdHJveVBpcGVzKCk7XG4gICAgICB0aGlzLl9kZXN0cm95RGlyZWN0aXZlcygpO1xuICAgIH1cbiAgICB0aGlzLnZhbHVlc1swXSA9IG51bGw7XG4gICAgTGlzdFdyYXBwZXIuZmlsbCh0aGlzLnZhbHVlcywgQ2hhbmdlRGV0ZWN0aW9uVXRpbC51bmluaXRpYWxpemVkLCAxKTtcbiAgICBMaXN0V3JhcHBlci5maWxsKHRoaXMuY2hhbmdlcywgZmFsc2UpO1xuICAgIExpc3RXcmFwcGVyLmZpbGwodGhpcy5sb2NhbFBpcGVzLCBudWxsKTtcbiAgICBMaXN0V3JhcHBlci5maWxsKHRoaXMucHJldkNvbnRleHRzLCBDaGFuZ2VEZXRlY3Rpb25VdGlsLnVuaW5pdGlhbGl6ZWQpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGVzdHJveVBpcGVzKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sb2NhbFBpcGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMubG9jYWxQaXBlc1tpXSkpIHtcbiAgICAgICAgQ2hhbmdlRGV0ZWN0aW9uVXRpbC5jYWxsUGlwZU9uRGVzdHJveSh0aGlzLmxvY2FsUGlwZXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Rlc3Ryb3lEaXJlY3RpdmVzKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZGlyZWN0aXZlUmVjb3Jkcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHJlY29yZCA9IHRoaXMuX2RpcmVjdGl2ZVJlY29yZHNbaV07XG4gICAgICBpZiAocmVjb3JkLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKHJlY29yZC5kaXJlY3RpdmVJbmRleCkubmdPbkRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjaGVja05vQ2hhbmdlcygpOiB2b2lkIHsgdGhpcy5ydW5EZXRlY3RDaGFuZ2VzKHRydWUpOyB9XG5cbiAgZGV0ZWN0Q2hhbmdlc0luUmVjb3Jkc0ludGVybmFsKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pIHtcbiAgICB2YXIgcHJvdG9zID0gdGhpcy5fcmVjb3JkcztcblxuICAgIHZhciBjaGFuZ2VzID0gbnVsbDtcbiAgICB2YXIgaXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgZm9yICh2YXIgcHJvdG9JZHggPSAwOyBwcm90b0lkeCA8IHByb3Rvcy5sZW5ndGg7ICsrcHJvdG9JZHgpIHtcbiAgICAgIHZhciBwcm90bzogUHJvdG9SZWNvcmQgPSBwcm90b3NbcHJvdG9JZHhdO1xuICAgICAgdmFyIGJpbmRpbmdSZWNvcmQgPSBwcm90by5iaW5kaW5nUmVjb3JkO1xuICAgICAgdmFyIGRpcmVjdGl2ZVJlY29yZCA9IGJpbmRpbmdSZWNvcmQuZGlyZWN0aXZlUmVjb3JkO1xuXG4gICAgICBpZiAodGhpcy5fZmlyc3RJbkJpbmRpbmcocHJvdG8pKSB7XG4gICAgICAgIHRoaXMucHJvcGVydHlCaW5kaW5nSW5kZXggPSBwcm90by5wcm9wZXJ0eUJpbmRpbmdJbmRleDtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3RvLmlzTGlmZUN5Y2xlUmVjb3JkKCkpIHtcbiAgICAgICAgaWYgKHByb3RvLm5hbWUgPT09IFwiRG9DaGVja1wiICYmICF0aHJvd09uQ2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCkubmdEb0NoZWNrKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvdG8ubmFtZSA9PT0gXCJPbkluaXRcIiAmJiAhdGhyb3dPbkNoYW5nZSAmJlxuICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQpIHtcbiAgICAgICAgICB0aGlzLl9nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlUmVjb3JkLmRpcmVjdGl2ZUluZGV4KS5uZ09uSW5pdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHByb3RvLm5hbWUgPT09IFwiT25DaGFuZ2VzXCIgJiYgaXNQcmVzZW50KGNoYW5nZXMpICYmICF0aHJvd09uQ2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCkubmdPbkNoYW5nZXMoY2hhbmdlcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocHJvdG8uaXNTa2lwUmVjb3JkKCkpIHtcbiAgICAgICAgcHJvdG9JZHggKz0gdGhpcy5fY29tcHV0ZVNraXBMZW5ndGgocHJvdG9JZHgsIHByb3RvLCB0aGlzLnZhbHVlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgY2hhbmdlID0gdGhpcy5fY2hlY2socHJvdG8sIHRocm93T25DaGFuZ2UsIHRoaXMudmFsdWVzLCB0aGlzLmxvY2Fscyk7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoY2hhbmdlKSkge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZURpcmVjdGl2ZU9yRWxlbWVudChjaGFuZ2UsIGJpbmRpbmdSZWNvcmQpO1xuICAgICAgICAgIGlzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgY2hhbmdlcyA9IHRoaXMuX2FkZENoYW5nZShiaW5kaW5nUmVjb3JkLCBjaGFuZ2UsIGNoYW5nZXMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm90by5sYXN0SW5EaXJlY3RpdmUpIHtcbiAgICAgICAgY2hhbmdlcyA9IG51bGw7XG4gICAgICAgIGlmIChpc0NoYW5nZWQgJiYgIWJpbmRpbmdSZWNvcmQuaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uKCkpIHtcbiAgICAgICAgICB0aGlzLl9nZXREZXRlY3RvckZvcihkaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpLm1hcmtBc0NoZWNrT25jZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmlyc3RJbkJpbmRpbmcocjogUHJvdG9SZWNvcmQpOiBib29sZWFuIHtcbiAgICB2YXIgcHJldiA9IENoYW5nZURldGVjdGlvblV0aWwucHJvdG9CeUluZGV4KHRoaXMuX3JlY29yZHMsIHIuc2VsZkluZGV4IC0gMSk7XG4gICAgcmV0dXJuIGlzQmxhbmsocHJldikgfHwgcHJldi5iaW5kaW5nUmVjb3JkICE9PSByLmJpbmRpbmdSZWNvcmQ7XG4gIH1cblxuICBhZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3NJbnRlcm5hbCgpIHtcbiAgICB2YXIgZGlycyA9IHRoaXMuX2RpcmVjdGl2ZVJlY29yZHM7XG4gICAgZm9yICh2YXIgaSA9IGRpcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHZhciBkaXIgPSBkaXJzW2ldO1xuICAgICAgaWYgKGRpci5jYWxsQWZ0ZXJDb250ZW50SW5pdCAmJiB0aGlzLnN0YXRlID09IENoYW5nZURldGVjdG9yU3RhdGUuTmV2ZXJDaGVja2VkKSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyLmNhbGxBZnRlckNvbnRlbnRDaGVja2VkKSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsKCkge1xuICAgIHZhciBkaXJzID0gdGhpcy5fZGlyZWN0aXZlUmVjb3JkcztcbiAgICBmb3IgKHZhciBpID0gZGlycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdmFyIGRpciA9IGRpcnNbaV07XG4gICAgICBpZiAoZGlyLmNhbGxBZnRlclZpZXdJbml0ICYmIHRoaXMuc3RhdGUgPT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQpIHtcbiAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpci5kaXJlY3RpdmVJbmRleCkubmdBZnRlclZpZXdJbml0KCk7XG4gICAgICB9XG4gICAgICBpZiAoZGlyLmNhbGxBZnRlclZpZXdDaGVja2VkKSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm5nQWZ0ZXJWaWV3Q2hlY2tlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlRGlyZWN0aXZlT3JFbGVtZW50KGNoYW5nZSwgYmluZGluZ1JlY29yZCkge1xuICAgIGlmIChpc0JsYW5rKGJpbmRpbmdSZWNvcmQuZGlyZWN0aXZlUmVjb3JkKSkge1xuICAgICAgc3VwZXIubm90aWZ5RGlzcGF0Y2hlcihjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRpcmVjdGl2ZUluZGV4ID0gYmluZGluZ1JlY29yZC5kaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXg7XG4gICAgICBiaW5kaW5nUmVjb3JkLnNldHRlcih0aGlzLl9nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlSW5kZXgpLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZ2VuQ29uZmlnLmxvZ0JpbmRpbmdVcGRhdGUpIHtcbiAgICAgIHN1cGVyLmxvZ0JpbmRpbmdVcGRhdGUoY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9hZGRDaGFuZ2UoYmluZGluZ1JlY29yZDogQmluZGluZ1JlY29yZCwgY2hhbmdlLCBjaGFuZ2VzKSB7XG4gICAgaWYgKGJpbmRpbmdSZWNvcmQuY2FsbE9uQ2hhbmdlcygpKSB7XG4gICAgICByZXR1cm4gc3VwZXIuYWRkQ2hhbmdlKGNoYW5nZXMsIGNoYW5nZS5wcmV2aW91c1ZhbHVlLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNoYW5nZXM7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlSW5kZXg6IERpcmVjdGl2ZUluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hlci5nZXREaXJlY3RpdmVGb3IoZGlyZWN0aXZlSW5kZXgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9nZXREZXRlY3RvckZvcihkaXJlY3RpdmVJbmRleDogRGlyZWN0aXZlSW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaGVyLmdldERldGVjdG9yRm9yKGRpcmVjdGl2ZUluZGV4KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfY2hlY2socHJvdG86IFByb3RvUmVjb3JkLCB0aHJvd09uQ2hhbmdlOiBib29sZWFuLCB2YWx1ZXM6IGFueVtdLFxuICAgICAgICAgICAgICAgICBsb2NhbHM6IExvY2Fscyk6IFNpbXBsZUNoYW5nZSB7XG4gICAgaWYgKHByb3RvLmlzUGlwZVJlY29yZCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGlwZUNoZWNrKHByb3RvLCB0aHJvd09uQ2hhbmdlLCB2YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlQ2hlY2socHJvdG8sIHRocm93T25DaGFuZ2UsIHZhbHVlcywgbG9jYWxzKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3JlZmVyZW5jZUNoZWNrKHByb3RvOiBQcm90b1JlY29yZCwgdGhyb3dPbkNoYW5nZTogYm9vbGVhbiwgdmFsdWVzOiBhbnlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxzOiBMb2NhbHMpIHtcbiAgICBpZiAodGhpcy5fcHVyZUZ1bmNBbmRBcmdzRGlkTm90Q2hhbmdlKHByb3RvKSkge1xuICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgZmFsc2UpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGN1cnJWYWx1ZSA9IHRoaXMuX2NhbGN1bGF0ZUN1cnJWYWx1ZShwcm90bywgdmFsdWVzLCBsb2NhbHMpO1xuICAgIGlmICh0aGlzLnN0cmF0ZWd5ID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hPYnNlcnZlKSB7XG4gICAgICBzdXBlci5vYnNlcnZlVmFsdWUoY3VyclZhbHVlLCBwcm90by5zZWxmSW5kZXgpO1xuICAgIH1cblxuICAgIGlmIChwcm90by5zaG91bGRCZUNoZWNrZWQoKSkge1xuICAgICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuX3JlYWRTZWxmKHByb3RvLCB2YWx1ZXMpO1xuICAgICAgaWYgKENoYW5nZURldGVjdGlvblV0aWwubG9vc2VOb3RJZGVudGljYWwocHJldlZhbHVlLCBjdXJyVmFsdWUpKSB7XG4gICAgICAgIGlmIChwcm90by5sYXN0SW5CaW5kaW5nKSB7XG4gICAgICAgICAgdmFyIGNoYW5nZSA9IENoYW5nZURldGVjdGlvblV0aWwuc2ltcGxlQ2hhbmdlKHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgICAgICBpZiAodGhyb3dPbkNoYW5nZSkgdGhpcy50aHJvd09uQ2hhbmdlRXJyb3IocHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuXG4gICAgICAgICAgdGhpcy5fd3JpdGVTZWxmKHByb3RvLCBjdXJyVmFsdWUsIHZhbHVlcyk7XG4gICAgICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgdHJ1ZSk7XG4gICAgICAgICAgcmV0dXJuIGNoYW5nZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIGN1cnJWYWx1ZSwgdmFsdWVzKTtcbiAgICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCB0cnVlKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgZmFsc2UpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIGN1cnJWYWx1ZSwgdmFsdWVzKTtcbiAgICAgIHRoaXMuX3NldENoYW5nZWQocHJvdG8sIHRydWUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2FsY3VsYXRlQ3VyclZhbHVlKHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWVzOiBhbnlbXSwgbG9jYWxzOiBMb2NhbHMpIHtcbiAgICBzd2l0Y2ggKHByb3RvLm1vZGUpIHtcbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5TZWxmOlxuICAgICAgICByZXR1cm4gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5Db25zdDpcbiAgICAgICAgcmV0dXJuIHByb3RvLmZ1bmNPclZhbHVlO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuUHJvcGVydHlSZWFkOlxuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gcHJvdG8uZnVuY09yVmFsdWUoY29udGV4dCk7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5TYWZlUHJvcGVydHk6XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBpc0JsYW5rKGNvbnRleHQpID8gbnVsbCA6IHByb3RvLmZ1bmNPclZhbHVlKGNvbnRleHQpO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuUHJvcGVydHlXcml0ZTpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcylbMF07XG4gICAgICAgIHByb3RvLmZ1bmNPclZhbHVlKGNvbnRleHQsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuS2V5ZWRXcml0ZTpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpWzBdO1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKVsxXTtcbiAgICAgICAgY29udGV4dFtrZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkxvY2FsOlxuICAgICAgICByZXR1cm4gbG9jYWxzLmdldChwcm90by5uYW1lKTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkludm9rZU1ldGhvZDpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgICAgdmFyIGFyZ3MgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIHByb3RvLmZ1bmNPclZhbHVlKGNvbnRleHQsIGFyZ3MpO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuU2FmZU1ldGhvZEludm9rZTpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgICAgaWYgKGlzQmxhbmsoY29udGV4dCkpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXJncyA9IHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gcHJvdG8uZnVuY09yVmFsdWUoY29udGV4dCwgYXJncyk7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5LZXllZFJlYWQ6XG4gICAgICAgIHZhciBhcmcgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKVswXTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpW2FyZ107XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5DaGFpbjpcbiAgICAgICAgdmFyIGFyZ3MgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkludm9rZUNsb3N1cmU6XG4gICAgICAgIHJldHVybiBGdW5jdGlvbldyYXBwZXIuYXBwbHkodGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcykpO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuSW50ZXJwb2xhdGU6XG4gICAgICBjYXNlIFJlY29yZFR5cGUuUHJpbWl0aXZlT3A6XG4gICAgICBjYXNlIFJlY29yZFR5cGUuQ29sbGVjdGlvbkxpdGVyYWw6XG4gICAgICAgIHJldHVybiBGdW5jdGlvbldyYXBwZXIuYXBwbHkocHJvdG8uZnVuY09yVmFsdWUsIHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFVua25vd24gb3BlcmF0aW9uICR7cHJvdG8ubW9kZX1gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9waXBlQ2hlY2socHJvdG86IFByb3RvUmVjb3JkLCB0aHJvd09uQ2hhbmdlOiBib29sZWFuLCB2YWx1ZXM6IGFueVtdKSB7XG4gICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICB2YXIgc2VsZWN0ZWRQaXBlID0gdGhpcy5fcGlwZUZvcihwcm90bywgY29udGV4dCk7XG4gICAgaWYgKCFzZWxlY3RlZFBpcGUucHVyZSB8fCB0aGlzLl9hcmdzT3JDb250ZXh0Q2hhbmdlZChwcm90bykpIHtcbiAgICAgIHZhciBhcmdzID0gdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcyk7XG4gICAgICB2YXIgY3VyclZhbHVlID0gc2VsZWN0ZWRQaXBlLnBpcGUudHJhbnNmb3JtKGNvbnRleHQsIGFyZ3MpO1xuXG4gICAgICBpZiAocHJvdG8uc2hvdWxkQmVDaGVja2VkKCkpIHtcbiAgICAgICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuX3JlYWRTZWxmKHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICBpZiAoQ2hhbmdlRGV0ZWN0aW9uVXRpbC5sb29zZU5vdElkZW50aWNhbChwcmV2VmFsdWUsIGN1cnJWYWx1ZSkpIHtcbiAgICAgICAgICBjdXJyVmFsdWUgPSBDaGFuZ2VEZXRlY3Rpb25VdGlsLnVud3JhcFZhbHVlKGN1cnJWYWx1ZSk7XG5cbiAgICAgICAgICBpZiAocHJvdG8ubGFzdEluQmluZGluZykge1xuICAgICAgICAgICAgdmFyIGNoYW5nZSA9IENoYW5nZURldGVjdGlvblV0aWwuc2ltcGxlQ2hhbmdlKHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgICAgICAgIGlmICh0aHJvd09uQ2hhbmdlKSB0aGlzLnRocm93T25DaGFuZ2VFcnJvcihwcmV2VmFsdWUsIGN1cnJWYWx1ZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3dyaXRlU2VsZihwcm90bywgY3VyclZhbHVlLCB2YWx1ZXMpO1xuICAgICAgICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjaGFuZ2U7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fd3JpdGVTZWxmKHByb3RvLCBjdXJyVmFsdWUsIHZhbHVlcyk7XG4gICAgICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCBmYWxzZSk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3dyaXRlU2VsZihwcm90bywgY3VyclZhbHVlLCB2YWx1ZXMpO1xuICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGlwZUZvcihwcm90bzogUHJvdG9SZWNvcmQsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RvcmVkUGlwZSA9IHRoaXMuX3JlYWRQaXBlKHByb3RvKTtcbiAgICBpZiAoaXNQcmVzZW50KHN0b3JlZFBpcGUpKSByZXR1cm4gc3RvcmVkUGlwZTtcblxuICAgIHZhciBwaXBlID0gdGhpcy5waXBlcy5nZXQocHJvdG8ubmFtZSk7XG4gICAgdGhpcy5fd3JpdGVQaXBlKHByb3RvLCBwaXBlKTtcbiAgICByZXR1cm4gcGlwZTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlYWRDb250ZXh0KHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWVzOiBhbnlbXSkge1xuICAgIGlmIChwcm90by5jb250ZXh0SW5kZXggPT0gLTEpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXREaXJlY3RpdmVGb3IocHJvdG8uZGlyZWN0aXZlSW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzW3Byb3RvLmNvbnRleHRJbmRleF07XG4gIH1cblxuICBwcml2YXRlIF9yZWFkU2VsZihwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlczogYW55W10pIHsgcmV0dXJuIHZhbHVlc1twcm90by5zZWxmSW5kZXhdOyB9XG5cbiAgcHJpdmF0ZSBfd3JpdGVTZWxmKHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWUsIHZhbHVlczogYW55W10pIHsgdmFsdWVzW3Byb3RvLnNlbGZJbmRleF0gPSB2YWx1ZTsgfVxuXG4gIHByaXZhdGUgX3JlYWRQaXBlKHByb3RvOiBQcm90b1JlY29yZCkgeyByZXR1cm4gdGhpcy5sb2NhbFBpcGVzW3Byb3RvLnNlbGZJbmRleF07IH1cblxuICBwcml2YXRlIF93cml0ZVBpcGUocHJvdG86IFByb3RvUmVjb3JkLCB2YWx1ZSkgeyB0aGlzLmxvY2FsUGlwZXNbcHJvdG8uc2VsZkluZGV4XSA9IHZhbHVlOyB9XG5cbiAgcHJpdmF0ZSBfc2V0Q2hhbmdlZChwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHByb3RvLmFyZ3VtZW50VG9QdXJlRnVuY3Rpb24pIHRoaXMuY2hhbmdlc1twcm90by5zZWxmSW5kZXhdID0gdmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9wdXJlRnVuY0FuZEFyZ3NEaWROb3RDaGFuZ2UocHJvdG86IFByb3RvUmVjb3JkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHByb3RvLmlzUHVyZUZ1bmN0aW9uKCkgJiYgIXRoaXMuX2FyZ3NDaGFuZ2VkKHByb3RvKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FyZ3NDaGFuZ2VkKHByb3RvOiBQcm90b1JlY29yZCk6IGJvb2xlYW4ge1xuICAgIHZhciBhcmdzID0gcHJvdG8uYXJncztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICh0aGlzLmNoYW5nZXNbYXJnc1tpXV0pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2FyZ3NPckNvbnRleHRDaGFuZ2VkKHByb3RvOiBQcm90b1JlY29yZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hcmdzQ2hhbmdlZChwcm90bykgfHwgdGhpcy5jaGFuZ2VzW3Byb3RvLmNvbnRleHRJbmRleF07XG4gIH1cblxuICBwcml2YXRlIF9yZWFkQXJncyhwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlczogYW55W10pIHtcbiAgICB2YXIgcmVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKHByb3RvLmFyZ3MubGVuZ3RoKTtcbiAgICB2YXIgYXJncyA9IHByb3RvLmFyZ3M7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICByZXNbaV0gPSB2YWx1ZXNbYXJnc1tpXV07XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbn1cbiJdfQ==