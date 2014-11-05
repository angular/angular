import {Binding, Dependency, Key, Injector} from 'di/di';
import {ProtoElementInjector} from 'core/compiler/element_injector';

var ITERATIONS = 20000;
var count = 0;

export function run () {
  var appInjector = new Injector([]);
  
  var bindings = [
    new Binding(Key.get(A), () => new A(), [], false),
    new Binding(Key.get(B), () => new B(), [], false),
    new Binding(Key.get(C), (a,b) => new C(a,b), [
      new Dependency(Key.get(A), false, false, []),
      new Dependency(Key.get(B), false, false, [])
    ], false)];


  var proto = new ProtoElementInjector(null, 0, bindings);
  for (var i = 0; i < ITERATIONS; ++i) {
    var ei = proto.instantiate({view:null, parentElementInjector: null});
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
