import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  SpyPipe,
  SpyPipeFactory
} from 'angular2/test_lib';

import {Injector, bind} from 'angular2/di';
import {Pipes} from 'angular2/src/change_detection/pipes/pipes';
import {PipeFactory} from 'angular2/src/change_detection/pipes/pipe';

export function main() {
  describe("pipe registry", () => {
    var firstPipe;
    var secondPipe;

    var firstPipeFactory;
    var secondPipeFactory;

    beforeEach(() => {
      firstPipe = <any>new SpyPipe();
      secondPipe = <any>new SpyPipe();

      firstPipeFactory = <any>new SpyPipeFactory();
      secondPipeFactory = <any>new SpyPipeFactory();
    });

    it("should return an existing pipe if it can support the passed in object", () => {
      var r = new Pipes({"type": []});

      firstPipe.spy("supports").andReturn(true);

      expect(r.get("type", "some object", null, firstPipe)).toEqual(firstPipe);
    });

    it("should call onDestroy on the provided pipe if it cannot support the provided object",
       () => {
         firstPipe.spy("supports").andReturn(false);
         firstPipeFactory.spy("supports").andReturn(true);
         firstPipeFactory.spy("create").andReturn(secondPipe);

         var r = new Pipes({"type": [firstPipeFactory]});

         expect(r.get("type", "some object", null, firstPipe)).toEqual(secondPipe);
         expect(firstPipe.spy("onDestroy")).toHaveBeenCalled();
       });

    it("should return the first pipe supporting the data type", () => {
      firstPipeFactory.spy("supports").andReturn(false);
      firstPipeFactory.spy("create").andReturn(firstPipe);

      secondPipeFactory.spy("supports").andReturn(true);
      secondPipeFactory.spy("create").andReturn(secondPipe);

      var r = new Pipes({"type": [firstPipeFactory, secondPipeFactory]});

      expect(r.get("type", "some object")).toBe(secondPipe);
    });

    it("should throw when no matching type", () => {
      var r = new Pipes({});
      expect(() => r.get("unknown", "some object"))
          .toThrowError(`Cannot find 'unknown' pipe supporting object 'some object'`);
    });

    it("should throw when no matching pipe", () => {
      var r = new Pipes({"type": []});

      expect(() => r.get("type", "some object"))
          .toThrowError(`Cannot find 'type' pipe supporting object 'some object'`);
    });

    describe('.create()', () => {
      it("should create a new Pipes object", () => {
        firstPipeFactory.spy("supports").andReturn(true);
        firstPipeFactory.spy("create").andReturn(firstPipe);

        var pipes = Pipes.create({'async': [firstPipeFactory]});
        expect(pipes.get("async", "first")).toBe(firstPipe);
      });

      it("should prepend passed it config in existing registry", () => {
        firstPipeFactory.spy("supports").andReturn(true);
        secondPipeFactory.spy("supports").andReturn(true);
        secondPipeFactory.spy("create").andReturn(secondPipe);

        var pipes1 = Pipes.create({'async': [firstPipeFactory]});
        var pipes2 = Pipes.create({'async': [secondPipeFactory]}, pipes1);

        expect(pipes2.get("async", "first")).toBe(secondPipe);
      });

      it("should use inherited pipes when no overrides support the provided object", () => {
        firstPipeFactory.spy("supports").andReturn(true);
        firstPipeFactory.spy("create").andReturn(firstPipe);
        secondPipeFactory.spy("supports").andReturn(false);

        var pipes1 = Pipes.create({'async': [firstPipeFactory], 'date': [firstPipeFactory]});
        var pipes2 = Pipes.create({'async': [secondPipeFactory]}, pipes1);

        expect(pipes2.get("async", "first")).toBe(firstPipe);
        expect(pipes2.get("date", "first")).toBe(firstPipe);
      });
    });

    describe(".extend()", () => {
      it('should create a factory that prepend new pipes to old', () => {
        firstPipeFactory.spy("supports").andReturn(true);
        secondPipeFactory.spy("supports").andReturn(true);
        secondPipeFactory.spy("create").andReturn(secondPipe);

        var originalPipes = new Pipes({'async': [firstPipeFactory]});
        var binding = Pipes.extend({'async':<PipeFactory[]>[secondPipeFactory]});
        var pipes: Pipes = binding.toFactory(originalPipes);

        expect(pipes.config['async'].length).toBe(2);
        expect(originalPipes.config['async'].length).toBe(1);
        expect(pipes.get('async', 'second plz')).toBe(secondPipe);
      });

      it('should throw if calling extend when creating root injector', () => {
        secondPipeFactory.spy("supports").andReturn(true);
        secondPipeFactory.spy("create").andReturn(secondPipe);

        var injector: Injector =
            Injector.resolveAndCreate([Pipes.extend({'async': [secondPipeFactory]})]);

        expect(() => injector.get(Pipes))
            .toThrowError(/Cannot extend Pipes without a parent injector/g);
      });

      it('should extend di-inherited pipes', () => {
        firstPipeFactory.spy("supports").andReturn(true);
        firstPipeFactory.spy("create").andReturn(firstPipe);

        secondPipeFactory.spy("supports").andReturn(false);

        var originalPipes: Pipes = new Pipes({'async': [firstPipeFactory]});
        var injector: Injector = Injector.resolveAndCreate([bind(Pipes).toValue(originalPipes)]);
        var childInjector: Injector =
            injector.resolveAndCreateChild([Pipes.extend({'async': [secondPipeFactory]})]);

        var parentPipes: Pipes = injector.get(Pipes);
        var childPipes: Pipes = childInjector.get(Pipes);

        expect(childPipes.config['async'].length).toBe(2);
        expect(parentPipes.config['async'].length).toBe(1);
        expect(childPipes.get('async', 'second plz')).toBe(firstPipe);
      });
    });
  });
}
