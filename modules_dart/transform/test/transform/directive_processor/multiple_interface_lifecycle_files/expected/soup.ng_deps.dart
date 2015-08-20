library dinner.soup.ng_deps.dart;

import 'soup.dart';
export 'soup.dart';
import 'package:angular2/src/reflection/reflection.dart' as _ngRef;
import 'package:angular2/metadata.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        MultiSoupComponent,
        new _ngRef.ReflectionInfo(
            const [
              const Component(
                  selector: '[soup]',
                  lifecycle: const [
                    LifecycleEvent.onChange,
                    LifecycleEvent.onDestroy,
                    LifecycleEvent.onInit
                  ])
            ],
            const [],
            () => new MultiSoupComponent(),
            const [OnChange, OnDestroy, OnInit]))
    ..registerType(
        MixedSoupComponent,
        new _ngRef.ReflectionInfo(
            const [
              const Component(
                  selector: '[soup]',
                  lifecycle: const [
                    LifecycleEvent.onChange,
                    LifecycleEvent.onCheck
                  ])
            ],
            const [],
            () => new MixedSoupComponent(),
            const [OnChange]))
    ..registerType(
        MatchedSoupComponent,
        new _ngRef.ReflectionInfo(
            const [
              const Component(
                  selector: '[soup]',
                  lifecycle: const [LifecycleEvent.onChange])
            ],
            const [],
            () => new MatchedSoupComponent(),
            const [OnChange]));
}
