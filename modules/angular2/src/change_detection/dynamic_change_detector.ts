import {isPresent, isBlank, BaseException, FunctionWrapper} from 'angular2/src/facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {AbstractChangeDetector} from './abstract_change_detector';
import {BindingRecord} from './binding_record';
import {ChangeDetectionUtil, SimpleChange} from './change_detection_util';


import {ProtoRecord, RecordType} from './proto_record';

export class DynamicChangeDetector extends AbstractChangeDetector<any> {
  values: List<any>;
  changes: List<any>;
  localPipes: List<any>;
  prevContexts: List<any>;
  directives: any = null;

  constructor(id: string, changeDetectionStrategy: string, dispatcher: any,
              protos: List<ProtoRecord>, directiveRecords: List<any>) {
    super(id, dispatcher, protos, directiveRecords,
          ChangeDetectionUtil.changeDetectionMode(changeDetectionStrategy));
    var len = protos.length + 1;
    this.values = ListWrapper.createFixedSize(len);
    this.localPipes = ListWrapper.createFixedSize(len);
    this.prevContexts = ListWrapper.createFixedSize(len);
    this.changes = ListWrapper.createFixedSize(len);

    this.dehydrateDirectives(false);
  }

  hydrateDirectives(directives: any): void {
    this.values[0] = this.context;
    this.directives = directives;
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
    var protos = this.protos;

    var changes = null;
    var isChanged = false;
    for (var i = 0; i < protos.length; ++i) {
      var proto: ProtoRecord = protos[i];
      var bindingRecord = proto.bindingRecord;
      var directiveRecord = bindingRecord.directiveRecord;

      if (this._firstInBinding(proto)) {
        this.firstProtoInCurrentBinding = proto.selfIndex;
      }

      if (proto.isLifeCycleRecord()) {
        if (proto.name === "onCheck" && !throwOnChange) {
          this._getDirectiveFor(directiveRecord.directiveIndex).onCheck();
        } else if (proto.name === "onInit" && !throwOnChange && !this.alreadyChecked) {
          this._getDirectiveFor(directiveRecord.directiveIndex).onInit();
        } else if (proto.name === "onChange" && isPresent(changes) && !throwOnChange) {
          this._getDirectiveFor(directiveRecord.directiveIndex).onChange(changes);
        }

      } else {
        var change = this._check(proto, throwOnChange);
        if (isPresent(change)) {
          this._updateDirectiveOrElement(change, bindingRecord);
          isChanged = true;
          changes = this._addChange(bindingRecord, change, changes);
        }
      }

      if (proto.lastInDirective) {
        changes = null;
        if (isChanged && bindingRecord.isOnPushChangeDetection()) {
          this._getDetectorFor(directiveRecord.directiveIndex).markAsCheckOnce();
        }

        isChanged = false;
      }
    }

    this.alreadyChecked = true;
  }

  _firstInBinding(r: ProtoRecord): boolean {
    var prev = ChangeDetectionUtil.protoByIndex(this.protos, r.selfIndex - 1);
    return isBlank(prev) || prev.bindingRecord !== r.bindingRecord;
  }

  callOnAllChangesDone() {
    super.callOnAllChangesDone();
    var dirs = this.directiveRecords;
    for (var i = dirs.length - 1; i >= 0; --i) {
      var dir = dirs[i];
      if (dir.callOnAllChangesDone) {
        this._getDirectiveFor(dir.directiveIndex).onAllChangesDone();
      }
    }
  }

  _updateDirectiveOrElement(change, bindingRecord) {
    if (isBlank(bindingRecord.directiveRecord)) {
      this.dispatcher.notifyOnBinding(bindingRecord, change.currentValue);
    } else {
      var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
      bindingRecord.setter(this._getDirectiveFor(directiveIndex), change.currentValue);
    }
  }

  _addChange(bindingRecord: BindingRecord, change, changes) {
    if (bindingRecord.callOnChange()) {
      return super.addChange(changes, change.previousValue, change.currentValue);
    } else {
      return changes;
    }
  }

  _getDirectiveFor(directiveIndex) { return this.directives.getDirectiveFor(directiveIndex); }

  _getDetectorFor(directiveIndex) { return this.directives.getDetectorFor(directiveIndex); }

  _check(proto: ProtoRecord, throwOnChange: boolean): SimpleChange {
    if (proto.isPipeRecord()) {
      return this._pipeCheck(proto, throwOnChange);
    } else {
      return this._referenceCheck(proto, throwOnChange);
    }
  }

  _referenceCheck(proto: ProtoRecord, throwOnChange: boolean) {
    if (this._pureFuncAndArgsDidNotChange(proto)) {
      this._setChanged(proto, false);
      return null;
    }

    var currValue = this._calculateCurrValue(proto);
    if (proto.shouldBeChecked()) {
      var prevValue = this._readSelf(proto);
      if (!isSame(prevValue, currValue)) {
        if (proto.lastInBinding) {
          var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
          if (throwOnChange) this.throwOnChangeError(prevValue, currValue);

          this._writeSelf(proto, currValue);
          this._setChanged(proto, true);
          return change;
        } else {
          this._writeSelf(proto, currValue);
          this._setChanged(proto, true);
          return null;
        }
      } else {
        this._setChanged(proto, false);
        return null;
      }

    } else {
      this._writeSelf(proto, currValue);
      this._setChanged(proto, true);
      return null;
    }
  }

  _calculateCurrValue(proto: ProtoRecord) {
    switch (proto.mode) {
      case RecordType.SELF:
        return this._readContext(proto);

      case RecordType.CONST:
        return proto.funcOrValue;

      case RecordType.PROPERTY:
        var context = this._readContext(proto);
        return proto.funcOrValue(context);

      case RecordType.SAFE_PROPERTY:
        var context = this._readContext(proto);
        return isBlank(context) ? null : proto.funcOrValue(context);

      case RecordType.LOCAL:
        return this.locals.get(proto.name);

      case RecordType.INVOKE_METHOD:
        var context = this._readContext(proto);
        var args = this._readArgs(proto);
        return proto.funcOrValue(context, args);

      case RecordType.SAFE_INVOKE_METHOD:
        var context = this._readContext(proto);
        if (isBlank(context)) {
          return null;
        }
        var args = this._readArgs(proto);
        return proto.funcOrValue(context, args);

      case RecordType.KEYED_ACCESS:
        var arg = this._readArgs(proto)[0];
        return this._readContext(proto)[arg];

      case RecordType.INVOKE_CLOSURE:
        return FunctionWrapper.apply(this._readContext(proto), this._readArgs(proto));

      case RecordType.INTERPOLATE:
      case RecordType.PRIMITIVE_OP:
      case RecordType.COLLECTION_LITERAL:
        return FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto));

      default:
        throw new BaseException(`Unknown operation ${proto.mode}`);
    }
  }

  _pipeCheck(proto: ProtoRecord, throwOnChange: boolean) {
    var context = this._readContext(proto);
    var args = this._readArgs(proto);

    var pipe = this._pipeFor(proto, context);
    var currValue = pipe.transform(context, args);

    if (proto.shouldBeChecked()) {
      var prevValue = this._readSelf(proto);
      if (!isSame(prevValue, currValue)) {
        currValue = ChangeDetectionUtil.unwrapValue(currValue);

        if (proto.lastInBinding) {
          var change = ChangeDetectionUtil.simpleChange(prevValue, currValue);
          if (throwOnChange) this.throwOnChangeError(prevValue, currValue);

          this._writeSelf(proto, currValue);
          this._setChanged(proto, true);

          return change;

        } else {
          this._writeSelf(proto, currValue);
          this._setChanged(proto, true);
          return null;
        }
      } else {
        this._setChanged(proto, false);
        return null;
      }
    } else {
      this._writeSelf(proto, currValue);
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

  _readContext(proto: ProtoRecord) {
    if (proto.contextIndex == -1) {
      return this._getDirectiveFor(proto.directiveIndex);
    } else {
      return this.values[proto.contextIndex];
    }

    return this.values[proto.contextIndex];
  }

  _readSelf(proto: ProtoRecord) { return this.values[proto.selfIndex]; }

  _writeSelf(proto: ProtoRecord, value) { this.values[proto.selfIndex] = value; }

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

  _readArgs(proto: ProtoRecord) {
    var res = ListWrapper.createFixedSize(proto.args.length);
    var args = proto.args;
    for (var i = 0; i < args.length; ++i) {
      res[i] = this.values[args[i]];
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
