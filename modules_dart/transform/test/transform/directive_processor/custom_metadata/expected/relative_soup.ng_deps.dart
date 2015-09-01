library dinner.relative_soup.ng_deps.dart;

import 'relative_soup.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'annotations/soup.dart';
export 'relative_soup.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        RelativeSoup,
        new _ngRef.ReflectionInfo(
            const [const Soup()], const [], () => new RelativeSoup()));
}
