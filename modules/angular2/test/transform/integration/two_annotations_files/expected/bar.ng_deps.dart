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
    ..registerType(
        MyComponent,
        new _ngRef.ReflectionInfo(const [
          const Component(selector: '[soup]'),
          const View(template: 'Salad: {{myNum}} is awesome')
        ], const [], () => new MyComponent()))
    ..registerGetters({'myNum': (o) => o.myNum})
    ..registerSetters({'myNum': (o, v) => o.myNum = v});
  _gen.preGeneratedProtoDetectors['MyComponent_comp_0'] =
      _MyComponent_ChangeDetector0.newProtoChangeDetector;
}

class _MyComponent_ChangeDetector0
    extends _gen.AbstractChangeDetector<MyComponent> {
  var myNum0, interpolate1;

  _MyComponent_ChangeDetector0(dispatcher, protos, directiveRecords)
      : super("MyComponent_comp_0", dispatcher, protos, directiveRecords,
            'ALWAYS_CHECK') {
    dehydrateDirectives(false);
  }

  bool handleEvent(eventName, elIndex, locals) {
    var preventDefault = false;
    return preventDefault;
  }

  void detectChangesInRecordsInternal(throwOnChange) {
    var l_context = this.context, l_myNum0, c_myNum0, l_interpolate1;
    c_myNum0 = false;
    var isChanged = false;
    var changes = null;

    this.firstProtoInCurrentBinding = 1;
    l_myNum0 = l_context.myNum;
    if (_gen.looseNotIdentical(l_myNum0, this.myNum0)) {
      c_myNum0 = true;

      this.myNum0 = l_myNum0;
    }
    if (c_myNum0) {
      l_interpolate1 =
          "${"Salad: "}${_gen.ChangeDetectionUtil.s(l_myNum0)}${" is awesome"}";
      if (_gen.looseNotIdentical(l_interpolate1, this.interpolate1)) {
        if (throwOnChange) {
          this.throwOnChangeError(this.interpolate1, l_interpolate1);
        }

        this.notifyDispatcher(l_interpolate1);

        this.interpolate1 = l_interpolate1;
      }
    }
    changes = null;

    isChanged = false;

    this.alreadyChecked = true;
  }

  void checkNoChanges() {
    runDetectChanges(true);
  }

  void dehydrateDirectives(destroyPipes) {
    this.myNum0 = this.interpolate1 = _gen.ChangeDetectionUtil.uninitialized;
  }

  static _gen.ProtoChangeDetector newProtoChangeDetector(
      _gen.ChangeDetectorDefinition def) {
    return new _gen.PregenProtoChangeDetector(
        (a, b, c) => new _MyComponent_ChangeDetector0(a, b, c), def);
  }
}
