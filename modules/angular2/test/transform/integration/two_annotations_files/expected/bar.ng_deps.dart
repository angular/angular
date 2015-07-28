library bar.ng_deps.dart;

import 'package:angular2/src/change_detection/pregen_proto_change_detector.dart'
    as _gen;

import 'bar.dart';
export 'bar.dart';
import 'package:angular2/src/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'package:angular2/src/core/annotations_impl/view.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(MyComponent, new _ngRef.ReflectionInfo(const [
      const Component(selector: '[soup]'),
      const View(template: 'Salad: {{myNum}} is awesome')
    ], const [], () => new MyComponent()))
    ..registerGetters({'myNum': (o) => o.myNum})
    ..registerSetters({'myNum': (o, v) => o.myNum = v});
  _gen.preGeneratedProtoDetectors['MyComponent_comp_0'] =
      _MyComponent_ChangeDetector0.newProtoChangeDetector;
}
class _MyComponent_ChangeDetector0 extends _gen.AbstractChangeDetector {
  _gen.Pipes _pipes;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;
  dynamic _alreadyChecked = false;
  dynamic currentProto = null;
  MyComponent _context;
  var _myNum0, _interpolate1;

  _MyComponent_ChangeDetector0(
      dynamic dispatcher, this._protos, this._directiveRecords)
      : super("MyComponent_comp_0", dispatcher) {
    _context = null;
    _myNum0 = _interpolate1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  void detectChangesInRecords(throwOnChange) {
    if (!hydrated()) {
      _gen.ChangeDetectionUtil.throwDehydrated();
    }
    try {
      this.__detectChangesInRecords(throwOnChange);
    } catch (e, s) {
      this.throwError(currentProto, e, s);
    }
  }

  void __detectChangesInRecords(throwOnChange) {
    var context, c_context, myNum0, c_myNum0, interpolate1, c_interpolate1;
    c_context = c_myNum0 = c_interpolate1 = false;
    var isChanged = false;
    currentProto = null;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    myNum0 = context.myNum;
    if (_gen.looseNotIdentical(myNum0, _myNum0)) {
      c_myNum0 = true;

      _myNum0 = myNum0;
    }
    if (c_myNum0) {
      currentProto = _protos[1];
      interpolate1 = "Salad: " "${myNum0 == null ? "" : myNum0}" " is awesome";
      if (_gen.looseNotIdentical(interpolate1, _interpolate1)) {
        c_interpolate1 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _interpolate1, interpolate1));
        }

        dispatcher.notifyOnBinding(currentProto.bindingRecord, interpolate1);

        _interpolate1 = interpolate1;
      }
    } else {
      interpolate1 = _interpolate1;
    }
    changes = null;

    isChanged = false;

    _alreadyChecked = true;
  }

  void checkNoChanges() {
    this.runDetectChanges(true);
  }

  void callOnAllChangesDone() {
    dispatcher.notifyOnAllChangesDone();
  }

  void hydrate(MyComponent context, locals, directives, pipes) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;

    _alreadyChecked = false;
    _pipes = pipes;
  }

  void dehydrate() {
    _context = null;
    _myNum0 = _interpolate1 = _gen.ChangeDetectionUtil.uninitialized;
    _locals = null;
    _pipes = null;
  }

  hydrated() => _context != null;

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c) => new _MyComponent_ChangeDetector0(a, b, c), def);
  }
}
