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
import {StyleInliner} from 'angular2/src/render/dom/compiler/style_inliner';
import {StyleUrlResolver} from 'angular2/src/render/dom/compiler/style_url_resolver';
import {UrlResolver} from 'angular2/src/services/url_resolver';

import {ViewDefinition} from 'angular2/src/render/api';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {StringWrapper, isBlank, isPresent} from 'angular2/src/facade/lang';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {XHR} from 'angular2/src/render/xhr';
import {MockXHR} from 'angular2/src/render/xhr_mock';

export function main() {
  describe('TemplateLoader', () => {
    var loader, xhr, styleUrlResolver, urlResolver;

    beforeEach(() => {
      xhr = new MockXHR();
      urlResolver = new FakeUrlResolver();
      styleUrlResolver = new StyleUrlResolver(urlResolver);
      let styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
      loader = new TemplateLoader(xhr, styleInliner, styleUrlResolver);
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

      it('should resolve urls in styles', inject([AsyncTestCompleter], (async) => {
           xhr.expect('base/foo.html',
                      '<style>.foo { background-image: url("double.jpg"); }</style>');
           var template = new ViewDefinition({templateAbsUrl: 'base/foo.html'});
           loader.load(template).then((el) => {
             expect(DOM.content(el))
                 .toHaveText(".foo { background-image: url('/base/double.jpg'); }");
             async.done();
           });
           xhr.flush();
         }));

      it('should inline styles', inject([AsyncTestCompleter], (async) => {
           let xhr = new FakeXHR();
           xhr.reply('base/foo.html', '<style>@import "foo.css";</style>');
           xhr.reply('/base/foo.css', '/* foo.css */');

           let styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
           let loader = new TemplateLoader(xhr, styleInliner, styleUrlResolver);

           var template = new ViewDefinition({templateAbsUrl: 'base/foo.html'});
           loader.load(template).then((el) => {
             expect(DOM.getInnerHTML(el)).toEqual("<style>/* foo.css */\n</style>");
             async.done();
           });
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
                 .toEqual('<style>style 1</style><style>style 2</style>html');
             async.done();
           });
         }));

      it('should resolve urls in inline styles', inject([AsyncTestCompleter], (async) => {
           var template = new ViewDefinition(
               {template: 'html', styles: ['.foo { background-image: url("double.jpg"); }']});
           loader.load(template).then((el) => {
             expect(DOM.getInnerHTML(el))
                 .toEqual("<style>.foo { background-image: url('/double.jpg'); }</style>html");
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
                 .toEqual('<style>i1</style><style>1</style><style>2</style>xhr template');
             async.done();
           });
           xhr.flush();
         }));

      it('should inline styles', inject([AsyncTestCompleter], (async) => {
           let xhr = new FakeXHR();
           xhr.reply('base/foo.html', '<p>template</p>');
           xhr.reply('/base/foo.css', '/* foo.css */');

           let styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
           let loader = new TemplateLoader(xhr, styleInliner, styleUrlResolver);

           var template = new ViewDefinition(
               {templateAbsUrl: 'base/foo.html', styles: ['@import "foo.css";']});
           loader.load(template).then((el) => {
             expect(DOM.getInnerHTML(el)).toEqual("<style>/* foo.css */\n</style><p>template</p>");
             async.done();
           });
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

  resolve(baseUrl: string, url: string): string {
    if (url.length > 0 && url[0] == '/') return url;
    if (!isPresent(baseUrl)) return `/${url}`;
    var parts: List<string> = baseUrl.split('/');
    if (parts.length > 1) {
      ListWrapper.removeLast(parts);
    }
    parts.push(url);
    return '/' + parts.join('/');
  }
}

class FakeXHR extends XHR {
  _responses: Map<string, string> = new Map();

  constructor() { super(); }

  get(url: string): Promise<string> {
    return this._responses.has(url) ? PromiseWrapper.resolve(this._responses.get(url)) :
                                      PromiseWrapper.reject('xhr error', null);
  }

  reply(url: string, response: string): void { this._responses.set(url, response); }
}
