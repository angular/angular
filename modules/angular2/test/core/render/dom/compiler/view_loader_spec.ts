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
import {ViewLoader, TemplateAndStyles} from 'angular2/src/core/render/dom/compiler/view_loader';
import {StyleInliner} from 'angular2/src/core/render/dom/compiler/style_inliner';
import {StyleUrlResolver} from 'angular2/src/core/render/dom/compiler/style_url_resolver';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';

import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {XHR} from 'angular2/src/core/render/xhr';
import {MockXHR} from 'angular2/src/core/render/xhr_mock';
import {ViewDefinition} from 'angular2/src/core/render/api';

export function main() {
  describe('ViewLoader', () => {
    var loader: ViewLoader;
    var xhr, styleUrlResolver, urlResolver;

    beforeEach(() => {
      xhr = new MockXHR();
      urlResolver = new UrlResolver();
      styleUrlResolver = new StyleUrlResolver(urlResolver);
      let styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
      loader = new ViewLoader(xhr, styleInliner, styleUrlResolver);
    });

    describe('html', () => {
      it('should load inline templates', inject([AsyncTestCompleter], (async) => {
           loader.load(new ViewDefinition({template: 'template template'}))
               .then((el) => {
                 expect(el.template).toEqual('template template');
                 async.done();
               });
         }));

      it('should load templates through XHR', inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.html', 'xhr template');
           loader.load(new ViewDefinition({templateAbsUrl: 'http://ng.io/foo.html'}))
               .then((el) => {
                 expect(el.template).toEqual('xhr template');
                 async.done();
               });
           xhr.flush();
         }));

      it('should resolve urls in styles', inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.html',
                      '<style>.foo { background-image: url("double.jpg"); }</style>');
           loader.load(new ViewDefinition({templateAbsUrl: 'http://ng.io/foo.html'}))
               .then((el) => {
                 expect(el.template).toEqual('');
                 expect(el.styles)
                     .toEqual([".foo { background-image: url('http://ng.io/double.jpg'); }"]);
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

           loader.load(new ViewDefinition({templateAbsUrl: 'http://ng.io/foo.html'}))
               .then((el) => {
                 expect(el.template).toEqual('');
                 expect(el.styles).toEqual(["/* foo.css */\n"]);
                 async.done();
               });
         }));

      it('should throw when no template is defined', () => {
        expect(() => loader.load(new ViewDefinition(
                   {componentId: 'TestComponent', template: null, templateAbsUrl: null})))
            .toThrowError(
                'View should have either the templateUrl or template property set but none was found for the \'TestComponent\' component');
      });

      it('should return a rejected Promise when XHR loading fails',
         inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.html', null);
           PromiseWrapper.then(
               loader.load(new ViewDefinition({templateAbsUrl: 'http://ng.io/foo.html'})),
               function(_) { throw 'Unexpected response'; },
               function(error) {
                 expect(error.message).toEqual('Failed to fetch url "http://ng.io/foo.html"');
                 async.done();
               });
           xhr.flush();
         }));

      it('should replace $baseUrl in attributes with the template base url',
         inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/path/foo.html', '<img src="$baseUrl/logo.png">');
           loader.load(new ViewDefinition({templateAbsUrl: 'http://ng.io/path/foo.html'}))
               .then((el) => {
                 expect(el.template).toEqual('<img src="http://ng.io/path/logo.png">');
                 async.done();
               });
           xhr.flush();
         }));
    });

    describe('css', () => {
      it('should load inline styles', inject([AsyncTestCompleter], (async) => {
           loader.load(new ViewDefinition({template: 'html', styles: ['style 1', 'style 2']}))
               .then((el) => {
                 expect(el.template).toEqual('html');
                 expect(el.styles).toEqual(['style 1', 'style 2']);
                 async.done();
               });
         }));

      it('should resolve urls in inline styles', inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.html', 'html');
           loader.load(new ViewDefinition({
                   templateAbsUrl: 'http://ng.io/foo.html',
                   styles: ['.foo { background-image: url("double.jpg"); }']
                 }))
               .then((el) => {
                 expect(el.template).toEqual('html');
                 expect(el.styles)
                     .toEqual([".foo { background-image: url('http://ng.io/double.jpg'); }"]);
                 async.done();
               });
           xhr.flush();
         }));

      it('should load templates through XHR', inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.html', 'xhr template');
           xhr.expect('http://ng.io/foo-1.css', '1');
           xhr.expect('http://ng.io/foo-2.css', '2');
           loader.load(new ViewDefinition({
                   templateAbsUrl: 'http://ng.io/foo.html',
                   styles: ['i1'],
                   styleAbsUrls: ['http://ng.io/foo-1.css', 'http://ng.io/foo-2.css']
                 }))
               .then((el) => {
                 expect(el.template).toEqual('xhr template');
                 expect(el.styles).toEqual(['i1', '1', '2']);
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

           loader.load(
                     new ViewDefinition(
                         {templateAbsUrl: 'http://ng.io/foo.html', styles: ['@import "foo.css";']}))
               .then((el) => {
                 expect(el.template).toEqual("<p>template</p>");
                 expect(el.styles).toEqual(["/* foo.css */\n"]);
                 async.done();
               });
         }));

      it('should return a rejected Promise when XHR loading fails',
         inject([AsyncTestCompleter], (async) => {
           xhr.expect('http://ng.io/foo.css', null);
           PromiseWrapper.then(
               loader.load(
                   new ViewDefinition({template: '', styleAbsUrls: ['http://ng.io/foo.css']})),
               function(_) { throw 'Unexpected response'; },
               function(error) {
                 expect(error.message).toEqual('Failed to fetch url "http://ng.io/foo.css"');
                 async.done();
               });
           xhr.flush();
         }));
    });
  });
}

class SomeComponent {}

class FakeXHR extends XHR {
  _responses = new Map<string, string>();

  constructor() { super(); }

  get(url: string): Promise<string> {
    return this._responses.has(url) ? PromiseWrapper.resolve(this._responses.get(url)) :
                                      PromiseWrapper.reject('xhr error', null);
  }

  reply(url: string, response: string): void { this._responses.set(url, response); }
}
