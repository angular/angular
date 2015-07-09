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

    describe('.append()', () => {
      it('should create a factory that appends new pipes to old', () => {
        firstPipeFactory.spy("supports").andReturn(false);
        secondPipeFactory.spy("supports").andReturn(true);
        secondPipeFactory.spy("create").andReturn(secondPipe);
        var originalPipes = new Pipes({'async': [firstPipeFactory]});
        var binding = Pipes.append({'async':<PipeFactory[]>[secondPipeFactory]});
        var pipes: Pipes = binding.toFactory(originalPipes);

        expect(pipes.config['async'].length).toBe(2);
        expect(originalPipes.config['async'].length).toBe(1);
        expect(pipes.get('async', 'second plz')).toBe(secondPipe);
      });


      it('should append to di-inherited pipes', () => {
        firstPipeFactory.spy("supports").andReturn(false);
        secondPipeFactory.spy("supports").andReturn(true);
        secondPipeFactory.spy("create").andReturn(secondPipe);

        var originalPipes: Pipes = new Pipes({'async': [firstPipeFactory]});
        var injector: Injector = Injector.resolveAndCreate([bind(Pipes).toValue(originalPipes)]);
        var childInjector: Injector =
            injector.resolveAndCreateChild([Pipes.append({'async': [secondPipeFactory]})]);
        var parentPipes: Pipes = injector.get(Pipes);
        var childPipes: Pipes = childInjector.get(Pipes);
        expect(childPipes.config['async'].length).toBe(2);
        expect(parentPipes.config['async'].length).toBe(1);
        expect(childPipes.get('async', 'second plz')).toBe(secondPipe);
      });


      it('should throw if calling append when creating root injector', () => {
        secondPipeFactory.spy("supports").andReturn(true);
        secondPipeFactory.spy("create").andReturn(secondPipe);

        var injector: Injector =
            Injector.resolveAndCreate([Pipes.append({'async': [secondPipeFactory]})]);

        expect(() => injector.get(Pipes))
            .toThrowError(/Cannot append to Pipes without a parent injector/g);
      });
    });
  });
}
