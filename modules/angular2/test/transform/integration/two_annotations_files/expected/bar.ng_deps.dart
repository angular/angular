library bar.ng_deps.dart;

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
