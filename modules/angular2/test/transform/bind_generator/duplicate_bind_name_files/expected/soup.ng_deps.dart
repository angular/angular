library dinner.soup.ng_deps.dart;

import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'soup.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        SoupComponent,
        new ReflectionInfo(const [
          const Component(
              componentServices: const [SaladComponent],
              properties: const ['menu'])
        ], const [], () => new SoupComponent()))
    ..registerType(
        SaladComponent,
        new ReflectionInfo(const [
          const Component(properties: const ['menu'])
        ], const [], () => new SaladComponent()))
    ..registerSetters({'menu': (o, v) => o.menu = v});
}
