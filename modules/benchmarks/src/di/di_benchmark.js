import {Injectable, Injector, Key} from "angular2/di";
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {getIntParameter, bindAction, microBenchmark} from 'angular2/src/test_lib/benchmark_util';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

var count = 0;

function setupReflector() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
}

export function main() {
  BrowserDomAdapter.makeCurrent();
  var iterations = getIntParameter('iterations');

  setupReflector();
  var bindings = [A, B, C, D, E];
  var injector = new Injector(bindings);

  var D_KEY = Key.get(D);
  var E_KEY = Key.get(E);
  var childInjector = injector.
    createChild([]).
    createChild([]).
    createChild([]).
    createChild([]).
    createChild([]);

  function getByToken () {
    for (var i = 0; i < iterations; ++i) {
      injector.get(D);
      injector.get(E);
    }
  }
  function getByKey() {
    for (var i = 0; i < iterations; ++i) {
      injector.get(D_KEY);
      injector.get(E_KEY);
    }
  }

  function getChild () {
    for (var i = 0; i < iterations; ++i) {
      childInjector.get(D);
      childInjector.get(E);
    }
  }

  function instantiate () {
    for (var i = 0; i < iterations; ++i) {
      var child = injector.createChild([E]);
      child.get(E);
    }
  }

  bindAction(
    '#getByToken',
    () => microBenchmark('injectAvg', iterations, getByToken)
  );
  bindAction(
    '#getByKey',
    () => microBenchmark('injectAvg', iterations, getByKey)
  );
  bindAction(
    '#getChild',
    () => microBenchmark('injectAvg', iterations, getChild)
  );
  bindAction(
    '#instantiate',
    () => microBenchmark('injectAvg', iterations, instantiate)
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
  constructor(a:A) {
    count++;
  }
}

@Injectable()
class C {
  constructor(b:B) {
    count++;
  }
}

@Injectable()
class D {
  constructor(c:C, b:B) {
    count++;
  }
}

@Injectable()
class E {
  constructor(d:D, c:C) {
    count++;
  }
}
