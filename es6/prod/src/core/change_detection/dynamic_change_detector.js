import { isPresent, isBlank, FunctionWrapper } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { AbstractChangeDetector } from './abstract_change_detector';
import { ChangeDetectionUtil } from './change_detection_util';
import { ChangeDetectionStrategy, ChangeDetectorState } from './constants';
import { RecordType } from './proto_record';
export class DynamicChangeDetector extends AbstractChangeDetector {
    constructor(id, dispatcher, numberOfPropertyProtoRecords, propertyBindingTargets, directiveIndices, strategy, _records, _eventBindings, _directiveRecords, _genConfig) {
        super(id, dispatcher, numberOfPropertyProtoRecords, propertyBindingTargets, directiveIndices, strategy);
        this._records = _records;
        this._eventBindings = _eventBindings;
        this._directiveRecords = _directiveRecords;
        this._genConfig = _genConfig;
        this.directives = null;
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
    hydrateDirectives(directives) {
        this.values[0] = this.context;
        this.directives = directives;
        if (this.strategy === ChangeDetectionStrategy.OnPushObserve) {
            for (var i = 0; i < this.directiveIndices.length; ++i) {
                var index = this.directiveIndices[i];
                super.observeDirective(directives.getDirectiveFor(index), i);
            }
        }
    }
    dehydrateDirectives(destroyPipes) {
        if (destroyPipes) {
            this._destroyPipes();
        }
        this.values[0] = null;
        this.directives = null;
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
        return this.directives.getDirectiveFor(directiveIndex);
    }
    /** @internal */
    _getDetectorFor(directiveIndex) { return this.directives.getDetectorFor(directiveIndex); }
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
