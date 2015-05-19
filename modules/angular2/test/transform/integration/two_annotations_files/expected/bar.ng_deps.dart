library bar.ng_deps.dart;

import 'package:angular2/src/facade/lang.dart' as _gen
    show NumberWrapper, looseIdentical;
import 'package:angular2/src/change_detection/change_detection_util.dart'
    as _gen show ChangeDetectionUtil;
import 'package:angular2/src/change_detection/abstract_change_detector.dart'
    as _gen show AbstractChangeDetector;

import 'bar.dart';
import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'package:angular2/src/core/annotations_impl/annotations.ng_deps.dart'
    as i0;
import 'package:angular2/src/core/annotations_impl/view.dart';
import 'package:angular2/src/core/annotations_impl/view.ng_deps.dart' as i1;

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
  i0.initReflector(reflector);
  i1.initReflector(reflector);
}
class _MyComponent_ChangeDetector0 extends _gen.AbstractChangeDetector {
  final dynamic _dispatcher;
  final PipeRegistry _pipeRegistry;
  final dynamic _protos;
  final dynamic _directiveRecords;
  dynamic _locals = null;
  dynamic _context = _gen.ChangeDetectionUtil.uninitialized();
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

  void hydrate(context, locals, directives) {
    mode = 'ALWAYS_CHECK';
    _context = context;
    _locals = locals;
  }

  void dehydrate() {
    _context = _gen.ChangeDetectionUtil.uninitialized();
    _locals = null;
  }

  hydrated() =>
      !_gen.looseIdentical(_context, _gen.ChangeDetectionUtil.uninitialized());
}
