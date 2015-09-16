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

import {Injector, Inject, bind, Pipe, PipeTransform} from 'angular2/core';
import {ProtoPipes, Pipes} from 'angular2/src/core/pipes/pipes';
import {PipeBinding} from 'angular2/src/core/pipes/pipe_binding';

class PipeA implements PipeTransform {
  transform(a, b) {}
  onDestroy() {}
}

class PipeB implements PipeTransform {
  dep;
  constructor(@Inject("dep") dep: any) { this.dep = dep; }
  transform(a, b) {}
  onDestroy() {}
}

export function main() {
  describe("Pipes", () => {
    var injector;

    beforeEach(
        () => { injector = Injector.resolveAndCreate([bind('dep').toValue('dependency')]); });

    it('should instantiate a pipe', () => {
      var proto = new ProtoPipes([PipeBinding.createFromType(PipeA, new Pipe({name: 'a'}))]);
      var pipes = new Pipes(proto, injector);

      expect(pipes.get("a").pipe).toBeAnInstanceOf(PipeA);
    });

    it('should throw when no pipe found', () => {
      var proto = new ProtoPipes([]);
      var pipes = new Pipes(proto, injector);
      expect(() => pipes.get("invalid")).toThrowErrorWith("Cannot find pipe 'invalid'");
    });

    it('should inject dependencies from the provided injector', () => {
      var proto = new ProtoPipes([PipeBinding.createFromType(PipeB, new Pipe({name: 'b'}))]);
      var pipes = new Pipes(proto, injector);
      expect((<any>pipes.get("b").pipe).dep).toEqual("dependency");
    });

    it('should cache pure pipes', () => {
      var proto =
          new ProtoPipes([PipeBinding.createFromType(PipeA, new Pipe({name: 'a', pure: true}))]);
      var pipes = new Pipes(proto, injector);

      expect(pipes.get("a").pure).toEqual(true);
      expect(pipes.get("a")).toBe(pipes.get("a"));
    });

    it('should NOT cache impure pipes', () => {
      var proto =
          new ProtoPipes([PipeBinding.createFromType(PipeA, new Pipe({name: 'a', pure: false}))]);
      var pipes = new Pipes(proto, injector);

      expect(pipes.get("a").pure).toEqual(false);
      expect(pipes.get("a")).not.toBe(pipes.get("a"));
    });
  });
}
