/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReflectionInfo, Reflector} from '@angular/core/src/reflection/reflection';
import {ReflectionCapabilities} from '@angular/core/src/reflection/reflection_capabilities';
import {makeDecorator, makeParamDecorator, makePropDecorator} from '@angular/core/src/util/decorators';

interface ClassDecoratorFactory {
  (data: ClassDecorator): any;
  new (data: ClassDecorator): ClassDecorator;
}

interface ClassDecorator {
  value: any;
}

interface ParamDecorator {
  value: any;
}

interface PropDecorator {
  value: any;
}

/** @Annotation */ const ClassDecorator =
    <ClassDecoratorFactory>makeDecorator('ClassDecorator', {value: undefined});
/** @Annotation */ const ParamDecorator =
    makeParamDecorator('ParamDecorator', [['value', undefined]]);
/** @Annotation */ const PropDecorator = makePropDecorator('PropDecorator', [['value', undefined]]);

class AType {
  constructor(public value: any) {}
}

@ClassDecorator({value: 'class'})
class ClassWithDecorators {
  @PropDecorator('p1') @PropDecorator('p2') a: AType;

  b: AType;

  @PropDecorator('p3')
  set c(value: any) {}

  @PropDecorator('p4')
  someMethod() {}

  constructor(@ParamDecorator('a') a: AType, @ParamDecorator('b') b: AType) {
    this.a = a;
    this.b = b;
  }
}

class ClassWithoutDecorators {
  constructor(a: any, b: any) {}
}

class TestObj {
  constructor(public a: any, public b: any) {}

  identity(arg: any) { return arg; }
}

export function main() {
  describe('Reflector', () => {
    var reflector: Reflector;

    beforeEach(() => { reflector = new Reflector(new ReflectionCapabilities()); });

    describe('usage tracking', () => {
      beforeEach(() => { reflector = new Reflector(null); });

      it('should be disabled by default', () => {
        expect(() => reflector.listUnusedKeys()).toThrowError('Usage tracking is disabled');
      });

      it('should report unused keys', () => {
        reflector.trackUsage();
        expect(reflector.listUnusedKeys()).toEqual([]);

        reflector.registerType(AType, new ReflectionInfo(null, null, () => 'AType'));
        reflector.registerType(TestObj, new ReflectionInfo(null, null, () => 'TestObj'));
        expect(reflector.listUnusedKeys()).toEqual([AType, TestObj]);

        reflector.factory(AType);
        expect(reflector.listUnusedKeys()).toEqual([TestObj]);

        reflector.factory(TestObj);
        expect(reflector.listUnusedKeys()).toEqual([]);
      });
    });

    describe('factory', () => {
      it('should create a factory for the given type', () => {
        const obj = reflector.factory(TestObj)(1, 2);
        expect(obj.a).toEqual(1);
        expect(obj.b).toEqual(2);
      });

      it('should return a registered factory if available', () => {
        reflector.registerType(TestObj, new ReflectionInfo(null, null, () => 'fake'));
        expect(reflector.factory(TestObj)()).toEqual('fake');
      });
    });

    describe('parameters', () => {
      it('should return an array of parameters for a type', () => {
        const p = reflector.parameters(ClassWithDecorators);
        expect(p).toEqual([[AType, new ParamDecorator('a')], [AType, new ParamDecorator('b')]]);
      });

      it('should work for a class without annotations', () => {
        const p = reflector.parameters(ClassWithoutDecorators);
        expect(p.length).toEqual(2);
      });

      it('should return registered parameters if available', () => {
        reflector.registerType(TestObj, new ReflectionInfo(null, [[1], [2]]));
        expect(reflector.parameters(TestObj)).toEqual([[1], [2]]);
      });

      it('should return an empty list when no parameters field in the stored type info', () => {
        reflector.registerType(TestObj, new ReflectionInfo());
        expect(reflector.parameters(TestObj)).toEqual([]);
      });
    });

    describe('propMetadata', () => {
      it('should return a string map of prop metadata for the given class', () => {
        const p = reflector.propMetadata(ClassWithDecorators);
        expect(p['a']).toEqual([new PropDecorator('p1'), new PropDecorator('p2')]);
        expect(p['c']).toEqual([new PropDecorator('p3')]);
        expect(p['someMethod']).toEqual([new PropDecorator('p4')]);
      });

      it('should return registered meta if available', () => {
        reflector.registerType(TestObj, new ReflectionInfo(null, null, null, null, {'a': [1, 2]}));
        expect(reflector.propMetadata(TestObj)).toEqual({'a': [1, 2]});
      });
    });

    describe('annotations', () => {
      it('should return an array of annotations for a type', () => {
        const p = reflector.annotations(ClassWithDecorators);
        expect(p).toEqual([new ClassDecorator({value: 'class'})]);
      });

      it('should return registered annotations if available', () => {
        reflector.registerType(TestObj, new ReflectionInfo([1, 2]));
        expect(reflector.annotations(TestObj)).toEqual([1, 2]);
      });

      it('should work for a class without annotations', () => {
        const p = reflector.annotations(ClassWithoutDecorators);
        expect(p).toEqual([]);
      });
    });

    describe('getter', () => {
      it('returns a function reading a property', () => {
        const getA = reflector.getter('a');
        expect(getA(new TestObj(1, 2))).toEqual(1);
      });

      it('should return a registered getter if available', () => {
        reflector.registerGetters({'abc': (obj: any) => 'fake'});
        expect(reflector.getter('abc')('anything')).toEqual('fake');
      });
    });

    describe('setter', () => {
      it('returns a function setting a property', () => {
        const setA = reflector.setter('a');
        const obj = new TestObj(1, 2);
        setA(obj, 100);
        expect(obj.a).toEqual(100);
      });

      it('should return a registered setter if available', () => {
        let updateMe: any;

        reflector.registerSetters({'abc': (obj: any, value: any) => { updateMe = value; }});
        reflector.setter('abc')('anything', 'fake');

        expect(updateMe).toEqual('fake');
      });
    });

    describe('method', () => {
      it('returns a function invoking a method', () => {
        const func = reflector.method('identity');
        const obj = new TestObj(1, 2);
        expect(func(obj, ['value'])).toEqual('value');
      });

      it('should return a registered method if available', () => {
        reflector.registerMethods({'abc': (obj: any, args: any) => args});
        expect(reflector.method('abc')('anything', ['fake'])).toEqual(['fake']);
      });
    });
  });
}
