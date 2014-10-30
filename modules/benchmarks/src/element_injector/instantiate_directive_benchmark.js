import {Injector} from 'di/di';
import {ProtoElementInjector} from 'core/compiler/element_injector';

var ITERATIONS = 20000;
var count = 0;

export function run () {
  var appInjector = new Injector([]);

  var bindings = [A, B, C];
  var proto = new ProtoElementInjector(null, bindings);
  var ei = proto.instantiate({view:null});

  for (var i = 0; i < ITERATIONS; ++i) {
    ei.clearDirectives();
    ei.instantiateDirectives(appInjector);
  }
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
