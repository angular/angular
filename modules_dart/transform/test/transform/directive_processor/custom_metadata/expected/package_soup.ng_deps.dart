library dinner.package_soup.ng_deps.dart;

import 'package_soup.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:soup/soup.dart';
export 'package_soup.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        PackageSoup,
        new _ngRef.ReflectionInfo(
            const [const Soup()], const [], () => new PackageSoup()));
}
