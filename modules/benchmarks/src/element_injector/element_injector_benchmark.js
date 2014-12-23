import {reflector} from 'reflection/reflection';
import {Injector} from 'di/di';
import {ProtoElementInjector} from 'core/compiler/element_injector';
import {document, DOM} from 'facade/dom';

var count = 0;
var ITERATIONS = 20000;

function setupReflector() {
  reflector.registerType(A, {
    'factory': () => new A(),
    'parameters': [],
    'annotations' : []
  });
  reflector.registerType(B, {
    'factory': () => new B(),
    'parameters': [],
    'annotations' : []
  });
  reflector.registerType(C, {
    'factory': (a,b) => new C(a,b),
    'parameters': [[A],[B]],
    'annotations' : []
  });
}

export function main() {
  setupReflector();
  var appInjector = new Injector([]);

  var bindings = [A, B, C];
  var proto = new ProtoElementInjector(null, 0, bindings);
  var elementInjector = proto.instantiate(null,null);

  function instantiate (_) {
    for (var i = 0; i < ITERATIONS; ++i) {
      var ei = proto.instantiate(null, null);
      ei.instantiateDirectives(appInjector, null, null);
    }
  }

  function instantiateDirectives (_) {
    for (var i = 0; i < ITERATIONS; ++i) {
      elementInjector.clearDirectives();
      elementInjector.instantiateDirectives(appInjector, null, null);
    }
  }

  DOM.on(DOM.querySelector(document, '#instantiate'), 'click', instantiate);
  DOM.on(DOM.querySelector(document, '#instantiateDirectives'), 'click', instantiateDirectives);
}

class A {
  constructor() {
    count++;
  }
}

class B {
  constructor() {
    count++;
  }
}

class C {
  constructor(a:A, b:B) {
    count++;
  }
}
