library angular2.test.core.linker.compiler_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        xdescribe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        AsyncTestCompleter,
        inject,
        beforeEachProviders;
import "package:angular2/core.dart" show provide;
import "package:angular2/src/core/linker/compiler.dart" show Compiler;
import "package:angular2/src/core/reflection/reflection.dart"
    show reflector, ReflectionInfo;
import "package:angular2/src/core/linker/compiler.dart" show Compiler_;
import "package:angular2/src/core/linker/view.dart" show HostViewFactory;

main() {
  describe("Compiler", () {
    var someHostViewFactory;
    beforeEachProviders(() => [provide(Compiler, useClass: Compiler_)]);
    beforeEach(inject([Compiler], (_compiler) {
      someHostViewFactory = new HostViewFactory(null, null);
      reflector.registerType(
          SomeComponent, new ReflectionInfo([someHostViewFactory]));
    }));
    it(
        "should read the template from an annotation",
        inject([AsyncTestCompleter, Compiler], (async, compiler) {
          compiler.compileInHost(SomeComponent).then((hostViewFactoryRef) {
            expect(hostViewFactoryRef.internalHostViewFactory)
                .toBe(someHostViewFactory);
            async.done();
          });
        }));
    it(
        "should clear the cache",
        inject([Compiler], (compiler) {
          // Nothing to assert for now...
          compiler.clearCache();
        }));
  });
}

class SomeComponent {}
