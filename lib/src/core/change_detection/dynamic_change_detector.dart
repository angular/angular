library angular2.src.core.change_detection.dynamic_change_detector;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, FunctionWrapper, StringWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper, StringMapWrapper;
import "abstract_change_detector.dart" show AbstractChangeDetector;
import "event_binding.dart" show EventBinding;
import "binding_record.dart" show BindingRecord, BindingTarget;
import "directive_record.dart" show DirectiveRecord, DirectiveIndex;
import "parser/locals.dart" show Locals;
import "interfaces.dart" show ChangeDispatcher, ChangeDetectorGenConfig;
import "change_detection_util.dart" show ChangeDetectionUtil, SimpleChange;
import "constants.dart" show ChangeDetectionStrategy, ChangeDetectorState;
import "proto_record.dart" show ProtoRecord, RecordType;

class DynamicChangeDetector extends AbstractChangeDetector<dynamic> {
  List<ProtoRecord> _records;
  List<EventBinding> _eventBindings;
  List<DirectiveRecord> _directiveRecords;
  ChangeDetectorGenConfig _genConfig;
  List<dynamic> values;
  List<dynamic> changes;
  List<dynamic> localPipes;
  List<dynamic> prevContexts;
  dynamic directives = null;
  DynamicChangeDetector(
      String id,
      ChangeDispatcher dispatcher,
      num numberOfPropertyProtoRecords,
      List<BindingTarget> propertyBindingTargets,
      List<DirectiveIndex> directiveIndices,
      ChangeDetectionStrategy strategy,
      this._records,
      this._eventBindings,
      this._directiveRecords,
      this._genConfig)
      : super(id, dispatcher, numberOfPropertyProtoRecords,
            propertyBindingTargets, directiveIndices, strategy) {
    /* super call moved to initializer */;
    var len = _records.length + 1;
    this.values = ListWrapper.createFixedSize(len);
    this.localPipes = ListWrapper.createFixedSize(len);
    this.prevContexts = ListWrapper.createFixedSize(len);
    this.changes = ListWrapper.createFixedSize(len);
    this.dehydrateDirectives(false);
  }
  bool handleEventInternal(String eventName, num elIndex, Locals locals) {
    var preventDefault = false;
    this._matchingEventBindings(eventName, elIndex).forEach((rec) {
      var res = this._processEventBinding(rec, locals);
      if (identical(res, false)) {
        preventDefault = true;
      }
    });
    return preventDefault;
  }

  /** @internal */
  dynamic _processEventBinding(EventBinding eb, Locals locals) {
    var values = ListWrapper.createFixedSize(eb.records.length);
    values[0] = this.values[0];
    for (var protoIdx = 0; protoIdx < eb.records.length; ++protoIdx) {
      var proto = eb.records[protoIdx];
      if (proto.isSkipRecord()) {
        protoIdx += this._computeSkipLength(protoIdx, proto, values);
      } else {
        var res = this._calculateCurrValue(proto, values, locals);
        if (proto.lastInBinding) {
          this._markPathAsCheckOnce(proto);
          return res;
        } else {
          this._writeSelf(proto, res, values);
        }
      }
    }
    throw new BaseException("Cannot be reached");
  }

  num _computeSkipLength(
      num protoIndex, ProtoRecord proto, List<dynamic> values) {
    if (identical(proto.mode, RecordType.SkipRecords)) {
      return proto.fixedArgs[0] - protoIndex - 1;
    }
    if (identical(proto.mode, RecordType.SkipRecordsIf)) {
      var condition = this._readContext(proto, values);
      return condition ? proto.fixedArgs[0] - protoIndex - 1 : 0;
    }
    if (identical(proto.mode, RecordType.SkipRecordsIfNot)) {
      var condition = this._readContext(proto, values);
      return condition ? 0 : proto.fixedArgs[0] - protoIndex - 1;
    }
    throw new BaseException("Cannot be reached");
  }

  /** @internal */
  void _markPathAsCheckOnce(ProtoRecord proto) {
    if (!proto.bindingRecord.isDefaultChangeDetection()) {
      var dir = proto.bindingRecord.directiveRecord;
      this._getDetectorFor(dir.directiveIndex).markPathToRootAsCheckOnce();
    }
  }

  /** @internal */
  List<EventBinding> _matchingEventBindings(String eventName, num elIndex) {
    return this
        ._eventBindings
        .where(
            (eb) => eb.eventName == eventName && identical(eb.elIndex, elIndex))
        .toList();
  }

  void hydrateDirectives(dynamic directives) {
    this.values[0] = this.context;
    this.directives = directives;
    if (identical(this.strategy, ChangeDetectionStrategy.OnPushObserve)) {
      for (var i = 0; i < this.directiveIndices.length; ++i) {
        var index = this.directiveIndices[i];
        super.observeDirective(directives.getDirectiveFor(index), i);
      }
    }
  }

  dehydrateDirectives(bool destroyPipes) {
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

  void checkNoChanges() {
    this.runDetectChanges(true);
  }

  detectChangesInRecordsInternal(bool throwOnChange) {
    var protos = this._records;
    var changes = null;
    var isChanged = false;
    for (var protoIdx = 0; protoIdx < protos.length; ++protoIdx) {
      ProtoRecord proto = protos[protoIdx];
      var bindingRecord = proto.bindingRecord;
      var directiveRecord = bindingRecord.directiveRecord;
      if (this._firstInBinding(proto)) {
        this.propertyBindingIndex = proto.propertyBindingIndex;
      }
      if (proto.isLifeCycleRecord()) {
        if (identical(proto.name, "DoCheck") && !throwOnChange) {
          this._getDirectiveFor(directiveRecord.directiveIndex).ngDoCheck();
        } else if (identical(proto.name, "OnInit") &&
            !throwOnChange &&
            this.state == ChangeDetectorState.NeverChecked) {
          this._getDirectiveFor(directiveRecord.directiveIndex).ngOnInit();
        } else if (identical(proto.name, "OnChanges") &&
            isPresent(changes) &&
            !throwOnChange) {
          this
              ._getDirectiveFor(directiveRecord.directiveIndex)
              .ngOnChanges(changes);
        }
      } else if (proto.isSkipRecord()) {
        protoIdx += this._computeSkipLength(protoIdx, proto, this.values);
      } else {
        var change =
            this._check(proto, throwOnChange, this.values, this.locals);
        if (isPresent(change)) {
          this._updateDirectiveOrElement(change, bindingRecord);
          isChanged = true;
          changes = this._addChange(bindingRecord, change, changes);
        }
      }
      if (proto.lastInDirective) {
        changes = null;
        if (isChanged && !bindingRecord.isDefaultChangeDetection()) {
          this
              ._getDetectorFor(directiveRecord.directiveIndex)
              .markAsCheckOnce();
        }
        isChanged = false;
      }
    }
  }

  /** @internal */
  bool _firstInBinding(ProtoRecord r) {
    var prev = ChangeDetectionUtil.protoByIndex(this._records, r.selfIndex - 1);
    return isBlank(prev) || !identical(prev.bindingRecord, r.bindingRecord);
  }

  afterContentLifecycleCallbacksInternal() {
    var dirs = this._directiveRecords;
    for (var i = dirs.length - 1; i >= 0; --i) {
      var dir = dirs[i];
      if (dir.callAfterContentInit &&
          this.state == ChangeDetectorState.NeverChecked) {
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
      if (dir.callAfterViewInit &&
          this.state == ChangeDetectorState.NeverChecked) {
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
    } else {
      var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
      bindingRecord.setter(
          this._getDirectiveFor(directiveIndex), change.currentValue);
    }
    if (this._genConfig.logBindingUpdate) {
      super.logBindingUpdate(change.currentValue);
    }
  }

  /** @internal */
  _addChange(BindingRecord bindingRecord, change, changes) {
    if (bindingRecord.callOnChanges()) {
      return super
          .addChange(changes, change.previousValue, change.currentValue);
    } else {
      return changes;
    }
  }

  /** @internal */
  _getDirectiveFor(directiveIndex) {
    return this.directives.getDirectiveFor(directiveIndex);
  }

  /** @internal */
  _getDetectorFor(directiveIndex) {
    return this.directives.getDetectorFor(directiveIndex);
  }

  /** @internal */
  SimpleChange _check(ProtoRecord proto, bool throwOnChange,
      List<dynamic> values, Locals locals) {
    if (proto.isPipeRecord()) {
      return this._pipeCheck(proto, throwOnChange, values);
    } else {
      return this._referenceCheck(proto, throwOnChange, values, locals);
    }
  }

  /** @internal */
  _referenceCheck(ProtoRecord proto, bool throwOnChange, List<dynamic> values,
      Locals locals) {
    if (this._pureFuncAndArgsDidNotChange(proto)) {
      this._setChanged(proto, false);
      return null;
    }
    var currValue = this._calculateCurrValue(proto, values, locals);
    if (identical(this.strategy, ChangeDetectionStrategy.OnPushObserve)) {
      super.observeValue(currValue, proto.selfIndex);
    }
    if (proto.shouldBeChecked()) {
      var prevValue = this._readSelf(proto, values);
      if (ChangeDetectionUtil.looseNotIdentical(prevValue, currValue)) {
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

  _calculateCurrValue(ProtoRecord proto, List<dynamic> values, Locals locals) {
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
        return FunctionWrapper.apply(
            this._readContext(proto, values), this._readArgs(proto, values));
      case RecordType.Interpolate:
      case RecordType.PrimitiveOp:
      case RecordType.CollectionLiteral:
        return FunctionWrapper.apply(
            proto.funcOrValue, this._readArgs(proto, values));
      default:
        throw new BaseException('''Unknown operation ${ proto . mode}''');
    }
  }

  _pipeCheck(ProtoRecord proto, bool throwOnChange, List<dynamic> values) {
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
  }

  _pipeFor(ProtoRecord proto, context) {
    var storedPipe = this._readPipe(proto);
    if (isPresent(storedPipe)) return storedPipe;
    var pipe = this.pipes.get(proto.name);
    this._writePipe(proto, pipe);
    return pipe;
  }

  _readContext(ProtoRecord proto, List<dynamic> values) {
    if (proto.contextIndex == -1) {
      return this._getDirectiveFor(proto.directiveIndex);
    }
    return values[proto.contextIndex];
  }

  _readSelf(ProtoRecord proto, List<dynamic> values) {
    return values[proto.selfIndex];
  }

  _writeSelf(ProtoRecord proto, value, List<dynamic> values) {
    values[proto.selfIndex] = value;
  }

  _readPipe(ProtoRecord proto) {
    return this.localPipes[proto.selfIndex];
  }

  _writePipe(ProtoRecord proto, value) {
    this.localPipes[proto.selfIndex] = value;
  }

  _setChanged(ProtoRecord proto, bool value) {
    if (proto.argumentToPureFunction) this.changes[proto.selfIndex] = value;
  }

  bool _pureFuncAndArgsDidNotChange(ProtoRecord proto) {
    return proto.isPureFunction() && !this._argsChanged(proto);
  }

  bool _argsChanged(ProtoRecord proto) {
    var args = proto.args;
    for (var i = 0; i < args.length; ++i) {
      if (this.changes[args[i]]) {
        return true;
      }
    }
    return false;
  }

  bool _argsOrContextChanged(ProtoRecord proto) {
    return this._argsChanged(proto) || this.changes[proto.contextIndex];
  }

  _readArgs(ProtoRecord proto, List<dynamic> values) {
    var res = ListWrapper.createFixedSize(proto.args.length);
    var args = proto.args;
    for (var i = 0; i < args.length; ++i) {
      res[i] = values[args[i]];
    }
    return res;
  }
}
