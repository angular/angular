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
} from 'angular2/test_lib';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {TemplateLoader} from 'angular2/src/render/dom/compiler/template_loader';
import {UrlResolver} from 'angular2/src/services/url_resolver';

import {ViewDefinition} from 'angular2/src/render/api';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {MockXHR} from 'angular2/src/render/xhr_mock';

export function main() {
  describe('TemplateLoader', () => {
    var loader, xhr;

    beforeEach(() => {
      xhr = new MockXHR();
      loader = new TemplateLoader(xhr, new FakeUrlResolver());
    });

    describe('html', () => {
      it('should load inline templates', inject([AsyncTestCompleter], (async) => {
           var template = new ViewDefinition({template: 'template template'});
           loader.load(template).then((el) => {
             expect(DOM.content(el)).toHaveText('template template');
             async.done();
           });
         }));

      it('should load templates through XHR', inject([AsyncTestCompleter], (async) => {
           xhr.expect('base/foo.html', 'xhr template');
           var template = new ViewDefinition({templateAbsUrl: 'base/foo.html'});
           loader.load(template).then((el) => {
             expect(DOM.content(el)).toHaveText('xhr template');
             async.done();
           });
           xhr.flush();
         }));

      it('should return a new template element on each call',
         inject([AsyncTestCompleter], (async) => {
           var firstEl;
           // we have only one xhr.expect, so there can only be one xhr call!
           xhr.expect('base/foo.html', 'xhr template');
           var template = new ViewDefinition({templateAbsUrl: 'base/foo.html'});
           loader.load(template)
               .then((el) => {
                 expect(DOM.content(el)).toHaveText('xhr template');
                 firstEl = el;
                 return loader.load(template);
               })
               .then((el) => {
                 expect(el).not.toBe(firstEl);
                 expect(DOM.content(el)).toHaveText('xhr template');
                 async.done();
               });
           xhr.flush();
         }));

      it('should throw when no template is defined', () => {
        var template = new ViewDefinition({template: null, templateAbsUrl: null});
        expect(() => loader.load(template))
            .toThrowError('View should have either the templateUrl or template property set');
      });

      it('should return a rejected Promise when XHR loading fails',
         inject([AsyncTestCompleter], (async) => {
           xhr.expect('base/foo.html', null);
           var template = new ViewDefinition({templateAbsUrl: 'base/foo.html'});
           PromiseWrapper.then(loader.load(template), function(_) { throw 'Unexpected response'; },
                               function(error) {
                                 expect(error.message)
                                     .toEqual('Failed to fetch url "base/foo.html"');
                                 async.done();
                               });
           xhr.flush();
         }));
    });

    describe('css', () => {
      it('should load inline styles', inject([AsyncTestCompleter], (async) => {
           var template = new ViewDefinition({template: 'html', styles: ['style 1', 'style 2']});
           loader.load(template).then((el) => {
             expect(DOM.getInnerHTML(el))
                 .toEqual(
                     '<style type="text/css">style 1</style><style type="text/css">style 2</style>html');
             async.done();
           });
         }));

      it('should load templates through XHR', inject([AsyncTestCompleter], (async) => {
           xhr.expect('base/foo.html', 'xhr template');
           xhr.expect('base/foo-1.css', '1');
           xhr.expect('base/foo-2.css', '2');
           var template = new ViewDefinition({
             templateAbsUrl: 'base/foo.html',
             styles: ['i1'],
             styleAbsUrls: ['base/foo-1.css', 'base/foo-2.css']
           });
           loader.load(template).then((el) => {
             expect(DOM.getInnerHTML(el))
                 .toEqual(
                     '<style type="text/css">i1</style><style type="text/css">1</style><style type="text/css">2</style>xhr template');
             async.done();
           });
           xhr.flush();
         }));

      it('should return a rejected Promise when XHR loading fails',
         inject([AsyncTestCompleter], (async) => {
           xhr.expect('base/foo.css', null);
           var template = new ViewDefinition({template: '', styleAbsUrls: ['base/foo.css']});
           PromiseWrapper.then(loader.load(template), function(_) { throw 'Unexpected response'; },
                               function(error) {
                                 expect(error.message)
                                     .toEqual('Failed to fetch url "base/foo.css"');
                                 async.done();
                               });
           xhr.flush();
         }));
    });
  });
}

class SomeComponent {}

class FakeUrlResolver extends UrlResolver {
  constructor() { super(); }

  resolve(baseUrl: string, url: string): string { return baseUrl + url; }
}
