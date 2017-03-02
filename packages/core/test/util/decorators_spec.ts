/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject} from '@angular/core';
import {reflector} from '@angular/core/src/reflection/reflection';
import {global} from '@angular/core/src/util';
import {Class, makeDecorator, makePropDecorator} from '@angular/core/src/util/decorators';

class DecoratedParent {}
class DecoratedChild extends DecoratedParent {}

export function main() {
  const Reflect = global['Reflect'];

  const TerminalDecorator = makeDecorator('TerminalDecorator', {terminal: true});
  const TestDecorator = makeDecorator(
      'TestDecorator', {marker: undefined}, Object, (fn: any) => fn.Terminal = TerminalDecorator);

  describe('Property decorators', () => {
    // https://github.com/angular/angular/issues/12224
    it('should work on the "watch" property', () => {
      const Prop = makePropDecorator('Prop', [['value', undefined]]);

      class TestClass {
        @Prop('firefox!')
        watch: any;
      }

      const p = reflector.propMetadata(TestClass);
      expect(p['watch']).toEqual([new Prop('firefox!')]);
    });

    it('should work with any default plain values', () => {
      const Default = makePropDecorator('Default', [['value', 5]]);
      expect(new Default(0)['value']).toEqual(0);
    });

    it('should work with any object values', () => {
      // make sure we don't walk up the prototype chain
      const Default = makePropDecorator('Default', [{value: 5}]);
      const value = Object.create({value: 10});
      expect(new Default(value)['value']).toEqual(5);
    });
  });

  describe('decorators', () => {
    it('should invoke as decorator', () => {
      function Type() {}
      TestDecorator({marker: 'WORKS'})(Type);
      const annotations = Reflect.getOwnMetadata('annotations', Type);
      expect(annotations[0].marker).toEqual('WORKS');
    });

    it('should invoke as new', () => {
      const annotation = new (<any>TestDecorator)({marker: 'WORKS'});
      expect(annotation instanceof TestDecorator).toEqual(true);
      expect(annotation.marker).toEqual('WORKS');
    });

    it('should invoke as chain', () => {
      let chain: any = TestDecorator({marker: 'WORKS'});
      expect(typeof chain.Terminal).toEqual('function');
      chain = chain.Terminal();
      expect(chain.annotations[0] instanceof TestDecorator).toEqual(true);
      expect(chain.annotations[0].marker).toEqual('WORKS');
      expect(chain.annotations[1] instanceof TerminalDecorator).toEqual(true);
    });

    it('should not apply decorators from the prototype chain', function() {
      TestDecorator({marker: 'parent'})(DecoratedParent);
      TestDecorator({marker: 'child'})(DecoratedChild);

      const annotations = Reflect.getOwnMetadata('annotations', DecoratedChild);
      expect(annotations.length).toBe(1);
      expect(annotations[0].marker).toEqual('child');
    });

    describe('Class', () => {
      it('should create a class', () => {
        let i0: any;
        let i1: any;
        const MyClass = (<any>TestDecorator({marker: 'test-works'})).Class(<any>{
          extends: Class(<any>{
            constructor: function() {},
            extendWorks: function() { return 'extend ' + this.arg; }
          }),
          constructor: [String, function(arg: any) { this.arg = arg; }],
          methodA: [
            i0 = new Inject(String),
            [i1 = Inject(String), Number],
            function(a: any, b: any) {},
          ],
          works: function() { return this.arg; },
          prototype: 'IGNORE'
        });

        const obj: any = new MyClass('WORKS');
        expect(obj.arg).toEqual('WORKS');
        expect(obj.works()).toEqual('WORKS');
        expect(obj.extendWorks()).toEqual('extend WORKS');
        expect(reflector.parameters(MyClass)).toEqual([[String]]);
        expect(reflector.parameters(obj.methodA)).toEqual([[i0], [i1.annotation, Number]]);

        const proto = (<Function>MyClass).prototype;
        expect(proto.extends).toEqual(undefined);
        expect(proto.prototype).toEqual(undefined);

        expect(reflector.annotations(MyClass)[0].marker).toEqual('test-works');
      });

      describe('errors', () => {
        it('should ensure that last constructor is required', () => {
          expect(() => { (<Function>Class)({}); })
              .toThrowError(
                  'Only Function or Array is supported in Class definition for key \'constructor\' is \'undefined\'');
        });


        it('should ensure that we dont accidently patch native objects', () => {
          expect(() => {
            (<Function>Class)({constructor: Object});
          }).toThrowError('Can not use native Object as constructor');
        });


        it('should ensure that last position is function', () => {
          expect(() => { Class({constructor: []}); })
              .toThrowError(
                  'Last position of Class method array must be Function in key constructor was \'undefined\'');
        });

        it('should ensure that annotation count matches parameters count', () => {
          expect(() => {
            Class({constructor: [String, function MyType() {}]});
          })
              .toThrowError(
                  'Number of annotations (1) does not match number of arguments (0) in the function: MyType');
        });

        it('should ensure that only Function|Arrays are supported', () => {
          expect(() => { Class({constructor: function() {}, method: <any>'non_function'}); })
              .toThrowError(
                  'Only Function or Array is supported in Class definition for key \'method\' is \'non_function\'');
        });

        it('should ensure that extends is a Function', () => {
          expect(() => { Class({extends: <any>'non_type', constructor: function() {}}); })
              .toThrowError(
                  'Class definition \'extends\' property must be a constructor function was: non_type');
        });

        it('should assign an overridden name for anonymous constructor functions', () => {
          expect((Class({constructor: function() {}}) as any).overriddenName).not.toBeUndefined();
        });
      });
    });
  });
}
