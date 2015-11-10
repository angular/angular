var testing_internal_1 = require('angular2/testing_internal');
var directive_metadata_1 = require('angular2/src/compiler/directive_metadata');
var view_1 = require('angular2/src/core/metadata/view');
var template_normalizer_1 = require('angular2/src/compiler/template_normalizer');
var xhr_1 = require('angular2/src/compiler/xhr');
var test_bindings_1 = require('./test_bindings');
function main() {
    testing_internal_1.describe('TemplateNormalizer', function () {
        var dirType;
        var dirTypeWithHttpUrl;
        testing_internal_1.beforeEachBindings(function () { return test_bindings_1.TEST_PROVIDERS; });
        testing_internal_1.beforeEach(function () {
            dirType = new directive_metadata_1.CompileTypeMetadata({ moduleUrl: 'package:some/module/a.js', name: 'SomeComp' });
            dirTypeWithHttpUrl =
                new directive_metadata_1.CompileTypeMetadata({ moduleUrl: 'http://some/module/a.js', name: 'SomeComp' });
        });
        testing_internal_1.describe('loadTemplate', function () {
            testing_internal_1.describe('inline template', function () {
                testing_internal_1.it('should store the template', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, template_normalizer_1.TemplateNormalizer], function (async, normalizer) {
                    normalizer.normalizeTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({
                        encapsulation: null,
                        template: 'a',
                        templateUrl: null,
                        styles: [],
                        styleUrls: ['test.css']
                    }))
                        .then(function (template) {
                        testing_internal_1.expect(template.template).toEqual('a');
                        testing_internal_1.expect(template.templateUrl).toEqual('package:some/module/a.js');
                        async.done();
                    });
                }));
                testing_internal_1.it('should resolve styles on the annotation against the moduleUrl', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, template_normalizer_1.TemplateNormalizer], function (async, normalizer) {
                    normalizer.normalizeTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({
                        encapsulation: null,
                        template: '',
                        templateUrl: null,
                        styles: [],
                        styleUrls: ['test.css']
                    }))
                        .then(function (template) {
                        testing_internal_1.expect(template.styleUrls).toEqual(['package:some/module/test.css']);
                        async.done();
                    });
                }));
                testing_internal_1.it('should resolve styles in the template against the moduleUrl', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, template_normalizer_1.TemplateNormalizer], function (async, normalizer) {
                    normalizer.normalizeTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({
                        encapsulation: null,
                        template: '<style>@import test.css</style>',
                        templateUrl: null,
                        styles: [],
                        styleUrls: []
                    }))
                        .then(function (template) {
                        testing_internal_1.expect(template.styleUrls).toEqual(['package:some/module/test.css']);
                        async.done();
                    });
                }));
            });
            testing_internal_1.describe('templateUrl', function () {
                testing_internal_1.it('should load a template from a url that is resolved against moduleUrl', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, template_normalizer_1.TemplateNormalizer, xhr_1.XHR], function (async, normalizer, xhr) {
                    xhr.expect('package:some/module/sometplurl.html', 'a');
                    normalizer.normalizeTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({
                        encapsulation: null,
                        template: null,
                        templateUrl: 'sometplurl.html',
                        styles: [],
                        styleUrls: ['test.css']
                    }))
                        .then(function (template) {
                        testing_internal_1.expect(template.template).toEqual('a');
                        testing_internal_1.expect(template.templateUrl)
                            .toEqual('package:some/module/sometplurl.html');
                        async.done();
                    });
                    xhr.flush();
                }));
                testing_internal_1.it('should resolve styles on the annotation against the moduleUrl', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, template_normalizer_1.TemplateNormalizer, xhr_1.XHR], function (async, normalizer, xhr) {
                    xhr.expect('package:some/module/tpl/sometplurl.html', '');
                    normalizer.normalizeTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({
                        encapsulation: null,
                        template: null,
                        templateUrl: 'tpl/sometplurl.html',
                        styles: [],
                        styleUrls: ['test.css']
                    }))
                        .then(function (template) {
                        testing_internal_1.expect(template.styleUrls).toEqual(['package:some/module/test.css']);
                        async.done();
                    });
                    xhr.flush();
                }));
                testing_internal_1.it('should resolve styles in the template against the templateUrl', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter, template_normalizer_1.TemplateNormalizer, xhr_1.XHR], function (async, normalizer, xhr) {
                    xhr.expect('package:some/module/tpl/sometplurl.html', '<style>@import test.css</style>');
                    normalizer.normalizeTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({
                        encapsulation: null,
                        template: null,
                        templateUrl: 'tpl/sometplurl.html',
                        styles: [],
                        styleUrls: []
                    }))
                        .then(function (template) {
                        testing_internal_1.expect(template.styleUrls).toEqual(['package:some/module/tpl/test.css']);
                        async.done();
                    });
                    xhr.flush();
                }));
            });
            testing_internal_1.it('should throw if no template was specified', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                testing_internal_1.expect(function () { return normalizer.normalizeTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] })); })
                    .toThrowError('No template specified for component SomeComp');
            }));
        });
        testing_internal_1.describe('normalizeLoadedTemplate', function () {
            testing_internal_1.it('should store the viewEncapsulationin the result', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var viewEncapsulation = view_1.ViewEncapsulation.Native;
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: viewEncapsulation, styles: [], styleUrls: [] }), '', 'package:some/module/');
                testing_internal_1.expect(template.encapsulation).toBe(viewEncapsulation);
            }));
            testing_internal_1.it('should keep the template as html', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), 'a', 'package:some/module/');
                testing_internal_1.expect(template.template).toEqual('a');
            }));
            testing_internal_1.it('should collect ngContent', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), '<ng-content select="a"></ng-content>', 'package:some/module/');
                testing_internal_1.expect(template.ngContentSelectors).toEqual(['a']);
            }));
            testing_internal_1.it('should normalize ngContent wildcard selector', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), '<ng-content></ng-content><ng-content select></ng-content><ng-content select="*"></ng-content>', 'package:some/module/');
                testing_internal_1.expect(template.ngContentSelectors).toEqual(['*', '*', '*']);
            }));
            testing_internal_1.it('should collect top level styles in the template', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), '<style>a</style>', 'package:some/module/');
                testing_internal_1.expect(template.styles).toEqual(['a']);
            }));
            testing_internal_1.it('should collect styles inside in elements', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), '<div><style>a</style></div>', 'package:some/module/');
                testing_internal_1.expect(template.styles).toEqual(['a']);
            }));
            testing_internal_1.it('should collect styleUrls in the template', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), '<link rel="stylesheet" href="aUrl">', 'package:some/module/');
                testing_internal_1.expect(template.styleUrls).toEqual(['package:some/module/aUrl']);
            }));
            testing_internal_1.it('should collect styleUrls in elements', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), '<div><link rel="stylesheet" href="aUrl"></div>', 'package:some/module/');
                testing_internal_1.expect(template.styleUrls).toEqual(['package:some/module/aUrl']);
            }));
            testing_internal_1.it('should ignore link elements with non stylesheet rel attribute', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), '<link href="b" rel="a"></link>', 'package:some/module/');
                testing_internal_1.expect(template.styleUrls).toEqual([]);
            }));
            testing_internal_1.it('should ignore link elements with absolute urls but non package: scheme', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), '<link href="http://some/external.css" rel="stylesheet"></link>', 'package:some/module/');
                testing_internal_1.expect(template.styleUrls).toEqual([]);
            }));
            testing_internal_1.it('should extract @import style urls into styleAbsUrl', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: ['@import "test.css";'], styleUrls: [] }), '', 'package:some/module/id');
                testing_internal_1.expect(template.styles).toEqual(['']);
                testing_internal_1.expect(template.styleUrls).toEqual(['package:some/module/test.css']);
            }));
            testing_internal_1.it('should not resolve relative urls in inline styles', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({
                    encapsulation: null,
                    styles: ['.foo{background-image: url(\'double.jpg\');'],
                    styleUrls: []
                }), '', 'package:some/module/id');
                testing_internal_1.expect(template.styles).toEqual(['.foo{background-image: url(\'double.jpg\');']);
            }));
            testing_internal_1.it('should resolve relative style urls in styleUrls', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: ['test.css'] }), '', 'package:some/module/id');
                testing_internal_1.expect(template.styles).toEqual([]);
                testing_internal_1.expect(template.styleUrls).toEqual(['package:some/module/test.css']);
            }));
            testing_internal_1.it('should resolve relative style urls in styleUrls with http directive url', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirTypeWithHttpUrl, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: ['test.css'] }), '', 'http://some/module/id');
                testing_internal_1.expect(template.styles).toEqual([]);
                testing_internal_1.expect(template.styleUrls).toEqual(['http://some/module/test.css']);
            }));
            testing_internal_1.it('should normalize ViewEncapsulation.Emulated to ViewEncapsulation.None if there are no stlyes nor stylesheets', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: view_1.ViewEncapsulation.Emulated, styles: [], styleUrls: [] }), '', 'package:some/module/id');
                testing_internal_1.expect(template.encapsulation).toEqual(view_1.ViewEncapsulation.None);
            }));
            testing_internal_1.it('should ignore ng-content in elements with ng-non-bindable', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), '<div ng-non-bindable><ng-content select="a"></ng-content></div>', 'package:some/module/');
                testing_internal_1.expect(template.ngContentSelectors).toEqual([]);
            }));
            testing_internal_1.it('should still collect <style> in elements with ng-non-bindable', testing_internal_1.inject([template_normalizer_1.TemplateNormalizer], function (normalizer) {
                var template = normalizer.normalizeLoadedTemplate(dirType, new directive_metadata_1.CompileTemplateMetadata({ encapsulation: null, styles: [], styleUrls: [] }), '<div ng-non-bindable><style>div {color:red}</style></div>', 'package:some/module/');
                testing_internal_1.expect(template.styles).toEqual(['div {color:red}']);
            }));
        });
    });
}
exports.main = main;
//# sourceMappingURL=template_normalizer_spec.js.map