/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reflector} from '@angular/core/src/reflection/reflection';
import {DELEGATE_CTOR, ReflectionCapabilities} from '@angular/core/src/reflection/reflection_capabilities';
import {global} from '@angular/core/src/util';
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
    let reflector: Reflector;

    beforeEach(() => { reflector = new Reflector(new ReflectionCapabilities()); });

    describe('factory', () => {
      it('should create a factory for the given type', () => {
        const obj = reflector.factory(TestObj)(1, 2);
        expect(obj.a).toEqual(1);
        expect(obj.b).toEqual(2);
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

      // See https://github.com/angular/tsickle/issues/261
      it('should read forwardRef down-leveled type', () => {
        class Dep {}
        class ForwardLegacy {
          constructor(d: Dep) {}
          // Older tsickle had a bug: wrote a forward reference
          static ctorParameters = [{type: Dep}];
        }
        expect(reflector.parameters(ForwardLegacy)).toEqual([[Dep]]);
        class Forward {
          constructor(d: Dep) {}
          // Newer tsickle generates a functionClosure
          static ctorParameters = () => [{type: ForwardDep}];
        }
        class ForwardDep {}
        expect(reflector.parameters(Forward)).toEqual([[ForwardDep]]);
      });
    });

    describe('propMetadata', () => {
      it('should return a string map of prop metadata for the given class', () => {
        const p = reflector.propMetadata(ClassWithDecorators);
        expect(p['a']).toEqual([new PropDecorator('p1'), new PropDecorator('p2')]);
        expect(p['c']).toEqual([new PropDecorator('p3')]);
        expect(p['someMethod']).toEqual([new PropDecorator('p4')]);
      });

      it('should also return metadata if the class has no decorator', () => {
        class Test {
          @PropDecorator('test')
          prop: any;
        }

        expect(reflector.propMetadata(Test)).toEqual({'prop': [new PropDecorator('test')]});
      });
    });

    describe('annotations', () => {
      it('should return an array of annotations for a type', () => {
        const p = reflector.annotations(ClassWithDecorators);
        expect(p).toEqual([new ClassDecorator({value: 'class'})]);
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
    });

    describe('setter', () => {
      it('returns a function setting a property', () => {
        const setA = reflector.setter('a');
        const obj = new TestObj(1, 2);
        setA(obj, 100);
        expect(obj.a).toEqual(100);
      });
    });

    describe('method', () => {
      it('returns a function invoking a method', () => {
        const func = reflector.method('identity');
        const obj = new TestObj(1, 2);
        expect(func(obj, ['value'])).toEqual('value');
      });
    });

    describe('ctor inheritance detection', () => {
      it('should use the right regex', () => {
        class Parent {}

        class ChildNoCtor extends Parent {}
        class ChildWithCtor extends Parent {
          constructor() { super(); }
        }
        class ChildNoCtorPrivateProps extends Parent {
          private x = 10;
        }

        expect(DELEGATE_CTOR.exec(ChildNoCtor.toString())).toBeTruthy();
        expect(DELEGATE_CTOR.exec(ChildNoCtorPrivateProps.toString())).toBeTruthy();
        expect(DELEGATE_CTOR.exec(ChildWithCtor.toString())).toBeFalsy();
      });
    });

    describe('inheritance with decorators', () => {
      it('should inherit annotations', () => {

        @ClassDecorator({value: 'parent'})
        class Parent {
        }

        @ClassDecorator({value: 'child'})
        class Child extends Parent {
        }

        class ChildNoDecorators extends Parent {}

        class NoDecorators {}

        // Check that metadata for Parent was not changed!
        expect(reflector.annotations(Parent)).toEqual([new ClassDecorator({value: 'parent'})]);

        expect(reflector.annotations(Child)).toEqual([
          new ClassDecorator({value: 'parent'}), new ClassDecorator({value: 'child'})
        ]);

        expect(reflector.annotations(ChildNoDecorators)).toEqual([new ClassDecorator(
            {value: 'parent'})]);

        expect(reflector.annotations(NoDecorators)).toEqual([]);
        expect(reflector.annotations(<any>{})).toEqual([]);
        expect(reflector.annotations(<any>1)).toEqual([]);
        expect(reflector.annotations(null !)).toEqual([]);
      });

      it('should inherit parameters', () => {
        class A {}
        class B {}
        class C {}

        // Note: We need the class decorator as well,
        // as otherwise TS won't capture the ctor arguments!
        @ClassDecorator({value: 'parent'})
        class Parent {
          constructor(@ParamDecorator('a') a: A, @ParamDecorator('b') b: B) {}
        }

        class Child extends Parent {}

        @ClassDecorator({value: 'child'})
        class ChildWithDecorator extends Parent {
        }

        @ClassDecorator({value: 'child'})
        class ChildWithDecoratorAndProps extends Parent {
          private x = 10;
        }

        // Note: We need the class decorator as well,
        // as otherwise TS won't capture the ctor arguments!
        @ClassDecorator({value: 'child'})
        class ChildWithCtor extends Parent {
          constructor(@ParamDecorator('c') c: C) { super(null !, null !); }
        }

        class ChildWithCtorNoDecorator extends Parent {
          constructor(a: any, b: any, c: any) { super(null !, null !); }
        }

        class NoDecorators {}

        // Check that metadata for Parent was not changed!
        expect(reflector.parameters(Parent)).toEqual([
          [A, new ParamDecorator('a')], [B, new ParamDecorator('b')]
        ]);

        expect(reflector.parameters(Child)).toEqual([
          [A, new ParamDecorator('a')], [B, new ParamDecorator('b')]
        ]);

        expect(reflector.parameters(ChildWithDecorator)).toEqual([
          [A, new ParamDecorator('a')], [B, new ParamDecorator('b')]
        ]);

        expect(reflector.parameters(ChildWithDecoratorAndProps)).toEqual([
          [A, new ParamDecorator('a')], [B, new ParamDecorator('b')]
        ]);

        expect(reflector.parameters(ChildWithCtor)).toEqual([[C, new ParamDecorator('c')]]);

        // If we have no decorator, we don't get metadata about the ctor params.
        // But we should still get an array of the right length based on function.length.
        expect(reflector.parameters(ChildWithCtorNoDecorator)).toEqual([
          undefined, undefined, undefined
        ]);

        expect(reflector.parameters(NoDecorators)).toEqual([]);
        expect(reflector.parameters(<any>{})).toEqual([]);
        expect(reflector.parameters(<any>1)).toEqual([]);
        expect(reflector.parameters(null !)).toEqual([]);
      });

      it('should inherit property metadata', () => {
        class A {}
        class B {}
        class C {}

        class Parent {
          @PropDecorator('a')
          a: A;
          @PropDecorator('b1')
          b: B;
        }

        class Child extends Parent {
          @PropDecorator('b2')
          b: B;
          @PropDecorator('c')
          c: C;
        }

        class NoDecorators {}

        // Check that metadata for Parent was not changed!
        expect(reflector.propMetadata(Parent)).toEqual({
          'a': [new PropDecorator('a')],
          'b': [new PropDecorator('b1')],
        });

        expect(reflector.propMetadata(Child)).toEqual({
          'a': [new PropDecorator('a')],
          'b': [new PropDecorator('b1'), new PropDecorator('b2')],
          'c': [new PropDecorator('c')]
        });

        expect(reflector.propMetadata(NoDecorators)).toEqual({});
        expect(reflector.propMetadata(<any>{})).toEqual({});
        expect(reflector.propMetadata(<any>1)).toEqual({});
        expect(reflector.propMetadata(null !)).toEqual({});
      });

      it('should inherit lifecycle hooks', () => {
        class Parent {
          hook1() {}
          hook2() {}
        }

        class Child extends Parent {
          hook2() {}
          hook3() {}
        }

        function hooks(symbol: any, names: string[]): boolean[] {
          return names.map(name => reflector.hasLifecycleHook(symbol, name));
        }

        // Check that metadata for Parent was not changed!
        expect(hooks(Parent, ['hook1', 'hook2', 'hook3'])).toEqual([true, true, false]);

        expect(hooks(Child, ['hook1', 'hook2', 'hook3'])).toEqual([true, true, true]);
      });

    });

    describe('inheritance with tsickle', () => {
      it('should inherit annotations', () => {

        class Parent {
          static decorators = [{type: ClassDecorator, args: [{value: 'parent'}]}];
        }

        class Child extends Parent {
          static decorators = [{type: ClassDecorator, args: [{value: 'child'}]}];
        }

        class ChildNoDecorators extends Parent {}

        // Check that metadata for Parent was not changed!
        expect(reflector.annotations(Parent)).toEqual([new ClassDecorator({value: 'parent'})]);

        expect(reflector.annotations(Child)).toEqual([
          new ClassDecorator({value: 'parent'}), new ClassDecorator({value: 'child'})
        ]);

        expect(reflector.annotations(ChildNoDecorators)).toEqual([new ClassDecorator(
            {value: 'parent'})]);
      });

      it('should inherit parameters', () => {
        class A {}
        class B {}
        class C {}

        class Parent {
          static ctorParameters = () =>
              [{type: A, decorators: [{type: ParamDecorator, args: ['a']}]},
               {type: B, decorators: [{type: ParamDecorator, args: ['b']}]},
          ]
        }

        class Child extends Parent {}

        class ChildWithCtor extends Parent {
          static ctorParameters =
              () => [{type: C, decorators: [{type: ParamDecorator, args: ['c']}]}, ];
          constructor() { super(); }
        }

        // Check that metadata for Parent was not changed!
        expect(reflector.parameters(Parent)).toEqual([
          [A, new ParamDecorator('a')], [B, new ParamDecorator('b')]
        ]);

        expect(reflector.parameters(Child)).toEqual([
          [A, new ParamDecorator('a')], [B, new ParamDecorator('b')]
        ]);

        expect(reflector.parameters(ChildWithCtor)).toEqual([[C, new ParamDecorator('c')]]);
      });

      it('should inherit property metadata', () => {
        class A {}
        class B {}
        class C {}

        class Parent {
          static propDecorators: any = {
            'a': [{type: PropDecorator, args: ['a']}],
            'b': [{type: PropDecorator, args: ['b1']}],
          };
        }

        class Child extends Parent {
          static propDecorators: any = {
            'b': [{type: PropDecorator, args: ['b2']}],
            'c': [{type: PropDecorator, args: ['c']}],
          };
        }

        // Check that metadata for Parent was not changed!
        expect(reflector.propMetadata(Parent)).toEqual({
          'a': [new PropDecorator('a')],
          'b': [new PropDecorator('b1')],
        });

        expect(reflector.propMetadata(Child)).toEqual({
          'a': [new PropDecorator('a')],
          'b': [new PropDecorator('b1'), new PropDecorator('b2')],
          'c': [new PropDecorator('c')]
        });
      });

    });

    describe('inheritance with es5 API', () => {
      it('should inherit annotations', () => {

        class Parent {
          static annotations = [new ClassDecorator({value: 'parent'})];
        }

        class Child extends Parent {
          static annotations = [new ClassDecorator({value: 'child'})];
        }

        class ChildNoDecorators extends Parent {}

        // Check that metadata for Parent was not changed!
        expect(reflector.annotations(Parent)).toEqual([new ClassDecorator({value: 'parent'})]);

        expect(reflector.annotations(Child)).toEqual([
          new ClassDecorator({value: 'parent'}), new ClassDecorator({value: 'child'})
        ]);

        expect(reflector.annotations(ChildNoDecorators)).toEqual([new ClassDecorator(
            {value: 'parent'})]);
      });

      it('should inherit parameters', () => {
        class A {}
        class B {}
        class C {}

        class Parent {
          static parameters = [
            [A, new ParamDecorator('a')],
            [B, new ParamDecorator('b')],
          ];
        }

        class Child extends Parent {}

        class ChildWithCtor extends Parent {
          static parameters = [
            [C, new ParamDecorator('c')],
          ];
          constructor() { super(); }
        }

        // Check that metadata for Parent was not changed!
        expect(reflector.parameters(Parent)).toEqual([
          [A, new ParamDecorator('a')], [B, new ParamDecorator('b')]
        ]);

        expect(reflector.parameters(Child)).toEqual([
          [A, new ParamDecorator('a')], [B, new ParamDecorator('b')]
        ]);

        expect(reflector.parameters(ChildWithCtor)).toEqual([[C, new ParamDecorator('c')]]);
      });

      it('should inherit property metadata', () => {
        class A {}
        class B {}
        class C {}

        class Parent {
          static propMetadata: any = {
            'a': [new PropDecorator('a')],
            'b': [new PropDecorator('b1')],
          };
        }

        class Child extends Parent {
          static propMetadata: any = {
            'b': [new PropDecorator('b2')],
            'c': [new PropDecorator('c')],
          };
        }

        // Check that metadata for Parent was not changed!
        expect(reflector.propMetadata(Parent)).toEqual({
          'a': [new PropDecorator('a')],
          'b': [new PropDecorator('b1')],
        });

        expect(reflector.propMetadata(Child)).toEqual({
          'a': [new PropDecorator('a')],
          'b': [new PropDecorator('b1'), new PropDecorator('b2')],
          'c': [new PropDecorator('c')]
        });
      });
    });
  });
}
