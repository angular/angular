library dinner.soup.ng_deps.dart;

import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'soup.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(SoupComponent, {
      'factory': () => new SoupComponent(),
      'parameters': const [],
      'annotations': const [
        const Component(
            componentServices: const [SaladComponent],
            properties: const ['menu'])
      ]
    })
    ..registerType(SaladComponent, {
      'factory': () => new SaladComponent(),
      'parameters': const [],
      'annotations': const [const Component(properties: const ['menu'])]
    });
}
