import {ddescribe, describe, it, iit, expect, beforeEach, IS_DARTIUM} from 'angular2/test_lib';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {isPresent, global, CONST} from 'angular2/src/facade/lang';

export function main() {
  var rc;
  beforeEach(() => {
    rc = new ReflectionCapabilities();
  });

  function mockReflect(mockData, cls) {
    // This only makes sense for JS, but Dart passes trivially too.
    if (!IS_DARTIUM) {
      global.Reflect = {
        'getMetadata': (key, targetCls) => {
          return (targetCls == cls) ? mockData[key] : null;
        }
      }
    }
  }

  function assertTestClassAnnotations(annotations) {
    expect(annotations[0]).toBeAnInstanceOf(ClassDec1);
    expect(annotations[1]).toBeAnInstanceOf(ClassDec2);
  }

  function assertTestClassParameters(parameters) {
    expect(parameters.length).toBe(4);

    expect(parameters[0].length).toBe(2);
    expect(parameters[0][0]).toEqual(P1);
    expect(parameters[0][1]).toBeAnInstanceOf(ParamDec);

    expect(parameters[1].length).toBe(1);
    expect(parameters[1][0]).toEqual(P2);


    expect(parameters[2].length).toBe(1);
    expect(parameters[2][0]).toBeAnInstanceOf(ParamDec);

    expect(parameters[3].length).toBe(0);
  }

  describe('reflection capabilities', () => {
    it('can read out class annotations through annotations key', () => {
      assertTestClassAnnotations(rc.annotations(TestClass));
    });

    it('can read out parameter annotations through parameters key', () => {
      assertTestClassParameters(rc.parameters(TestClass));
    });

    it('can read out parameter annotations through parameters key for types only class', () => {
      expect(rc.parameters(TestClassTypesOnly)).toEqual([[P1], [P2]]);
    });


    if (!IS_DARTIUM) {
      // Mocking in the tests below is needed because the test runs through Traceur.
      // After the switch to TS the setup will have to change, where the direct key
      // access will be mocked, and the tests below will be direct.
      it('can read out class annotations though Reflect APIs', () => {
        mockReflect(mockDataForTestClassDec, TestClassDec);
        assertTestClassAnnotations(rc.annotations(TestClassDec));
      });

      it('can read out parameter annotations though Reflect APIs', () => {
        mockReflect(mockDataForTestClassDec, TestClassDec);
        assertTestClassParameters(rc.parameters(TestClassDec));
      });

      it('can read out parameter annotations though Reflect APIs for types only class', () => {
        mockReflect(mockDataForTestClassTypesOnly, TestClassTypesOnlyDec);
        expect(rc.parameters(TestClassTypesOnlyDec)).toEqual([[P1], [P2]]);
      });
    }
  });
}

class ClassDec1 {
  @CONST()
  constructor() {}
}

class ClassDec2 {
  @CONST()
  constructor() {}
}


class ParamDec {
  @CONST()
  constructor() {}
}

class P1 {}
class P2 {}

@ClassDec1()
@ClassDec2()
class TestClass {
  constructor(@ParamDec() a: P1, b: P2, @ParamDec() c, d) {}
}

// Mocking the data stored in global.Reflect as if TS was compiling TestClass above.
var mockDataForTestClassDec = {
  'annotations': [new ClassDec1(), new ClassDec2()],
  'parameters': [new ParamDec(), null, new ParamDec()],
  'design:paramtypes': [P1, P2, Object, Object]
};
class TestClassDec {}


class TestClassTypesOnly {
  constructor(a: P1, b: P2) {}
}

// Mocking the data stored in global.Reflect as if TS was compiling TestClass above.
var mockDataForTestClassTypesOnly = {
  'annotations': null,
  'parameters': null,
  'design:paramtypes': [P1, P2]
};
class TestClassTypesOnlyDec {}
