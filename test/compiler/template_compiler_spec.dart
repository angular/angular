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
    show MapWrapper, SetWrapper, ListWrapper;
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
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show Locals;
import "package:angular2/src/core/linker/template_commands.dart"
    show
        CommandVisitor,
        TextCmd,
        NgContentCmd,
        BeginElementCmd,
        BeginComponentCmd,
        EmbeddedTemplateCmd,
        TemplateCmd,
        visitAllCommands,
        CompiledComponentTemplate;
import "package:angular2/core.dart" show Component, View, Directive, provide;
import "test_bindings.dart" show TEST_PROVIDERS;
import "change_detector_mocks.dart" show TestDispatcher, TestPipes;
import "package:angular2/src/compiler/util.dart"
    show codeGenValueFn, codeGenExportVariable, MODULE_SUFFIX;

// Attention: This path has to point to this test file!
const THIS_MODULE_ID = "angular2/test/compiler/template_compiler_spec";
var THIS_MODULE_REF =
    moduleRef('''package:${ THIS_MODULE_ID}${ MODULE_SUFFIX}''');
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
              compile([CompWithBindingsAndStyles]).then((humanizedTemplate) {
                expect(humanizedTemplate["styles"]).toEqual([]);
                expect(humanizedTemplate["commands"][0]).toEqual("<comp-a>");
                expect(humanizedTemplate["cd"])
                    .toEqual(["elementProperty(title)=someDirValue"]);
                async.done();
              });
            }));
        it(
            "should compile nested components",
            inject([AsyncTestCompleter], (async) {
              compile([CompWithBindingsAndStyles]).then((humanizedTemplate) {
                var nestedTemplate = humanizedTemplate["commands"][1];
                expect(nestedTemplate["styles"]).toEqual(["div {color: red}"]);
                expect(nestedTemplate["commands"][0]).toEqual("<a>");
                expect(nestedTemplate["cd"])
                    .toEqual(["elementProperty(href)=someCtxValue"]);
                async.done();
              });
            }));
        it(
            "should compile recursive components",
            inject([AsyncTestCompleter], (async) {
              compile([TreeComp]).then((humanizedTemplate) {
                expect(humanizedTemplate["commands"][0]).toEqual("<tree>");
                expect(humanizedTemplate["commands"][1]["commands"][0])
                    .toEqual("<tree>");
                expect(humanizedTemplate["commands"][1]["commands"][1]
                    ["commands"][0]).toEqual("<tree>");
                async.done();
              });
            }));
        it(
            "should pass the right change detector to embedded templates",
            inject([AsyncTestCompleter], (async) {
              compile([CompWithEmbeddedTemplate]).then((humanizedTemplate) {
                expect(humanizedTemplate["commands"][1]["commands"][0])
                    .toEqual("<template>");
                expect(humanizedTemplate["commands"][1]["commands"][1]["cd"])
                    .toEqual(["elementProperty(href)=someCtxValue"]);
                async.done();
              });
            }));
        it(
            "should dedup directives",
            inject([AsyncTestCompleter], (async) {
              compile([CompWithDupDirectives, TreeComp])
                  .then((humanizedTemplate) {
                expect(humanizedTemplate["commands"][1]["commands"][0])
                    .toEqual("<tree>");
                async.done();
              });
            }));
      }
      describe("compileHostComponentRuntime", () {
        Future<List<dynamic>> compile(List<Type> components) {
          return compiler.compileHostComponentRuntime(components[0]).then(
              (compiledHostTemplate) =>
                  humanizeTemplate(compiledHostTemplate.template));
        }
        runTests(compile);
        it(
            "should cache components for parallel requests",
            inject([AsyncTestCompleter, XHR], (async, MockXHR xhr) {
              xhr.expect("package:angular2/test/compiler/compUrl.html", "a");
              PromiseWrapper.all([
                compile([CompWithTemplateUrl]),
                compile([CompWithTemplateUrl])
              ]).then((humanizedTemplates) {
                expect(humanizedTemplates[0]["commands"][1]["commands"])
                    .toEqual(["#text(a)"]);
                expect(humanizedTemplates[1]["commands"][1]["commands"])
                    .toEqual(["#text(a)"]);
                async.done();
              });
              xhr.flush();
            }));
        it(
            "should cache components for sequential requests",
            inject([AsyncTestCompleter, XHR], (async, MockXHR xhr) {
              xhr.expect("package:angular2/test/compiler/compUrl.html", "a");
              compile([CompWithTemplateUrl]).then((humanizedTemplate0) {
                return compile([CompWithTemplateUrl])
                    .then((humanizedTemplate1) {
                  expect(humanizedTemplate0["commands"][1]["commands"])
                      .toEqual(["#text(a)"]);
                  expect(humanizedTemplate1["commands"][1]["commands"])
                      .toEqual(["#text(a)"]);
                  async.done();
                });
              });
              xhr.flush();
            }));
        it(
            "should allow to clear the cache",
            inject([AsyncTestCompleter, XHR], (async, MockXHR xhr) {
              xhr.expect("package:angular2/test/compiler/compUrl.html", "a");
              compile([CompWithTemplateUrl]).then((humanizedTemplate) {
                compiler.clearCache();
                xhr.expect("package:angular2/test/compiler/compUrl.html", "b");
                var result = compile([CompWithTemplateUrl]);
                xhr.flush();
                return result;
              }).then((humanizedTemplate) {
                expect(humanizedTemplate["commands"][1]["commands"])
                    .toEqual(["#text(b)"]);
                async.done();
              });
              xhr.flush();
            }));
      });
      describe("compileTemplatesCodeGen", () {
        Future<NormalizedComponentWithViewDirectives> normalizeComponent(
            Type component) {
          var compAndViewDirMetas = (new List.from(
              [runtimeMetadataResolver.getMetadata(component)])
            ..addAll(
                runtimeMetadataResolver.getViewDirectivesMetadata(component)));
          return PromiseWrapper
              .all(compAndViewDirMetas
                  .map((meta) => compiler.normalizeDirectiveMetadata(meta))
                  .toList())
              .then((List<
                      CompileDirectiveMetadata> normalizedCompAndViewDirMetas) =>
                  new NormalizedComponentWithViewDirectives(
                      normalizedCompAndViewDirMetas[0],
                      ListWrapper.slice(normalizedCompAndViewDirMetas, 1)));
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
            var meta = runtimeMetadataResolver.getMetadata(NonComponent);
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
                .normalizeDirectiveMetadata(
                    runtimeMetadataResolver.getMetadata(CompWithTemplateUrl))
                .then((CompileDirectiveMetadata meta) {
              expect(meta.template.template).toEqual("loadedTemplate");
              async.done();
            });
            xhr.flush();
          }));
      it(
          "should copy all the other fields",
          inject([AsyncTestCompleter], (async) {
            var meta =
                runtimeMetadataResolver.getMetadata(CompWithBindingsAndStyles);
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

@Component(
    selector: "comp-a",
    host: const {"[title]": "someProp"},
    moduleId: THIS_MODULE_ID,
    exportAs: "someExportAs")
@View(
    template: "<a [href]=\"someProp\"></a>",
    styles: const ["div {color: red}"],
    encapsulation: ViewEncapsulation.None)
class CompWithBindingsAndStyles {}

@Component(selector: "tree", moduleId: THIS_MODULE_ID)
@View(
    template: "<tree></tree>",
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
    template: "<template><a [href]=\"someProp\"></a></template>",
    encapsulation: ViewEncapsulation.None)
class CompWithEmbeddedTemplate {}

@Directive(selector: "plain")
@View(template: "")
class NonComponent {}

SourceModule testableTemplateModule(
    SourceModule sourceModule, CompileDirectiveMetadata normComp) {
  var resultExpression =
      '''${ THIS_MODULE_REF}humanizeTemplate(Host${ normComp . type . name}Template.template)''';
  var testableSource = '''${ sourceModule . sourceWithModuleRefs}
  ${ codeGenValueFn ( [ "_" ] , resultExpression , "_run" )};
  ${ codeGenExportVariable ( "run" )}_run;''';
  return new SourceModule(sourceModule.moduleUrl, testableSource);
}

SourceModule testableStylesModule(SourceModule sourceModule) {
  var testableSource = '''${ sourceModule . sourceWithModuleRefs}
  ${ codeGenValueFn ( [ "_" ] , "STYLES" , "_run" )};
  ${ codeGenExportVariable ( "run" )}_run;''';
  return new SourceModule(sourceModule.moduleUrl, testableSource);
}

// Attention: read by eval!
Map<String, dynamic> humanizeTemplate(CompiledComponentTemplate template,
    [Map<String, Map<String, dynamic>> humanizedTemplates = null]) {
  if (isBlank(humanizedTemplates)) {
    humanizedTemplates = new Map<String, Map<String, dynamic>>();
  }
  var result = humanizedTemplates[template.id];
  if (isPresent(result)) {
    return result;
  }
  var commands = [];
  result = {
    "styles": template.styles,
    "commands": commands,
    "cd": testChangeDetector(template.changeDetectorFactory)
  };
  humanizedTemplates[template.id] = result;
  visitAllCommands(
      new CommandHumanizer(commands, humanizedTemplates), template.commands);
  return result;
}

class TestContext
    implements
        CompWithBindingsAndStyles,
        TreeComp,
        CompWithTemplateUrl,
        CompWithEmbeddedTemplate,
        CompWithDupDirectives {
  String someProp;
}

List<String> testChangeDetector(Function changeDetectorFactory) {
  var ctx = new TestContext();
  ctx.someProp = "someCtxValue";
  var dir1 = new TestContext();
  dir1.someProp = "someDirValue";
  var dispatcher = new TestDispatcher([dir1], []);
  var cd = changeDetectorFactory(dispatcher);
  var locals =
      new Locals(null, MapWrapper.createFromStringMap({"someVar": null}));
  cd.hydrate(ctx, locals, dispatcher, new TestPipes());
  cd.detectChanges();
  return dispatcher.log;
}

class CommandHumanizer implements CommandVisitor {
  List<dynamic> result;
  Map<String, Map<String, dynamic>> humanizedTemplates;
  CommandHumanizer(this.result, this.humanizedTemplates) {}
  dynamic visitText(TextCmd cmd, dynamic context) {
    this.result.add('''#text(${ cmd . value})''');
    return null;
  }

  dynamic visitNgContent(NgContentCmd cmd, dynamic context) {
    return null;
  }

  dynamic visitBeginElement(BeginElementCmd cmd, dynamic context) {
    this.result.add('''<${ cmd . name}>''');
    return null;
  }

  dynamic visitEndElement(dynamic context) {
    this.result.add("</>");
    return null;
  }

  dynamic visitBeginComponent(BeginComponentCmd cmd, dynamic context) {
    this.result.add('''<${ cmd . name}>''');
    this
        .result
        .add(humanizeTemplate(cmd.templateGetter(), this.humanizedTemplates));
    return null;
  }

  dynamic visitEndComponent(dynamic context) {
    return this.visitEndElement(context);
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateCmd cmd, dynamic context) {
    this.result.add('''<template>''');
    this.result.add({"cd": testChangeDetector(cmd.changeDetectorFactory)});
    this.result.add('''</template>''');
    return null;
  }
}
