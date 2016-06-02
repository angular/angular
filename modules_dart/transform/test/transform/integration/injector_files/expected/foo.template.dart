// @ignoreProblemForFile UNUSED_IMPORT
// @ignoreProblemForFile UNUSED_SHOWN_NAME
library foo.template.dart;

import 'foo.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/angular2.dart' show Injectable;
export 'foo.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        ServiceDep,
        new _ngRef.ReflectionInfo(
            const [const Injectable()], const [], () => new ServiceDep()));
}
