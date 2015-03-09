import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';

import {Template} from 'angular2/src/core/annotations/template';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {XHRMock} from 'angular2/src/mock/xhr_mock';

export function main() {
  describe('TemplateLoader', () => {
    var loader, xhr;

    beforeEach(() => {
      xhr = new XHRMock()
      loader = new TemplateLoader(xhr, new FakeUrlResolver());
    });

    it('should load inline templates synchronously', () => {
      var template = new Template({inline: 'inline template'});
      expect(DOM.content(loader.load(template))).toHaveText('inline template');
    });

    it('should load templates through XHR', (done) => {
      xhr.expect('base/foo', 'xhr template');
      var template = new Template({url: '/foo'});
      loader.setBaseUrl(template, 'base');
      loader.load(template).then((el) => {
        expect(DOM.content(el)).toHaveText('xhr template');
        done();
      });
      xhr.flush();
    });

    it('should cache template loaded through XHR', (done) => {
      var firstEl;
      xhr.expect('base/foo', 'xhr template');
      var template = new Template({url: '/foo'});
      loader.setBaseUrl(template, 'base');
      loader.load(template)
        .then((el) => {
          firstEl = el;
          return loader.load(template);
        })
        .then((el) =>{
          expect(el).toBe(firstEl);
          expect(DOM.content(el)).toHaveText('xhr template');
          done();
        });
      xhr.flush();
    });

    it('should throw when no template is defined', () => {
      var template =  new Template({inline: null, url: null});
      expect(() => loader.load(template))
        .toThrowError('Templates should have either their url or inline property set');
    });

    it('should return a rejected Promise when xhr loading fails', (done) => {
      xhr.expect('base/foo', null);
      var template = new Template({url: '/foo'});
      loader.setBaseUrl(template, 'base');
      PromiseWrapper.then(loader.load(template),
        function(_) { throw 'Unexpected response'; },
        function(error) {
          expect(error).toEqual('Failed to load base/foo');
          done();
        }
      )
      xhr.flush();
    });

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
