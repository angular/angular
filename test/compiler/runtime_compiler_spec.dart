library angular2.test.compiler.runtime_compiler_spec;

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
import "package:angular2/core.dart" show Component, View, provide;
import "package:angular2/src/facade/async.dart" show PromiseWrapper;
import "spies.dart" show SpyTemplateCompiler;
import "package:angular2/src/compiler/compiler.dart" show TemplateCompiler;
import "package:angular2/src/compiler/runtime_compiler.dart"
    show RuntimeCompiler, RuntimeCompiler_;
import "package:angular2/src/core/linker/view.dart" show HostViewFactory;

main() {
  describe("RuntimeCompiler", () {
    RuntimeCompiler_ compiler;
    var templateCompilerSpy;
    var someHostViewFactory;
    beforeEachProviders(() {
      templateCompilerSpy = new SpyTemplateCompiler();
      someHostViewFactory = new HostViewFactory(null, null, null);
      templateCompilerSpy
          .spy("compileHostComponentRuntime")
          .andReturn(PromiseWrapper.resolve(someHostViewFactory));
      return [provide(TemplateCompiler, useValue: templateCompilerSpy)];
    });
    beforeEach(inject([RuntimeCompiler], (_compiler) {
      compiler = _compiler;
    }));
    it(
        "compileInHost should compile the template via TemplateCompiler",
        inject([AsyncTestCompleter], (async) {
          compiler.compileInHost(SomeComponent).then((hostViewFactoryRef) {
            expect(hostViewFactoryRef.internalHostViewFactory)
                .toBe(someHostViewFactory);
            async.done();
          });
        }));
    it("should clear the cache", () {
      compiler.clearCache();
      expect(templateCompilerSpy.spy("clearCache")).toHaveBeenCalled();
    });
  });
}

@Component(selector: "some-comp")
@View(template: "")
class SomeComponent {}
