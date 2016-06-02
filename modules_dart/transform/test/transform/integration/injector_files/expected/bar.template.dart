// @ignoreProblemForFile UNUSED_IMPORT
// @ignoreProblemForFile UNUSED_SHOWN_NAME
library bar.template.dart;

import 'bar.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/metadata.dart';
import 'foo.dart';
import 'package:angular2/src/core/metadata.template.dart' as i0;
import 'foo.template.dart' as i1;
export 'bar.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        MyModule,
        new _ngRef.ReflectionInfo(const [
          const InjectorModule(providers: const [ServiceDep])
        ], const [], () => new MyModule()));
  i0.initReflector();
  i1.initReflector();
}
