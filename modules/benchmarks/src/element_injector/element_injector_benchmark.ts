import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {Injectable, Injector} from 'angular2/di';
import {ProtoElementInjector, DirectiveBinding} from 'angular2/src/core/compiler/element_injector';
import {getIntParameter, bindAction, microBenchmark} from 'angular2/src/test_lib/benchmark_util';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

var count = 0;

export function main() {
  BrowserDomAdapter.makeCurrent();
  var iterations = getIntParameter('iterations');

  reflector.reflectionCapabilities = new ReflectionCapabilities();
  var appInjector = Injector.resolveAndCreate([]);

  var bindings = [
    DirectiveBinding.createFromType(A, null),
    DirectiveBinding.createFromType(B, null),
    DirectiveBinding.createFromType(C, null)
  ];
  var proto = ProtoElementInjector.create(null, 0, bindings, false, 0);
  var elementInjector = proto.instantiate(null);

  function instantiate() {
    for (var i = 0; i < iterations; ++i) {
      var ei = proto.instantiate(null);
      ei.hydrate(appInjector, null, null);
    }
  }

  function hydrate() {
    for (var i = 0; i < iterations; ++i) {
      elementInjector.dehydrate();
      elementInjector.hydrate(appInjector, null, null);
    }
  }

  bindAction('#instantiate', () => microBenchmark('instantiateAvg', iterations, instantiate));
  bindAction('#hydrate', () => microBenchmark('instantiateAvg', iterations, hydrate));
}

@Injectable()
class A {
  constructor() { count++; }
}

@Injectable()
class B {
  constructor() { count++; }
}

@Injectable()
class C {
  constructor(a: A, b: B) { count++; }
}
