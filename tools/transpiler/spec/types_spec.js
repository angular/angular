import {describe, xdescribe, it, expect, IS_DARTIUM} from 'angular2/test_lib';

class A {}
class B {}

function sum(a: number, b: number): number {
  return a + b;
}

function not(a: boolean): boolean {
  return !a;
}

function generics(a: A<B>) {

}

function namedObjectType({a,b}:{a:A,b:B<C>}) {

}

class Bar {
  constructor({
      selector,
      lightDomServices,
      implementsTypes
    })
  {
  }
}

class Foo {
  a;
  b;

  constructor(a: number, b: number) {
    this.a = a;
    this.b = b;
  }

  sum(): number {
    return this.a + this.b;
  }

  typedVariables() {
    // TODO(vojta): test this
    var foo:string = 'foo';
    var typed:boolean, untyped;
    var oneTyped:string = 'one',
        another: boolean = true;
  }
}

class WithFields {
  name: string;
  static id: number;
  untyped;
  static staticUntyped;
}


export function main() {
  describe('types', function() {
    it('should work', function() {
      // TODO(vojta): test this better.
      var f = new Foo(1, 2);
      assert(f.sum() == 3);
      assert(f instanceof Foo);

      f.typedVariables();
    });

    xdescribe('class fields', function() {
      it('should fail when setting wrong type value', function() {
        var wf = new WithFields();

        expect(function() {
          wf.name = true;
        }).toThrowError(IS_DARTIUM ?
          // Dart
          "type 'bool' is not a subtype of type 'String' of 'value'" :
          // JavaScript
          // TODO(vojta): Better error, it's not first argument, it's setting a field.
          'Invalid arguments given!\n' +
          '  - 1st argument has to be an instance of string, got true'
        );
      });
    });

    xdescribe('static class fields', function() {
      it('should fail when setting wrong type value', function() {
        expect(function() {
          WithFields.id = true;
        }).toThrowError(IS_DARTIUM ?
          // Dart
          "type 'bool' is not a subtype of type 'num' of 'id'" :
          // JavaScript
          // TODO(vojta): Better error, it's not first argument, it's setting a field.
          'Invalid arguments given!\n' +
          '  - 1st argument has to be an instance of number, got true'
        );
      });
    });
  });
}
