library angular2.test.compiler.change_detector_compiler_spec;

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
import "package:angular2/src/core/di.dart" show provide;
import "package:angular2/src/facade/lang.dart" show stringify;
import "package:angular2/src/facade/collection.dart" show MapWrapper;
import "package:angular2/src/facade/async.dart" show Future;
import "package:angular2/src/compiler/change_detector_compiler.dart"
    show ChangeDetectionCompiler;
import "package:angular2/src/compiler/directive_metadata.dart"
    show CompileDirectiveMetadata, CompileTypeMetadata;
import "package:angular2/src/compiler/source_module.dart"
    show SourceModule, SourceExpression, SourceExpressions, moduleRef;
import "package:angular2/src/compiler/template_parser.dart" show TemplateParser;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show
        ChangeDetectorGenConfig,
        ChangeDetectionStrategy,
        ChangeDispatcher,
        DirectiveIndex,
        Locals,
        BindingTarget,
        ChangeDetector;
import "eval_module.dart" show evalModule;
import "test_bindings.dart" show TEST_PROVIDERS;
import "change_detector_mocks.dart" show TestDispatcher, TestPipes;
import "package:angular2/src/compiler/util.dart"
    show codeGenValueFn, codeGenExportVariable, MODULE_SUFFIX;

// Attention: These module names have to correspond to real modules!
var THIS_MODULE_ID = "angular2/test/compiler/change_detector_compiler_spec";
var THIS_MODULE_URL = '''package:${ THIS_MODULE_ID}${ MODULE_SUFFIX}''';
var THIS_MODULE_REF = moduleRef(THIS_MODULE_URL);
main() {
  describe("ChangeDetectorCompiler", () {
    beforeEachProviders(() => TEST_PROVIDERS);
    TemplateParser parser;
    ChangeDetectionCompiler compiler;
    beforeEach(
        inject([TemplateParser, ChangeDetectionCompiler], (_parser, _compiler) {
      parser = _parser;
      compiler = _compiler;
    }));
    describe("compileComponentRuntime", () {
      List<String> detectChanges(
          ChangeDetectionCompiler compiler, String template,
          [List<CompileDirectiveMetadata> directives = const []]) {
        var type = new CompileTypeMetadata(
            name: stringify(SomeComponent), moduleUrl: THIS_MODULE_URL);
        var parsedTemplate = parser.parse(template, directives, "TestComp");
        var factories = compiler.compileComponentRuntime(
            type, ChangeDetectionStrategy.Default, parsedTemplate);
        return testChangeDetector(factories[0]);
      }
      describe("no jit", () {
        beforeEachProviders(() => [
              provide(ChangeDetectorGenConfig,
                  useValue: new ChangeDetectorGenConfig(true, false, false))
            ]);
        it("should watch element properties", () {
          expect(detectChanges(compiler, "<div [elProp]=\"someProp\">"))
              .toEqual(["elementProperty(elProp)=someValue"]);
        });
      });
      describe("jit", () {
        beforeEachProviders(() => [
              provide(ChangeDetectorGenConfig,
                  useValue: new ChangeDetectorGenConfig(true, false, true))
            ]);
        it("should watch element properties", () {
          expect(detectChanges(compiler, "<div [elProp]=\"someProp\">"))
              .toEqual(["elementProperty(elProp)=someValue"]);
        });
      });
    });
    describe("compileComponentCodeGen", () {
      Future<List<String>> detectChanges(
          ChangeDetectionCompiler compiler, String template,
          [List<CompileDirectiveMetadata> directives = const []]) {
        var type = new CompileTypeMetadata(
            name: stringify(SomeComponent), moduleUrl: THIS_MODULE_URL);
        var parsedTemplate = parser.parse(template, directives, "TestComp");
        var sourceExpressions = compiler.compileComponentCodeGen(
            type, ChangeDetectionStrategy.Default, parsedTemplate);
        var testableModule =
            createTestableModule(sourceExpressions, 0).getSourceWithImports();
        return evalModule(testableModule.source, testableModule.imports, null);
      }
      it(
          "should watch element properties",
          inject([AsyncTestCompleter], (async) {
            detectChanges(compiler, "<div [elProp]=\"someProp\">")
                .then((value) {
              expect(value).toEqual(["elementProperty(elProp)=someValue"]);
              async.done();
            });
          }));
    });
  });
}

SourceModule createTestableModule(
    SourceExpressions source, num changeDetectorIndex) {
  var resultExpression =
      '''${ THIS_MODULE_REF}testChangeDetector(([${ source . expressions . join ( "," )}])[${ changeDetectorIndex}])''';
  var testableSource = '''${ source . declarations . join ( "\n" )}
  ${ codeGenValueFn ( [ "_" ] , resultExpression , "_run" )};
  ${ codeGenExportVariable ( "run" )}_run;''';
  return new SourceModule(null, testableSource);
}

List<String> testChangeDetector(Function changeDetectorFactory) {
  var dispatcher = new TestDispatcher([], []);
  var cd = changeDetectorFactory(dispatcher);
  var ctx = new SomeComponent();
  ctx.someProp = "someValue";
  var locals =
      new Locals(null, MapWrapper.createFromStringMap({"someVar": null}));
  cd.hydrate(ctx, locals, dispatcher, new TestPipes());
  cd.detectChanges();
  return dispatcher.log;
}

class SomeComponent {
  String someProp;
}
