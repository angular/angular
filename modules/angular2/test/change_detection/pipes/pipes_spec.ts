import {
  ddescribe,
  xdescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach
} from 'angular2/test_lib';

import {Injector, bind} from 'angular2/di';
import {Pipes} from 'angular2/src/change_detection/pipes/pipes';
import {Pipe} from 'angular2/src/change_detection/pipes/pipe';

class APipe implements Pipe {
  transform(a, b) {}
  onDestroy() {}
}

class AnotherPipe implements Pipe {
  transform(a, b) {}
  onDestroy() {}
}

export function main() {
  describe("pipe registry", () => {
    var injector;

    beforeEach(() => { injector = Injector.resolveAndCreate([]); });

    it("should instantiate a pipe", () => {
      var r = new Pipes({"type": APipe}, injector);
      expect(r.get("type", null)).toBeAnInstanceOf(APipe);
    });

    it("should instantiate a new pipe every time", () => {
      var r = new Pipes({"type": APipe}, injector);
      var p1 = r.get("type", null);
      var p2 = r.get("type", null);
      expect(p1).not.toBe(p2);
    });

    it("should throw when no matching type", () => {
      var r = new Pipes({}, null);
      expect(() => r.get("unknown", null)).toThrowError(`Cannot find pipe 'unknown'.`);
    });

    describe('.create()', () => {
      it("should create a new Pipes object", () => {
        var pipes = Pipes.create({'pipe': APipe}, null);
        expect(pipes.config).toEqual({'pipe': APipe});
      });

      it("should merge pipes config", () => {
        var pipes1 = Pipes.create({'pipe': APipe, 'pipe1': APipe}, null);
        var pipes2 = Pipes.create({'pipe': AnotherPipe, 'pipe2': AnotherPipe}, null, pipes1);

        expect(pipes2.config).toEqual({'pipe': AnotherPipe, 'pipe1': APipe, 'pipe2': AnotherPipe});
      });

      it("should not change parent's config", () => {
        var pipes1 = Pipes.create({'pipe': APipe, 'pipe1': APipe}, null);
        Pipes.create({'pipe': AnotherPipe, 'pipe2': AnotherPipe}, null, pipes1);

        expect(pipes1.config).toEqual({'pipe': APipe, 'pipe1': APipe});
      });
    });

    describe(".extend()", () => {
      it('should create a factory that prepend new pipes to old', () => {
        var pipes1 = Pipes.create({'pipe': APipe, 'pipe1': APipe}, null);
        var binding = Pipes.extend({'pipe': AnotherPipe, 'pipe2': AnotherPipe});
        var pipes: Pipes = binding.toFactory(pipes1, injector);

        expect(pipes.config).toEqual({'pipe': AnotherPipe, 'pipe1': APipe, 'pipe2': AnotherPipe});
      });

      it('should throw if calling extend when creating root injector', () => {
        var injector = Injector.resolveAndCreate([Pipes.extend({'pipe': APipe})]);

        expect(() => injector.get(Pipes))
            .toThrowErrorWith("Cannot extend Pipes without a parent injector");
      });
    });
  });
}
