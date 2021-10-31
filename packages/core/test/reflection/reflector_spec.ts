/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reflector} from '@angular/core/src/reflection/reflection';
import {isDelegateCtor, ReflectionCapabilities} from '@angular/core/src/reflection/reflection_capabilities';
import {makeDecorator, makeParamDecorator, makePropDecorator} from '@angular/core/src/util/decorators';
import {global} from '@angular/core/src/util/global';

interface ClassDecoratorFactory {
  (data: ClassDecorator): any;
  new(data: ClassDecorator): ClassDecorator;
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
    <ClassDecoratorFactory>makeDecorator('ClassDecorator', (data: any) => data);
/** @Annotation */ const ParamDecorator =
    makeParamDecorator('ParamDecorator', (value: any) => ({value}));
/** @Annotation */ const PropDecorator =
    makePropDecorator('PropDecorator', (value: any) => ({value}));

class AType {
  constructor(public value: any) {}
}

@ClassDecorator({value: 'class'})
class ClassWithDecorators {
  @PropDecorator('p1') @PropDecorator('p2') a: AType;

  b: AType;

  @PropDecorator('p3')
  set c(value: any) {
  }

  @PropDecorator('p4')
  someMethod() {
  }

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

  identity(arg: any) {
    return arg;
  }
}

{
  describe('Reflector', () => {
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector(new ReflectionCapabilities());
    });

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

      it('should not return undefined types for downleveled types', () => {
        class Dep {}

        class TestService {
          constructor() {}
          static ctorParameters = () => [{type: undefined, decorators: []}, {type: Dep}];
        }
        expect(reflector.parameters(TestService)).toEqual([[], [Dep]]);
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
          @PropDecorator('test') prop: any;
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

    describe('isDelegateCtor', () => {
      it('should support ES5 compiled classes', () => {
        // These classes will be compiled to ES5 code so their stringified form
        // below will contain ES5 constructor functions rather than native classes.
        class Parent {}

        class ChildNoCtor extends Parent {}
        class ChildWithCtor extends Parent {
          constructor() {
            super();
          }
        }
        class ChildNoCtorPrivateProps extends Parent {
          private x = 10;
        }

        expect(isDelegateCtor(ChildNoCtor.toString())).toBe(true);
        expect(isDelegateCtor(ChildNoCtorPrivateProps.toString())).toBe(true);
        expect(isDelegateCtor(ChildWithCtor.toString())).toBe(false);
      });

      // See: https://github.com/angular/angular/issues/38453
      it('should support ES2015 downleveled classes (workspace TypeScript version) (downlevelIteration=true)',
         () => {
           const {ChildNoCtor, ChildNoCtorPrivateProps, ChildWithCtor} =
               require('./es5_downleveled_inheritance_fixture');

           expect(isDelegateCtor(ChildNoCtor.toString())).toBe(true);
           expect(isDelegateCtor(ChildNoCtorPrivateProps.toString())).toBe(true);
           expect(isDelegateCtor(ChildWithCtor.toString())).toBe(false);
         });

      it('should support ES2015 downleveled classes (<TS4.2) (downlevelIteration=true)', () => {
        const ChildNoCtor = `function ChildNoCtor() {
          return _super !== null && _super.apply(this, arguments) || this;
        }`;
        const ChildNoCtorPrivateProps = `function ChildNoCtorPrivateProps() {
          var _this = _super.apply(this, __spread(arguments)) || this;
          _this.x = 10;
          return _this;
        }`;
        const ChildWithCtor = `function ChildWithCtor() {
          return _super.call(this) || this;
        }`;
        expect(isDelegateCtor(ChildNoCtor)).toBe(true);
        expect(isDelegateCtor(ChildNoCtorPrivateProps)).toBe(true);
        expect(isDelegateCtor(ChildWithCtor)).toBe(false);
      });

      it('should support ES2015 downleveled classes (>=TS4.2) (downlevelIteration=true)', () => {
        const ChildNoCtor = `function ChildNoCtor() {
          return _super !== null && _super.apply(this, arguments) || this;
        }`;
        const ChildNoCtorPrivateProps = `function ChildNoCtorPrivateProps() {
          var _this = _super.apply(this, __spreadArray([], __read(arguments))) || this;
          _this.x = 10;
          return _this;
        }`;
        const ChildWithCtor = `function ChildWithCtor() {
          return _super.call(this) || this;
        }`;
        expect(isDelegateCtor(ChildNoCtor)).toBe(true);
        expect(isDelegateCtor(ChildNoCtorPrivateProps)).toBe(true);
        expect(isDelegateCtor(ChildWithCtor)).toBe(false);
      });

      it('should support ES2015 classes when minified', () => {
        // These classes are ES2015 in minified form
        const ChildNoCtorMinified = 'class ChildNoCtor extends Parent{}';
        const ChildWithCtorMinified = 'class ChildWithCtor extends Parent{constructor(){super()}}';
        const ChildNoCtorPrivatePropsMinified =
            'class ChildNoCtorPrivateProps extends Parent{constructor(){super(...arguments);this.x=10}}';

        expect(isDelegateCtor(ChildNoCtorMinified)).toBe(true);
        expect(isDelegateCtor(ChildNoCtorPrivatePropsMinified)).toBe(true);
        expect(isDelegateCtor(ChildWithCtorMinified)).toBe(false);
      });

      it('should not throw when no prototype on type', () => {
        // Cannot test arrow function here due to the compilation
        const dummyArrowFn = function() {};
        Object.defineProperty(dummyArrowFn, 'prototype', {value: undefined});
        expect(() => reflector.annotations(dummyArrowFn as any)).not.toThrow();
      });

      it('should support native class', () => {
        // These classes are defined as strings unlike the tests above because otherwise
        // the compiler (of these tests) will convert them to ES5 constructor function
        // style classes.
        const ChildNoCtor = `class ChildNoCtor extends Parent {}\n`;
        const ChildWithCtor = `class ChildWithCtor extends Parent {\n` +
            `  constructor() { super(); }` +
            `}\n`;
        const ChildNoCtorComplexBase = `class ChildNoCtor extends Parent['foo'].bar(baz) {}\n`;
        const ChildWithCtorComplexBase = `class ChildWithCtor extends Parent['foo'].bar(baz) {\n` +
            `  constructor() { super(); }` +
            `}\n`;
        const ChildNoCtorPrivateProps = `class ChildNoCtorPrivateProps extends Parent {\n` +
            `  constructor() {\n` +
            // Note that the instance property causes a pass-through constructor to be synthesized
            `    super(...arguments);\n` +
            `    this.x = 10;\n` +
            `  }\n` +
            `}\n`;

        expect(isDelegateCtor(ChildNoCtor)).toBe(true);
        expect(isDelegateCtor(ChildNoCtorPrivateProps)).toBe(true);
        expect(isDelegateCtor(ChildWithCtor)).toBe(false);
        expect(isDelegateCtor(ChildNoCtorComplexBase)).toBe(true);
        expect(isDelegateCtor(ChildWithCtorComplexBase)).toBe(false);
      });

      it('should properly handle all class forms', () => {
        const ctor = (str: string) => expect(isDelegateCtor(str)).toBe(false);
        const noCtor = (str: string) => expect(isDelegateCtor(str)).toBe(true);

        ctor(`class Bar extends Foo {constructor(){}}`);
        ctor(`class Bar extends Foo { constructor ( ) {} }`);
        ctor(`class Bar extends Foo { other(){}; constructor(){} }`);

        noCtor(`class extends Foo{}`);
        noCtor(`class extends Foo {}`);
        noCtor(`class Bar extends Foo {}`);
        noCtor(`class $Bar1_ extends $Fo0_ {}`);
        noCtor(`class Bar extends Foo { other(){} }`);
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
        expect(reflector.annotations(null!)).toEqual([]);
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
          constructor(@ParamDecorator('c') c: C) {
            super(null!, null!);
          }
        }

        class ChildWithCtorNoDecorator extends Parent {
          constructor(a: any, b: any, c: any) {
            super(null!, null!);
          }
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
        ] as any[]);  // TODO: Review use of `any` here (#19904)

        expect(reflector.parameters(NoDecorators)).toEqual([]);
        expect(reflector.parameters(<any>{})).toEqual([]);
        expect(reflector.parameters(<any>1)).toEqual([]);
        expect(reflector.parameters(null!)).toEqual([]);
      });

      it('should inherit property metadata', () => {
        class A {}
        class B {}
        class C {}

        class Parent {
          // TODO(issue/24571): remove '!'.
          @PropDecorator('a') a!: A;
          // TODO(issue/24571): remove '!'.
          @PropDecorator('b1') b!: B;
        }

        class Child extends Parent {
          // TODO(issue/24571): remove '!'.
          @PropDecorator('b2') override b!: B;
          // TODO(issue/24571): remove '!'.
          @PropDecorator('c') c!: C;
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
        expect(reflector.propMetadata(null!)).toEqual({});
      });

      it('should inherit lifecycle hooks', () => {
        class Parent {
          hook1() {}
          hook2() {}
        }

        class Child extends Parent {
          override hook2() {}
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
          static override decorators = [{type: ClassDecorator, args: [{value: 'child'}]}];
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
          static override ctorParameters = () =>
              [{type: C, decorators: [{type: ParamDecorator, args: ['c']}]},
          ]
          constructor() {
            super();
          }
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
          static override propDecorators: any = {
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
          static override annotations = [new ClassDecorator({value: 'child'})];
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
          static override parameters = [
            [C, new ParamDecorator('c')],
          ];
          constructor() {
            super();
          }
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
          static override propMetadata: any = {
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
