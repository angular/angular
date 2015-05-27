import {describe, it, iit, ddescribe, expect, beforeEach, IS_DARTIUM} from 'angular2/test_lib';
import {Reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {ClassDecorator, ParamDecorator, classDecorator, paramDecorator} from './reflector_common';

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

class TestObjWith11Args {
  constructor(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {}
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

      it("should throw when more than 10 arguments", () => {
        expect(() => reflector.factory(TestObjWith11Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11))
            .toThrowError();
      });

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
