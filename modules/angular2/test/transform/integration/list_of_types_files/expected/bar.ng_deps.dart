library bar;

import 'bar.dart';
import 'package:angular2/src/core/annotations/annotations.dart';
import 'foo.dart';

bool _visited = false;
void setupReflection(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, {
      'factory': (MyContext c) => new MyComponent(c),
      'parameters': const [const [MyContext]],
      'annotations':
          const [const Component(componentServices: const [MyContext])]
    });
}
