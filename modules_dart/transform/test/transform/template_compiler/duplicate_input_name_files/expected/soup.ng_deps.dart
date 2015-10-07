library dinner.soup.ng_deps.dart;

import 'package:angular2/src/core/metadata.dart';
import 'soup.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        SoupDirective,
        new ReflectionInfo(const [
          const Directive(
              selector: 'soup',
              componentServices: const [SaladDirective],
              inputs: const ['menu'])
        ], const [], () => new SoupDirective()))
    ..registerType(
        SaladDirective,
        new ReflectionInfo(const [
          const Directive(selector: 'salad', inputs: const ['menu'])
        ], const [], () => new SaladDirective()))
    ..registerSetters({'menu': (o, v) => o.menu = v});
}
