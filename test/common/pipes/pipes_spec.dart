library angular2.test.common.pipes.pipes_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        xdescribe,
        describe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach;
import "package:angular2/core.dart"
    show Injector, Inject, provide, Pipe, PipeTransform, OnDestroy;
import "package:angular2/src/core/pipes/pipes.dart" show ProtoPipes, Pipes;
import "package:angular2/src/core/pipes/pipe_provider.dart" show PipeProvider;

class PipeA implements PipeTransform, OnDestroy {
  transform(a, b) {}
  ngOnDestroy() {}
}

class PipeB implements PipeTransform, OnDestroy {
  var dep;
  PipeB(@Inject("dep") dynamic dep) {
    this.dep = dep;
  }
  transform(a, b) {}
  ngOnDestroy() {}
}

main() {
  describe("Pipes", () {
    var injector;
    beforeEach(() {
      injector =
          Injector.resolveAndCreate([provide("dep", useValue: "dependency")]);
    });
    it("should instantiate a pipe", () {
      var proto = ProtoPipes.fromProviders(
          [PipeProvider.createFromType(PipeA, new Pipe(name: "a"))]);
      var pipes = new Pipes(proto, injector);
      expect(pipes.get("a").pipe).toBeAnInstanceOf(PipeA);
    });
    it("should throw when no pipe found", () {
      var proto = ProtoPipes.fromProviders([]);
      var pipes = new Pipes(proto, injector);
      expect(() => pipes.get("invalid"))
          .toThrowErrorWith("Cannot find pipe 'invalid'");
    });
    it("should inject dependencies from the provided injector", () {
      var proto = ProtoPipes.fromProviders(
          [PipeProvider.createFromType(PipeB, new Pipe(name: "b"))]);
      var pipes = new Pipes(proto, injector);
      expect(((pipes.get("b").pipe as dynamic)).dep).toEqual("dependency");
    });
    it("should cache pure pipes", () {
      var proto = ProtoPipes.fromProviders([
        PipeProvider.createFromType(PipeA, new Pipe(name: "a", pure: true))
      ]);
      var pipes = new Pipes(proto, injector);
      expect(pipes.get("a").pure).toEqual(true);
      expect(pipes.get("a")).toBe(pipes.get("a"));
    });
    it("should NOT cache impure pipes", () {
      var proto = ProtoPipes.fromProviders([
        PipeProvider.createFromType(PipeA, new Pipe(name: "a", pure: false))
      ]);
      var pipes = new Pipes(proto, injector);
      expect(pipes.get("a").pure).toEqual(false);
      expect(pipes.get("a")).not.toBe(pipes.get("a"));
    });
  });
}
