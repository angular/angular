var testing_internal_1 = require('angular2/testing_internal');
var di_1 = require('angular2/src/core/di');
var spies_1 = require('./spies');
var xhr_1 = require('angular2/src/compiler/xhr');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var eval_module_1 = require('./eval_module');
var style_compiler_1 = require('angular2/src/compiler/style_compiler');
var directive_metadata_1 = require('angular2/src/compiler/directive_metadata');
var source_module_1 = require('angular2/src/compiler/source_module');
var view_1 = require('angular2/src/core/metadata/view');
var test_bindings_1 = require('./test_bindings');
var util_1 = require('angular2/src/compiler/util');
// Attention: These module names have to correspond to real modules!
var MODULE_URL = "package:angular2/test/compiler/style_compiler_spec" + util_1.MODULE_SUFFIX;
var IMPORT_ABS_STYLESHEET_URL = "package:angular2/test/compiler/style_compiler_import.css";
var IMPORT_REL_STYLESHEET_URL = './style_compiler_import.css';
// Note: Not a real module, only used via mocks.
var IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT = "package:angular2/test/compiler/style_compiler_transitive_import.css";
function main() {
    testing_internal_1.describe('StyleCompiler', function () {
        var xhr;
        testing_internal_1.beforeEachBindings(function () {
            xhr = new spies_1.SpyXHR();
            return [test_bindings_1.TEST_PROVIDERS, di_1.provide(xhr_1.XHR, { useValue: xhr })];
        });
        var compiler;
        testing_internal_1.beforeEach(testing_internal_1.inject([style_compiler_1.StyleCompiler], function (_compiler) { compiler = _compiler; }));
        testing_internal_1.describe('compileComponentRuntime', function () {
            var xhrUrlResults;
            var xhrCount;
            testing_internal_1.beforeEach(function () {
                xhrCount = 0;
                xhrUrlResults = {};
                xhrUrlResults[IMPORT_ABS_STYLESHEET_URL] = 'span {color: blue}';
                xhrUrlResults[IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT] =
                    "a {color: green}@import " + IMPORT_REL_STYLESHEET_URL + ";";
            });
            function compile(styles, styleAbsUrls, encapsulation) {
                // Note: Can't use MockXHR as the xhr is called recursively,
                // so we can't trigger flush.
                xhr.spy('get').andCallFake(function (url) {
                    var response = xhrUrlResults[url];
                    xhrCount++;
                    if (lang_1.isBlank(response)) {
                        throw new exceptions_1.BaseException("Unexpected url " + url);
                    }
                    return async_1.PromiseWrapper.resolve(response);
                });
                return compiler.compileComponentRuntime(new directive_metadata_1.CompileTemplateMetadata({ styles: styles, styleUrls: styleAbsUrls, encapsulation: encapsulation }));
            }
            testing_internal_1.describe('no shim', function () {
                var encapsulation = view_1.ViewEncapsulation.None;
                testing_internal_1.it('should compile plain css rules', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div {color: red}', 'span {color: blue}'], [], encapsulation)
                        .then(function (styles) {
                        testing_internal_1.expect(styles).toEqual(['div {color: red}', 'span {color: blue}']);
                        async.done();
                    });
                }));
                testing_internal_1.it('should allow to import rules', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div {color: red}'], [IMPORT_ABS_STYLESHEET_URL], encapsulation)
                        .then(function (styles) {
                        testing_internal_1.expect(styles).toEqual(['div {color: red}', ['span {color: blue}']]);
                        async.done();
                    });
                }));
                testing_internal_1.it('should allow to import rules transitively', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div {color: red}'], [IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT], encapsulation)
                        .then(function (styles) {
                        testing_internal_1.expect(styles)
                            .toEqual(['div {color: red}', ['a {color: green}', ['span {color: blue}']]]);
                        async.done();
                    });
                }));
            });
            testing_internal_1.describe('with shim', function () {
                var encapsulation = view_1.ViewEncapsulation.Emulated;
                testing_internal_1.it('should compile plain css rules', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div {\ncolor: red;\n}', 'span {\ncolor: blue;\n}'], [], encapsulation)
                        .then(function (styles) {
                        compareStyles(styles, [
                            'div[_ngcontent-%COMP%] {\ncolor: red;\n}',
                            'span[_ngcontent-%COMP%] {\ncolor: blue;\n}'
                        ]);
                        async.done();
                    });
                }));
                testing_internal_1.it('should allow to import rules', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div {\ncolor: red;\n}'], [IMPORT_ABS_STYLESHEET_URL], encapsulation)
                        .then(function (styles) {
                        compareStyles(styles, [
                            'div[_ngcontent-%COMP%] {\ncolor: red;\n}',
                            ['span[_ngcontent-%COMP%] {color: blue}']
                        ]);
                        async.done();
                    });
                }));
                testing_internal_1.it('should allow to import rules transitively', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div {\ncolor: red;\n}'], [IMPORT_ABS_STYLESHEET_URL_WITH_IMPORT], encapsulation)
                        .then(function (styles) {
                        compareStyles(styles, [
                            'div[_ngcontent-%COMP%] {\ncolor: red;\n}',
                            [
                                'a[_ngcontent-%COMP%] {color: green}',
                                ['span[_ngcontent-%COMP%] {color: blue}']
                            ]
                        ]);
                        async.done();
                    });
                }));
            });
            testing_internal_1.it('should cache stylesheets for parallel requests', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                async_1.PromiseWrapper.all([
                    compile([], [IMPORT_ABS_STYLESHEET_URL], view_1.ViewEncapsulation.None),
                    compile([], [IMPORT_ABS_STYLESHEET_URL], view_1.ViewEncapsulation.None)
                ])
                    .then(function (styleArrays) {
                    testing_internal_1.expect(styleArrays[0]).toEqual([['span {color: blue}']]);
                    testing_internal_1.expect(styleArrays[1]).toEqual([['span {color: blue}']]);
                    testing_internal_1.expect(xhrCount).toBe(1);
                    async.done();
                });
            }));
            testing_internal_1.it('should cache stylesheets for serial requests', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                compile([], [IMPORT_ABS_STYLESHEET_URL], view_1.ViewEncapsulation.None)
                    .then(function (styles0) {
                    xhrUrlResults[IMPORT_ABS_STYLESHEET_URL] = 'span {color: black}';
                    return compile([], [IMPORT_ABS_STYLESHEET_URL], view_1.ViewEncapsulation.None)
                        .then(function (styles1) {
                        testing_internal_1.expect(styles0).toEqual([['span {color: blue}']]);
                        testing_internal_1.expect(styles1).toEqual([['span {color: blue}']]);
                        testing_internal_1.expect(xhrCount).toBe(1);
                        async.done();
                    });
                });
            }));
            testing_internal_1.it('should allow to clear the cache', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                compile([], [IMPORT_ABS_STYLESHEET_URL], view_1.ViewEncapsulation.None)
                    .then(function (_) {
                    compiler.clearCache();
                    xhrUrlResults[IMPORT_ABS_STYLESHEET_URL] = 'span {color: black}';
                    return compile([], [IMPORT_ABS_STYLESHEET_URL], view_1.ViewEncapsulation.None);
                })
                    .then(function (styles) {
                    testing_internal_1.expect(xhrCount).toBe(2);
                    testing_internal_1.expect(styles).toEqual([['span {color: black}']]);
                    async.done();
                });
            }));
        });
        testing_internal_1.describe('compileComponentCodeGen', function () {
            function compile(styles, styleAbsUrls, encapsulation) {
                var sourceExpression = compiler.compileComponentCodeGen(new directive_metadata_1.CompileTemplateMetadata({ styles: styles, styleUrls: styleAbsUrls, encapsulation: encapsulation }));
                var sourceWithImports = testableExpression(sourceExpression).getSourceWithImports();
                return eval_module_1.evalModule(sourceWithImports.source, sourceWithImports.imports, null);
            }
            ;
            testing_internal_1.describe('no shim', function () {
                var encapsulation = view_1.ViewEncapsulation.None;
                testing_internal_1.it('should compile plain css rules', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div {color: red}', 'span {color: blue}'], [], encapsulation)
                        .then(function (styles) {
                        testing_internal_1.expect(styles).toEqual(['div {color: red}', 'span {color: blue}']);
                        async.done();
                    });
                }));
                testing_internal_1.it('should compile css rules with newlines and quotes', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div\n{"color": \'red\'}'], [], encapsulation)
                        .then(function (styles) {
                        testing_internal_1.expect(styles).toEqual(['div\n{"color": \'red\'}']);
                        async.done();
                    });
                }));
                testing_internal_1.it('should allow to import rules', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div {color: red}'], [IMPORT_ABS_STYLESHEET_URL], encapsulation)
                        .then(function (styles) {
                        testing_internal_1.expect(styles).toEqual(['div {color: red}', ['span {color: blue}']]);
                        async.done();
                    });
                }), 1000);
            });
            testing_internal_1.describe('with shim', function () {
                var encapsulation = view_1.ViewEncapsulation.Emulated;
                testing_internal_1.it('should compile plain css ruless', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div {\ncolor: red;\n}', 'span {\ncolor: blue;\n}'], [], encapsulation)
                        .then(function (styles) {
                        compareStyles(styles, [
                            'div[_ngcontent-%COMP%] {\ncolor: red;\n}',
                            'span[_ngcontent-%COMP%] {\ncolor: blue;\n}'
                        ]);
                        async.done();
                    });
                }));
                testing_internal_1.it('should allow to import rules', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    compile(['div {color: red}'], [IMPORT_ABS_STYLESHEET_URL], encapsulation)
                        .then(function (styles) {
                        compareStyles(styles, [
                            'div[_ngcontent-%COMP%] {color: red}',
                            ['span[_ngcontent-%COMP%] {\ncolor: blue;\n}']
                        ]);
                        async.done();
                    });
                }), 1000);
            });
        });
        testing_internal_1.describe('compileStylesheetCodeGen', function () {
            function compile(style) {
                var sourceModules = compiler.compileStylesheetCodeGen(MODULE_URL, style);
                return async_1.PromiseWrapper.all(sourceModules.map(function (sourceModule) {
                    var sourceWithImports = testableModule(sourceModule).getSourceWithImports();
                    return eval_module_1.evalModule(sourceWithImports.source, sourceWithImports.imports, null);
                }));
            }
            testing_internal_1.it('should compile plain css rules', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                compile('div {color: red;}')
                    .then(function (stylesAndShimStyles) {
                    var expected = [['div {color: red;}'], ['div[_ngcontent-%COMP%] {color: red;}']];
                    compareStyles(stylesAndShimStyles[0], expected[0]);
                    compareStyles(stylesAndShimStyles[1], expected[1]);
                    async.done();
                });
            }));
            testing_internal_1.it('should allow to import rules with relative paths', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                compile("div {color: red}@import " + IMPORT_REL_STYLESHEET_URL + ";")
                    .then(function (stylesAndShimStyles) {
                    var expected = [
                        ['div {color: red}', ['span {color: blue}']],
                        [
                            'div[_ngcontent-%COMP%] {color: red}',
                            ['span[_ngcontent-%COMP%] {\ncolor: blue;\n}']
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
exports.main = main;
function testableExpression(source) {
    var testableSource = source.declarations.join('\n') + "\n  " + util_1.codeGenValueFn(['_'], source.expression, '_run') + ";\n  " + util_1.codeGenExportVariable('run') + "_run;";
    return new source_module_1.SourceModule(null, testableSource);
}
function testableModule(sourceModule) {
    var testableSource = sourceModule.sourceWithModuleRefs + "\n  " + util_1.codeGenValueFn(['_'], 'STYLES', '_run') + ";\n  " + util_1.codeGenExportVariable('run') + "_run;";
    return new source_module_1.SourceModule(sourceModule.moduleUrl, testableSource);
}
// Needed for Android browsers which add an extra space at the end of some lines
function compareStyles(styles, expectedStyles) {
    testing_internal_1.expect(styles.length).toEqual(expectedStyles.length);
    for (var i = 0; i < styles.length; i++) {
        var style = styles[i];
        if (lang_1.isArray(style)) {
            compareStyles(style, expectedStyles[i]);
        }
        else {
            testing_internal_1.expect(lang_1.StringWrapper.replaceAll(style, /\s+\n/g, '\n')).toEqual(expectedStyles[i]);
        }
    }
}
//# sourceMappingURL=style_compiler_spec.js.map