import {Injector} from "di/di";

var count = 0;

export function run () {
  var bindings = [A, B, C, D, E];
  var injector = new Injector(bindings);

  for (var i = 0; i < 20000; ++i) {
    injector.get(D);
    injector.get(E);
  }
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
