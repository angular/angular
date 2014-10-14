import {Injector} from 'di/di';
import {ProtoElementInjector} from 'core/compiler/element_injector';

var count = 0;

export function run () {
  var appInjector = new Injector([]);

  var bindings = [A, B, C];
  var proto = new ProtoElementInjector(null, bindings, []);
  for (var i = 0; i < 20000; ++i) {
    var ei = proto.instantiate();
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