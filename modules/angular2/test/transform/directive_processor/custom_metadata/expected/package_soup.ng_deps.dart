library dinner.package_soup.ng_deps.dart;

import 'package_soup.dart';
import 'package:soup/soup.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(PackageSoup, {
      'factory': () => new PackageSoup(),
      'parameters': const [],
      'annotations': const [const Soup()]
    });
}
