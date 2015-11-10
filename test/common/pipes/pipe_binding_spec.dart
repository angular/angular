library angular2.test.common.pipes.pipe_binding_spec;

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
import "package:angular2/src/core/pipes/pipe_provider.dart" show PipeProvider;
import "package:angular2/src/core/metadata.dart" show Pipe;

class MyPipe {}

main() {
  describe("PipeProvider", () {
    it("should create a provider out of a type", () {
      var provider =
          PipeProvider.createFromType(MyPipe, new Pipe(name: "my-pipe"));
      expect(provider.name).toEqual("my-pipe");
      expect(provider.key.token).toEqual(MyPipe);
    });
  });
}
