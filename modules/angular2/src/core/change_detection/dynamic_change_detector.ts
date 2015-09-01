import {
  isPresent,
  isBlank,
  BaseException,
  FunctionWrapper,
  StringWrapper
} from 'angular2/src/core/facade/lang';
import {ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';

import {AbstractChangeDetector} from './abstract_change_detector';
import {EventBinding} from './event_binding';
import {BindingRecord, BindingTarget} from './binding_record';
import {DirectiveRecord, DirectiveIndex} from './directive_record';
import {Locals} from './parser/locals';
import {ChangeDetectorGenConfig} from './interfaces';
import {ChangeDetectionUtil, SimpleChange} from './change_detection_util';
import {ChangeDetectionStrategy} from './constants';
import {ProtoRecord, RecordType} from './proto_record';

export class DynamicChangeDetector extends AbstractChangeDetector<any> {
  values: any[];
  changes: any[];
  localPipes: any[];
  prevContexts: any[];
  directives: any = null;

  constructor(id: string, dispatcher: any, numberOfPropertyProtoRecords: number,
              propertyBindingTargets: BindingTarget[], directiveIndices: DirectiveIndex[],
              strategy: ChangeDetectionStrategy, private records: ProtoRecord[],
              private eventBindings: EventBinding[], private directiveRecords: DirectiveRecord[],
              private genConfig: ChangeDetectorGenConfig) {
    super(id, dispatcher, numberOfPropertyProtoRecords, propertyBindingTargets, directiveIndices,
          strategy);
    var len = records.length + 1;
    this.values = ListWrapper.createFixedSize(len);
    this.localPipes = ListWrapper.createFixedSize(len);
    this.prevContexts = ListWrapper.createFixedSize(len);
    this.changes = ListWrapper.createFixedSize(len);

    this.dehydrateDirectives(false);
  }

  handleEventInternal(eventName: string, elIndex: number, locals: Locals): boolean {
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

  _processEventBinding(eb: EventBinding, locals: Locals): any {
    var values = ListWrapper.createFixedSize(eb.records.length);
    values[0] = this.values[0];

    for (var i = 0; i < eb.records.length; ++i) {
      var proto = eb.records[i];
      var res = this._calculateCurrValue(proto, values, locals);
      if (proto.lastInBinding) {
        this._markPathAsCheckOnce(proto);
        return res;
      } else {
        this._writeSelf(proto, res, values);
      }
    }

    throw new BaseException("Cannot be reached");
  }

  _markPathAsCheckOnce(proto: ProtoRecord): void {
    if (!proto.bindingRecord.isDefaultChangeDetection()) {
      var dir = proto.bindingRecord.directiveRecord;
      this._getDetectorFor(dir.directiveIndex).markPathToRootAsCheckOnce();
    }
  }

  _matchingEventBindings(eventName: string, elIndex: number): EventBinding[] {
    return ListWrapper.filter(this.eventBindings,
                              eb => eb.eventName == eventName && eb.elIndex === elIndex);
  }

  hydrateDirectives(directives: any): void {
    this.values[0] = this.context;
    this.directives = directives;

    if (this.strategy === ChangeDetectionStrategy.OnPushObserve) {
      for (var i = 0; i < this.directiveIndices.length; ++i) {
        var index = this.directiveIndices[i];
        super.observeDirective(directives.getDirectiveFor(index), i);
      }
    }
  }

  dehydrateDirectives(destroyPipes: boolean) {
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

  _destroyPipes() {
    for (var i = 0; i < this.localPipes.length; ++i) {
      if (isPresent(this.localPipes[i])) {
        ChangeDetectionUtil.callPipeOnDestroy(this.localPipes[i]);
      }
    }
  }

  checkNoChanges(): void { this.runDetectChanges(true); }

  detectChangesInRecordsInternal(throwOnChange: boolean) {
    var protos = this.records;

    var changes = null;
    var isChanged = false;
    for (var i = 0; i < protos.length; ++i) {
      var proto: ProtoRecord = protos[i];
      var bindingRecord = proto.bindingRecord;
      var directiveRecord = bindingRecord.directiveRecord;

      if (this._firstInBinding(proto)) {
        this.propertyBindingIndex = proto.propertyBindingIndex;
      }

      if (proto.isLifeCycleRecord()) {
        if (proto.name === "DoCheck" && !throwOnChange) {
          this._getDirectiveFor(directiveRecord.directiveIndex).doCheck();
        } else if (proto.name === "OnInit" && !throwOnChange && !this.alreadyChecked) {
          this._getDirectiveFor(directiveRecord.directiveIndex).onInit();
        } else if (proto.name === "OnChanges" && isPresent(changes) && !throwOnChange) {
          this._getDirectiveFor(directiveRecord.directiveIndex).onChanges(changes);
        }

      } else {
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

  _firstInBinding(r: ProtoRecord): boolean {
    var prev = ChangeDetectionUtil.protoByIndex(this.records, r.selfIndex - 1);
    return isBlank(prev) || prev.bindingRecord !== r.bindingRecord;
  }

  afterContentLifecycleCallbacksInternal() {
    var dirs = this.directiveRecords;
    for (var i = dirs.length - 1; i >= 0; --i) {
      var dir = dirs[i];
      if (dir.callAfterContentInit && !this.alreadyChecked) {
        this._getDirectiveFor(dir.directiveIndex).afterContentInit();
      }

      if (dir.callAfterContentChecked) {
        this._getDirectiveFor(dir.directiveIndex).afterContentChecked();
      }
    }
  }

  afterViewLifecycleCallbacksInternal() {
    var dirs = this.directiveRecords;
    for (var i = dirs.length - 1; i >= 0; --i) {
      var dir = dirs[i];
      if (dir.callAfterViewInit && !this.alreadyChecked) {
        this._getDirectiveFor(dir.directiveIndex).afterViewInit();
      }
      if (dir.callAfterViewChecked) {
        this._getDirectiveFor(dir.directiveIndex).afterViewChecked();
      }
    }
  }

  _updateDirectiveOrElement(change, bindingRecord) {
    if (isBlank(bindingRecord.directiveRecord)) {
      super.notifyDispatcher(change.currentValue);
    } else {
      var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
      bindingRecord.setter(this._getDirectiveFor(directiveIndex), change.currentValue);
    }

    if (this.genConfig.logBindingUpdate) {
      super.logBindingUpdate(change.currentValue);
    }
  }

  _addChange(bindingRecord: BindingRecord, change, changes) {
    if (bindingRecord.callOnChanges()) {
      return super.addChange(changes, change.previousValue, change.currentValue);
    } else {
      return changes;
    }
  }

  _getDirectiveFor(directiveIndex) { return this.directives.getDirectiveFor(directiveIndex); }

  _getDetectorFor(directiveIndex) { return this.directives.getDetectorFor(directiveIndex); }

  _check(proto: ProtoRecord, throwOnChange: boolean, values: any[], locals: Locals): SimpleChange {
    if (proto.isPipeRecord()) {
      return this._pipeCheck(proto, throwOnChange, values);
    } else {
      return this._referenceCheck(proto, throwOnChange, values, locals);
    }
  }

  _referenceCheck(proto: ProtoRecord, throwOnChange: boolean, values: any[], locals: Locals) {
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
      if (!isSame(prevValue, currValue)) {
        if (proto.lastInBinding) {
          var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
          if (throwOnChange) this.throwOnChangeError(prevValue, currValue);

          this._writeSelf(proto, currValue, values);
          this._setChanged(proto, true);
          return change;
        } else {
          this._writeSelf(proto, currValue, values);
          this._setChanged(proto, true);
          return null;
        }
      } else {
        this._setChanged(proto, false);
        return null;
      }

    } else {
      this._writeSelf(proto, currValue, values);
      this._setChanged(proto, true);
      return null;
    }
  }

  _calculateCurrValue(proto: ProtoRecord, values: any[], locals: Locals) {
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
        return FunctionWrapper.apply(this._readContext(proto, values),
                                     this._readArgs(proto, values));

      case RecordType.Interpolate:
      case RecordType.PrimitiveOp:
      case RecordType.CollectionLiteral:
        return FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto, values));

      default:
        throw new BaseException(`Unknown operation ${proto.mode}`);
    }
  }

  _pipeCheck(proto: ProtoRecord, throwOnChange: boolean, values: any[]) {
    var context = this._readContext(proto, values);
    var args = this._readArgs(proto, values);

    var pipe = this._pipeFor(proto, context);
    var currValue = pipe.transform(context, args);

    if (proto.shouldBeChecked()) {
      var prevValue = this._readSelf(proto, values);
      if (!isSame(prevValue, currValue)) {
        currValue = ChangeDetectionUtil.unwrapValue(currValue);

        if (proto.lastInBinding) {
          var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
          if (throwOnChange) this.throwOnChangeError(prevValue, currValue);

          this._writeSelf(proto, currValue, values);
          this._setChanged(proto, true);

          return change;

        } else {
          this._writeSelf(proto, currValue, values);
          this._setChanged(proto, true);
          return null;
        }
      } else {
        this._setChanged(proto, false);
        return null;
      }
    } else {
      this._writeSelf(proto, currValue, values);
      this._setChanged(proto, true);
      return null;
    }
  }

  _pipeFor(proto: ProtoRecord, context) {
    var storedPipe = this._readPipe(proto);
    if (isPresent(storedPipe)) return storedPipe;

    var pipe = this.pipes.get(proto.name);
    this._writePipe(proto, pipe);
    return pipe;
  }

  _readContext(proto: ProtoRecord, values: any[]) {
    if (proto.contextIndex == -1) {
      return this._getDirectiveFor(proto.directiveIndex);
    } else {
      return values[proto.contextIndex];
    }

    return values[proto.contextIndex];
  }

  _readSelf(proto: ProtoRecord, values: any[]) { return values[proto.selfIndex]; }

  _writeSelf(proto: ProtoRecord, value, values: any[]) { values[proto.selfIndex] = value; }

  _readPipe(proto: ProtoRecord) { return this.localPipes[proto.selfIndex]; }

  _writePipe(proto: ProtoRecord, value) { this.localPipes[proto.selfIndex] = value; }

  _setChanged(proto: ProtoRecord, value: boolean) {
    if (proto.argumentToPureFunction) this.changes[proto.selfIndex] = value;
  }

  _pureFuncAndArgsDidNotChange(proto: ProtoRecord): boolean {
    return proto.isPureFunction() && !this._argsChanged(proto);
  }

  _argsChanged(proto: ProtoRecord): boolean {
    var args = proto.args;
    for (var i = 0; i < args.length; ++i) {
      if (this.changes[args[i]]) {
        return true;
      }
    }
    return false;
  }

  _readArgs(proto: ProtoRecord, values: any[]) {
    var res = ListWrapper.createFixedSize(proto.args.length);
    var args = proto.args;
    for (var i = 0; i < args.length; ++i) {
      res[i] = values[args[i]];
    }
    return res;
  }
}

function isSame(a, b): boolean {
  if (a === b) return true;
  if (a instanceof String && b instanceof String && a == b) return true;
  if ((a !== a) && (b !== b)) return true;
  return false;
}
