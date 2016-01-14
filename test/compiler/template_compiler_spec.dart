library angular2.test.compiler.template_compiler_spec;

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
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/facade/lang.dart"
    show Type, isPresent, isBlank, stringify, isString;
import "package:angular2/src/facade/collection.dart"
    show MapWrapper, SetWrapper, ListWrapper, StringMapWrapper;
import "package:angular2/src/compiler/runtime_metadata.dart"
    show RuntimeMetadataResolver;
import "package:angular2/src/compiler/template_compiler.dart"
    show TemplateCompiler, NormalizedComponentWithViewDirectives;
import "package:angular2/src/compiler/directive_metadata.dart"
    show CompileDirectiveMetadata;
import "eval_module.dart" show evalModule;
import "package:angular2/src/compiler/source_module.dart"
    show SourceModule, moduleRef;
import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/compiler/xhr_mock.dart" show MockXHR;
import "../core/spies.dart"
    show SpyRootRenderer, SpyRenderer, SpyAppViewManager;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "package:angular2/src/core/linker/view.dart" show AppView, AppProtoView;
import "package:angular2/src/core/linker/element.dart" show AppElement;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show Locals, ChangeDetectorGenConfig;
import "package:angular2/core.dart"
    show Component, View, Directive, provide, RenderComponentType;
import "test_bindings.dart" show TEST_PROVIDERS;
import "package:angular2/src/compiler/util.dart"
    show codeGenValueFn, codeGenFnHeader, codeGenExportVariable, MODULE_SUFFIX;
import "package:angular2/core.dart"
    show PipeTransform, WrappedValue, Injectable, Pipe;

// Attention: This path has to point to this test file!
const THIS_MODULE_ID = "angular2/test/compiler/template_compiler_spec";
var THIS_MODULE_REF =
    moduleRef('''package:${ THIS_MODULE_ID}${ MODULE_SUFFIX}''');
var REFLECTOR_MODULE_REF = moduleRef(
    '''package:angular2/src/core/reflection/reflection${ MODULE_SUFFIX}''');
var REFLECTION_CAPS_MODULE_REF = moduleRef(
    '''package:angular2/src/core/reflection/reflection_capabilities${ MODULE_SUFFIX}''');
main() {
  describe("TemplateCompiler", () {
    TemplateCompiler compiler;
    RuntimeMetadataResolver runtimeMetadataResolver;
    beforeEachProviders(() => TEST_PROVIDERS);
    beforeEach(inject([TemplateCompiler, RuntimeMetadataResolver],
        (_compiler, _runtimeMetadataResolver) {
      compiler = _compiler;
      runtimeMetadataResolver = _runtimeMetadataResolver;
    }));
    describe("compile templates", () {
      runTests(compile) {
        it(
            "should throw for non components",
            inject([AsyncTestCompleter], (async) {
              PromiseWrapper.catchError(
                  PromiseWrapper.wrap(() => compile([NonComponent])), (error) {
                expect(error.message).toEqual(
                    '''Could not compile \'${ stringify ( NonComponent )}\' because it is not a component.''');
                async.done();
              });
            }));
        it(
            "should compile host components",
            inject([AsyncTestCompleter], (async) {
              compile([CompWithBindingsAndStylesAndPipes])
                  .then((humanizedView) {
                expect(humanizedView["styles"]).toEqual([]);
                expect(humanizedView["elements"]).toEqual(["<comp-a>"]);
                expect(humanizedView["pipes"]).toEqual({});
                expect(humanizedView["cd"])
                    .toEqual(["prop(title)=someHostValue"]);
                async.done();
              });
            }));
        it(
            "should compile nested components",
            inject([AsyncTestCompleter], (async) {
              compile([CompWithBindingsAndStylesAndPipes])
                  .then((humanizedView) {
                var componentView = humanizedView["componentViews"][0];
                expect(componentView["styles"]).toEqual(["div {color: red}"]);
                expect(componentView["elements"]).toEqual(["<a>"]);
                expect(componentView["pipes"])
                    .toEqual({"uppercase": stringify(UpperCasePipe)});
                expect(componentView["cd"])
                    .toEqual(["prop(href)=SOMECTXVALUE"]);
                async.done();
              });
            }));
        it(
            "should compile components at various nesting levels",
            inject([AsyncTestCompleter], (async) {
              compile([CompWith2NestedComps, Comp1, Comp2])
                  .then((humanizedView) {
                expect(humanizedView["elements"])
                    .toEqual(["<comp-with-2nested>"]);
                expect(humanizedView["componentViews"][0]["elements"])
                    .toEqual(["<comp1>", "<comp2>"]);
                expect(humanizedView["componentViews"][0]["componentViews"][0]
                    ["elements"]).toEqual(["<a>", "<comp2>"]);
                expect(humanizedView["componentViews"][0]["componentViews"][1]
                    ["elements"]).toEqual(["<b>"]);
                async.done();
              });
            }));
        it(
            "should compile recursive components",
            inject([AsyncTestCompleter], (async) {
              compile([TreeComp]).then((humanizedView) {
                expect(humanizedView["elements"]).toEqual(["<tree>"]);
                expect(humanizedView["componentViews"][0]["embeddedViews"][0]
                    ["elements"]).toEqual(["<tree>"]);
                expect(humanizedView["componentViews"][0]["embeddedViews"][0]
                        ["componentViews"][0]["embeddedViews"][0]["elements"])
                    .toEqual(["<tree>"]);
                async.done();
              });
            }));
        it(
            "should compile embedded templates",
            inject([AsyncTestCompleter], (async) {
              compile([CompWithEmbeddedTemplate]).then((humanizedView) {
                var embeddedView = humanizedView["componentViews"][0]
                    ["embeddedViews"][0];
                expect(embeddedView["elements"]).toEqual(["<a>"]);
                expect(embeddedView["cd"])
                    .toEqual(["prop(href)=someEmbeddedValue"]);
                async.done();
              });
            }));
        it(
            "should dedup directives",
            inject([AsyncTestCompleter], (async) {
              compile([CompWithDupDirectives, TreeComp]).then((humanizedView) {
                expect(humanizedView["componentViews"][0]["componentViews"]
                    .length).toBe(1);
                async.done();
              });
            }));
      }
      describe("compileHostComponentRuntime", () {
        Future<List<dynamic>> compile(List<Type> components) {
          return compiler.compileHostComponentRuntime(components[0]).then(
              (compiledHostTemplate) =>
                  humanizeViewFactory(compiledHostTemplate.viewFactory));
        }
        describe("no jit", () {
          beforeEachProviders(() => [
                provide(ChangeDetectorGenConfig,
                    useValue: new ChangeDetectorGenConfig(true, false, false))
              ]);
          runTests(compile);
        });
        describe("jit", () {
          beforeEachProviders(() => [
                provide(ChangeDetectorGenConfig,
                    useValue: new ChangeDetectorGenConfig(true, false, true))
              ]);
          runTests(compile);
        });
        it(
            "should cache components for parallel requests",
            inject([AsyncTestCompleter, XHR], (async, MockXHR xhr) {
              // Expecting only one xhr...
              xhr.expect(
                  "package:angular2/test/compiler/compUrl.html", "<a></a>");
              PromiseWrapper.all([
                compile([CompWithTemplateUrl]),
                compile([CompWithTemplateUrl])
              ]).then((humanizedViews) {
                expect(humanizedViews[0]["componentViews"][0]["elements"])
                    .toEqual(["<a>"]);
                expect(humanizedViews[1]["componentViews"][0]["elements"])
                    .toEqual(["<a>"]);
                async.done();
              });
              xhr.flush();
            }));
        it(
            "should cache components for sequential requests",
            inject([AsyncTestCompleter, XHR], (async, MockXHR xhr) {
              // Expecting only one xhr...
              xhr.expect("package:angular2/test/compiler/compUrl.html", "<a>");
              compile([CompWithTemplateUrl]).then((humanizedView0) {
                return compile([CompWithTemplateUrl]).then((humanizedView1) {
                  expect(humanizedView0["componentViews"][0]["elements"])
                      .toEqual(["<a>"]);
                  expect(humanizedView1["componentViews"][0]["elements"])
                      .toEqual(["<a>"]);
                  async.done();
                });
              });
              xhr.flush();
            }));
        it(
            "should allow to clear the cache",
            inject([AsyncTestCompleter, XHR], (async, MockXHR xhr) {
              xhr.expect("package:angular2/test/compiler/compUrl.html", "<a>");
              compile([CompWithTemplateUrl]).then((humanizedView) {
                compiler.clearCache();
                xhr.expect(
                    "package:angular2/test/compiler/compUrl.html", "<b>");
                var result = compile([CompWithTemplateUrl]);
                xhr.flush();
                return result;
              }).then((humanizedView) {
                expect(humanizedView["componentViews"][0]["elements"])
                    .toEqual(["<b>"]);
                async.done();
              });
              xhr.flush();
            }));
      });
      describe("compileTemplatesCodeGen", () {
        Future<NormalizedComponentWithViewDirectives> normalizeComponent(
            Type component) {
          var compAndViewDirMetas = (new List.from(
              [runtimeMetadataResolver.getDirectiveMetadata(component)])
            ..addAll(
                runtimeMetadataResolver.getViewDirectivesMetadata(component)));
          var upperCasePipeMeta =
              runtimeMetadataResolver.getPipeMetadata(UpperCasePipe);
          upperCasePipeMeta.type.moduleUrl =
              '''package:${ THIS_MODULE_ID}${ MODULE_SUFFIX}''';
          return PromiseWrapper
              .all(compAndViewDirMetas
                  .map((meta) => compiler.normalizeDirectiveMetadata(meta))
                  .toList())
              .then((List<
                      CompileDirectiveMetadata> normalizedCompAndViewDirMetas) =>
                  new NormalizedComponentWithViewDirectives(
                      normalizedCompAndViewDirMetas[0],
                      ListWrapper.slice(normalizedCompAndViewDirMetas, 1),
                      [upperCasePipeMeta]));
        }
        Future<List<dynamic>> compile(List<Type> components) {
          return PromiseWrapper
              .all(components.map(normalizeComponent).toList())
              .then((List<
                  NormalizedComponentWithViewDirectives> normalizedCompWithViewDirMetas) {
            var sourceModule = compiler
                .compileTemplatesCodeGen(normalizedCompWithViewDirMetas);
            var sourceWithImports = testableTemplateModule(
                    sourceModule, normalizedCompWithViewDirMetas[0].component)
                .getSourceWithImports();
            return evalModule(
                sourceWithImports.source, sourceWithImports.imports, null);
          });
        }
        runTests(compile);
      });
    });
    describe("normalizeDirectiveMetadata", () {
      it(
          "should return the given DirectiveMetadata for non components",
          inject([AsyncTestCompleter], (async) {
            var meta =
                runtimeMetadataResolver.getDirectiveMetadata(NonComponent);
            compiler.normalizeDirectiveMetadata(meta).then((normMeta) {
              expect(normMeta).toBe(meta);
              async.done();
            });
          }));
      it(
          "should normalize the template",
          inject([AsyncTestCompleter, XHR], (async, MockXHR xhr) {
            xhr.expect("package:angular2/test/compiler/compUrl.html",
                "loadedTemplate");
            compiler
                .normalizeDirectiveMetadata(runtimeMetadataResolver
                    .getDirectiveMetadata(CompWithTemplateUrl))
                .then((CompileDirectiveMetadata meta) {
              expect(meta.template.template).toEqual("loadedTemplate");
              async.done();
            });
            xhr.flush();
          }));
      it(
          "should copy all the other fields",
          inject([AsyncTestCompleter], (async) {
            var meta = runtimeMetadataResolver
                .getDirectiveMetadata(CompWithBindingsAndStylesAndPipes);
            compiler
                .normalizeDirectiveMetadata(meta)
                .then((CompileDirectiveMetadata normMeta) {
              expect(normMeta.type).toEqual(meta.type);
              expect(normMeta.isComponent).toEqual(meta.isComponent);
              expect(normMeta.dynamicLoadable).toEqual(meta.dynamicLoadable);
              expect(normMeta.selector).toEqual(meta.selector);
              expect(normMeta.exportAs).toEqual(meta.exportAs);
              expect(normMeta.changeDetection).toEqual(meta.changeDetection);
              expect(normMeta.inputs).toEqual(meta.inputs);
              expect(normMeta.outputs).toEqual(meta.outputs);
              expect(normMeta.hostListeners).toEqual(meta.hostListeners);
              expect(normMeta.hostProperties).toEqual(meta.hostProperties);
              expect(normMeta.hostAttributes).toEqual(meta.hostAttributes);
              expect(normMeta.lifecycleHooks).toEqual(meta.lifecycleHooks);
              async.done();
            });
          }));
    });
    describe("compileStylesheetCodeGen", () {
      it(
          "should compile stylesheets into code",
          inject([AsyncTestCompleter], (async) {
            var cssText = "div {color: red}";
            var sourceModule = compiler.compileStylesheetCodeGen(
                "package:someModuleUrl", cssText)[0];
            var sourceWithImports =
                testableStylesModule(sourceModule).getSourceWithImports();
            evalModule(
                    sourceWithImports.source, sourceWithImports.imports, null)
                .then((loadedCssText) {
              expect(loadedCssText).toEqual([cssText]);
              async.done();
            });
          }));
    });
  });
}

@Pipe(name: "uppercase")
@Injectable()
class UpperCasePipe implements PipeTransform {
  String transform(String value, [List<dynamic> args = null]) {
    return value.toUpperCase();
  }
}

@Component(
    selector: "comp-a",
    host: const {"[title]": "'someHostValue'"},
    moduleId: THIS_MODULE_ID,
    exportAs: "someExportAs")
@View(
    template: "<a [href]=\"'someCtxValue' | uppercase\"></a>",
    styles: const ["div {color: red}"],
    encapsulation: ViewEncapsulation.None,
    pipes: const [UpperCasePipe])
class CompWithBindingsAndStylesAndPipes {}

@Component(selector: "tree", moduleId: THIS_MODULE_ID)
@View(
    template: "<template><tree></tree></template>",
    directives: const [TreeComp],
    encapsulation: ViewEncapsulation.None)
class TreeComp {}

@Component(selector: "comp-wit-dup-tpl", moduleId: THIS_MODULE_ID)
@View(
    template: "<tree></tree>",
    directives: const [TreeComp, TreeComp],
    encapsulation: ViewEncapsulation.None)
class CompWithDupDirectives {}

@Component(selector: "comp-url", moduleId: THIS_MODULE_ID)
@View(templateUrl: "compUrl.html", encapsulation: ViewEncapsulation.None)
class CompWithTemplateUrl {}

@Component(selector: "comp-tpl", moduleId: THIS_MODULE_ID)
@View(
    template: "<template><a [href]=\"'someEmbeddedValue'\"></a></template>",
    encapsulation: ViewEncapsulation.None)
class CompWithEmbeddedTemplate {}

@Directive(selector: "plain")
@View(template: "")
class NonComponent {}

@Component(selector: "comp2", moduleId: THIS_MODULE_ID)
@View(template: "<b></b>", encapsulation: ViewEncapsulation.None)
class Comp2 {}

@Component(selector: "comp1", moduleId: THIS_MODULE_ID)
@View(
    template: "<a></a>, <comp2></comp2>",
    encapsulation: ViewEncapsulation.None,
    directives: const [Comp2])
class Comp1 {}

@Component(selector: "comp-with-2nested", moduleId: THIS_MODULE_ID)
@View(
    template: "<comp1></comp1>, <comp2></comp2>",
    encapsulation: ViewEncapsulation.None,
    directives: const [Comp1, Comp2])
class CompWith2NestedComps {}

SourceModule testableTemplateModule(
    SourceModule sourceModule, CompileDirectiveMetadata normComp) {
  var testableSource = '''
  ${ sourceModule . sourceWithModuleRefs}
  ${ codeGenFnHeader ( [ "_" ] , "_run" )}{
    ${ REFLECTOR_MODULE_REF}reflector.reflectionCapabilities = new ${ REFLECTION_CAPS_MODULE_REF}ReflectionCapabilities();
    return ${ THIS_MODULE_REF}humanizeViewFactory(hostViewFactory_${ normComp . type . name}.viewFactory);
  }
  ${ codeGenExportVariable ( "run" )}_run;''';
  return new SourceModule(sourceModule.moduleUrl, testableSource);
}

SourceModule testableStylesModule(SourceModule sourceModule) {
  var testableSource = '''${ sourceModule . sourceWithModuleRefs}
  ${ codeGenValueFn ( [ "_" ] , "STYLES" , "_run" )};
  ${ codeGenExportVariable ( "run" )}_run;''';
  return new SourceModule(sourceModule.moduleUrl, testableSource);
}

Map<String, dynamic> humanizeView(
    AppView view, Map<AppProtoView, dynamic> cachedResults) {
  var result = cachedResults[view.proto];
  if (isPresent(result)) {
    return result;
  }
  result = {};
  // fill the cache early to break cycles.
  cachedResults[view.proto] = result;
  view.changeDetector.detectChanges();
  var pipes = {};
  if (isPresent(view.proto.protoPipes)) {
    StringMapWrapper.forEach(view.proto.protoPipes.config,
        (pipeProvider, pipeName) {
      pipes[pipeName] = stringify(pipeProvider.key.token);
    });
  }
  var componentViews = [];
  var embeddedViews = [];
  view.appElements.forEach((appElement) {
    if (isPresent(appElement.componentView)) {
      componentViews.add(humanizeView(appElement.componentView, cachedResults));
    } else if (isPresent(appElement.embeddedViewFactory)) {
      embeddedViews.add(humanizeViewFactory(
          appElement.embeddedViewFactory, appElement, cachedResults));
    }
  });
  result["styles"] = ((view.renderer as dynamic)).styles;
  result["elements"] = ((view.renderer as dynamic)).elements;
  result["pipes"] = pipes;
  result["cd"] = ((view.renderer as dynamic)).props;
  result["componentViews"] = componentViews;
  result["embeddedViews"] = embeddedViews;
  return result;
}

// Attention: read by eval!
Map<String, dynamic> humanizeViewFactory(Function viewFactory,
    [AppElement containerAppElement = null,
    Map<AppProtoView, dynamic> cachedResults = null]) {
  if (isBlank(cachedResults)) {
    cachedResults = new Map<AppProtoView, dynamic>();
  }
  var viewManager = new SpyAppViewManager();
  viewManager.spy("createRenderComponentType").andCallFake(
      (ViewEncapsulation encapsulation,
          List<dynamic /* String | List < dynamic > */ > styles) {
    return new RenderComponentType("someId", encapsulation, styles);
  });
  AppView view = viewFactory(new RecordingRenderer([]), viewManager,
      containerAppElement, [], null, null, null);
  return humanizeView(view, cachedResults);
}

class RecordingRenderer extends SpyRenderer {
  List<String> styles;
  List<String> props = [];
  List<String> elements = [];
  RecordingRenderer(this.styles) : super() {
    /* super call moved to initializer */;
    this.spy("renderComponent").andCallFake(
        (componentProto) => new RecordingRenderer(componentProto.styles));
    this.spy("setElementProperty").andCallFake((el, prop, value) {
      this.props.add('''prop(${ prop})=${ value}''');
    });
    this.spy("createElement").andCallFake((parent, elName) {
      this.elements.add('''<${ elName}>''');
    });
  }
}
