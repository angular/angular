import {isPresent, isBlank, BaseException, FunctionWrapper} from 'facade/lang';
import {List, ListWrapper, MapWrapper, StringMapWrapper} from 'facade/collection';
import {ContextWithVariableBindings} from './parser/context_with_variable_bindings';

import {ArrayChanges} from './array_changes';
import {KeyValueChanges} from './keyvalue_changes';

import {
  ProtoRecord,
  RECORD_TYPE_SELF,
  RECORD_TYPE_PROPERTY,
  RECORD_TYPE_INVOKE_METHOD,
  RECORD_TYPE_CONST,
  RECORD_TYPE_INVOKE_CLOSURE,
  RECORD_TYPE_INVOKE_PURE_FUNCTION,
  RECORD_TYPE_INVOKE_FORMATTER,
  RECORD_TYPE_STRUCTURAL_CHECK,
  ProtoChangeDetector
  } from './proto_change_detector';

import {ChangeDetector, ChangeRecord, ChangeDispatcher} from './interfaces';
import {ExpressionChangedAfterItHasBeenChecked, ChangeDetectionError} from './exceptions';

class SimpleChange {
  previousValue:any;
  currentValue:any;

  constructor(previousValue:any, currentValue:any) {
    this.previousValue = previousValue;
    this.currentValue = currentValue;
  }
}

export class DynamicChangeDetector extends ChangeDetector {
  dispatcher:any;
  formatters:Map;
  children:List;
  values:List;
  protos:List<ProtoRecord>;
  parent:ChangeDetector;

  constructor(dispatcher:any, formatters:Map, protoRecords:List<ProtoRecord>) {
    this.dispatcher = dispatcher;
    this.formatters = formatters;
    this.values = ListWrapper.createFixedSize(protoRecords.length + 1);
    this.protos = protoRecords;

    this.children = [];
  }

  addChild(cd:ChangeDetector) {
    ListWrapper.push(this.children, cd);
    cd.parent = this;
  }

  removeChild(cd:ChangeDetector) {
    ListWrapper.remove(this.children, cd);
  }

  remove() {
    this.parent.removeChild(this);
  }

  setContext(context:any) {
    this.values[0] = context;
  }

  detectChanges() {
    this._detectChanges(false);
  }

  checkNoChanges() {
    this._detectChanges(true);
  }

  _detectChanges(throwOnChange:boolean) {
    this._detectChangesInRecords(throwOnChange);
    this._detectChangesInChildren(throwOnChange);
  }

  _detectChangesInRecords(throwOnChange:boolean) {
    var protos:List<ProtoRecord> = this.protos;

    var updatedRecords = null;
    var currentGroup = null;

    for (var i = 0; i < protos.length; ++i) {
      var proto:ProtoRecord = protos[i];
      var change = this._check(proto);

      // only when the terminal record, which ends a binding, changes
      // we need to add it to a list of changed records
      if (isPresent(change) && proto.terminal) {
        if (throwOnChange) throw new ExpressionChangedAfterItHasBeenChecked(proto, change);
        currentGroup = proto.groupMemento;
        updatedRecords = this._addRecord(updatedRecords, proto, change);
      }

      if (isPresent(updatedRecords)) {
        var lastRecordOfCurrentGroup = protos.length == i + 1 ||
          currentGroup !== protos[i + 1].groupMemento;
        if (lastRecordOfCurrentGroup) {
          this.dispatcher.onRecordChange(currentGroup, updatedRecords);
          updatedRecords = null;
        }
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
    var prevValue = this._readSelf(proto);
    var currValue = this._calculateCurrValue(proto);

    if (! isSame(prevValue, currValue)) {
      this._writeSelf(proto, currValue);
      return new SimpleChange(prevValue, currValue);

    } else {
      return null;
    }
  }

  _calculateCurrValue(proto:ProtoRecord) {
    switch (proto.mode) {
      case RECORD_TYPE_SELF:
        throw new BaseException("Cannot evaluate self");

      case RECORD_TYPE_CONST:
        return proto.funcOrValue;

      case RECORD_TYPE_PROPERTY:
        var context = this._readContext(proto);
        while (context instanceof ContextWithVariableBindings) {
          if (context.hasBinding(proto.name)) {
            return context.get(proto.name);
          }
          context = context.parent;
        }
        var propertyGetter:Function = proto.funcOrValue;
        return propertyGetter(context);

      case RECORD_TYPE_INVOKE_METHOD:
        var methodInvoker:Function = proto.funcOrValue;
        return methodInvoker(this._readContext(proto), this._readArgs(proto));

      case RECORD_TYPE_INVOKE_CLOSURE:
        return FunctionWrapper.apply(this._readContext(proto), this._readArgs(proto));

      case RECORD_TYPE_INVOKE_PURE_FUNCTION:
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

    if (isBlank(self)) {
      if (ArrayChanges.supports(context)) {
        self = new ArrayChanges();
      } else if (KeyValueChanges.supports(context)) {
        self = new KeyValueChanges();
      }
    }

    if (ArrayChanges.supports(context)) {
      if (self.check(context)) {
        this._writeSelf(proto, self);
        return new SimpleChange(null, self); // TODO: don't wrap and return self instead
      }

    } else if (KeyValueChanges.supports(context)) {
      if (self.check(context)) {
        this._writeSelf(proto, self);
        return new SimpleChange(null, self); // TODO: don't wrap and return self instead
      }

    } else if (context == null) {
      this._writeSelf(proto, null);
      return new SimpleChange(null, null);

    } else {
      throw new BaseException(`Unsupported type (${context})`);
    }

  }

  _addRecord(updatedRecords:List, proto:ProtoRecord, change):List {
    // we can use a pool of change records not to create extra garbage
    var record = new ChangeRecord(proto.bindingMemento, change);
    if (isBlank(updatedRecords)) {
      updatedRecords = _singleElementList;
      updatedRecords[0] = record;

    } else if (updatedRecords === _singleElementList) {
      updatedRecords = [_singleElementList[0], record];

    } else {
      ListWrapper.push(updatedRecords, record);
    }
    return updatedRecords;
  }

  _detectChangesInChildren(throwOnChange:boolean) {
    var children = this.children;
    for(var i = 0; i < children.length; ++i) {
      children[i]._detectChanges(throwOnChange);
    }
  }

  _readContext(proto:ProtoRecord) {
    return this.values[proto.contextIndex];
  }

  _readSelf(proto:ProtoRecord) {
    return this.values[proto.record_type_selfIndex];
  }

  _writeSelf(proto:ProtoRecord, value) {
    this.values[proto.record_type_selfIndex] = value;
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
