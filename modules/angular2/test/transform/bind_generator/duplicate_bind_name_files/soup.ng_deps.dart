library dinner.soup.ng_deps.dart;

import 'package:angular2/src/core/annotations/annotations.dart';
import 'soup.dart';

bool _visited = false;
void setupReflection(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(SoupComponent, {
      'factory': () => new SoupComponent(),
      'parameters': const [],
      'annotations': const [
        const Component(
            componentServices: const [SaladComponent],
            bind: const {'menu': 'menu'})
      ]
    })
    ..registerType(SaladComponent, {
      'factory': () => new SaladComponent(),
      'parameters': const [],
      'annotations': const [const Component(bind: const {'menu': 'menu'})]
    });
}
