library angular2.test.compiler.style_compiler_spec;

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
import "spies.dart" show SpyXHR;
import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, StringWrapper, isArray;
import "package:angular2/src/facade/async.dart" show PromiseWrapper, Future;
import "eval_module.dart" show evalModule;
import "package:angular2/src/compiler/style_compiler.dart" show StyleCompiler;
import "package:angular2/src/compiler/directive_metadata.dart"
    show CompileDirectiveMetadata, CompileTemplateMetadata, CompileTypeMetadata;
import "package:angular2/src/compiler/source_module.dart"
    show SourceExpression, SourceModule;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "test_bindings.dart" show TEST_PROVIDERS;
import "package:angular2/src/compiler/util.dart"
    show codeGenValueFn, codeGenExportVariable, MODULE_SUFFIX;

// Attention: These module names have to correspond to real modules!
var MODULE_URL =
    '''package:angular2/test/compiler/style_compiler_spec${ MODULE_SUFFIX}''';
var IMPORT_ABS_STYLESHEET_URL =
    '''package:angular2/test/compiler/style_compiler_import.css''';
var IMPORT_REL_STYLESHEET_URL = "./style_compiler_import.css";
// Note: Not a real module, only used via mocks.
var IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT =
    '''package:angular2/test/compiler/style_compiler_transitive_import.css''';
main() {
  describe("StyleCompiler", () {
    SpyXHR xhr;
    beforeEachProviders(() {
      xhr = (new SpyXHR() as dynamic);
      return [TEST_PROVIDERS, provide(XHR, useValue: xhr)];
    });
    StyleCompiler compiler;
    beforeEach(inject([StyleCompiler], (_compiler) {
      compiler = _compiler;
    }));
    describe("compileComponentRuntime", () {
      var xhrUrlResults;
      var xhrCount;
      beforeEach(() {
        xhrCount = 0;
        xhrUrlResults = {};
        xhrUrlResults[IMPORT_ABS_STYLESHEET_URL] = "span {color: blue}";
        xhrUrlResults[IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT] =
            '''a {color: green}@import ${ IMPORT_REL_STYLESHEET_URL};''';
      });
      Future<List<String>> compile(List<String> styles,
          List<String> styleAbsUrls, ViewEncapsulation encapsulation) {
        // Note: Can't use MockXHR as the xhr is called recursively,

        // so we can't trigger flush.
        xhr.spy("get").andCallFake((url) {
          var response = xhrUrlResults[url];
          xhrCount++;
          if (isBlank(response)) {
            throw new BaseException('''Unexpected url ${ url}''');
          }
          return PromiseWrapper.resolve(response);
        });
        return compiler.compileComponentRuntime(new CompileTemplateMetadata(
            styles: styles,
            styleUrls: styleAbsUrls,
            encapsulation: encapsulation));
      }
      describe("no shim", () {
        var encapsulation = ViewEncapsulation.None;
        it(
            "should compile plain css rules",
            inject([AsyncTestCompleter], (async) {
              compile(["div {color: red}", "span {color: blue}"], [],
                  encapsulation).then((styles) {
                expect(styles)
                    .toEqual(["div {color: red}", "span {color: blue}"]);
                async.done();
              });
            }));
        it(
            "should allow to import rules",
            inject([AsyncTestCompleter], (async) {
              compile(["div {color: red}"], [IMPORT_ABS_STYLESHEET_URL],
                  encapsulation).then((styles) {
                expect(styles).toEqual([
                  "div {color: red}",
                  ["span {color: blue}"]
                ]);
                async.done();
              });
            }));
        it(
            "should allow to import rules transitively",
            inject([AsyncTestCompleter], (async) {
              compile(
                  ["div {color: red}"],
                  [IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT],
                  encapsulation).then((styles) {
                expect(styles).toEqual([
                  "div {color: red}",
                  [
                    "a {color: green}",
                    ["span {color: blue}"]
                  ]
                ]);
                async.done();
              });
            }));
      });
      describe("with shim", () {
        var encapsulation = ViewEncapsulation.Emulated;
        it(
            "should compile plain css rules",
            inject([AsyncTestCompleter], (async) {
              compile(["div {\ncolor: red;\n}", "span {\ncolor: blue;\n}"], [],
                  encapsulation).then((styles) {
                compareStyles(styles, [
                  "div[_ngcontent-%COMP%] {\ncolor: red;\n}",
                  "span[_ngcontent-%COMP%] {\ncolor: blue;\n}"
                ]);
                async.done();
              });
            }));
        it(
            "should allow to import rules",
            inject([AsyncTestCompleter], (async) {
              compile(["div {\ncolor: red;\n}"], [IMPORT_ABS_STYLESHEET_URL],
                  encapsulation).then((styles) {
                compareStyles(styles, [
                  "div[_ngcontent-%COMP%] {\ncolor: red;\n}",
                  ["span[_ngcontent-%COMP%] {color: blue}"]
                ]);
                async.done();
              });
            }));
        it(
            "should allow to import rules transitively",
            inject([AsyncTestCompleter], (async) {
              compile(
                  ["div {\ncolor: red;\n}"],
                  [IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT],
                  encapsulation).then((styles) {
                compareStyles(styles, [
                  "div[_ngcontent-%COMP%] {\ncolor: red;\n}",
                  [
                    "a[_ngcontent-%COMP%] {color: green}",
                    ["span[_ngcontent-%COMP%] {color: blue}"]
                  ]
                ]);
                async.done();
              });
            }));
      });
      it(
          "should cache stylesheets for parallel requests",
          inject([AsyncTestCompleter], (async) {
            PromiseWrapper.all([
              compile([], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None),
              compile([], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None)
            ]).then((styleArrays) {
              expect(styleArrays[0]).toEqual([
                ["span {color: blue}"]
              ]);
              expect(styleArrays[1]).toEqual([
                ["span {color: blue}"]
              ]);
              expect(xhrCount).toBe(1);
              async.done();
            });
          }));
      it(
          "should cache stylesheets for serial requests",
          inject([AsyncTestCompleter], (async) {
            compile([], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None)
                .then((styles0) {
              xhrUrlResults[IMPORT_ABS_STYLESHEET_URL] = "span {color: black}";
              return compile(
                      [], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None)
                  .then((styles1) {
                expect(styles0).toEqual([
                  ["span {color: blue}"]
                ]);
                expect(styles1).toEqual([
                  ["span {color: blue}"]
                ]);
                expect(xhrCount).toBe(1);
                async.done();
              });
            });
          }));
      it(
          "should allow to clear the cache",
          inject([AsyncTestCompleter], (async) {
            compile([], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None)
                .then((_) {
              compiler.clearCache();
              xhrUrlResults[IMPORT_ABS_STYLESHEET_URL] = "span {color: black}";
              return compile(
                  [], [IMPORT_ABS_STYLESHEET_URL], ViewEncapsulation.None);
            }).then((styles) {
              expect(xhrCount).toBe(2);
              expect(styles).toEqual([
                ["span {color: black}"]
              ]);
              async.done();
            });
          }));
    });
    describe("compileComponentCodeGen", () {
      Future<List<String>> compile(List<String> styles,
          List<String> styleAbsUrls, ViewEncapsulation encapsulation) {
        var sourceExpression = compiler.compileComponentCodeGen(
            new CompileTemplateMetadata(
                styles: styles,
                styleUrls: styleAbsUrls,
                encapsulation: encapsulation));
        var sourceWithImports =
            testableExpression(sourceExpression).getSourceWithImports();
        return evalModule(
            sourceWithImports.source, sourceWithImports.imports, null);
      }
      ;
      describe("no shim", () {
        var encapsulation = ViewEncapsulation.None;
        it(
            "should compile plain css rules",
            inject([AsyncTestCompleter], (async) {
              compile(["div {color: red}", "span {color: blue}"], [],
                  encapsulation).then((styles) {
                expect(styles)
                    .toEqual(["div {color: red}", "span {color: blue}"]);
                async.done();
              });
            }));
        it(
            "should compile css rules with newlines and quotes",
            inject([AsyncTestCompleter], (async) {
              compile(["div\n{\"color\": 'red'}"], [], encapsulation)
                  .then((styles) {
                expect(styles).toEqual(["div\n{\"color\": 'red'}"]);
                async.done();
              });
            }));
        it(
            "should allow to import rules",
            inject([AsyncTestCompleter], (async) {
              compile(["div {color: red}"], [IMPORT_ABS_STYLESHEET_URL],
                  encapsulation).then((styles) {
                expect(styles).toEqual([
                  "div {color: red}",
                  ["span {color: blue}"]
                ]);
                async.done();
              });
            }),
            1000);
      });
      describe("with shim", () {
        var encapsulation = ViewEncapsulation.Emulated;
        it(
            "should compile plain css ruless",
            inject([AsyncTestCompleter], (async) {
              compile(["div {\ncolor: red;\n}", "span {\ncolor: blue;\n}"], [],
                  encapsulation).then((styles) {
                compareStyles(styles, [
                  "div[_ngcontent-%COMP%] {\ncolor: red;\n}",
                  "span[_ngcontent-%COMP%] {\ncolor: blue;\n}"
                ]);
                async.done();
              });
            }));
        it(
            "should allow to import rules",
            inject([AsyncTestCompleter], (async) {
              compile(["div {color: red}"], [IMPORT_ABS_STYLESHEET_URL],
                  encapsulation).then((styles) {
                compareStyles(styles, [
                  "div[_ngcontent-%COMP%] {color: red}",
                  ["span[_ngcontent-%COMP%] {\ncolor: blue;\n}"]
                ]);
                async.done();
              });
            }),
            1000);
      });
    });
    describe("compileStylesheetCodeGen", () {
      Future<List<List<String>>> compile(String style) {
        var sourceModules =
            compiler.compileStylesheetCodeGen(MODULE_URL, style);
        return PromiseWrapper.all(sourceModules.map((sourceModule) {
          var sourceWithImports =
              testableModule(sourceModule).getSourceWithImports();
          return evalModule(
              sourceWithImports.source, sourceWithImports.imports, null);
        }).toList());
      }
      it(
          "should compile plain css rules",
          inject([AsyncTestCompleter], (async) {
            compile("div {color: red;}").then((stylesAndShimStyles) {
              var expected = [
                ["div {color: red;}"],
                ["div[_ngcontent-%COMP%] {color: red;}"]
              ];
              compareStyles(stylesAndShimStyles[0], expected[0]);
              compareStyles(stylesAndShimStyles[1], expected[1]);
              async.done();
            });
          }));
      it(
          "should allow to import rules with relative paths",
          inject([AsyncTestCompleter], (async) {
            compile('''div {color: red}@import ${ IMPORT_REL_STYLESHEET_URL};''')
                .then((stylesAndShimStyles) {
              var expected = [
                [
                  "div {color: red}",
                  ["span {color: blue}"]
                ],
                [
                  "div[_ngcontent-%COMP%] {color: red}",
                  ["span[_ngcontent-%COMP%] {\ncolor: blue;\n}"]
                ]
              ];
              compareStyles(stylesAndShimStyles[0], expected[0]);
              compareStyles(stylesAndShimStyles[1], expected[1]);
              async.done();
            });
          }));
    });
  });
}

SourceModule testableExpression(SourceExpression source) {
  var testableSource = '''${ source . declarations . join ( "\n" )}
  ${ codeGenValueFn ( [ "_" ] , source . expression , "_run" )};
  ${ codeGenExportVariable ( "run" )}_run;''';
  return new SourceModule(null, testableSource);
}

SourceModule testableModule(SourceModule sourceModule) {
  var testableSource = '''${ sourceModule . sourceWithModuleRefs}
  ${ codeGenValueFn ( [ "_" ] , "STYLES" , "_run" )};
  ${ codeGenExportVariable ( "run" )}_run;''';
  return new SourceModule(sourceModule.moduleUrl, testableSource);
}

// Needed for Android browsers which add an extra space at the end of some lines
compareStyles(List<dynamic /* String | List < dynamic > */ > styles,
    List<dynamic /* String | List < dynamic > */ > expectedStyles) {
  expect(styles.length).toEqual(expectedStyles.length);
  for (var i = 0; i < styles.length; i++) {
    var style = styles[i];
    if (isArray(style)) {
      compareStyles(
          (style as List<dynamic>), (expectedStyles[i] as List<dynamic>));
    } else {
      expect(StringWrapper.replaceAll(
              (style as String), new RegExp(r'\s+\n'), "\n"))
          .toEqual(expectedStyles[i]);
    }
  }
}
