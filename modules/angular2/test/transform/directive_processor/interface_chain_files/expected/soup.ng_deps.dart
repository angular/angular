library dinner.soup.ng_deps.dart;

import 'soup.dart';
import 'package:angular2/src/core/annotations_impl/annotations.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(ChangingSoupComponent, {
      'factory': () => new ChangingSoupComponent(),
      'parameters': const [],
      'annotations': const [const Component(selector: '[soup]')],
      'interfaces': const [PrimaryInterface]
    });
}
