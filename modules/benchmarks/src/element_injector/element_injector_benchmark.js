import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {Injectable, Injector} from 'angular2/di';
import {ProtoElementInjector} from 'angular2/src/core/compiler/element_injector';
import {getIntParameter, bindAction, microBenchmark} from 'angular2/src/test_lib/benchmark_util';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

var count = 0;

export function main() {
  BrowserDomAdapter.makeCurrent();
  var iterations = getIntParameter('iterations');

  reflector.reflectionCapabilities = new ReflectionCapabilities();
  var appInjector = new Injector([]);

  var bindings = [A, B, C];
  var proto = new ProtoElementInjector(null, 0, bindings);
  var elementInjector = proto.instantiate(null);

  function instantiate () {
    for (var i = 0; i < iterations; ++i) {
      var ei = proto.instantiate(null);
      ei.instantiateDirectives(appInjector, null, null, null);
    }
  }

  function instantiateDirectives () {
    for (var i = 0; i < iterations; ++i) {
      elementInjector.clearDirectives();
      elementInjector.instantiateDirectives(appInjector, null, null, null);
    }
  }

  bindAction(
    '#instantiate',
    () => microBenchmark('instantiateAvg', iterations, instantiate)
  );
  bindAction(
    '#instantiateDirectives',
    () => microBenchmark('instantiateAvg', iterations, instantiateDirectives)
  );
}

@Injectable()
class A {
  constructor() {
    count++;
  }
}

@Injectable()
class B {
  constructor() {
    count++;
  }
}

@Injectable()
class C {
  constructor(a:A, b:B) {
    count++;
  }
}
