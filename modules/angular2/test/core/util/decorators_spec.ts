import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';

import {
  makeDecorator,
  makeParamDecorator,
  Class,
  reflectRegistry
} from 'angular2/src/core/util/decorators';
import {global} from 'angular2/src/core/facade/lang';
import {Inject} from 'angular2/angular2';
import {reflector} from 'angular2/src/core/reflection/reflection';

class TestAnnotation {
  constructor(public arg: any) {}
}

class TerminalAnnotation {
  terminal = true;
}

class DecoratedParent {}
class DecoratedChild extends DecoratedParent {}

class SampleAnnotation {}

var SampleDecorator: (...args) => any = makeDecorator(SampleAnnotation);

@SampleDecorator()
class SampleClass {
}

export function main() {
  var Reflect = global.Reflect;

  var TerminalDecorator = makeDecorator(TerminalAnnotation);
  var TestDecorator = makeDecorator(TestAnnotation, (fn: any) => fn.Terminal = TerminalDecorator);

  describe('decorators', () => {
    it('should invoke as decorator', () => {
      function Type() {}
      TestDecorator({marker: 'WORKS'})(Type);
      var annotations = Reflect.getMetadata('annotations', Type);
      expect(annotations[0].arg.marker).toEqual('WORKS');
    });

    it('should invoke as new', () => {
      var annotation = new (<any>TestDecorator)({marker: 'WORKS'});
      expect(annotation instanceof TestAnnotation).toEqual(true);
      expect(annotation.arg.marker).toEqual('WORKS');
    });

    it('should invoke as chain', () => {
      var chain: any = TestDecorator({marker: 'WORKS'});
      expect(typeof chain.Terminal).toEqual('function');
      chain = chain.Terminal();
      expect(chain.annotations[0] instanceof TestAnnotation).toEqual(true);
      expect(chain.annotations[0].arg.marker).toEqual('WORKS');
      expect(chain.annotations[1] instanceof TerminalAnnotation).toEqual(true);
    });

    it('should not apply decorators from the prototype chain', function() {
      TestDecorator({marker: 'parent'})(DecoratedParent);
      TestDecorator({marker: 'child'})(DecoratedChild);

      var annotations = Reflect.getOwnMetadata('annotations', DecoratedChild);
      expect(annotations.length).toBe(1);
      expect(annotations[0].arg.marker).toEqual('child');
    });

    describe('Class', () => {
      it('should create a class', () => {
        var i0, i1;
        var MyClass =
            (<any>TestDecorator('test-works'))
                .Class(<any>{
                  extends: Class(<any>{
                    constructor: function() {},
                    extendWorks: function() { return 'extend ' + this.arg; }
                  }),
                  constructor: [String, function(arg) { this.arg = arg; }],
                  methodA:
                      [i0 = new Inject(String), [i1 = Inject(String), Number], function(a, b) {}],
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

        expect(reflector.annotations(MyClass)[0].arg).toEqual('test-works')
      });

      describe('reflectRegistry', () => {
        it('should add annotated objects to the registry', () => {
          var MyClass = (<any>SampleDecorator()).Class(<any>{constructor: function() {}});
          expect(reflectRegistry.getForAnnotation(SampleAnnotation)).toContain(MyClass);
        });

        it('should add annotated classes to the registry', () => {
          expect(reflectRegistry.getForAnnotation(SampleAnnotation)).toContain(SampleClass);
        });
      });

      describe('errors', () => {
        it('should ensure that last constructor is required', () => {
          expect(() => { (<Function>Class)({}); })
              .toThrowError(
                  "Only Function or Array is supported in Class definition for key 'constructor' is 'undefined'");
        });


        it('should ensure that we dont accidently patch native objects', () => {
          expect(() => { (<Function>Class)({constructor: Object}); })
              .toThrowError("Can not use native Object as constructor");
        });


        it('should ensure that last possition is function', () => {
          expect(() => {Class({constructor: []})})
              .toThrowError(
                  "Last position of Class method array must be Function in key constructor was 'undefined'");
        });

        it('should ensure that annotation count matches paramaters count', () => {
          expect(() => {Class({constructor: [String, function MyType() {}]})})
              .toThrowError(
                  "Number of annotations (1) does not match number of arguments (0) in the function: MyType");
        });

        it('should ensure that only Function|Arrays are supported', () => {
          expect(() => { Class(<any>{constructor: function() {}, method: 'non_function'}); })
              .toThrowError(
                  "Only Function or Array is supported in Class definition for key 'method' is 'non_function'");
        });

        it('should ensure that extends is a Function', () => {
          expect(() => {(<Function>Class)({extends: 'non_type', constructor: function() {}})})
              .toThrowError(
                  "Class definition 'extends' property must be a constructor function was: non_type");
        });
      });
    });
  });
}
