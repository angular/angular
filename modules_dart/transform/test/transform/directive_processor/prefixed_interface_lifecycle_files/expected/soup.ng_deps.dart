library dinner.soup.ng_deps.dart;

import 'soup.dart';
export 'soup.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/metadata.dart' as prefix;

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        OnChangeSoupComponent,
        new _ngRef.ReflectionInfo(
            const [
              const prefix.Component(
                  selector: '[soup]',
                  lifecycle: const [prefix.LifecycleEvent.OnChanges])
            ],
            const [],
            () => new OnChangeSoupComponent(),
            const [prefix.OnChanges]));
}
