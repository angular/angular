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
            var detectedChange = throwOnChange ?
                !ChangeDetectionUtil.devModeEqual(prevValue, currValue) :
                ChangeDetectionUtil.looseNotIdentical(prevValue, currValue);
            if (detectedChange) {
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
                var detectedChange = throwOnChange ?
                    !ChangeDetectionUtil.devModeEqual(prevValue, currValue) :
                    ChangeDetectionUtil.looseNotIdentical(prevValue, currValue);
                if (detectedChange) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pY19jaGFuZ2VfZGV0ZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2R5bmFtaWNfY2hhbmdlX2RldGVjdG9yLnRzIl0sIm5hbWVzIjpbIkR5bmFtaWNDaGFuZ2VEZXRlY3RvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5jb25zdHJ1Y3RvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5oYW5kbGVFdmVudEludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9wcm9jZXNzRXZlbnRCaW5kaW5nIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jb21wdXRlU2tpcExlbmd0aCIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fbWFya1BhdGhBc0NoZWNrT25jZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fbWF0Y2hpbmdFdmVudEJpbmRpbmdzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmh5ZHJhdGVEaXJlY3RpdmVzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jcmVhdGVFdmVudEhhbmRsZXIiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuZGVoeWRyYXRlRGlyZWN0aXZlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fZGVzdHJveVBpcGVzIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9kZXN0cm95RGlyZWN0aXZlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5jaGVja05vQ2hhbmdlcyIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWwiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2ZpcnN0SW5CaW5kaW5nIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl91cGRhdGVEaXJlY3RpdmVPckVsZW1lbnQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2FkZENoYW5nZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fZ2V0RGlyZWN0aXZlRm9yIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9nZXREZXRlY3RvckZvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fY2hlY2siLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlZmVyZW5jZUNoZWNrIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9jYWxjdWxhdGVDdXJyVmFsdWUiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3BpcGVDaGVjayIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fcGlwZUZvciIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fcmVhZENvbnRleHQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlYWRTZWxmIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl93cml0ZVNlbGYiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3JlYWRQaXBlIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl93cml0ZVBpcGUiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3NldENoYW5nZWQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX3B1cmVGdW5jQW5kQXJnc0RpZE5vdENoYW5nZSIsIkR5bmFtaWNDaGFuZ2VEZXRlY3Rvci5fYXJnc0NoYW5nZWQiLCJEeW5hbWljQ2hhbmdlRGV0ZWN0b3IuX2FyZ3NPckNvbnRleHRDaGFuZ2VkIiwiRHluYW1pY0NoYW5nZURldGVjdG9yLl9yZWFkQXJncyJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBZ0IsTUFBTSwwQkFBMEI7T0FDcEYsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxXQUFXLEVBQStCLE1BQU0sZ0NBQWdDO09BRWpGLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSw0QkFBNEI7T0FNMUQsRUFBQyxtQkFBbUIsRUFBZSxNQUFNLHlCQUF5QjtPQUNsRSxFQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFDLE1BQU0sYUFBYTtPQUNqRSxFQUFjLFVBQVUsRUFBQyxNQUFNLGdCQUFnQjtPQUMvQyxFQUFDLFNBQVMsRUFBQyxNQUFNLHlDQUF5QztPQUMxRCxFQUFDLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO0FBRTNELDJDQUEyQyxzQkFBc0I7SUFNL0RBLFlBQVlBLEVBQVVBLEVBQUVBLDRCQUFvQ0EsRUFDaERBLHNCQUF1Q0EsRUFBRUEsZ0JBQWtDQSxFQUMzRUEsUUFBaUNBLEVBQVVBLFFBQXVCQSxFQUMxREEsY0FBOEJBLEVBQVVBLGlCQUFvQ0EsRUFDNUVBLFVBQW1DQTtRQUNyREMsTUFBTUEsRUFBRUEsRUFBRUEsNEJBQTRCQSxFQUFFQSxzQkFBc0JBLEVBQUVBLGdCQUFnQkEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFIdkNBLGFBQVFBLEdBQVJBLFFBQVFBLENBQWVBO1FBQzFEQSxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBZ0JBO1FBQVVBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBbUJBO1FBQzVFQSxlQUFVQSxHQUFWQSxVQUFVQSxDQUF5QkE7UUFFckRBLElBQUlBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxXQUFXQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUMvQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsV0FBV0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLFdBQVdBLENBQUNBLGVBQWVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3JEQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxXQUFXQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUVoREEsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUNsQ0EsQ0FBQ0E7SUFFREQsbUJBQW1CQSxDQUFDQSxTQUFpQkEsRUFBRUEsT0FBZUEsRUFBRUEsTUFBY0E7UUFDcEVFLElBQUlBLGNBQWNBLEdBQUdBLEtBQUtBLENBQUNBO1FBRTNCQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLFNBQVNBLEVBQUVBLE9BQU9BLENBQUNBO2FBQzFDQSxPQUFPQSxDQUFDQSxHQUFHQTtZQUNWQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLEdBQUdBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1lBQ2pEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbEJBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ3hCQSxDQUFDQTtRQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVQQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtJQUN4QkEsQ0FBQ0E7SUFFREYsZ0JBQWdCQTtJQUNoQkEsb0JBQW9CQSxDQUFDQSxFQUFnQkEsRUFBRUEsTUFBY0E7UUFDbkRHLElBQUlBLE1BQU1BLEdBQUdBLFdBQVdBLENBQUNBLGVBQWVBLENBQUNBLEVBQUVBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1FBQzVEQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUUzQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsR0FBR0EsQ0FBQ0EsRUFBRUEsUUFBUUEsR0FBR0EsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaEVBLElBQUlBLEtBQUtBLEdBQUdBLEVBQUVBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1lBRWpDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekJBLFFBQVFBLElBQUlBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDL0RBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO2dCQUMxREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3hCQSxJQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO29CQUNqQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7Z0JBQ2JBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDTkEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxDQUFDQTtZQUNIQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUVEQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBO0lBQy9DQSxDQUFDQTtJQUVPSCxrQkFBa0JBLENBQUNBLFVBQWtCQSxFQUFFQSxLQUFrQkEsRUFBRUEsTUFBYUE7UUFDOUVJLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEtBQUtBLFVBQVVBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQzFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxVQUFVQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUM3Q0EsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsS0FBS0EsVUFBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUNBLElBQUlBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1lBQ2pEQSxNQUFNQSxDQUFDQSxTQUFTQSxHQUFHQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxVQUFVQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUM3REEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsS0FBS0EsVUFBVUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvQ0EsSUFBSUEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDakRBLE1BQU1BLENBQUNBLFNBQVNBLEdBQUdBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLFVBQVVBLEdBQUdBLENBQUNBLENBQUNBO1FBQzdEQSxDQUFDQTtRQUVEQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBO0lBQy9DQSxDQUFDQTtJQUVESixnQkFBZ0JBO0lBQ2hCQSxvQkFBb0JBLENBQUNBLEtBQWtCQTtRQUNyQ0ssRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsYUFBYUEsQ0FBQ0Esd0JBQXdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwREEsSUFBSUEsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7WUFDOUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLEdBQUdBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLHlCQUF5QkEsRUFBRUEsQ0FBQ0E7UUFDdkVBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURMLGdCQUFnQkE7SUFDaEJBLHNCQUFzQkEsQ0FBQ0EsU0FBaUJBLEVBQUVBLE9BQWVBO1FBQ3ZETSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxDQUFDQSxTQUFTQSxJQUFJQSxTQUFTQSxJQUFJQSxFQUFFQSxDQUFDQSxPQUFPQSxLQUFLQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUMvRkEsQ0FBQ0E7SUFFRE4saUJBQWlCQSxDQUFDQSxVQUE0QkE7UUFDNUNPLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxVQUFVQSxDQUFDQTtRQUU3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsS0FBS0EsdUJBQXVCQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtnQkFDdERBLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JDQSxLQUFLQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMURBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0RBLElBQUlBLENBQUNBLG1CQUFtQkEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDOUJBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbENBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN6QkEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUE7b0JBQ3RCQSxJQUFJQSxZQUFZQSxHQUNQQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLGNBQWNBLENBQUNBLFlBQVlBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUM1RUEsSUFBSUEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtvQkFDeERBLElBQUlBLE1BQU1BLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUN6Q0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxJQUFJQSxDQUN6QkEsaUJBQWlCQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDcEVBLENBQUNBLENBQUNBLENBQUNBO1lBQ0xBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRU9QLG1CQUFtQkEsQ0FBQ0EsaUJBQXlCQSxFQUFFQSxTQUFpQkE7UUFDdEVRLE1BQU1BLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLEVBQUVBLGlCQUFpQkEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDMUVBLENBQUNBO0lBR0RSLG1CQUFtQkEsQ0FBQ0EsWUFBcUJBO1FBQ3ZDUyxFQUFFQSxDQUFDQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7WUFDckJBLElBQUlBLENBQUNBLGtCQUFrQkEsRUFBRUEsQ0FBQ0E7UUFDNUJBLENBQUNBO1FBQ0RBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxtQkFBbUJBLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3BFQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN0Q0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLG1CQUFtQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7SUFDekVBLENBQUNBO0lBRURULGdCQUFnQkE7SUFDaEJBLGFBQWFBO1FBQ1hVLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO1lBQ2hEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbENBLG1CQUFtQkEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRFYsZ0JBQWdCQTtJQUNoQkEsa0JBQWtCQTtRQUNoQlcsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUN2REEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3pCQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1lBQzdEQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEWCxjQUFjQSxLQUFXWSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRXZEWiw4QkFBOEJBLENBQUNBLGFBQXNCQTtRQUNuRGEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFFM0JBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBO1FBQ25CQSxJQUFJQSxTQUFTQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUN0QkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsR0FBR0EsQ0FBQ0EsRUFBRUEsUUFBUUEsR0FBR0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDNURBLElBQUlBLEtBQUtBLEdBQWdCQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUMxQ0EsSUFBSUEsYUFBYUEsR0FBR0EsS0FBS0EsQ0FBQ0EsYUFBYUEsQ0FBQ0E7WUFDeENBLElBQUlBLGVBQWVBLEdBQUdBLGFBQWFBLENBQUNBLGVBQWVBLENBQUNBO1lBRXBEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDaENBLElBQUlBLENBQUNBLG9CQUFvQkEsR0FBR0EsS0FBS0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQTtZQUN6REEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDOUJBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO29CQUMvQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxlQUFlQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtnQkFDcEVBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxLQUFLQSxRQUFRQSxJQUFJQSxDQUFDQSxhQUFhQTtvQkFDekNBLElBQUlBLENBQUNBLEtBQUtBLElBQUlBLG1CQUFtQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzFEQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLGVBQWVBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO2dCQUNuRUEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEtBQUtBLFdBQVdBLElBQUlBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO29CQUM5RUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxlQUFlQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtnQkFDN0VBLENBQUNBO1lBQ0hBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUNoQ0EsUUFBUUEsSUFBSUEsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxRQUFRQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUNwRUEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLGFBQWFBLEVBQUVBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO2dCQUN6RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3RCQSxJQUFJQSxDQUFDQSx5QkFBeUJBLENBQUNBLE1BQU1BLEVBQUVBLGFBQWFBLENBQUNBLENBQUNBO29CQUN0REEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0E7b0JBQ2pCQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxhQUFhQSxFQUFFQSxNQUFNQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtnQkFDNURBLENBQUNBO1lBQ0hBLENBQUNBO1lBRURBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxQkEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7Z0JBQ2ZBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLHdCQUF3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzNEQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxlQUFlQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxlQUFlQSxFQUFFQSxDQUFDQTtnQkFDekVBLENBQUNBO2dCQUVEQSxTQUFTQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUNwQkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRGIsZ0JBQWdCQTtJQUNoQkEsZUFBZUEsQ0FBQ0EsQ0FBY0E7UUFDNUJjLElBQUlBLElBQUlBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDNUVBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLGFBQWFBLEtBQUtBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBO0lBQ2pFQSxDQUFDQTtJQUVEZCxzQ0FBc0NBO1FBQ3BDZSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBO1FBQ2xDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUMxQ0EsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEJBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLG9CQUFvQkEsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsSUFBSUEsbUJBQW1CQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0VBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxDQUFDQTtZQUNqRUEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDaENBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EscUJBQXFCQSxFQUFFQSxDQUFDQTtZQUNwRUEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRGYsbUNBQW1DQTtRQUNqQ2dCLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0E7UUFDbENBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO1lBQzFDQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsaUJBQWlCQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxtQkFBbUJBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1RUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxlQUFlQSxFQUFFQSxDQUFDQTtZQUM5REEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDN0JBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxDQUFDQTtZQUNqRUEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRGhCLGdCQUFnQkE7SUFDUkEseUJBQXlCQSxDQUFDQSxNQUFNQSxFQUFFQSxhQUFhQTtRQUNyRGlCLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNDQSxLQUFLQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBQzlDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxjQUFjQSxHQUFHQSxhQUFhQSxDQUFDQSxlQUFlQSxDQUFDQSxjQUFjQSxDQUFDQTtZQUNsRUEsYUFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxjQUFjQSxDQUFDQSxFQUFFQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUNuRkEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQ0EsS0FBS0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUM5Q0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRGpCLGdCQUFnQkE7SUFDUkEsVUFBVUEsQ0FBQ0EsYUFBNEJBLEVBQUVBLE1BQU1BLEVBQUVBLE9BQU9BO1FBQzlEa0IsRUFBRUEsQ0FBQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbENBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLEVBQUVBLE1BQU1BLENBQUNBLGFBQWFBLEVBQUVBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBQzdFQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNqQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRGxCLGdCQUFnQkE7SUFDUkEsZ0JBQWdCQSxDQUFDQSxjQUE4QkE7UUFDckRtQixNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxlQUFlQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtJQUN6REEsQ0FBQ0E7SUFFRG5CLGdCQUFnQkE7SUFDUkEsZUFBZUEsQ0FBQ0EsY0FBOEJBO1FBQ3BEb0IsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7SUFDeERBLENBQUNBO0lBRURwQixnQkFBZ0JBO0lBQ1JBLE1BQU1BLENBQUNBLEtBQWtCQSxFQUFFQSxhQUFzQkEsRUFBRUEsTUFBYUEsRUFDekRBLE1BQWNBO1FBQzNCcUIsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLGFBQWFBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3ZEQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxLQUFLQSxFQUFFQSxhQUFhQSxFQUFFQSxNQUFNQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNwRUEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRHJCLGdCQUFnQkE7SUFDUkEsZUFBZUEsQ0FBQ0EsS0FBa0JBLEVBQUVBLGFBQXNCQSxFQUFFQSxNQUFhQSxFQUN6REEsTUFBY0E7UUFDcENzQixFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSw0QkFBNEJBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzdDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUMvQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFFREEsSUFBSUEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNoRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsS0FBS0EsdUJBQXVCQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsS0FBS0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsRUFBRUEsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDakRBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLGVBQWVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUM5Q0EsSUFBSUEsY0FBY0EsR0FBR0EsYUFBYUE7Z0JBQ1RBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsU0FBU0EsRUFBRUEsU0FBU0EsQ0FBQ0E7Z0JBQ3ZEQSxtQkFBbUJBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsU0FBU0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLEVBQUVBLENBQUNBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3hCQSxJQUFJQSxNQUFNQSxHQUFHQSxtQkFBbUJBLENBQUNBLFlBQVlBLENBQUNBLFNBQVNBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO29CQUNwRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0E7d0JBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsU0FBU0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7b0JBRWpFQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtvQkFDMUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO29CQUM5QkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7Z0JBQ2hCQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ05BLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO29CQUMxQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQzlCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtnQkFDZEEsQ0FBQ0E7WUFDSEEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO2dCQUMvQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDZEEsQ0FBQ0E7UUFFSEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDMUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1lBQzlCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVPdEIsbUJBQW1CQSxDQUFDQSxLQUFrQkEsRUFBRUEsTUFBYUEsRUFBRUEsTUFBY0E7UUFDM0V1QixNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsS0FBS0EsVUFBVUEsQ0FBQ0EsSUFBSUE7Z0JBQ2xCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUUxQ0EsS0FBS0EsVUFBVUEsQ0FBQ0EsS0FBS0E7Z0JBQ25CQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUUzQkEsS0FBS0EsVUFBVUEsQ0FBQ0EsWUFBWUE7Z0JBQzFCQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDL0NBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBRXBDQSxLQUFLQSxVQUFVQSxDQUFDQSxZQUFZQTtnQkFDMUJBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO2dCQUMvQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFFOURBLEtBQUtBLFVBQVVBLENBQUNBLGFBQWFBO2dCQUMzQkEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7Z0JBQy9DQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDN0NBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNsQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFFZkEsS0FBS0EsVUFBVUEsQ0FBQ0EsVUFBVUE7Z0JBQ3hCQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDL0NBLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNB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c1ByZXNlbnQsIGlzQmxhbmssIEZ1bmN0aW9uV3JhcHBlciwgU3RyaW5nV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7QWJzdHJhY3RDaGFuZ2VEZXRlY3Rvcn0gZnJvbSAnLi9hYnN0cmFjdF9jaGFuZ2VfZGV0ZWN0b3InO1xuaW1wb3J0IHtFdmVudEJpbmRpbmd9IGZyb20gJy4vZXZlbnRfYmluZGluZyc7XG5pbXBvcnQge0JpbmRpbmdSZWNvcmQsIEJpbmRpbmdUYXJnZXR9IGZyb20gJy4vYmluZGluZ19yZWNvcmQnO1xuaW1wb3J0IHtEaXJlY3RpdmVSZWNvcmQsIERpcmVjdGl2ZUluZGV4fSBmcm9tICcuL2RpcmVjdGl2ZV9yZWNvcmQnO1xuaW1wb3J0IHtMb2NhbHN9IGZyb20gJy4vcGFyc2VyL2xvY2Fscyc7XG5pbXBvcnQge0NoYW5nZURpc3BhdGNoZXIsIENoYW5nZURldGVjdG9yR2VuQ29uZmlnfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25VdGlsLCBTaW1wbGVDaGFuZ2V9IGZyb20gJy4vY2hhbmdlX2RldGVjdGlvbl91dGlsJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENoYW5nZURldGVjdG9yU3RhdGV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7UHJvdG9SZWNvcmQsIFJlY29yZFR5cGV9IGZyb20gJy4vcHJvdG9fcmVjb3JkJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmV4cG9ydCBjbGFzcyBEeW5hbWljQ2hhbmdlRGV0ZWN0b3IgZXh0ZW5kcyBBYnN0cmFjdENoYW5nZURldGVjdG9yPGFueT4ge1xuICB2YWx1ZXM6IGFueVtdO1xuICBjaGFuZ2VzOiBhbnlbXTtcbiAgbG9jYWxQaXBlczogYW55W107XG4gIHByZXZDb250ZXh0czogYW55W107XG5cbiAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgbnVtYmVyT2ZQcm9wZXJ0eVByb3RvUmVjb3JkczogbnVtYmVyLFxuICAgICAgICAgICAgICBwcm9wZXJ0eUJpbmRpbmdUYXJnZXRzOiBCaW5kaW5nVGFyZ2V0W10sIGRpcmVjdGl2ZUluZGljZXM6IERpcmVjdGl2ZUluZGV4W10sXG4gICAgICAgICAgICAgIHN0cmF0ZWd5OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgcHJpdmF0ZSBfcmVjb3JkczogUHJvdG9SZWNvcmRbXSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZXZlbnRCaW5kaW5nczogRXZlbnRCaW5kaW5nW10sIHByaXZhdGUgX2RpcmVjdGl2ZVJlY29yZHM6IERpcmVjdGl2ZVJlY29yZFtdLFxuICAgICAgICAgICAgICBwcml2YXRlIF9nZW5Db25maWc6IENoYW5nZURldGVjdG9yR2VuQ29uZmlnKSB7XG4gICAgc3VwZXIoaWQsIG51bWJlck9mUHJvcGVydHlQcm90b1JlY29yZHMsIHByb3BlcnR5QmluZGluZ1RhcmdldHMsIGRpcmVjdGl2ZUluZGljZXMsIHN0cmF0ZWd5KTtcbiAgICB2YXIgbGVuID0gX3JlY29yZHMubGVuZ3RoICsgMTtcbiAgICB0aGlzLnZhbHVlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsZW4pO1xuICAgIHRoaXMubG9jYWxQaXBlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsZW4pO1xuICAgIHRoaXMucHJldkNvbnRleHRzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG4gICAgdGhpcy5jaGFuZ2VzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG5cbiAgICB0aGlzLmRlaHlkcmF0ZURpcmVjdGl2ZXMoZmFsc2UpO1xuICB9XG5cbiAgaGFuZGxlRXZlbnRJbnRlcm5hbChldmVudE5hbWU6IHN0cmluZywgZWxJbmRleDogbnVtYmVyLCBsb2NhbHM6IExvY2Fscyk6IGJvb2xlYW4ge1xuICAgIHZhciBwcmV2ZW50RGVmYXVsdCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fbWF0Y2hpbmdFdmVudEJpbmRpbmdzKGV2ZW50TmFtZSwgZWxJbmRleClcbiAgICAgICAgLmZvckVhY2gocmVjID0+IHtcbiAgICAgICAgICB2YXIgcmVzID0gdGhpcy5fcHJvY2Vzc0V2ZW50QmluZGluZyhyZWMsIGxvY2Fscyk7XG4gICAgICAgICAgaWYgKHJlcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHByZXZlbnREZWZhdWx0O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcHJvY2Vzc0V2ZW50QmluZGluZyhlYjogRXZlbnRCaW5kaW5nLCBsb2NhbHM6IExvY2Fscyk6IGFueSB7XG4gICAgdmFyIHZhbHVlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShlYi5yZWNvcmRzLmxlbmd0aCk7XG4gICAgdmFsdWVzWzBdID0gdGhpcy52YWx1ZXNbMF07XG5cbiAgICBmb3IgKHZhciBwcm90b0lkeCA9IDA7IHByb3RvSWR4IDwgZWIucmVjb3Jkcy5sZW5ndGg7ICsrcHJvdG9JZHgpIHtcbiAgICAgIHZhciBwcm90byA9IGViLnJlY29yZHNbcHJvdG9JZHhdO1xuXG4gICAgICBpZiAocHJvdG8uaXNTa2lwUmVjb3JkKCkpIHtcbiAgICAgICAgcHJvdG9JZHggKz0gdGhpcy5fY29tcHV0ZVNraXBMZW5ndGgocHJvdG9JZHgsIHByb3RvLCB2YWx1ZXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlcyA9IHRoaXMuX2NhbGN1bGF0ZUN1cnJWYWx1ZShwcm90bywgdmFsdWVzLCBsb2NhbHMpO1xuICAgICAgICBpZiAocHJvdG8ubGFzdEluQmluZGluZykge1xuICAgICAgICAgIHRoaXMuX21hcmtQYXRoQXNDaGVja09uY2UocHJvdG8pO1xuICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fd3JpdGVTZWxmKHByb3RvLCByZXMsIHZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcIkNhbm5vdCBiZSByZWFjaGVkXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tcHV0ZVNraXBMZW5ndGgocHJvdG9JbmRleDogbnVtYmVyLCBwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlczogYW55W10pOiBudW1iZXIge1xuICAgIGlmIChwcm90by5tb2RlID09PSBSZWNvcmRUeXBlLlNraXBSZWNvcmRzKSB7XG4gICAgICByZXR1cm4gcHJvdG8uZml4ZWRBcmdzWzBdIC0gcHJvdG9JbmRleCAtIDE7XG4gICAgfVxuXG4gICAgaWYgKHByb3RvLm1vZGUgPT09IFJlY29yZFR5cGUuU2tpcFJlY29yZHNJZikge1xuICAgICAgbGV0IGNvbmRpdGlvbiA9IHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuICAgICAgcmV0dXJuIGNvbmRpdGlvbiA/IHByb3RvLmZpeGVkQXJnc1swXSAtIHByb3RvSW5kZXggLSAxIDogMDtcbiAgICB9XG5cbiAgICBpZiAocHJvdG8ubW9kZSA9PT0gUmVjb3JkVHlwZS5Ta2lwUmVjb3Jkc0lmTm90KSB7XG4gICAgICBsZXQgY29uZGl0aW9uID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICByZXR1cm4gY29uZGl0aW9uID8gMCA6IHByb3RvLmZpeGVkQXJnc1swXSAtIHByb3RvSW5kZXggLSAxO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQ2Fubm90IGJlIHJlYWNoZWRcIik7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9tYXJrUGF0aEFzQ2hlY2tPbmNlKHByb3RvOiBQcm90b1JlY29yZCk6IHZvaWQge1xuICAgIGlmICghcHJvdG8uYmluZGluZ1JlY29yZC5pc0RlZmF1bHRDaGFuZ2VEZXRlY3Rpb24oKSkge1xuICAgICAgdmFyIGRpciA9IHByb3RvLmJpbmRpbmdSZWNvcmQuZGlyZWN0aXZlUmVjb3JkO1xuICAgICAgdGhpcy5fZ2V0RGV0ZWN0b3JGb3IoZGlyLmRpcmVjdGl2ZUluZGV4KS5tYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWF0Y2hpbmdFdmVudEJpbmRpbmdzKGV2ZW50TmFtZTogc3RyaW5nLCBlbEluZGV4OiBudW1iZXIpOiBFdmVudEJpbmRpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50QmluZGluZ3MuZmlsdGVyKGViID0+IGViLmV2ZW50TmFtZSA9PSBldmVudE5hbWUgJiYgZWIuZWxJbmRleCA9PT0gZWxJbmRleCk7XG4gIH1cblxuICBoeWRyYXRlRGlyZWN0aXZlcyhkaXNwYXRjaGVyOiBDaGFuZ2VEaXNwYXRjaGVyKTogdm9pZCB7XG4gICAgdGhpcy52YWx1ZXNbMF0gPSB0aGlzLmNvbnRleHQ7XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcblxuICAgIGlmICh0aGlzLnN0cmF0ZWd5ID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hPYnNlcnZlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGlyZWN0aXZlSW5kaWNlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmRpcmVjdGl2ZUluZGljZXNbaV07XG4gICAgICAgIHN1cGVyLm9ic2VydmVEaXJlY3RpdmUodGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGluZGV4KSwgaSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMub3V0cHV0U3Vic2NyaXB0aW9ucyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZGlyZWN0aXZlUmVjb3Jkcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHIgPSB0aGlzLl9kaXJlY3RpdmVSZWNvcmRzW2ldO1xuICAgICAgaWYgKGlzUHJlc2VudChyLm91dHB1dHMpKSB7XG4gICAgICAgIHIub3V0cHV0cy5mb3JFYWNoKG91dHB1dCA9PiB7XG4gICAgICAgICAgdmFyIGV2ZW50SGFuZGxlciA9XG4gICAgICAgICAgICAgIDxhbnk+dGhpcy5fY3JlYXRlRXZlbnRIYW5kbGVyKHIuZGlyZWN0aXZlSW5kZXguZWxlbWVudEluZGV4LCBvdXRwdXRbMV0pO1xuICAgICAgICAgIHZhciBkaXJlY3RpdmUgPSB0aGlzLl9nZXREaXJlY3RpdmVGb3Ioci5kaXJlY3RpdmVJbmRleCk7XG4gICAgICAgICAgdmFyIGdldHRlciA9IHJlZmxlY3Rvci5nZXR0ZXIob3V0cHV0WzBdKTtcbiAgICAgICAgICB0aGlzLm91dHB1dFN1YnNjcmlwdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKGdldHRlcihkaXJlY3RpdmUpLCBldmVudEhhbmRsZXIpKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRXZlbnRIYW5kbGVyKGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIsIGV2ZW50TmFtZTogc3RyaW5nKTogRnVuY3Rpb24ge1xuICAgIHJldHVybiAoZXZlbnQpID0+IHRoaXMuaGFuZGxlRXZlbnQoZXZlbnROYW1lLCBib3VuZEVsZW1lbnRJbmRleCwgZXZlbnQpO1xuICB9XG5cblxuICBkZWh5ZHJhdGVEaXJlY3RpdmVzKGRlc3Ryb3lQaXBlczogYm9vbGVhbikge1xuICAgIGlmIChkZXN0cm95UGlwZXMpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQaXBlcygpO1xuICAgICAgdGhpcy5fZGVzdHJveURpcmVjdGl2ZXMoKTtcbiAgICB9XG4gICAgdGhpcy52YWx1ZXNbMF0gPSBudWxsO1xuICAgIExpc3RXcmFwcGVyLmZpbGwodGhpcy52YWx1ZXMsIENoYW5nZURldGVjdGlvblV0aWwudW5pbml0aWFsaXplZCwgMSk7XG4gICAgTGlzdFdyYXBwZXIuZmlsbCh0aGlzLmNoYW5nZXMsIGZhbHNlKTtcbiAgICBMaXN0V3JhcHBlci5maWxsKHRoaXMubG9jYWxQaXBlcywgbnVsbCk7XG4gICAgTGlzdFdyYXBwZXIuZmlsbCh0aGlzLnByZXZDb250ZXh0cywgQ2hhbmdlRGV0ZWN0aW9uVXRpbC51bmluaXRpYWxpemVkKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Rlc3Ryb3lQaXBlcygpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubG9jYWxQaXBlcy5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLmxvY2FsUGlwZXNbaV0pKSB7XG4gICAgICAgIENoYW5nZURldGVjdGlvblV0aWwuY2FsbFBpcGVPbkRlc3Ryb3kodGhpcy5sb2NhbFBpcGVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9kZXN0cm95RGlyZWN0aXZlcygpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2RpcmVjdGl2ZVJlY29yZHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0aGlzLl9kaXJlY3RpdmVSZWNvcmRzW2ldO1xuICAgICAgaWYgKHJlY29yZC5jYWxsT25EZXN0cm95KSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihyZWNvcmQuZGlyZWN0aXZlSW5kZXgpLm5nT25EZXN0cm95KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2hlY2tOb0NoYW5nZXMoKTogdm9pZCB7IHRoaXMucnVuRGV0ZWN0Q2hhbmdlcyh0cnVlKTsgfVxuXG4gIGRldGVjdENoYW5nZXNJblJlY29yZHNJbnRlcm5hbCh0aHJvd09uQ2hhbmdlOiBib29sZWFuKSB7XG4gICAgdmFyIHByb3RvcyA9IHRoaXMuX3JlY29yZHM7XG5cbiAgICB2YXIgY2hhbmdlcyA9IG51bGw7XG4gICAgdmFyIGlzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGZvciAodmFyIHByb3RvSWR4ID0gMDsgcHJvdG9JZHggPCBwcm90b3MubGVuZ3RoOyArK3Byb3RvSWR4KSB7XG4gICAgICB2YXIgcHJvdG86IFByb3RvUmVjb3JkID0gcHJvdG9zW3Byb3RvSWR4XTtcbiAgICAgIHZhciBiaW5kaW5nUmVjb3JkID0gcHJvdG8uYmluZGluZ1JlY29yZDtcbiAgICAgIHZhciBkaXJlY3RpdmVSZWNvcmQgPSBiaW5kaW5nUmVjb3JkLmRpcmVjdGl2ZVJlY29yZDtcblxuICAgICAgaWYgKHRoaXMuX2ZpcnN0SW5CaW5kaW5nKHByb3RvKSkge1xuICAgICAgICB0aGlzLnByb3BlcnR5QmluZGluZ0luZGV4ID0gcHJvdG8ucHJvcGVydHlCaW5kaW5nSW5kZXg7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm90by5pc0xpZmVDeWNsZVJlY29yZCgpKSB7XG4gICAgICAgIGlmIChwcm90by5uYW1lID09PSBcIkRvQ2hlY2tcIiAmJiAhdGhyb3dPbkNoYW5nZSkge1xuICAgICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpLm5nRG9DaGVjaygpO1xuICAgICAgICB9IGVsc2UgaWYgKHByb3RvLm5hbWUgPT09IFwiT25Jbml0XCIgJiYgIXRocm93T25DaGFuZ2UgJiZcbiAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID09IENoYW5nZURldGVjdG9yU3RhdGUuTmV2ZXJDaGVja2VkKSB7XG4gICAgICAgICAgdGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZVJlY29yZC5kaXJlY3RpdmVJbmRleCkubmdPbkluaXQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwcm90by5uYW1lID09PSBcIk9uQ2hhbmdlc1wiICYmIGlzUHJlc2VudChjaGFuZ2VzKSAmJiAhdGhyb3dPbkNoYW5nZSkge1xuICAgICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXJlY3RpdmVSZWNvcmQuZGlyZWN0aXZlSW5kZXgpLm5nT25DaGFuZ2VzKGNoYW5nZXMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHByb3RvLmlzU2tpcFJlY29yZCgpKSB7XG4gICAgICAgIHByb3RvSWR4ICs9IHRoaXMuX2NvbXB1dGVTa2lwTGVuZ3RoKHByb3RvSWR4LCBwcm90bywgdGhpcy52YWx1ZXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGNoYW5nZSA9IHRoaXMuX2NoZWNrKHByb3RvLCB0aHJvd09uQ2hhbmdlLCB0aGlzLnZhbHVlcywgdGhpcy5sb2NhbHMpO1xuICAgICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZSkpIHtcbiAgICAgICAgICB0aGlzLl91cGRhdGVEaXJlY3RpdmVPckVsZW1lbnQoY2hhbmdlLCBiaW5kaW5nUmVjb3JkKTtcbiAgICAgICAgICBpc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgIGNoYW5nZXMgPSB0aGlzLl9hZGRDaGFuZ2UoYmluZGluZ1JlY29yZCwgY2hhbmdlLCBjaGFuZ2VzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocHJvdG8ubGFzdEluRGlyZWN0aXZlKSB7XG4gICAgICAgIGNoYW5nZXMgPSBudWxsO1xuICAgICAgICBpZiAoaXNDaGFuZ2VkICYmICFiaW5kaW5nUmVjb3JkLmlzRGVmYXVsdENoYW5nZURldGVjdGlvbigpKSB7XG4gICAgICAgICAgdGhpcy5fZ2V0RGV0ZWN0b3JGb3IoZGlyZWN0aXZlUmVjb3JkLmRpcmVjdGl2ZUluZGV4KS5tYXJrQXNDaGVja09uY2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlzQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpcnN0SW5CaW5kaW5nKHI6IFByb3RvUmVjb3JkKTogYm9vbGVhbiB7XG4gICAgdmFyIHByZXYgPSBDaGFuZ2VEZXRlY3Rpb25VdGlsLnByb3RvQnlJbmRleCh0aGlzLl9yZWNvcmRzLCByLnNlbGZJbmRleCAtIDEpO1xuICAgIHJldHVybiBpc0JsYW5rKHByZXYpIHx8IHByZXYuYmluZGluZ1JlY29yZCAhPT0gci5iaW5kaW5nUmVjb3JkO1xuICB9XG5cbiAgYWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzSW50ZXJuYWwoKSB7XG4gICAgdmFyIGRpcnMgPSB0aGlzLl9kaXJlY3RpdmVSZWNvcmRzO1xuICAgIGZvciAodmFyIGkgPSBkaXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB2YXIgZGlyID0gZGlyc1tpXTtcbiAgICAgIGlmIChkaXIuY2FsbEFmdGVyQ29udGVudEluaXQgJiYgdGhpcy5zdGF0ZSA9PSBDaGFuZ2VEZXRlY3RvclN0YXRlLk5ldmVyQ2hlY2tlZCkge1xuICAgICAgICB0aGlzLl9nZXREaXJlY3RpdmVGb3IoZGlyLmRpcmVjdGl2ZUluZGV4KS5uZ0FmdGVyQ29udGVudEluaXQoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpci5jYWxsQWZ0ZXJDb250ZW50Q2hlY2tlZCkge1xuICAgICAgICB0aGlzLl9nZXREaXJlY3RpdmVGb3IoZGlyLmRpcmVjdGl2ZUluZGV4KS5uZ0FmdGVyQ29udGVudENoZWNrZWQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhZnRlclZpZXdMaWZlY3ljbGVDYWxsYmFja3NJbnRlcm5hbCgpIHtcbiAgICB2YXIgZGlycyA9IHRoaXMuX2RpcmVjdGl2ZVJlY29yZHM7XG4gICAgZm9yICh2YXIgaSA9IGRpcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHZhciBkaXIgPSBkaXJzW2ldO1xuICAgICAgaWYgKGRpci5jYWxsQWZ0ZXJWaWV3SW5pdCAmJiB0aGlzLnN0YXRlID09IENoYW5nZURldGVjdG9yU3RhdGUuTmV2ZXJDaGVja2VkKSB7XG4gICAgICAgIHRoaXMuX2dldERpcmVjdGl2ZUZvcihkaXIuZGlyZWN0aXZlSW5kZXgpLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgfVxuICAgICAgaWYgKGRpci5jYWxsQWZ0ZXJWaWV3Q2hlY2tlZCkge1xuICAgICAgICB0aGlzLl9nZXREaXJlY3RpdmVGb3IoZGlyLmRpcmVjdGl2ZUluZGV4KS5uZ0FmdGVyVmlld0NoZWNrZWQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3VwZGF0ZURpcmVjdGl2ZU9yRWxlbWVudChjaGFuZ2UsIGJpbmRpbmdSZWNvcmQpIHtcbiAgICBpZiAoaXNCbGFuayhiaW5kaW5nUmVjb3JkLmRpcmVjdGl2ZVJlY29yZCkpIHtcbiAgICAgIHN1cGVyLm5vdGlmeURpc3BhdGNoZXIoY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBkaXJlY3RpdmVJbmRleCA9IGJpbmRpbmdSZWNvcmQuZGlyZWN0aXZlUmVjb3JkLmRpcmVjdGl2ZUluZGV4O1xuICAgICAgYmluZGluZ1JlY29yZC5zZXR0ZXIodGhpcy5fZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZUluZGV4KSwgY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2dlbkNvbmZpZy5sb2dCaW5kaW5nVXBkYXRlKSB7XG4gICAgICBzdXBlci5sb2dCaW5kaW5nVXBkYXRlKGNoYW5nZS5jdXJyZW50VmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYWRkQ2hhbmdlKGJpbmRpbmdSZWNvcmQ6IEJpbmRpbmdSZWNvcmQsIGNoYW5nZSwgY2hhbmdlcykge1xuICAgIGlmIChiaW5kaW5nUmVjb3JkLmNhbGxPbkNoYW5nZXMoKSkge1xuICAgICAgcmV0dXJuIHN1cGVyLmFkZENoYW5nZShjaGFuZ2VzLCBjaGFuZ2UucHJldmlvdXNWYWx1ZSwgY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjaGFuZ2VzO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZUluZGV4OiBEaXJlY3RpdmVJbmRleCkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoZXIuZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZUluZGV4KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfZ2V0RGV0ZWN0b3JGb3IoZGlyZWN0aXZlSW5kZXg6IERpcmVjdGl2ZUluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2hlci5nZXREZXRlY3RvckZvcihkaXJlY3RpdmVJbmRleCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2NoZWNrKHByb3RvOiBQcm90b1JlY29yZCwgdGhyb3dPbkNoYW5nZTogYm9vbGVhbiwgdmFsdWVzOiBhbnlbXSxcbiAgICAgICAgICAgICAgICAgbG9jYWxzOiBMb2NhbHMpOiBTaW1wbGVDaGFuZ2Uge1xuICAgIGlmIChwcm90by5pc1BpcGVSZWNvcmQoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BpcGVDaGVjayhwcm90bywgdGhyb3dPbkNoYW5nZSwgdmFsdWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlZmVyZW5jZUNoZWNrKHByb3RvLCB0aHJvd09uQ2hhbmdlLCB2YWx1ZXMsIGxvY2Fscyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yZWZlcmVuY2VDaGVjayhwcm90bzogUHJvdG9SZWNvcmQsIHRocm93T25DaGFuZ2U6IGJvb2xlYW4sIHZhbHVlczogYW55W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsczogTG9jYWxzKSB7XG4gICAgaWYgKHRoaXMuX3B1cmVGdW5jQW5kQXJnc0RpZE5vdENoYW5nZShwcm90bykpIHtcbiAgICAgIHRoaXMuX3NldENoYW5nZWQocHJvdG8sIGZhbHNlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBjdXJyVmFsdWUgPSB0aGlzLl9jYWxjdWxhdGVDdXJyVmFsdWUocHJvdG8sIHZhbHVlcywgbG9jYWxzKTtcbiAgICBpZiAodGhpcy5zdHJhdGVneSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoT2JzZXJ2ZSkge1xuICAgICAgc3VwZXIub2JzZXJ2ZVZhbHVlKGN1cnJWYWx1ZSwgcHJvdG8uc2VsZkluZGV4KTtcbiAgICB9XG5cbiAgICBpZiAocHJvdG8uc2hvdWxkQmVDaGVja2VkKCkpIHtcbiAgICAgIHZhciBwcmV2VmFsdWUgPSB0aGlzLl9yZWFkU2VsZihwcm90bywgdmFsdWVzKTtcbiAgICAgIHZhciBkZXRlY3RlZENoYW5nZSA9IHRocm93T25DaGFuZ2UgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFDaGFuZ2VEZXRlY3Rpb25VdGlsLmRldk1vZGVFcXVhbChwcmV2VmFsdWUsIGN1cnJWYWx1ZSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENoYW5nZURldGVjdGlvblV0aWwubG9vc2VOb3RJZGVudGljYWwocHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuICAgICAgaWYgKGRldGVjdGVkQ2hhbmdlKSB7XG4gICAgICAgIGlmIChwcm90by5sYXN0SW5CaW5kaW5nKSB7XG4gICAgICAgICAgdmFyIGNoYW5nZSA9IENoYW5nZURldGVjdGlvblV0aWwuc2ltcGxlQ2hhbmdlKHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgICAgICBpZiAodGhyb3dPbkNoYW5nZSkgdGhpcy50aHJvd09uQ2hhbmdlRXJyb3IocHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuXG4gICAgICAgICAgdGhpcy5fd3JpdGVTZWxmKHByb3RvLCBjdXJyVmFsdWUsIHZhbHVlcyk7XG4gICAgICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgdHJ1ZSk7XG4gICAgICAgICAgcmV0dXJuIGNoYW5nZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIGN1cnJWYWx1ZSwgdmFsdWVzKTtcbiAgICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCB0cnVlKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2V0Q2hhbmdlZChwcm90bywgZmFsc2UpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIGN1cnJWYWx1ZSwgdmFsdWVzKTtcbiAgICAgIHRoaXMuX3NldENoYW5nZWQocHJvdG8sIHRydWUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2FsY3VsYXRlQ3VyclZhbHVlKHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWVzOiBhbnlbXSwgbG9jYWxzOiBMb2NhbHMpIHtcbiAgICBzd2l0Y2ggKHByb3RvLm1vZGUpIHtcbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5TZWxmOlxuICAgICAgICByZXR1cm4gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5Db25zdDpcbiAgICAgICAgcmV0dXJuIHByb3RvLmZ1bmNPclZhbHVlO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuUHJvcGVydHlSZWFkOlxuICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gcHJvdG8uZnVuY09yVmFsdWUoY29udGV4dCk7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5TYWZlUHJvcGVydHk6XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBpc0JsYW5rKGNvbnRleHQpID8gbnVsbCA6IHByb3RvLmZ1bmNPclZhbHVlKGNvbnRleHQpO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuUHJvcGVydHlXcml0ZTpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcylbMF07XG4gICAgICAgIHByb3RvLmZ1bmNPclZhbHVlKGNvbnRleHQsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuS2V5ZWRXcml0ZTpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpWzBdO1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKVsxXTtcbiAgICAgICAgY29udGV4dFtrZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkxvY2FsOlxuICAgICAgICByZXR1cm4gbG9jYWxzLmdldChwcm90by5uYW1lKTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkludm9rZU1ldGhvZDpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgICAgdmFyIGFyZ3MgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIHByb3RvLmZ1bmNPclZhbHVlKGNvbnRleHQsIGFyZ3MpO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuU2FmZU1ldGhvZEludm9rZTpcbiAgICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICAgICAgaWYgKGlzQmxhbmsoY29udGV4dCkpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXJncyA9IHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gcHJvdG8uZnVuY09yVmFsdWUoY29udGV4dCwgYXJncyk7XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5LZXllZFJlYWQ6XG4gICAgICAgIHZhciBhcmcgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKVswXTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlYWRDb250ZXh0KHByb3RvLCB2YWx1ZXMpW2FyZ107XG5cbiAgICAgIGNhc2UgUmVjb3JkVHlwZS5DaGFpbjpcbiAgICAgICAgdmFyIGFyZ3MgPSB0aGlzLl9yZWFkQXJncyhwcm90bywgdmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcblxuICAgICAgY2FzZSBSZWNvcmRUeXBlLkludm9rZUNsb3N1cmU6XG4gICAgICAgIHJldHVybiBGdW5jdGlvbldyYXBwZXIuYXBwbHkodGhpcy5fcmVhZENvbnRleHQocHJvdG8sIHZhbHVlcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcykpO1xuXG4gICAgICBjYXNlIFJlY29yZFR5cGUuSW50ZXJwb2xhdGU6XG4gICAgICBjYXNlIFJlY29yZFR5cGUuUHJpbWl0aXZlT3A6XG4gICAgICBjYXNlIFJlY29yZFR5cGUuQ29sbGVjdGlvbkxpdGVyYWw6XG4gICAgICAgIHJldHVybiBGdW5jdGlvbldyYXBwZXIuYXBwbHkocHJvdG8uZnVuY09yVmFsdWUsIHRoaXMuX3JlYWRBcmdzKHByb3RvLCB2YWx1ZXMpKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFVua25vd24gb3BlcmF0aW9uICR7cHJvdG8ubW9kZX1gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9waXBlQ2hlY2socHJvdG86IFByb3RvUmVjb3JkLCB0aHJvd09uQ2hhbmdlOiBib29sZWFuLCB2YWx1ZXM6IGFueVtdKSB7XG4gICAgdmFyIGNvbnRleHQgPSB0aGlzLl9yZWFkQ29udGV4dChwcm90bywgdmFsdWVzKTtcbiAgICB2YXIgc2VsZWN0ZWRQaXBlID0gdGhpcy5fcGlwZUZvcihwcm90bywgY29udGV4dCk7XG4gICAgaWYgKCFzZWxlY3RlZFBpcGUucHVyZSB8fCB0aGlzLl9hcmdzT3JDb250ZXh0Q2hhbmdlZChwcm90bykpIHtcbiAgICAgIHZhciBhcmdzID0gdGhpcy5fcmVhZEFyZ3MocHJvdG8sIHZhbHVlcyk7XG4gICAgICB2YXIgY3VyclZhbHVlID0gc2VsZWN0ZWRQaXBlLnBpcGUudHJhbnNmb3JtKGNvbnRleHQsIGFyZ3MpO1xuXG4gICAgICBpZiAocHJvdG8uc2hvdWxkQmVDaGVja2VkKCkpIHtcbiAgICAgICAgdmFyIHByZXZWYWx1ZSA9IHRoaXMuX3JlYWRTZWxmKHByb3RvLCB2YWx1ZXMpO1xuICAgICAgICB2YXIgZGV0ZWN0ZWRDaGFuZ2UgPSB0aHJvd09uQ2hhbmdlID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFDaGFuZ2VEZXRlY3Rpb25VdGlsLmRldk1vZGVFcXVhbChwcmV2VmFsdWUsIGN1cnJWYWx1ZSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2hhbmdlRGV0ZWN0aW9uVXRpbC5sb29zZU5vdElkZW50aWNhbChwcmV2VmFsdWUsIGN1cnJWYWx1ZSk7XG4gICAgICAgIGlmIChkZXRlY3RlZENoYW5nZSkge1xuICAgICAgICAgIGN1cnJWYWx1ZSA9IENoYW5nZURldGVjdGlvblV0aWwudW53cmFwVmFsdWUoY3VyclZhbHVlKTtcblxuICAgICAgICAgIGlmIChwcm90by5sYXN0SW5CaW5kaW5nKSB7XG4gICAgICAgICAgICB2YXIgY2hhbmdlID0gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5zaW1wbGVDaGFuZ2UocHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuICAgICAgICAgICAgaWYgKHRocm93T25DaGFuZ2UpIHRoaXMudGhyb3dPbkNoYW5nZUVycm9yKHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcblxuICAgICAgICAgICAgdGhpcy5fd3JpdGVTZWxmKHByb3RvLCBjdXJyVmFsdWUsIHZhbHVlcyk7XG4gICAgICAgICAgICB0aGlzLl9zZXRDaGFuZ2VkKHByb3RvLCB0cnVlKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZTtcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl93cml0ZVNlbGYocHJvdG8sIGN1cnJWYWx1ZSwgdmFsdWVzKTtcbiAgICAgICAgICAgIHRoaXMuX3NldENoYW5nZWQocHJvdG8sIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3NldENoYW5nZWQocHJvdG8sIGZhbHNlKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fd3JpdGVTZWxmKHByb3RvLCBjdXJyVmFsdWUsIHZhbHVlcyk7XG4gICAgICAgIHRoaXMuX3NldENoYW5nZWQocHJvdG8sIHRydWUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9waXBlRm9yKHByb3RvOiBQcm90b1JlY29yZCwgY29udGV4dCkge1xuICAgIHZhciBzdG9yZWRQaXBlID0gdGhpcy5fcmVhZFBpcGUocHJvdG8pO1xuICAgIGlmIChpc1ByZXNlbnQoc3RvcmVkUGlwZSkpIHJldHVybiBzdG9yZWRQaXBlO1xuXG4gICAgdmFyIHBpcGUgPSB0aGlzLnBpcGVzLmdldChwcm90by5uYW1lKTtcbiAgICB0aGlzLl93cml0ZVBpcGUocHJvdG8sIHBpcGUpO1xuICAgIHJldHVybiBwaXBlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVhZENvbnRleHQocHJvdG86IFByb3RvUmVjb3JkLCB2YWx1ZXM6IGFueVtdKSB7XG4gICAgaWYgKHByb3RvLmNvbnRleHRJbmRleCA9PSAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldERpcmVjdGl2ZUZvcihwcm90by5kaXJlY3RpdmVJbmRleCk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXNbcHJvdG8uY29udGV4dEluZGV4XTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlYWRTZWxmKHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWVzOiBhbnlbXSkgeyByZXR1cm4gdmFsdWVzW3Byb3RvLnNlbGZJbmRleF07IH1cblxuICBwcml2YXRlIF93cml0ZVNlbGYocHJvdG86IFByb3RvUmVjb3JkLCB2YWx1ZSwgdmFsdWVzOiBhbnlbXSkgeyB2YWx1ZXNbcHJvdG8uc2VsZkluZGV4XSA9IHZhbHVlOyB9XG5cbiAgcHJpdmF0ZSBfcmVhZFBpcGUocHJvdG86IFByb3RvUmVjb3JkKSB7IHJldHVybiB0aGlzLmxvY2FsUGlwZXNbcHJvdG8uc2VsZkluZGV4XTsgfVxuXG4gIHByaXZhdGUgX3dyaXRlUGlwZShwcm90bzogUHJvdG9SZWNvcmQsIHZhbHVlKSB7IHRoaXMubG9jYWxQaXBlc1twcm90by5zZWxmSW5kZXhdID0gdmFsdWU7IH1cblxuICBwcml2YXRlIF9zZXRDaGFuZ2VkKHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAocHJvdG8uYXJndW1lbnRUb1B1cmVGdW5jdGlvbikgdGhpcy5jaGFuZ2VzW3Byb3RvLnNlbGZJbmRleF0gPSB2YWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3B1cmVGdW5jQW5kQXJnc0RpZE5vdENoYW5nZShwcm90bzogUHJvdG9SZWNvcmQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gcHJvdG8uaXNQdXJlRnVuY3Rpb24oKSAmJiAhdGhpcy5fYXJnc0NoYW5nZWQocHJvdG8pO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXJnc0NoYW5nZWQocHJvdG86IFByb3RvUmVjb3JkKTogYm9vbGVhbiB7XG4gICAgdmFyIGFyZ3MgPSBwcm90by5hcmdzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKHRoaXMuY2hhbmdlc1thcmdzW2ldXSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXJnc09yQ29udGV4dENoYW5nZWQocHJvdG86IFByb3RvUmVjb3JkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FyZ3NDaGFuZ2VkKHByb3RvKSB8fCB0aGlzLmNoYW5nZXNbcHJvdG8uY29udGV4dEluZGV4XTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlYWRBcmdzKHByb3RvOiBQcm90b1JlY29yZCwgdmFsdWVzOiBhbnlbXSkge1xuICAgIHZhciByZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUocHJvdG8uYXJncy5sZW5ndGgpO1xuICAgIHZhciBhcmdzID0gcHJvdG8uYXJncztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpIHtcbiAgICAgIHJlc1tpXSA9IHZhbHVlc1thcmdzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxufVxuIl19