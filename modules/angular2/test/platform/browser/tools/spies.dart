import 'package:angular2/testing_internal.dart' show SpyObject;
import 'package:angular2/core.dart' show Injector, bind;
import 'package:angular2/src/core/application_ref.dart' show ApplicationRef;
import 'package:angular2/src/core/linker/dynamic_component_loader.dart'
    show ComponentRef_;
import 'dart:js';

@proxy
class SpyApplicationRef extends SpyObject implements ApplicationRef {
  tick() {}
}

@proxy
class SpyComponentRef extends SpyObject implements ComponentRef_ {
  Injector injector;

  SpyComponentRef() {
    this.injector = Injector
        .resolveAndCreate([bind(ApplicationRef).toClass(SpyApplicationRef)]);
  }
}

void callNgProfilerTimeChangeDetection([config]) {
  context['ng']['profiler']
      .callMethod('timeChangeDetection', config != null ? [config] : []);
}
