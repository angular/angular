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
import {MockXHR} from 'angular2/src/mock/xhr_mock';

export function main() {
  describe('TemplateLoader', () => {
    var loader, xhr;

    beforeEach(() => {
      xhr = new MockXHR();
      loader = new TemplateLoader(xhr, new FakeUrlResolver());
    });

    it('should load inline templates', inject([AsyncTestCompleter], (async) => {
         var template = new ViewDefinition({template: 'template template'});
         loader.load(template).then((el) => {
           expect(DOM.content(el)).toHaveText('template template');
           async.done();
         });
       }));

    it('should load templates through XHR', inject([AsyncTestCompleter], (async) => {
         xhr.expect('base/foo', 'xhr template');
         var template = new ViewDefinition({absUrl: 'base/foo'});
         loader.load(template).then((el) => {
           expect(DOM.content(el)).toHaveText('xhr template');
           async.done();
         });
         xhr.flush();
       }));

    it('should cache template loaded through XHR but clone it as the compiler might change it',
       inject([AsyncTestCompleter], (async) => {
         var firstEl;
         // we have only one xhr.expect, so there can only be one xhr call!
         xhr.expect('base/foo', 'xhr template');
         var template = new ViewDefinition({absUrl: 'base/foo'});
         loader.load(template)
             .then((el) =>
                   {
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
      var template = new ViewDefinition({template: null, absUrl: null});
      expect(() => loader.load(template))
          .toThrowError('View should have either the url or template property set');
    });

    it('should return a rejected Promise when xhr loading fails',
       inject([AsyncTestCompleter], (async) => {
         xhr.expect('base/foo', null);
         var template = new ViewDefinition({absUrl: 'base/foo'});
         PromiseWrapper.then(loader.load(template), function(_) { throw 'Unexpected response'; },
                             function(error) {
                               expect(error).toEqual('Failed to load base/foo');
                               async.done();
                             });
         xhr.flush();
       }));

  });
}

class SomeComponent {}

class FakeUrlResolver extends UrlResolver {
  constructor() { super(); }

  resolve(baseUrl: string, url: string): string { return baseUrl + url; }
}
