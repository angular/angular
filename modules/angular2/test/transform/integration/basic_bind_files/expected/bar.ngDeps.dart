library bar;

import 'bar.dart';
import 'package:angular2/src/core/annotations/annotations.dart';

bool _visited = false;
void setupReflection(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, {
      'factory': () => new MyComponent(),
      'parameters': const [],
      'annotations': const [
        const Component(selector: 'soup', services: const [ToolTip])
      ]
    })
    ..registerType(ToolTip, {
      'factory': () => new ToolTip(),
      'parameters': const [],
      'annotations': const [
        const Decorator(
            selector: '[tool-tip]', bind: const {'text': 'tool-tip'})
      ]
    })
    ..registerSetters({'text': (ToolTip o, String value) => o.text = value});
}
