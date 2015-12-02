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
import "../core/spies.dart" show SpyProtoViewFactory;
import "package:angular2/src/core/linker/template_commands.dart"
    show CompiledHostTemplate, CompiledComponentTemplate, BeginComponentCmd;
import "package:angular2/src/compiler/runtime_compiler.dart"
    show RuntimeCompiler;
import "package:angular2/src/core/linker/proto_view_factory.dart"
    show ProtoViewFactory;
import "package:angular2/src/core/linker/view.dart" show AppProtoView;

main() {
  describe("RuntimeCompiler", () {
    RuntimeCompiler compiler;
    beforeEach(inject([RuntimeCompiler], (_compiler) {
      compiler = _compiler;
    }));
    describe("compileInHost", () {
      var protoViewFactorySpy;
      var someProtoView;
      beforeEachProviders(() {
        protoViewFactorySpy = new SpyProtoViewFactory();
        someProtoView =
            new AppProtoView(null, null, null, null, null, null, null);
        protoViewFactorySpy.spy("createHost").andReturn(someProtoView);
        return [provide(ProtoViewFactory, useValue: protoViewFactorySpy)];
      });
      it(
          "should compile the template via TemplateCompiler",
          inject([AsyncTestCompleter], (async) {
            CompiledHostTemplate cht;
            protoViewFactorySpy.spy("createHost").andCallFake((_cht) {
              cht = _cht;
              return someProtoView;
            });
            compiler.compileInHost(SomeComponent).then((_) {
              var beginComponentCmd =
                  (cht.template.commands[0] as BeginComponentCmd);
              expect(beginComponentCmd.name).toEqual("some-comp");
              async.done();
            });
          }));
    });
    it(
        "should cache the result",
        inject([AsyncTestCompleter], (async) {
          PromiseWrapper.all([
            compiler.compileInHost(SomeComponent),
            compiler.compileInHost(SomeComponent)
          ]).then((protoViewRefs) {
            expect(protoViewRefs[0]).toBe(protoViewRefs[1]);
            async.done();
          });
        }));
    it(
        "should clear the cache",
        inject([AsyncTestCompleter], (async) {
          compiler.compileInHost(SomeComponent).then((protoViewRef1) {
            compiler.clearCache();
            compiler.compileInHost(SomeComponent).then((protoViewRef2) {
              expect(protoViewRef1).not.toBe(protoViewRef2);
              async.done();
            });
          });
        }));
  });
}

@Component(selector: "some-comp")
@View(template: "")
class SomeComponent {}
