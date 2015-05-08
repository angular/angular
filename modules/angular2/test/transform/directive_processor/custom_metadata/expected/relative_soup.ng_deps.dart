library dinner.relative_soup.ng_deps.dart;

import 'relative_soup.dart';
import 'annotations/soup.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(RelativeSoup, {
      'factory': () => new RelativeSoup(),
      'parameters': const [],
      'annotations': const [const Soup()]
    });
}
