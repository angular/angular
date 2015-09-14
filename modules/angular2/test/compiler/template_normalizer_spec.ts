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
  TypeMetadata,
  NormalizedTemplateMetadata,
  TemplateMetadata
} from 'angular2/src/compiler/directive_metadata';
import {ViewEncapsulation} from 'angular2/src/core/render/api';

import {TemplateNormalizer} from 'angular2/src/compiler/template_normalizer';
import {XHR} from 'angular2/src/core/render/xhr';
import {MockXHR} from 'angular2/src/core/render/xhr_mock';
import {TEST_BINDINGS} from './test_bindings';

export function main() {
  describe('TemplateNormalizer', () => {
    var dirType: TypeMetadata;

    beforeEachBindings(() => TEST_BINDINGS);

    beforeEach(
        () => { dirType = new TypeMetadata({moduleId: 'some/module/id', name: 'SomeComp'}); });

    describe('loadTemplate', () => {
      describe('inline template', () => {
        it('should store the template',
           inject([AsyncTestCompleter, TemplateNormalizer],
                  (async, normalizer: TemplateNormalizer) => {
                    normalizer.normalizeTemplate(dirType, new TemplateMetadata({
                                                   encapsulation: null,
                                                   template: 'a',
                                                   templateUrl: null,
                                                   styles: [],
                                                   styleUrls: ['test.css']
                                                 }))
                        .then((template: NormalizedTemplateMetadata) => {
                          expect(template.template).toEqual('a');
                          async.done();
                        });
                  }));

        it('should resolve styles on the annotation against the moduleId',
           inject([AsyncTestCompleter, TemplateNormalizer],
                  (async, normalizer: TemplateNormalizer) => {
                    normalizer.normalizeTemplate(dirType, new TemplateMetadata({
                                                   encapsulation: null,
                                                   template: '',
                                                   templateUrl: null,
                                                   styles: [],
                                                   styleUrls: ['test.css']
                                                 }))
                        .then((template: NormalizedTemplateMetadata) => {
                          expect(template.styleAbsUrls).toEqual(['some/module/test.css']);
                          async.done();
                        });
                  }));

        it('should resolve styles in the template against the moduleId',
           inject([AsyncTestCompleter, TemplateNormalizer],
                  (async, normalizer: TemplateNormalizer) => {
                    normalizer.normalizeTemplate(dirType, new TemplateMetadata({
                                                   encapsulation: null,
                                                   template: '<style>@import test.css</style>',
                                                   templateUrl: null,
                                                   styles: [],
                                                   styleUrls: []
                                                 }))
                        .then((template: NormalizedTemplateMetadata) => {
                          expect(template.styleAbsUrls).toEqual(['some/module/test.css']);
                          async.done();
                        });
                  }));
      });

      describe('templateUrl', () => {

        it('should load a template from a url that is resolved against moduleId',
           inject([AsyncTestCompleter, TemplateNormalizer, XHR],
                  (async, normalizer: TemplateNormalizer, xhr: MockXHR) => {
                    xhr.expect('some/module/sometplurl', 'a');
                    normalizer.normalizeTemplate(dirType, new TemplateMetadata({
                                                   encapsulation: null,
                                                   template: null,
                                                   templateUrl: 'sometplurl',
                                                   styles: [],
                                                   styleUrls: ['test.css']
                                                 }))
                        .then((template: NormalizedTemplateMetadata) => {
                          expect(template.template).toEqual('a');
                          async.done();
                        });
                    xhr.flush();
                  }));

        it('should resolve styles on the annotation against the moduleId',
           inject([AsyncTestCompleter, TemplateNormalizer, XHR],
                  (async, normalizer: TemplateNormalizer, xhr: MockXHR) => {
                    xhr.expect('some/module/tpl/sometplurl', '');
                    normalizer.normalizeTemplate(dirType, new TemplateMetadata({
                                                   encapsulation: null,
                                                   template: null,
                                                   templateUrl: 'tpl/sometplurl',
                                                   styles: [],
                                                   styleUrls: ['test.css']
                                                 }))
                        .then((template: NormalizedTemplateMetadata) => {
                          expect(template.styleAbsUrls).toEqual(['some/module/test.css']);
                          async.done();
                        });
                    xhr.flush();
                  }));

        it('should resolve styles in the template against the templateUrl',
           inject([AsyncTestCompleter, TemplateNormalizer, XHR],
                  (async, normalizer: TemplateNormalizer, xhr: MockXHR) => {
                    xhr.expect('some/module/tpl/sometplurl', '<style>@import test.css</style>');
                    normalizer.normalizeTemplate(dirType, new TemplateMetadata({
                                                   encapsulation: null,
                                                   template: null,
                                                   templateUrl: 'tpl/sometplurl',
                                                   styles: [],
                                                   styleUrls: []
                                                 }))
                        .then((template: NormalizedTemplateMetadata) => {
                          expect(template.styleAbsUrls).toEqual(['some/module/tpl/test.css']);
                          async.done();
                        });
                    xhr.flush();
                  }));

      });

    });

    describe('normalizeLoadedTemplate', () => {
      it('should store the viewEncapsulationin the result',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {

           var viewEncapsulation = ViewEncapsulation.Native;
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new TemplateMetadata({encapsulation: viewEncapsulation, styles: [], styleUrls: []}),
               '', 'some/module/');
           expect(template.encapsulation).toBe(viewEncapsulation);
         }));

      it('should keep the template as html',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new TemplateMetadata({encapsulation: null, styles: [], styleUrls: []}), 'a',
               'some/module/');
           expect(template.template).toEqual('a')
         }));

      it('should collect and keep ngContent',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new TemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<ng-content select="a"></ng-content>', 'some/module/');
           expect(template.ngContentSelectors).toEqual(['a']);
           expect(template.template).toEqual('<ng-content select="a"></ng-content>');
         }));

      it('should normalize ngContent wildcard selector',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new TemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<ng-content></ng-content><ng-content select></ng-content><ng-content select="*"></ng-content>',
               'some/module/');
           expect(template.ngContentSelectors).toEqual(['*', '*', '*']);
         }));

      it('should collect and remove top level styles in the template',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new TemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<style>a</style>', 'some/module/');
           expect(template.styles).toEqual(['a']);
           expect(template.template).toEqual('');
         }));

      it('should collect and remove styles inside in elements',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new TemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<div><style>a</style></div>', 'some/module/');
           expect(template.styles).toEqual(['a']);
           expect(template.template).toEqual('<div></div>');
         }));

      it('should collect and remove styleUrls in the template',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new TemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<link rel="stylesheet" href="aUrl">', 'some/module/');
           expect(template.styleAbsUrls).toEqual(['some/module/aUrl']);
           expect(template.template).toEqual('');
         }));

      it('should collect and remove styleUrls in elements',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new TemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<div><link rel="stylesheet" href="aUrl"></div>', 'some/module/');
           expect(template.styleAbsUrls).toEqual(['some/module/aUrl']);
           expect(template.template).toEqual('<div></div>');
         }));

      it('should keep link elements with non stylesheet rel attribute',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new TemplateMetadata({encapsulation: null, styles: [], styleUrls: []}),
               '<link href="b" rel="a"></link>', 'some/module/');
           expect(template.styleAbsUrls).toEqual([]);
           expect(template.template).toEqual('<link href="b" rel="a"></link>');
         }));

      it('should extract @import style urls into styleAbsUrl',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new TemplateMetadata(
                            {encapsulation: null, styles: ['@import "test.css";'], styleUrls: []}),
               '', 'some/module/id');
           expect(template.styles).toEqual(['']);
           expect(template.styleAbsUrls).toEqual(['some/module/test.css']);
         }));

      it('should resolve relative urls in inline styles',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType, new TemplateMetadata({
                 encapsulation: null,
                 styles: ['.foo{background-image: url(\'double.jpg\');'],
                 styleUrls: []
               }),
               '', 'some/module/id');
           expect(template.styles)
               .toEqual(['.foo{background-image: url(\'some/module/double.jpg\');']);
         }));

      it('should resolve relative style urls in styleUrls',
         inject([TemplateNormalizer], (normalizer: TemplateNormalizer) => {
           var template = normalizer.normalizeLoadedTemplate(
               dirType,
               new TemplateMetadata({encapsulation: null, styles: [], styleUrls: ['test.css']}), '',
               'some/module/id');
           expect(template.styles).toEqual([]);
           expect(template.styleAbsUrls).toEqual(['some/module/test.css']);
         }));

    });


  });
}
