import {describe, it, iit, ddescribe, expect, beforeEach, IS_DARTIUM} from 'angular2/test_lib';
import {Reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {ClassDecorator, ParamDecorator, classDecorator, paramDecorator} from './reflector_common';
import {List} from 'angular2/src/facade/collection';

class AType {
  value;

  constructor(value) { this.value = value; }
}

@ClassDecorator('class')
class ClassWithDecorators {
  a;
  b;

  constructor(@ParamDecorator("a") a: AType, @ParamDecorator("b") b: AType) {
    this.a = a;
    this.b = b;
  }
}

class ClassWithoutDecorators {
  constructor(a, b) {}
}

class TestObj {
  a;
  b;

  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  identity(arg) { return arg; }
}

class Interface {}

class ClassImplementingInterface implements Interface {}

export function main() {
  describe('Reflector', () => {
    var reflector;

    beforeEach(() => { reflector = new Reflector(new ReflectionCapabilities()); });

    describe("factory", () => {
      it("should create a factory for the given type", () => {
        var obj = reflector.factory(TestObj)(1, 2);

        expect(obj.a).toEqual(1);
        expect(obj.b).toEqual(2);
      });

      it("should check args from no to max", () => {
        var f = t => reflector.factory(t);
        var checkArgs = (obj, args) => expect(obj.args).toEqual(args);

        // clang-format off
        checkArgs(f(TestObjWith00Args)(), []);
        checkArgs(f(TestObjWith01Args)(1), [1]);
        checkArgs(f(TestObjWith02Args)(1, 2), [1, 2]);
        checkArgs(f(TestObjWith03Args)(1, 2, 3), [1, 2, 3]);
        checkArgs(f(TestObjWith04Args)(1, 2, 3, 4), [1, 2, 3, 4]);
        checkArgs(f(TestObjWith05Args)(1, 2, 3, 4, 5), [1, 2, 3, 4, 5]);
        checkArgs(f(TestObjWith06Args)(1, 2, 3, 4, 5, 6), [1, 2, 3, 4, 5, 6]);
        checkArgs(f(TestObjWith07Args)(1, 2, 3, 4, 5, 6, 7), [1, 2, 3, 4, 5, 6, 7]);
        checkArgs(f(TestObjWith08Args)(1, 2, 3, 4, 5, 6, 7, 8), [1, 2, 3, 4, 5, 6, 7, 8]);
        checkArgs(f(TestObjWith09Args)(1, 2, 3, 4, 5, 6, 7, 8, 9), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        checkArgs(f(TestObjWith10Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        checkArgs(f(TestObjWith11Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
        checkArgs(f(TestObjWith12Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        checkArgs(f(TestObjWith13Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
        checkArgs(f(TestObjWith14Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
        checkArgs(f(TestObjWith15Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
        checkArgs(f(TestObjWith16Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        checkArgs(f(TestObjWith17Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
        checkArgs(f(TestObjWith18Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
        checkArgs(f(TestObjWith19Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
        checkArgs(f(TestObjWith20Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        // clang-format on
      });

      it("should throw when more than 20 arguments",
         () => { expect(() => reflector.factory(TestObjWith21Args)).toThrowError(); });

      it("should return a registered factory if available", () => {
        reflector.registerType(TestObj, {"factory": () => "fake"});
        expect(reflector.factory(TestObj)()).toEqual("fake");
      });
    });

    describe("parameters", () => {
      it("should return an array of parameters for a type", () => {
        var p = reflector.parameters(ClassWithDecorators);
        expect(p).toEqual([[AType, paramDecorator('a')], [AType, paramDecorator('b')]]);
      });

      it("should work for a class without annotations", () => {
        var p = reflector.parameters(ClassWithoutDecorators);
        expect(p.length).toEqual(2);
      });

      it("should return registered parameters if available", () => {
        reflector.registerType(TestObj, {"parameters": [1, 2]});
        expect(reflector.parameters(TestObj)).toEqual([1, 2]);
      });

      it("should return an empty list when no paramters field in the stored type info", () => {
        reflector.registerType(TestObj, {});
        expect(reflector.parameters(TestObj)).toEqual([]);
      });
    });

    describe("annotations", () => {
      it("should return an array of annotations for a type", () => {
        var p = reflector.annotations(ClassWithDecorators);
        expect(p).toEqual([classDecorator('class')]);
      });

      it("should return registered annotations if available", () => {
        reflector.registerType(TestObj, {"annotations": [1, 2]});
        expect(reflector.annotations(TestObj)).toEqual([1, 2]);
      });

      it("should work for a class without annotations", () => {
        var p = reflector.annotations(ClassWithoutDecorators);
        expect(p).toEqual([]);
      });
    });

    if (IS_DARTIUM) {
      describe("interfaces", () => {
        it("should return an array of interfaces for a type", () => {
          var p = reflector.interfaces(ClassImplementingInterface);
          expect(p).toEqual([Interface]);
        });

        it("should return an empty array otherwise", () => {
          var p = reflector.interfaces(ClassWithDecorators);
          expect(p).toEqual([]);
        });
      });
    }

    describe("getter", () => {
      it("returns a function reading a property", () => {
        var getA = reflector.getter('a');
        expect(getA(new TestObj(1, 2))).toEqual(1);
      });

      it("should return a registered getter if available", () => {
        reflector.registerGetters({"abc": (obj) => "fake"});
        expect(reflector.getter("abc")("anything")).toEqual("fake");
      });
    });

    describe("setter", () => {
      it("returns a function setting a property", () => {
        var setA = reflector.setter('a');
        var obj = new TestObj(1, 2);
        setA(obj, 100);
        expect(obj.a).toEqual(100);
      });

      it("should return a registered setter if available", () => {
        var updateMe;
        reflector.registerSetters({"abc": (obj, value) => { updateMe = value; }});
        reflector.setter("abc")("anything", "fake");

        expect(updateMe).toEqual("fake");
      });
    });

    describe("method", () => {
      it("returns a function invoking a method", () => {
        var func = reflector.method('identity');
        var obj = new TestObj(1, 2);
        expect(func(obj, ['value'])).toEqual('value');
      });

      it("should return a registered method if available", () => {
        reflector.registerMethods({"abc": (obj, args) => args});
        expect(reflector.method("abc")("anything", ["fake"])).toEqual(['fake']);
      });
    });
  });
}


class TestObjWith00Args {
  args: List<any>;
  constructor() { this.args = []; }
}

class TestObjWith01Args {
  args: List<any>;
  constructor(a1) { this.args = [a1]; }
}

class TestObjWith02Args {
  args: List<any>;
  constructor(a1, a2) { this.args = [a1, a2]; }
}

class TestObjWith03Args {
  args: List<any>;
  constructor(a1, a2, a3) { this.args = [a1, a2, a3]; }
}

class TestObjWith04Args {
  args: List<any>;
  constructor(a1, a2, a3, a4) { this.args = [a1, a2, a3, a4]; }
}

class TestObjWith05Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5) { this.args = [a1, a2, a3, a4, a5]; }
}

class TestObjWith06Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6) { this.args = [a1, a2, a3, a4, a5, a6]; }
}

class TestObjWith07Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7) { this.args = [a1, a2, a3, a4, a5, a6, a7]; }
}

class TestObjWith08Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8) { this.args = [a1, a2, a3, a4, a5, a6, a7, a8]; }
}

class TestObjWith09Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9];
  }
}

class TestObjWith10Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10];
  }
}

class TestObjWith11Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
    this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11];
  }
}

class TestObjWith12Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
    this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12];
  }
}

class TestObjWith13Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
    this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13];
  }
}

class TestObjWith14Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
    this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14];
  }
}

class TestObjWith15Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
    this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15];
  }
}

class TestObjWith16Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
    this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16];
  }
}

class TestObjWith17Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
    this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17];
  }
}

class TestObjWith18Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) {
    this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18];
  }
}

class TestObjWith19Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18,
              a19) {
    this.args =
        [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19];
  }
}

class TestObjWith20Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19,
              a20) {
    this.args =
        [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20];
  }
}

class TestObjWith21Args {
  args: List<any>;
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19,
              a20, a21) {
    this.args = [
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
      a12,
      a13,
      a14,
      a15,
      a16,
      a17,
      a18,
      a19,
      a20,
      a21
    ];
  }
}
