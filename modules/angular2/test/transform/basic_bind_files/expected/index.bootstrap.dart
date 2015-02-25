library angular2.src.transform.generated;

import 'package:angular2/src/reflection/reflection.dart' show reflector;
import 'bar.dart' as i0;
import 'package:angular2/src/core/annotations/annotations.dart' as i1;

setupReflection() {
  reflector
    ..registerType(i0.MyComponent, {
      "factory": () => new i0.MyComponent(),
      "parameters": const [const []],
      "annotations": const [
        const i1.Component(
            selector: 'soup', componentServices: const [i0.ToolTip])
      ]
    })
    ..registerType(i0.ToolTip, {
      "factory": () => new i0.ToolTip(),
      "parameters": const [const []],
      "annotations": const [
        const i1.Decorator(
            selector: '[tool-tip]', bind: const {'text': 'tool-tip'})
      ]
    })
    ..registerSetters({"text": (i0.ToolTip o, String value) => o.text = value});
}
