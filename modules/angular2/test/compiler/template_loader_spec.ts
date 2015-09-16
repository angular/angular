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
  TestComponentBuilder
} from 'angular2/test_lib';

import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {TypeMetadata, TemplateMetadata} from 'angular2/src/compiler/api';
import {ViewEncapsulation} from 'angular2/src/core/render/api';

import {TemplateLoader} from 'angular2/src/compiler/template_loader';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {XHR} from 'angular2/src/core/render/xhr';
import {MockXHR} from 'angular2/src/core/render/xhr_mock';

export function main() {
  describe('TemplateLoader', () => {
    var loader: TemplateLoader;
    var dirType: TypeMetadata;
    var xhr: MockXHR;
    var htmlParser: HtmlParser;

    beforeEach(inject([XHR], (mockXhr) => {
      xhr = mockXhr;
      htmlParser = new HtmlParser();
      loader = new TemplateLoader(xhr, new UrlResolver(), htmlParser);
      dirType = new TypeMetadata({typeUrl: 'http://sometypeurl', typeName: 'SomeComp'});
    }));

    describe('loadTemplate', () => {
      describe('inline template', () => {
        it('should store the template', inject([AsyncTestCompleter], (async) => {
             loader.loadTemplate(dirType, null, 'a', null, [], ['test.css'])
                 .then((template: TemplateMetadata) => {
                   expect(template.template).toEqual('a');
                   async.done();
                 });
           }));

        it('should resolve styles against the typeUrl', inject([AsyncTestCompleter], (async) => {
             loader.loadTemplate(dirType, null, 'a', null, [], ['test.css'])
                 .then((template: TemplateMetadata) => {
                   expect(template.styleAbsUrls).toEqual(['http://sometypeurl/test.css']);
                   async.done();
                 });
           }));
      });

      describe('templateUrl', () => {

        it('should load a template from a url that is resolved against typeUrl',
           inject([AsyncTestCompleter], (async) => {
             xhr.expect('http://sometypeurl/sometplurl', 'a');
             loader.loadTemplate(dirType, null, null, 'sometplurl', [], ['test.css'])
                 .then((template: TemplateMetadata) => {
                   expect(template.template).toEqual('a');
                   async.done();
                 });
             xhr.flush();
           }));

        it('should resolve styles against the templateUrl',
           inject([AsyncTestCompleter], (async) => {
             xhr.expect('http://sometypeurl/tpl/sometplurl', 'a');
             loader.loadTemplate(dirType, null, null, 'tpl/sometplurl', [], ['test.css'])
                 .then((template: TemplateMetadata) => {
                   expect(template.styleAbsUrls).toEqual(['http://sometypeurl/tpl/test.css']);
                   async.done();
                 });
             xhr.flush();
           }));

      });

    });

    describe('loadTemplateFromString', () => {
      it('should store the viewEncapsulationin the result', () => {
        var viewEncapsulation = ViewEncapsulation.Native;
        var template = loader.createTemplateFromString(dirType, viewEncapsulation, '',
                                                       'http://someurl/', [], []);
        expect(template.encapsulation).toBe(viewEncapsulation);
      });

      it('should keep the template as html', () => {
        var template =
            loader.createTemplateFromString(dirType, null, 'a', 'http://someurl/', [], []);
        expect(template.template).toEqual('a')
      });

      it('should collect and keep ngContent', () => {
        var template = loader.createTemplateFromString(
            dirType, null, '<ng-content select="a"></ng-content>', 'http://someurl/', [], []);
        expect(template.ngContentSelectors).toEqual(['a']);
        expect(template.template).toEqual('<ng-content select="a"></ng-content>');
      });

      it('should normalize ngContent wildcard selector', () => {
        var template = loader.createTemplateFromString(
            dirType, null,
            '<ng-content></ng-content><ng-content select></ng-content><ng-content select="*"></ng-content>',
            'http://someurl/', [], []);
        expect(template.ngContentSelectors).toEqual(['*', '*', '*']);
      });

      it('should collect and remove top level styles in the template', () => {
        var template = loader.createTemplateFromString(dirType, null, '<style>a</style>',
                                                       'http://someurl/', [], []);
        expect(template.styles).toEqual(['a']);
        expect(template.template).toEqual('');
      });

      it('should collect and remove styles inside in elements', () => {
        var template = loader.createTemplateFromString(dirType, null, '<div><style>a</style></div>',
                                                       'http://someurl/', [], []);
        expect(template.styles).toEqual(['a']);
        expect(template.template).toEqual('<div></div>');
      });

      it('should collect and remove styleUrls in the template', () => {
        var template = loader.createTemplateFromString(
            dirType, null, '<link rel="stylesheet" href="aUrl">', 'http://someurl/', [], []);
        expect(template.styleAbsUrls).toEqual(['http://someurl/aUrl']);
        expect(template.template).toEqual('');
      });

      it('should collect and remove styleUrls in elements', () => {
        var template = loader.createTemplateFromString(
            dirType, null, '<div><link rel="stylesheet" href="aUrl"></div>', 'http://someurl/', [],
            []);
        expect(template.styleAbsUrls).toEqual(['http://someurl/aUrl']);
        expect(template.template).toEqual('<div></div>');
      });

      it('should keep link elements with non stylesheet rel attribute', () => {
        var template = loader.createTemplateFromString(
            dirType, null, '<link href="b" rel="a"></link>', 'http://someurl/', [], []);
        expect(template.styleAbsUrls).toEqual([]);
        expect(template.template).toEqual('<link href="b" rel="a"></link>');
      });

      it('should extract @import style urls into styleAbsUrl', () => {
        var template = loader.createTemplateFromString(dirType, null, '', 'http://someurl',
                                                       ['@import "test.css";'], []);
        expect(template.styles).toEqual(['']);
        expect(template.styleAbsUrls).toEqual(['http://someurl/test.css']);
      });

      it('should resolve relative urls in inline styles', () => {
        var template =
            loader.createTemplateFromString(dirType, null, '', 'http://someurl',
                                            ['.foo{background-image: url(\'double.jpg\');'], []);
        expect(template.styles)
            .toEqual(['.foo{background-image: url(\'http://someurl/double.jpg\');']);
      });

      it('should resolve relative style urls in styleUrls', () => {
        var template =
            loader.createTemplateFromString(dirType, null, '', 'http://someurl', [], ['test.css']);
        expect(template.styles).toEqual([]);
        expect(template.styleAbsUrls).toEqual(['http://someurl/test.css']);
      });

    });


  });
}
