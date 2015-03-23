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

import {Template} from 'angular2/src/render/api';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {XHRMock} from 'angular2/src/mock/xhr_mock';

export function main() {
  describe('TemplateLoader', () => {
    var loader, xhr;

    beforeEach(() => {
      xhr = new XHRMock()
      loader = new TemplateLoader(xhr, new FakeUrlResolver());
    });

    it('should load inline templates', inject([AsyncTestCompleter], (async) => {
      var template = new Template({inline: 'inline template'});
      loader.load(template).then( (el) => {
        expect(DOM.content(el)).toHaveText('inline template');
        async.done();
      });
    }));

    it('should load templates through XHR', inject([AsyncTestCompleter], (async) => {
      xhr.expect('base/foo', 'xhr template');
      var template = new Template({absUrl: 'base/foo'});
      loader.load(template).then((el) => {
        expect(DOM.content(el)).toHaveText('xhr template');
        async.done();
      });
      xhr.flush();
    }));

    it('should cache template loaded through XHR', inject([AsyncTestCompleter], (async) => {
      var firstEl;
      xhr.expect('base/foo', 'xhr template');
      var template = new Template({absUrl: 'base/foo'});
      loader.load(template)
        .then((el) => {
          firstEl = el;
          return loader.load(template);
        })
        .then((el) =>{
          expect(el).toBe(firstEl);
          expect(DOM.content(el)).toHaveText('xhr template');
          async.done();
        });
      xhr.flush();
    }));

    it('should throw when no template is defined', () => {
      var template =  new Template({inline: null, absUrl: null});
      expect(() => loader.load(template))
        .toThrowError('Templates should have either their url or inline property set');
    });

    it('should return a rejected Promise when xhr loading fails', inject([AsyncTestCompleter], (async) => {
      xhr.expect('base/foo', null);
      var template = new Template({absUrl: 'base/foo'});
      PromiseWrapper.then(loader.load(template),
        function(_) { throw 'Unexpected response'; },
        function(error) {
          expect(error).toEqual('Failed to load base/foo');
          async.done();
        }
      )
      xhr.flush();
    }));

  });
}

class SomeComponent {
}

class FakeUrlResolver extends UrlResolver {
  constructor() {
    super();
  }

  resolve(baseUrl: string, url: string): string {
    return baseUrl + url;
  }
}
