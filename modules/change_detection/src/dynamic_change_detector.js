import {isPresent, isBlank, BaseException, FunctionWrapper} from 'facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'facade/collection';
import {ContextWithVariableBindings} from './parser/context_with_variable_bindings';

import {AbstractChangeDetector} from './abstract_change_detector';
import {ChangeDetectionUtil, SimpleChange, uninitialized} from './change_detection_util';

import {ArrayChanges} from './array_changes';
import {KeyValueChanges} from './keyvalue_changes';

import {
  ProtoRecord,
  RECORD_TYPE_SELF,
  RECORD_TYPE_PROPERTY,
  RECORD_TYPE_INVOKE_METHOD,
  RECORD_TYPE_CONST,
  RECORD_TYPE_INVOKE_CLOSURE,
  RECORD_TYPE_PRIMITIVE_OP,
  RECORD_TYPE_KEYED_ACCESS,
  RECORD_TYPE_INVOKE_FORMATTER,
  RECORD_TYPE_STRUCTURAL_CHECK,
  RECORD_TYPE_INTERPOLATE,
  ProtoChangeDetector
  } from './proto_change_detector';

import {ChangeDetector, ChangeDispatcher} from './interfaces';
import {ExpressionChangedAfterItHasBeenChecked, ChangeDetectionError} from './exceptions';

export class DynamicChangeDetector extends AbstractChangeDetector {
  dispatcher:any;
  formatters:Map;
  values:List;
  changes:List;
  protos:List<ProtoRecord>;

  constructor(dispatcher:any, formatters:Map, protoRecords:List<ProtoRecord>) {
    super();
    this.dispatcher = dispatcher;
    this.formatters = formatters;

    this.values = ListWrapper.createFixedSize(protoRecords.length + 1);
    ListWrapper.fill(this.values, uninitialized);

    this.changes = ListWrapper.createFixedSize(protoRecords.length + 1);

    this.protos = protoRecords;
  }

  setContext(context:any) {
    this.values[0] = context;
  }

  detectChangesInRecords(throwOnChange:boolean) {
    var protos:List<ProtoRecord> = this.protos;

    var updatedRecords = null;
    var currentGroup = null;

    for (var i = 0; i < protos.length; ++i) {
      var proto:ProtoRecord = protos[i];
      var change = this._check(proto);

      if (isPresent(change)) {
        currentGroup = proto.groupMemento;
        var record = ChangeDetectionUtil.changeRecord(proto.bindingMemento, change);
        updatedRecords = ChangeDetectionUtil.addRecord(updatedRecords, record);
      }

      if (proto.lastInGroup && isPresent(updatedRecords)) {
        if (throwOnChange) ChangeDetectionUtil.throwOnChange(proto, updatedRecords[0]);

        this.dispatcher.onRecordChange(currentGroup, updatedRecords);
        updatedRecords = null;
      }
    }
  }

  _check(proto:ProtoRecord) {
    try {
      if (proto.mode == RECORD_TYPE_STRUCTURAL_CHECK) {
        return this._structuralCheck(proto);
      } else {
        return this._referenceCheck(proto);
      }
    } catch (e) {
      throw new ChangeDetectionError(proto, e);
    }
  }

  _referenceCheck(proto:ProtoRecord) {
    if (this._pureFuncAndArgsDidNotChange(proto)) {
      this._setChanged(proto, false);
      return null;
    }

    var prevValue = this._readSelf(proto);
    var currValue = this._calculateCurrValue(proto);

    if (!isSame(prevValue, currValue)) {
      this._writeSelf(proto, currValue);
      this._setChanged(proto, true);

      if (proto.lastInBinding) {
        return ChangeDetectionUtil.simpleChange(prevValue, currValue);
      } else {
        return null;
      }
    } else {
      this._setChanged(proto, false);
      return null;
    }
  }

  _calculateCurrValue(proto:ProtoRecord) {
    switch (proto.mode) {
      case RECORD_TYPE_SELF:
        return this._readContext(proto);

      case RECORD_TYPE_CONST:
        return proto.funcOrValue;

      case RECORD_TYPE_PROPERTY:
        var context = this._readContext(proto);
        var c = ChangeDetectionUtil.findContext(proto.name, context);
        if (c instanceof ContextWithVariableBindings) {
          return c.get(proto.name);
        } else {
          var propertyGetter:Function = proto.funcOrValue;
          return propertyGetter(c);
        }
        break;

      case RECORD_TYPE_INVOKE_METHOD:
        var methodInvoker:Function = proto.funcOrValue;
        return methodInvoker(this._readContext(proto), this._readArgs(proto));

      case RECORD_TYPE_KEYED_ACCESS:
        var arg = this._readArgs(proto)[0];
        return this._readContext(proto)[arg];

      case RECORD_TYPE_INVOKE_CLOSURE:
        return FunctionWrapper.apply(this._readContext(proto), this._readArgs(proto));

      case RECORD_TYPE_INTERPOLATE:
      case RECORD_TYPE_PRIMITIVE_OP:
        return FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto));

      case RECORD_TYPE_INVOKE_FORMATTER:
        var formatter = MapWrapper.get(this.formatters, proto.funcOrValue);
        return FunctionWrapper.apply(formatter, this._readArgs(proto));

      default:
        throw new BaseException(`Unknown operation ${proto.mode}`);
    }
  }

  _structuralCheck(proto:ProtoRecord) {
    var self = this._readSelf(proto);
    var context = this._readContext(proto);

    var change = ChangeDetectionUtil.structuralCheck(self, context);
    if (isPresent(change)) {
      this._writeSelf(proto, change.currentValue);
    }
    return change;
  }

  _readContext(proto:ProtoRecord) {
    return this.values[proto.contextIndex];
  }

  _readSelf(proto:ProtoRecord) {
    return this.values[proto.selfIndex];
  }

  _writeSelf(proto:ProtoRecord, value) {
    this.values[proto.selfIndex] = value;
  }

  _setChanged(proto:ProtoRecord, value:boolean) {
    this.changes[proto.selfIndex] = value;
  }

  _pureFuncAndArgsDidNotChange(proto:ProtoRecord):boolean {
    return proto.isPureFunction() && !this._argsChanged(proto);
  }

  _argsChanged(proto:ProtoRecord):boolean {
    var args = proto.args;
    for(var i = 0; i < args.length; ++i) {
      if (this.changes[args[i]]) {
        return true;
      }
    }
    return false;
  }

  _readArgs(proto:ProtoRecord) {
    var res = ListWrapper.createFixedSize(proto.args.length);
    var args = proto.args;
    for (var i = 0; i < args.length; ++i) {
      res[i] = this.values[args[i]];
    }
    return res;
  }
}

var _singleElementList = [null];

function isSame(a, b) {
  if (a === b) return true;
  if (a instanceof String && b instanceof String && a == b) return true;
  if ((a !== a) && (b !== b)) return true;
  return false;
}
