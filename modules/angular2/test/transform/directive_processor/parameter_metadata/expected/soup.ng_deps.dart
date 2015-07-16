library dinner.soup.ng_deps.dart;

import 'soup.dart';
import 'package:angular2/src/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/annotations_impl/annotations.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(SoupComponent, {
      'factory':
          (String description, salt) => new SoupComponent(description, salt),
      'parameters': const [const [String, Tasty], const [const Inject(Salt)]],
      'annotations': const [const Component(selector: '[soup]')]
    });
}
