library examples.hello_world.index_common_dart.ng_deps.dart;

import 'package:angular2/src/change_detection/pregen_proto_change_detector.dart'
    as _gen;

import 'hello.dart';
import 'package:angular2/angular2.dart'
    show bootstrap, Component, Directive, View, NgElement;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(HelloCmp, {
      'factory': () => new HelloCmp(),
      'parameters': const [const []],
      'annotations': const [
        const Component(selector: 'hello-app'),
        const View(template: '{{greeting}}, {{greeting}}')
      ]
    })
    ..registerGetters({'greeting': (o) => o.greeting})
    ..registerSetters({'greeting': (o, v) => o.greeting = v});
  _gen.preGeneratedProtoDetectors['HelloCmp_comp_0'] =
      _HelloCmp_ChangeDetector0.newProtoChangeDetector;
}

class _HelloCmp_ChangeDetector0 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  _gen.Pipes _pipes;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;
  dynamic _alreadyChecked = false;
  dynamic currentProto = null;
  HelloCmp _context = null;
  dynamic _greeting0 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _greeting1 = _gen.ChangeDetectionUtil.uninitialized();
  dynamic _interpolate2 = _gen.ChangeDetectionUtil.uninitialized();

  _HelloCmp_ChangeDetector0(
      this._dispatcher, this._protos, this._directiveRecords)
      : super("HelloCmp_comp_0");

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
    var greeting0 = null;
    var greeting1 = null;
    var interpolate2 = null;
    var change_context = false;
    var change_greeting0 = false;
    var change_greeting1 = false;
    var change_interpolate2 = false;
    var isChanged = false;
    currentProto = null;
    var changes = null;

    context = _context;
    currentProto = _protos[0];
    greeting0 = context.greeting;
    if (!_gen.looseIdentical(greeting0, _greeting0)) {
      change_greeting0 = true;

      _greeting0 = greeting0;
    }
    currentProto = _protos[1];
    greeting1 = context.greeting;
    if (!_gen.looseIdentical(greeting1, _greeting1)) {
      change_greeting1 = true;

      _greeting1 = greeting1;
    }
    if (change_greeting0 || change_greeting1) {
      currentProto = _protos[2];
      interpolate2 =
          "" "${greeting0 == null ? "" : greeting0}" ", " "${greeting1 == null ? "" : greeting1}" "";
      if (!_gen.looseIdentical(interpolate2, _interpolate2)) {
        change_interpolate2 = true;
        if (throwOnChange) {
          _gen.ChangeDetectionUtil.throwOnChange(currentProto,
              _gen.ChangeDetectionUtil.simpleChange(
                  _interpolate2, interpolate2));
        }

        _dispatcher.notifyOnBinding(currentProto.bindingRecord, interpolate2);

        _interpolate2 = interpolate2;
      }
    } else {
      interpolate2 = _interpolate2;
    }
    changes = null;

    isChanged = false;

    _alreadyChecked = true;
  }

  void callOnAllChangesDone() {
    _dispatcher.notifyOnAllChangesDone();
  }

  void hydrate(HelloCmp context, locals, directives, pipes) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;

    _alreadyChecked = false;
    _pipes = pipes;
  }

  void dehydrate() {
    _context = null;
    _greeting0 = _gen.ChangeDetectionUtil.uninitialized();
    _greeting1 = _gen.ChangeDetectionUtil.uninitialized();
    _interpolate2 = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
    _pipes = null;
  }

  hydrated() => _context != null;

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c) => new _HelloCmp_ChangeDetector0(a, b, c), def);
  }
}
