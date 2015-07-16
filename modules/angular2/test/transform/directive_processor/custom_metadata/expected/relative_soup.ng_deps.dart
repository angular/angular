library dinner.relative_soup.ng_deps.dart;

import 'relative_soup.dart';
import 'package:angular2/src/reflection/reflection.dart' as _ngRef;
import 'annotations/soup.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(RelativeSoup, {
      'factory': () => new RelativeSoup(),
      'parameters': const [],
      'annotations': const [const Soup()]
    });
}
