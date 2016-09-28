/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject} from '@angular/core';
import {reflector} from '@angular/core/src/reflection/reflection';
import {Class, makeDecorator} from '@angular/core/src/util/decorators';
import {describe, expect, it} from '@angular/core/testing/testing_internal';

import {global} from '../../src/facade/lang';

class DecoratedParent {}
class DecoratedChild extends DecoratedParent {}

export function main() {
  var Reflect = global.Reflect;

  var TerminalDecorator = makeDecorator('TerminalDecorator', {terminal: true});
  var TestDecorator = makeDecorator(
      'TestDecorator', {marker: undefined}, Object, (fn: any) => fn.Terminal = TerminalDecorator);

  describe('decorators', () => {
    it('should invoke as decorator', () => {
      function Type() {}
      TestDecorator({marker: 'WORKS'})(Type);
      var annotations = Reflect.getMetadata('annotations', Type);
      expect(annotations[0].marker).toEqual('WORKS');
    });

    it('should invoke as new', () => {
      var annotation = new (<any>TestDecorator)({marker: 'WORKS'});
      expect(annotation instanceof TestDecorator).toEqual(true);
      expect(annotation.marker).toEqual('WORKS');
    });

    it('should invoke as chain', () => {
      var chain: any = TestDecorator({marker: 'WORKS'});
      expect(typeof chain.Terminal).toEqual('function');
      chain = chain.Terminal();
      expect(chain.annotations[0] instanceof TestDecorator).toEqual(true);
      expect(chain.annotations[0].marker).toEqual('WORKS');
      expect(chain.annotations[1] instanceof TerminalDecorator).toEqual(true);
    });

    it('should not apply decorators from the prototype chain', function() {
      TestDecorator({marker: 'parent'})(DecoratedParent);
      TestDecorator({marker: 'child'})(DecoratedChild);

      var annotations = Reflect.getOwnMetadata('annotations', DecoratedChild);
      expect(annotations.length).toBe(1);
      expect(annotations[0].marker).toEqual('child');
    });

    describe('Class', () => {
      it('should create a class', () => {
        var i0: any /** TODO #9100 */, i1: any /** TODO #9100 */;
        var MyClass = (<any>TestDecorator({marker: 'test-works'})).Class(<any>{
          extends: Class(<any>{
            constructor: function() {},
            extendWorks: function() { return 'extend ' + this.arg; }
          }),
          constructor: [String, function(arg: any /** TODO #9100 */) { this.arg = arg; }],
          methodA: [
            i0 = new Inject(String), [i1 = Inject(String), Number],
            function(a: any /** TODO #9100 */, b: any /** TODO #9100 */) {}
          ],
          works: function() { return this.arg; },
          prototype: 'IGNORE'
        });
        var obj: any = new MyClass('WORKS');
        expect(obj.arg).toEqual('WORKS');
        expect(obj.works()).toEqual('WORKS');
        expect(obj.extendWorks()).toEqual('extend WORKS');
        expect(reflector.parameters(MyClass)).toEqual([[String]]);
        expect(reflector.parameters(obj.methodA)).toEqual([[i0], [i1.annotation, Number]]);

        var proto = (<Function>MyClass).prototype;
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
          expect(() => { Class(<any>{constructor: function() {}, method: 'non_function'}); })
              .toThrowError(
                  'Only Function or Array is supported in Class definition for key \'method\' is \'non_function\'');
        });

        it('should ensure that extends is a Function', () => {
          expect(() => { (<Function>Class)({extends: 'non_type', constructor: function() {}}); })
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
