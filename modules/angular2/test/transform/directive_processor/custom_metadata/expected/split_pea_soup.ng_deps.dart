library dinner.split_pea_soup.ng_deps.dart;

import 'split_pea_soup.dart';
import 'package:angular2/di.dart' show Injectable;
import 'package:angular2/src/facade/lang.dart' show CONST;

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(SplitPea, {
      'factory': () => new SplitPea(),
      'parameters': const [],
      'annotations': const [const Soup()]
    });
}
