library dinner.chicken_soup.ng_deps.dart;

import 'chicken_soup.dart';
import 'package:angular2/di.dart' show Injectable;
import 'package:angular2/src/facade/lang.dart' show CONST;

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(ChickenSoup, {
      'factory': () => new ChickenSoup(),
      'parameters': const [],
      'annotations': const [const Soup()]
    });
}
