import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  TestComponentBuilder,
  beforeEachBindings
} from 'angular2/test_lib';

import {
  CompileTypeMetadata,
  CompileTemplateMetadata
} from 'angular2/src/core/compiler/directive_metadata';
import {ViewEncapsulation} from 'angular2/src/core/render/api';

import {TemplateNormalizer} from 'angular2/src/core/compiler/template_normalizer';
import {XHR} from 'angular2/src/core/compiler/xhr';
import {MockXHR} from 'angular2/src/core/compiler/xhr_mock';
import {TEST_BINDINGS} from './test_bindings';

export function main() {
  describe('TemplateNormalizer', () => {
    var dirType: CompileTypeMetadata;

    beforeEachBindings(() => TEST_BINDINGS);

    beforeEach(() => {
      dirType = new CompileTypeMetadata({moduleUrl: 'package:some/module/a.js', name: 'SomeComp'});
    });

    describe('loadTemplate', () => {
      describe('inline template', () => {
        it('should store the template',
           inject([AsyncTestCompleter, TemplateNormalizer],
                  (async, normalizer: TemplateNormalizer) => {
                    normalizer.normalizeTemplate(dirType, new CompileTemplateMetadata({
                                                   encapsulation: null,
                                                   template: 'a',
                                                   templateUrl: null,
                                                   styles: [],
                                                   styleUrls: ['test.css']
                                                 }))
                        .then((template: CompileTemplateMetadata) => {
                          expect(template.template).toEqual('a');
                          expect(template.templateUrl).toEqual('package:some/module/a.js');
                          async.done();
                        });
                  }));

        it('should resolve styles on the annotation against the moduleUrl',
           inject([AsyncTestCompleter, TemplateNormalizer],
                  (async, normalizer: TemplateNormalizer) => {
                    normalizer.normalizeTemplate(dirType, new CompileTemplateMetadata({
                                                   encapsulation: null,
                                                   template: '',
                                                   templateUrl: null,
                                                   styles: [],
                                                   styleUrls: ['test.css']
                                                 }))
                        .then((template: CompileTemplateMetadata) => {
                          expect(template.styleUrls).toEqual(['package:some/module/test.css']);
                          async.done();
                        });
                  }));

        it('should resolve styles in the template against the moduleUrl',
           inject([AsyncTestCompleter, TemplateNormalizer],
                  (async, normalizer: TemplateNormalizer) => {
                    normalizer.normalizeTemplate(dirType, new CompileTemplateMetadata({
                                                   encapsulation: null,
                                                   template: '<style>@import test.css</style>',
                                                   templateUrl: null,
                                                   styles: [],
                                                   styleUrls: []
                                                 }))
                        .then((template: CompileTemplateMetadata) => {
                          expect(template.styleUrls).toEqual(['package:some/module/test.css']);
                          async.done();
                        });
                  }));
      });

      describe('templateUrl', () => {

        it('should load a template from a url that is resolved against moduleUrl',
           inject([AsyncTestCompleter, TemplateNormalizer, XHR],
                  (async, normalizer: TemplateNormalizer, xhr: MockXHR) => {
                    xhr.expect('package:some/module/sometplurl.html', 'a');
                    normalizer.normalizeTemplate(dirType, new CompileTemplateMetadata({
                                                   encapsulation: null,
                                                   template: null,
                                                   templateUrl: 'sometplurl.html',
                                                   styles: [],
                                                   styleUrls: ['test.css']
                                                 }))
                        .then((template: CompileTemplateMetadata) => {
                          expect(template.template).toEqual('a');
                          expect(template.templateUrl)
                              .toEqual('package:some/module/sometplurl.html');
                          async.done();
                        });
                    xhr.flush();
                  }));

        it('should resolve styles on the annotation against the moduleUrl',
           inject([AsyncTestCompleter, TemplateNormalizer, XHR],
                  (async, normalizer: TemplateNormalizer, xhr: MockXHR) => {
                    xhr.expect('package:some/module/tpl/sometplurl.html', '');
                    normalizer.normalizeTemplate(dirType, new CompileTemplateMetadata({
                                                   encapsulation: null,
                                                   template: null,
                                                   templateUrl: 'tpl/sometplurl.html',
                                                   styles: [],
                                                   styleUrls: ['test.css']
                                                 }))
                        .then((template: CompileTemplateMetadata) => {
                          expect(template.styleUrls).toEqual(['package:some/module/test.css']);
                          async.done();
                        });
                    xhr.flush();
                  }));

        it('should resolve styles in the template against the templateUrl',
           inject([AsyncTestCompleter, TemplateNormalizer, XHR],
                  (async, normalizer: TemplateNormalizer, xhr: MockXHR) => {
                    xhr.expect('package:some/module/tpl/sometplurl.html',
                               '<style>@import test.css</style>');
                    normalizer.normalizeTemplate(dirType, new CompileTemplateMetadata({
                                                   encapsulation: null,
                                                   template: null,
                                                   templateUrl: 'tpl/sometplurl.html',
                                                   styles: [],
                                                   styleUrls: []
                                                 }))
                        .then((template: CompileTemplateMetadata) => {
                          expect(template.styleUrls).toEqual(['package:some/module/tpl/test.css']);
                          async.done();
                        });
                    xhr.flush();
                  }));

      });

      it('should throw if no template was specified',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           expect(() => normalizer.normalizeTemplate(
                      dirType, new CompileTemplateMetadata(
                                   {encapsulation: null, styles: [], styleUrls: []})))
               .toThrowError('No template specified for component SomeComp');
         }));

    });

    describe('normalizeLoadedTemplate', () => {
      it('should store the viewEncapsulationin the result',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {

           var viewEncapsulation = ViewEncapsulation.Native;
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new CompileTemplateMetadata(
                            {encapsulation: viewEncapsulation, styles: [], styleUrls: []}),
               '', 'package:some/module/');
           expect(template.encapsulation).toBe(viewEncapsulation);
         }));

      it('should keep the template as html',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}), 'a',
               'package:some/module/');
           expect(template.template).toEqual('a')
         }));

      it('should collect ngContent',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<ng-content select="a"></ng-content>', 'package:some/module/');
           expect(template.ngContentSelectors).toEqual(['a']);
         }));

      it('should normalize ngContent wildcard selector',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<ng-content></ng-content><ng-content select></ng-content><ng-content select="*"></ng-content>',
               'package:some/module/');
           expect(template.ngContentSelectors).toEqual(['*', '*', '*']);
         }));

      it('should collect top level styles in the template',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<style>a</style>', 'package:some/module/');
           expect(template.styles).toEqual(['a']);
         }));

      it('should collect styles inside in elements',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<div><style>a</style></div>', 'package:some/module/');
           expect(template.styles).toEqual(['a']);
         }));

      it('should collect styleUrls in the template',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<link rel="stylesheet" href="aUrl">', 'package:some/module/');
           expect(template.styleUrls).toEqual(['package:some/module/aUrl']);
         }));

      it('should collect styleUrls in elements',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<div><link rel="stylesheet" href="aUrl"></div>', 'package:some/module/');
           expect(template.styleUrls).toEqual(['package:some/module/aUrl']);
         }));

      it('should ignore link elements with non stylesheet rel attribute',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<link href="b" rel="a"></link>', 'package:some/module/');
           expect(template.styleUrls).toEqual([]);
         }));

      it('should extract @import style urls into styleAbsUrl',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new CompileTemplateMetadata(
                            {encapsulation: null, styles: ['@import "test.css";'], styleUrls: []}),
               '', 'package:some/module/id');
           expect(template.styles).toEqual(['']);
           expect(template.styleUrls).toEqual(['package:some/module/test.css']);
         }));

      it('should resolve relative urls in inline styles',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new CompileTemplateMetadata({
                 encapsulation: null,
                 styles: ['.foo{background-image: url(\'double.jpg\');'],
                 styleUrls: []
               }),
               '', 'package:some/module/id');
           expect(template.styles)
               .toEqual(['.foo{background-image: url(\'package:some/module/double.jpg\');']);
         }));

      it('should resolve relative style urls in styleUrls',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new CompileTemplateMetadata(
                            {encapsulation: null, styles: [], styleUrls: ['test.css']}),
               '', 'package:some/module/id');
           expect(template.styles).toEqual([]);
           expect(template.styleUrls).toEqual(['package:some/module/test.css']);
         }));

      it('should normalize ViewEncapsulation.Emulated to ViewEncapsulation.None if there are no stlyes nor stylesheets',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new CompileTemplateMetadata(
                            {encapsulation: ViewEncapsulation.Emulated, styles: [], styleUrls: []}),
               '', 'package:some/module/id');
           expect(template.encapsulation).toEqual(ViewEncapsulation.None);
         }));

      it('should ignore ng-content in elements with ng-non-bindable',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<div ng-non-bindable><ng-content select="a"></ng-content></div>',
               'package:some/module/');
           expect(template.ngContentSelectors).toEqual([]);
         }));

      it('should still collect <style> in elements with ng-non-bindable',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new CompileTemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<div ng-non-bindable><style>div {color:red}</style></div>', 'package:some/module/');
           expect(template.styles).toEqual(['div {color:red}']);
         }));
    });
  });
}
