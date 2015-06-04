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
        const View(template: 'Salad')
      ]
    });
}
class _MyComponent_ChangeDetector0 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final _gen.PipeRegistry _pipeRegistry;
  final _gen.List<_gen.ProtoRecord> _protos;
  final _gen.List<_gen.DirectiveRecord> _directiveRecords;
  dynamic _locals = null;
  MyComponent _context = null;

  _MyComponent_ChangeDetector0(this._dispatcher, this._pipeRegistry,
      this._protos, this._directiveRecords)
      : super();

  void detectChangesInRecords(throwOnChange) {
    var context = null;
    var change_context = false;
    var isChanged = false;
    var currentProto;
    var changes = null;

    context = _context;
  }

  void callOnAllChangesDone() {}

  void hydrate(MyComponent context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = null;
    _locals = null;
  }

  hydrated() => _context == null;

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.PipeRegistry registry, _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c, d) => new _MyComponent_ChangeDetector0(a, b, c, d), registry,
        def);
  }
}
