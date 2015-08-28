library dinner.soup.ng_deps.dart;

import 'soup.dart';
export 'soup.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/metadata.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        OnChangeSoupComponent,
        new _ngRef.ReflectionInfo(
            const [
              const Component(
                  selector: '[soup]',
                  lifecycle: const [LifecycleEvent.OnChanges])
            ],
            const [],
            () => new OnChangeSoupComponent(),
            const [OnChanges]))
    ..registerType(
        OnDestroySoupComponent,
        new _ngRef.ReflectionInfo(
            const [
              const Component(
                  selector: '[soup]',
                  lifecycle: const [LifecycleEvent.OnDestroy])
            ],
            const [],
            () => new OnDestroySoupComponent(),
            const [OnDestroy]))
    ..registerType(
        OnCheckSoupComponent,
        new _ngRef.ReflectionInfo(
            const [
              const Component(
                  selector: '[soup]', lifecycle: const [LifecycleEvent.DoCheck])
            ],
            const [],
            () => new OnCheckSoupComponent(),
            const [DoCheck]))
    ..registerType(
        OnInitSoupComponent,
        new _ngRef.ReflectionInfo(
            const [
              const Component(
                  selector: '[soup]', lifecycle: const [LifecycleEvent.OnInit])
            ],
            const [],
            () => new OnInitSoupComponent(),
            const [OnInit]))
    ..registerType(
        AfterContentCheckedSoupComponent,
        new _ngRef.ReflectionInfo(
            const [
              const Component(
                  selector: '[soup]',
                  lifecycle: const [LifecycleEvent.AfterContentChecked])
            ],
            const [],
            () => new AfterContentCheckedSoupComponent(),
            const [AfterContentChecked]));
}
