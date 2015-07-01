library bar.ng_deps.dart;

import 'package:angular2/src/change_detection/pregen_proto_change_detector.dart'
    as _gen;

import 'bar.dart';
import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'package:angular2/src/core/annotations_impl/view.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, {
      'factory': () => new MyComponent(),
      'parameters': const [],
      'annotations': const [
        const Component(selector: '[soup]'),
        const View(template: 'Salad: {{myNum}} is awesome')
      ]
    })
    ..registerGetters({'myNum': (o) => o.myNum})
    ..registerSetters({'myNum': (o, v) => o.myNum = v});
  _gen.preGeneratedProtoDetectors['MyComponent_comp_0'] =
      _MyComponent_ChangeDetector0.newProtoChangeDetector;
}
class _MyComponent_ChangeDetector0 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;
  dynamic _alreadyChecked = false;
  MyComponent _context = null;
  dynamic _myNum0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _interpolate1 = _gen.ChangeDetectionUtil.uninitialized();

  _MyComponent_ChangeDetector0(this._dispatcher, this._pipeRegistry,
      this._protos, this._directiveRecords)
      : super("MyComponent_comp_0");

  void detectChangesInRecords(throwOnChange) {
    if (!hydrated()) {
      _gen.ChangeDetectionUtil.throwDehydrated();
    }
    var context = null;
    var myNum0 = null;
    var interpolate1 = null;
    var change_context = false;
    var change_myNum0 = false;
    var change_interpolate1 = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    myNum0 = context.myNum;
    if (!_gen.looseIdentical(myNum0, _myNum0)) {
      change_myNum0 = true;

      _myNum0 = myNum0;
    }
    if (change_myNum0) {
      currentProto = _protos[1];
      interpolate1 = "Salad: " "${myNum0 == null ? "" : myNum0}" " is awesome";
      if (!_gen.looseIdentical(interpolate1, _interpolate1)) {
        change_interpolate1 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _interpolate1, interpolate1));
        }

        _dispatcher.notifyOnBinding(currentProto.bindingRecord, interpolate1);

        _interpolate1 = interpolate1;
      }
    } else {
      interpolate1 = _interpolate1;
    }
    changes = null;

    isChanged = false;

    _alreadyChecked = true;
  }

  void callOnAllChangesDone() {
    _dispatcher.notifyOnAllChangesDone();
  }

  void hydrate(MyComponent context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;

    _alreadyChecked = false;
  }

  void dehydrate() {
    _context = null;
    _myNum0 = _gen.ChangeDetectionUtil.uninitialized();
    _interpolate1 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() => _context != null;

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new _MyComponent_ChangeDetector0(a, b, c, d), registry,
        def);
  }
}
