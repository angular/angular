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
import "package:angular2/core.dart" show Component, View, provide;
import "../spies.dart" show SpyProtoViewFactory;
import "package:angular2/src/core/linker/template_commands.dart"
    show CompiledHostTemplate, CompiledComponentTemplate, BeginComponentCmd;
import "package:angular2/src/core/linker/compiler.dart" show Compiler;
import "package:angular2/src/core/linker/proto_view_factory.dart"
    show ProtoViewFactory;
import "package:angular2/src/core/reflection/reflection.dart"
    show reflector, ReflectionInfo;
import "package:angular2/src/core/linker/view.dart" show AppProtoView;
import "package:angular2/src/core/linker/compiler.dart" show Compiler_;

main() {
  describe("Compiler", () {
    Compiler compiler;
    var protoViewFactorySpy;
    var someProtoView;
    CompiledHostTemplate cht;
    beforeEachProviders(() {
      protoViewFactorySpy = new SpyProtoViewFactory();
      someProtoView =
          new AppProtoView(null, null, null, null, null, null, null);
      protoViewFactorySpy.spy("createHost").andReturn(someProtoView);
      var factory = provide(ProtoViewFactory, useValue: protoViewFactorySpy);
      var classProvider = provide(Compiler, useClass: Compiler_);
      var providers = [factory, classProvider];
      return providers;
    });
    beforeEach(inject([Compiler], (_compiler) {
      compiler = _compiler;
      cht = new CompiledHostTemplate(
          new CompiledComponentTemplate("aCompId", null, null, null));
      reflector.registerType(SomeComponent, new ReflectionInfo([cht]));
    }));
    it(
        "should read the template from an annotation",
        inject([AsyncTestCompleter], (async) {
          compiler.compileInHost(SomeComponent).then((_) {
            expect(protoViewFactorySpy.spy("createHost"))
                .toHaveBeenCalledWith(cht);
            async.done();
          });
        }));
    it("should clear the cache", () {
      compiler.clearCache();
      expect(protoViewFactorySpy.spy("clearCache")).toHaveBeenCalled();
    });
  });
}

class SomeComponent {}
