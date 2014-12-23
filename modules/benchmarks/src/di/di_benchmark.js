import {Injector, Key} from "di/di";
import {reflector} from 'reflection/reflection';
import {document, DOM} from 'facade/dom';

var count = 0;

function setupReflector() {
  reflector.registerType(A, {
    'factory': () => new A(),
    'parameters': [],
    'annotations' : []
  });
  reflector.registerType(B, {
    'factory': (a) => new B(a),
    'parameters': [[A]],
    'annotations' : []
  });
  reflector.registerType(C, {
    'factory': (b) => new C(b),
    'parameters': [[B]],
    'annotations' : []
  });
  reflector.registerType(D, {
    'factory': (c,b) => new D(c,b),
    'parameters': [[C],[B]],
    'annotations' : []
  });
  reflector.registerType(E, {
    'factory': (d,c) => new E(d,c),
    'parameters': [[D],[C]],
    'annotations' : []
  });
}

export function main() {
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

  function getByToken (_) {
    for (var i = 0; i < 20000; ++i) {
      injector.get(D);
      injector.get(E);
    }
  }
  function getByKey(_) {
    for (var i = 0; i < 20000; ++i) {
      injector.get(D_KEY);
      injector.get(E_KEY);
    }
  }

  function getChild (_) {
    for (var i = 0; i < 20000; ++i) {
      childInjector.get(D);
      childInjector.get(E);
    }
  }

  function instantiate (_) {
    for (var i = 0; i < 5000; ++i) {
      var child = injector.createChild([E]);
      child.get(E);
    }
  }

  DOM.on(DOM.querySelector(document, '#getByToken'), 'click', getByToken);
  DOM.on(DOM.querySelector(document, '#getByKey'), 'click', getByKey);
  DOM.on(DOM.querySelector(document, '#getChild'), 'click', getChild);
  DOM.on(DOM.querySelector(document, '#instantiate'), 'click', instantiate);
}




class A {
  constructor() {
    count++;
  }
}

class B {
  constructor(a:A) {
    count++;
  }
}

class C {
  constructor(b:B) {
    count++;
  }
}

class D {
  constructor(c:C, b:B) {
    count++;
  }
}

class E {
  constructor(d:D, c:C) {
    count++;
  }
}
