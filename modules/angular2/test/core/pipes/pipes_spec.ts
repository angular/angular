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

import {PipeTransform} from 'angular2/change_detection';
import {Injector, Inject, bind} from 'angular2/di';
import {ProtoPipes, Pipes} from 'angular2/src/core/pipes/pipes';
import {PipeBinding} from 'angular2/src/core/pipes/pipe_binding';
import {Pipe} from 'angular2/metadata';

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
      expect(pipes.get("a")).toBeAnInstanceOf(PipeA);
    });

    it('should throw when no pipe found', () => {
      var proto = new ProtoPipes([]);
      var pipes = new Pipes(proto, injector);
      expect(() => pipes.get("invalid")).toThrowErrorWith("Cannot find pipe 'invalid'");
    });

    it('should inject dependencies from the provided injector', () => {
      var proto = new ProtoPipes([PipeBinding.createFromType(PipeB, new Pipe({name: 'b'}))]);
      var pipes = new Pipes(proto, injector);
      expect(pipes.get("b").dep).toEqual("dependency");
    });
  });
}
