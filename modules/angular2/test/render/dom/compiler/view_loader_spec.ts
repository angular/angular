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
import {ViewLoader} from 'angular2/src/render/dom/compiler/view_loader';
import {StyleInliner} from 'angular2/src/render/dom/compiler/style_inliner';
import {StyleUrlResolver} from 'angular2/src/render/dom/compiler/style_url_resolver';
import {UrlResolver} from 'angular2/src/services/url_resolver';

import {ViewDefinition} from 'angular2/src/render/api';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {XHR} from 'angular2/src/render/xhr';
import {MockXHR} from 'angular2/src/render/xhr_mock';

export function main() {
  describe('ViewLoader', () => {
    var loader, xhr, styleUrlResolver, urlResolver;

    beforeEach(() => {
      xhr = new MockXHR();
      urlResolver = new UrlResolver();
      styleUrlResolver = new StyleUrlResolver(urlResolver);
      let styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
      loader = new ViewLoader(xhr, styleInliner, styleUrlResolver);
    });

    describe('html', () => {
      it('should load inline templates', inject([AsyncTestCompleter], (async) => {
           var view = new ViewDefinition({template: 'template template'});
           loader.load(view).then((el) => {
             expect(DOM.content(el)).toHaveText('template template');
             async.done();
           });
         }));

      it('should load templates through XHR', inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.html', 'xhr template');
           var view = new ViewDefinition({templateAbsUrl: 'http://ng.io/foo.html'});
           loader.load(view).then((el) => {
             expect(DOM.content(el)).toHaveText('xhr template');
             async.done();
           });
           xhr.flush();
         }));

      it('should resolve urls in styles', inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.html',
                      '<style>.foo { background-image: url("double.jpg"); }</style>');
           var view = new ViewDefinition({templateAbsUrl: 'http://ng.io/foo.html'});
           loader.load(view).then((el) => {
             expect(DOM.content(el))
                 .toHaveText(".foo { background-image: url('http://ng.io/double.jpg'); }");
             async.done();
           });
           xhr.flush();
         }));

      it('should inline styles', inject([AsyncTestCompleter], (async) => {
           let xhr = new FakeXHR();
           xhr.reply('http://ng.io/foo.html', '<style>@import "foo.css";</style>');
           xhr.reply('http://ng.io/foo.css', '/* foo.css */');

           let styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
           let loader = new ViewLoader(xhr, styleInliner, styleUrlResolver);

           var view = new ViewDefinition({templateAbsUrl: 'http://ng.io/foo.html'});
           loader.load(view).then((el) => {
             expect(DOM.getInnerHTML(el)).toEqual("<style>/* foo.css */\n</style>");
             async.done();
           });
         }));

      it('should return a new template element on each call',
         inject([AsyncTestCompleter], (async) => {
           var firstEl;
           // we have only one xhr.expect, so there can only be one xhr call!
           xhr.expect('http://ng.io/foo.html', 'xhr template');
           var view = new ViewDefinition({templateAbsUrl: 'http://ng.io/foo.html'});
           loader.load(view)
               .then((el) => {
                 expect(DOM.content(el)).toHaveText('xhr template');
                 firstEl = el;
                 return loader.load(view);
               })
               .then((el) => {
                 expect(el).not.toBe(firstEl);
                 expect(DOM.content(el)).toHaveText('xhr template');
                 async.done();
               });
           xhr.flush();
         }));

      it('should throw when no template is defined', () => {
        var view = new ViewDefinition({template: null, templateAbsUrl: null});
        expect(() => loader.load(view))
            .toThrowError('View should have either the templateUrl or template property set');
      });

      it('should return a rejected Promise when XHR loading fails',
         inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.html', null);
           var view = new ViewDefinition({templateAbsUrl: 'http://ng.io/foo.html'});
           PromiseWrapper.then(loader.load(view), function(_) { throw 'Unexpected response'; },
                               function(error) {
                                 expect(error.message)
                                     .toEqual('Failed to fetch url "http://ng.io/foo.html"');
                                 async.done();
                               });
           xhr.flush();
         }));
      it('should replace $baseUrl in attributes with the template base url',
         inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/path/foo.html', '<img src="$baseUrl/logo.png">');
           var view = new ViewDefinition({templateAbsUrl: 'http://ng.io/path/foo.html'});
           loader.load(view).then((el) => {
             expect(DOM.getInnerHTML(el)).toEqual('<img src="http://ng.io/path/logo.png">');
             async.done();
           });
           xhr.flush();
         }));
    });

    describe('css', () => {
      it('should load inline styles', inject([AsyncTestCompleter], (async) => {
           var view = new ViewDefinition({template: 'html', styles: ['style 1', 'style 2']});
           loader.load(view).then((el) => {
             expect(DOM.getInnerHTML(el))
                 .toEqual('<style>style 1</style><style>style 2</style>html');
             async.done();
           });
         }));

      it('should resolve urls in inline styles', inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.html', 'html');
           var view = new ViewDefinition({
             templateAbsUrl: 'http://ng.io/foo.html',
             styles: ['.foo { background-image: url("double.jpg"); }']
           });
           loader.load(view).then((el) => {
             expect(DOM.getInnerHTML(el))
                 .toEqual(
                     "<style>.foo { background-image: url('http://ng.io/double.jpg'); }</style>html");
             async.done();
           });
           xhr.flush();
         }));

      it('should load templates through XHR', inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.html', 'xhr template');
           xhr.expect('http://ng.io/foo-1.css', '1');
           xhr.expect('http://ng.io/foo-2.css', '2');
           var view = new ViewDefinition({
             templateAbsUrl: 'http://ng.io/foo.html',
             styles: ['i1'],
             styleAbsUrls: ['http://ng.io/foo-1.css', 'http://ng.io/foo-2.css']
           });
           loader.load(view).then((el) => {
             expect(DOM.getInnerHTML(el))
                 .toEqual('<style>i1</style><style>1</style><style>2</style>xhr template');
             async.done();
           });
           xhr.flush();
         }));

      it('should inline styles', inject([AsyncTestCompleter], (async) => {
           let xhr = new FakeXHR();
           xhr.reply('http://ng.io/foo.html', '<p>template</p>');
           xhr.reply('http://ng.io/foo.css', '/* foo.css */');

           let styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
           let loader = new ViewLoader(xhr, styleInliner, styleUrlResolver);

           var view = new ViewDefinition(
               {templateAbsUrl: 'http://ng.io/foo.html', styles: ['@import "foo.css";']});
           loader.load(view).then((el) => {
             expect(DOM.getInnerHTML(el)).toEqual("<style>/* foo.css */\n</style><p>template</p>");
             async.done();
           });
         }));


      it('should return a rejected Promise when XHR loading fails',
         inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.css', null);
           var view = new ViewDefinition({template: '', styleAbsUrls: ['http://ng.io/foo.css']});
           PromiseWrapper.then(loader.load(view), function(_) { throw 'Unexpected response'; },
                               function(error) {
                                 expect(error.message)
                                     .toEqual('Failed to fetch url "http://ng.io/foo.css"');
                                 async.done();
                               });
           xhr.flush();
         }));
    });
  });
}

class SomeComponent {}

class FakeXHR extends XHR {
  _responses: Map<string, string> = new Map();

  constructor() { super(); }

  get(url: string): Promise<string> {
    return this._responses.has(url) ? PromiseWrapper.resolve(this._responses.get(url)) :
                                      PromiseWrapper.reject('xhr error', null);
  }

  reply(url: string, response: string): void { this._responses.set(url, response); }
}
