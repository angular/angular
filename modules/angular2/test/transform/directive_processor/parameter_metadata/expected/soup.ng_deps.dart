library dinner.soup.ng_deps.dart;

import 'soup.dart';
import 'package:angular2/src/core/annotations/annotations.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(SoupComponent, {
      'factory':
          (String description, salt) => new SoupComponent(description, salt),
      'parameters': const [const [Tasty, String], const [const Inject(Salt)]],
      'annotations': const [const Component(selector: '[soup]')]
    });
}
