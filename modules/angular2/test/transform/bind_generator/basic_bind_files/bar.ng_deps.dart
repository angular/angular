library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/annotations/annotations.dart';

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(ToolTip, {
      'factory': () => new ToolTip(),
      'parameters': const [],
      'annotations': const [
        const Decorator(
            selector: '[tool-tip]', bind: const {'text': 'tool-tip'})
      ]
    });
}
