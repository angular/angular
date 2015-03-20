library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/annotations/annotations.dart';
import 'package:angular2/src/core/annotations/template.dart';
import 'package:angular2/src/core/annotations/template.ng_deps.dart' as i0;
import 'package:angular2/src/core/annotations/annotations.ng_deps.dart' as i1;

bool _visited = false;
void setupReflection(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, {
      'factory': () => new MyComponent(),
      'parameters': const [],
      'annotations': const [
        const Component(selector: '[soup]'),
        const Template(inline: 'Salad')
      ]
    });
  i0.setupReflection(reflector);
  i1.setupReflection(reflector);
}
