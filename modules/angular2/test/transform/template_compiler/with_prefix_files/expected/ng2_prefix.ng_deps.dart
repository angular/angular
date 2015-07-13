library angular2.test.transform.template_compiler.with_prefix_files.ng2_prefix.ng_deps.dart;

import 'package:angular2/src/change_detection/pregen_proto_change_detector.dart'
    as _gen;

import 'ng2_prefix.dart';
import 'package:angular2/angular2.dart' as ng2
    show bootstrap, Component, Directive, View, NgElement;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyApp, {
      'factory': () => new MyApp(),
      'parameters': const [const []],
      'annotations': const [
        const ng2.Component(selector: 'my-app'),
        const ng2.View(template: 'MyApp {{name}}')
      ]
    })
    ..registerGetters({'name': (o) => o.name})
    ..registerSetters({'name': (o, v) => o.name = v});
  _gen.preGeneratedProtoDetectors['MyApp_comp_0'] =
      _MyApp_ChangeDetector0.newProtoChangeDetector;
}

class _MyApp_ChangeDetector0 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  _gen.Pipes _pipes;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;
  dynamic _alreadyChecked = false;
  dynamic currentProto = null;
  MyApp _context = null;
  dynamic _name0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _interpolate1 = _gen.ChangeDetectionUtil.uninitialized();

  _MyApp_ChangeDetector0(this._dispatcher, this._protos, this._directiveRecords)
      : super("MyApp_comp_0");

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
    var context = null;
    var name0 = null;
    var interpolate1 = null;
    var change_context = false;
    var change_name0 = false;
    var change_interpolate1 = false;
    var isChanged = false;
    currentProto = null;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    name0 = context.name;
    if (!_gen.looseIdentical(name0, _name0)) {
      change_name0 = true;

      _name0 = name0;
    }
    if (change_name0) {
      currentProto = _protos[1];
      interpolate1 = "MyApp " "${name0 == null ? "" : name0}" "";
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

  void hydrate(MyApp context, locals, directives, pipes) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;

    _alreadyChecked = false;
    _pipes = pipes;
  }

  void dehydrate() {
    _context = null;
    _name0 = _gen.ChangeDetectionUtil.uninitialized();
    _interpolate1 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
    _pipes = null;
  }

  hydrated() => _context != null;

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c) => new _MyApp_ChangeDetector0(a, b, c), def);
  }
}
