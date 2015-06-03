// # Assert.js
// A run-time type assertion library for JavaScript. Designed to be used with
// [Traceur](https://github.com/google/traceur-compiler).
import {} from '../../angular2/src/test_lib/e2e_util';
import {assert} from '../rtts_assert';

// - [Basic Type Check](#basic-type-check)
// - [Custom Check](#custom-check)
// - [Primitive Values](#primitive-values)
// - [Describing more complex types](#describing-more-complex-types)
//   - [assert.arrayOf](#assert-arrayof)
//   - [assert.structure](#assert-structure)
// - [Integrating with Traceur](#integrating-with-traceur)

// Note: `assert` gets automatically included by traceur!

export function main() {
  return;

  describe('prettyPrint', () => {
    function Type() {}

    it('should limit the number of printed properties', () => {
      var o = {};
      for (var i = 0; i < 100; i++) {
        o['p_' + i] = i;
      }
      try {
        assert.type(o, Type);
        throw 'fail!';
      } catch (e) {
        expect(e.message.indexOf('p_0')).toBeGreaterThan(-1);
        expect(e.message.indexOf('...')).toBeGreaterThan(-1);
        expect(e.message.indexOf('p_20')).toEqual(-1);
      }
    });

    it('should limit the depth of printed properties', () => {
      var o = {l1: {l2: {l3: {l4: {l5: {l6: 'deep'}}}}}};

      expect(() => { assert.type(o, Type); })
          .toThrowError('Expected an instance of Type, got {l1: {l2: {l3: {l4: [...]}}}}!');
    });
  });

  // ## Basic Type Check
  // By default, `instanceof` is used to check the type.
  //
  // Note that you can use `assert.type()` in unit tests or anywhere in your code.
  // Most of the time, you will use it with Traceur.
  // Jump to the [Traceur section](#integrating-with-traceur) to see an example of that.
  describe('basic type check', function() {

    function Type() {}

    it('should pass', function() { assert.type(new Type(), Type); });


    it('should fail', function() {
      expect(() => assert.type(123, Type)).toThrowError('Expected an instance of Type, got 123!');
    });


    it('should allow null', function() { assert.type(null, Type); });
  });



  // ## Custom Check
  // Often, `instanceof` is not flexible enough.
  // In that case, your type can define its own `assert` method which will be used instead.
  //
  // See [Describing More Complex Types](#describing-more-complex-types) for examples how to
  // define custom checks using `assert.define()`.
  describe('custom check', function() {

    function Type() {}

    // the basic check can just return true/false, without specifying any reason
    it('should pass when returns true', function() {
      (<any>Type).assert = function(value) { return true; };

      assert.type({}, Type);
    });


    it('should fail when returns false', function() {
      (<any>Type).assert = function(value) { return false; };

      expect(() => assert.type({}, Type)).toThrowError('Expected an instance of Type, got {}!');
    });


    // Using `assert.fail()` allows to report even multiple errors.
    it('should fail when calls assert.fail()', function() {
      (<any>Type).assert = function(value) {
        assert.fail('not smart enough');
        assert.fail('not blue enough');
      };

      expect(() => assert.type({}, Type))
          .toThrowError('Expected an instance of Type, got {}!\n' +
                        '  - not smart enough\n' +
                        '  - not blue enough');
    });


    it('should fail when throws an exception', function() {
      (<any>Type).assert = function(value) { throw new Error('not long enough'); };

      expect(function() { assert.type(12345, Type); })
          .toThrowError('Expected an instance of Type, got 12345!\n' +
                        '  - not long enough');
    });
  });



  // ## Primitive Values
  // You don't want to check primitive values (such as strings, numbers, or booleans) using `typeof`
  // rather than
  // `instanceof`.
  //
  // Again, you probably won't write this code and rather use Traceur to do it for you, simply based
  // on type annotations.
  describe('primitive value check', function() {
    var primitive = global['$traceurRuntime'].type;

    describe('string', function() {

      it('should pass', function() { assert.type('xxx', primitive.string); });


      it('should fail', function() {
        expect(() => assert.type(12345, primitive.string))
            .toThrowError('Expected an instance of string, got 12345!');
      });

      it('should allow null', function() { assert.type(null, primitive.string); });
    });


    describe('number', function() {

      it('should pass', function() { assert.type(123, primitive.number); });


      it('should fail', function() {
        expect(() => assert.type(false, primitive.number))
            .toThrowError('Expected an instance of number, got false!');
      });

      it('should allow null', function() { assert.type(null, primitive.number); });
    });


    describe('boolean', function() {

      it('should pass', function() {
        expect(assert.type(true, primitive.boolean)).toEqual(true);
        expect(assert.type(false, primitive.boolean)).toEqual(false);
      });


      it('should fail', function() {
        expect(() => assert.type(123, primitive.boolean))
            .toThrowError('Expected an instance of boolean, got 123!');
      });

      it('should allow null', function() { assert.type(null, primitive.boolean); });
    });
  });


  // ## Describing more complex types
  //
  // Often, a simple type check using `instanceof` or `typeof` is not enough.
  // That's why you can define custom checks using this DSL.
  // The goal was to make them easy to compose and as descriptive as possible.
  // Of course you can write your own DSL on the top of this.
  describe('define', function() {

    // If the first argument to `assert.define()` is a type (function), it will define `assert`
    // method on that function.
    //
    // In this example, being a type of Type means being a either a function or object.
    it('should define assert for an existing type', function() {
      function Type() {}

      assert.define(Type, function(value) { assert(value).is(Function, Object); });

      assert.type({}, Type);
      assert.type(function() {}, Type);
      expect(() => assert.type('str', Type))
          .toThrowError('Expected an instance of Type, got "str"!\n' +
                        '  - "str" is not instance of Function\n' +
                        '  - "str" is not instance of Object');
    });


    // If the first argument to `assert.define()` is a string,
    // it will create an interface - basically an empty class with `assert` method.
    it('should define an interface', function() {
      var User = assert.define('MyUser', function(user) { assert(user).is(Object); });

      assert.type({}, User);
      expect(() => assert.type(12345, User))
          .toThrowError('Expected an instance of MyUser, got 12345!\n' +
                        '  - 12345 is not instance of Object');
    });


    // Here are a couple of more APIs to describe your custom types...
    //
    // ### assert.arrayOf
    // Checks if the value is an array and if so, it checks whether all the items are one the given
    // types.
    // These types can be composed types, not just simple ones.
    describe('arrayOf', function() {

      var Titles = assert.define('ListOfTitles', function(value) {
        assert(value).is(assert.arrayOf(assert.string, assert.number));
      });

      it('should pass', function() { assert.type(['one', 55, 'two'], Titles); });


      it('should fail when non-array given', function() {
        expect(() => assert.type('foo', Titles))
            .toThrowError('Expected an instance of ListOfTitles, got "foo"!\n' +
                          '  - "foo" is not instance of array of string/number\n' +
                          '    - "foo" is not instance of Array');
      });


      it('should fail when an invalid item in the array', function() {
        expect(() => assert.type(['aaa', true], Titles))
            .toThrowError('Expected an instance of ListOfTitles, got ["aaa", true]!\n' +
                          '  - ["aaa", true] is not instance of array of string/number\n' +
                          '    - true is not instance of string\n' +
                          '    - true is not instance of number');
      });
    });


    // ### assert.structure
    // Similar to `assert.arrayOf` which checks a content of an array,
    // `assert.structure` checks if the value is an object with specific properties.
    describe('structure', function() {

      var User = assert.define('MyUser', function(value) {
        assert(value).is(assert.structure({name: assert.string, age: assert.number}));
      });

      it('should pass', function() { assert.type({name: 'Vojta', age: 28}, User); });


      it('should fail when non-object given', function() {
        expect(() => assert.type(123, User))
            .toThrowError('Expected an instance of MyUser, got 123!\n' +
                          '  - 123 is not instance of object with properties name, age\n' +
                          '    - 123 is not instance of Object');
      });


      it('should fail when an invalid property', function() {
        expect(() => assert.type({name: 'Vojta', age: true}, User))
            .toThrowError(
                'Expected an instance of MyUser, got {name: "Vojta", age: true}!\n' +
                '  - {name: "Vojta", age: true} is not instance of object with properties name, age\n' +
                '    - true is not instance of number');
      });
    });
  });



  // ## Integrating with Traceur
  //
  // Manually calling `assert.type()` in your code is cumbersome. Most of the time, you'll want to
  // have Traceur add the calls to `assert.type()` to your code based on type annotations.
  //
  // This has several advantages:
  // - it's shorter and nicer,
  // - you can easily ignore it when generating production code.
  //
  // You'll need to run Traceur with `--types=true --type-assertions=true
  // --type-assertion-module="path/to/assert"`.
  describe('Traceur', function() {

    describe('arguments', function() {

      function reverse(str: string) { return str ? reverse(str.substring(1)) + str[0] : '' }

      it('should pass', function() { expect(reverse('angular')).toEqual('ralugna'); });


      it('should fail', function() {
        expect(() => reverse(<any>123))
            .toThrowError('Invalid arguments given!\n' +
                          '  - 1st argument has to be an instance of string, got 123');
      });
    });


    describe('return value', function() {

      function foo(bar): number { return bar; }

      it('should pass', function() { expect(foo(123)).toEqual(123); });


      it('should fail', function() {
        expect(() => foo('bar'))
            .toThrowError('Expected to return an instance of number, got "bar"!');
      });
    });


    describe('variables', function() {

      it('should pass', function() { var count: number = 1; });


      it('should fail', function() {
        expect(() => { var count: number = <any>true; })
            .toThrowError('Expected an instance of number, got true!');
      });
    });


    describe('void', function() {
      function foo(bar?): void { return bar; }

      it('should pass when not defined', function() {
        function nonReturn(): void {}
        function returnNothing(): void { return; }
        function returnUndefined(): void { return undefined; }

        foo();
        foo(undefined);
        nonReturn();
        returnNothing();
        returnUndefined();
      });


      it('should fail when a value returned', function() {
        expect(() => foo('bar')).toThrowError('Expected to return an instance of void, got "bar"!');
      });


      it('should fail when null returned', function() {
        expect(() => foo(null)).toThrowError('Expected to return an instance of void, got null!');
      });
    });


    describe('generics', function() {

      it('should pass', function() { var list: Array<string> = []; });

      // TODO(tbosch): add assertions based on generics to rtts_assert

    });

  });
}
