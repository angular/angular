import 'package:angular2/test_lib.dart' show SpyObject;
import 'package:angular2/core.dart'
    show ApplicationRef, LifeCycle, Injector, bind;
import 'dart:js';

@proxy
class SpyLifeCycle extends SpyObject implements LifeCycle {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyApplicationRef extends SpyObject implements ApplicationRef {
  Injector injector;

  SpyApplicationRef() {
    this.injector = Injector.resolveAndCreate([
      bind(LifeCycle).toClass(SpyLifeCycle)
    ]);
  }

  noSuchMethod(m) => super.noSuchMethod(m);
}

void callNgProfilerTimeChangeDetection([config]) {
  context['ng']['profiler'].callMethod('timeChangeDetection',
      config != null ? [config] : []);
}
