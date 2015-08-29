library examples.hello_world.index_common_dart.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement, LifecycleEvent;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        HelloCmp,
        new ReflectionInfo(const [
          const Component(lifecycle: [
            LifecycleEvent.OnChanges,
            LifecycleEvent.OnDestroy,
            LifecycleEvent.OnInit,
            LifecycleEvent.DoCheck,
            LifecycleEvent.AfterContentInit,
            LifecycleEvent.AfterContentChecked,
            LifecycleEvent.AfterViewInit,
            LifecycleEvent.AfterViewChecked
          ])
        ], const [
          const []
        ], () => new HelloCmp()));
}
