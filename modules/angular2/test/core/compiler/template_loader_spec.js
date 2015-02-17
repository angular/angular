import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';

import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';

import {Template} from 'angular2/src/core/annotations/template';

import {PromiseWrapper} from 'angular2/src/facade/async';
import {Type, stringify, isPresent} from 'angular2/src/facade/lang';

import {XHRMock} from 'angular2/src/mock/xhr_mock';

export function main() {
  describe('TemplateLoader', () => {
    var loader, xhr;

    beforeEach(() => {
      xhr = new XHRMock()
      loader = new TemplateLoader(xhr);
    });

    it('should load inline templates synchronously', () => {
      var template = new Template({inline: 'inline template'});
      expect(loader.load(template).content).toHaveText('inline template');
    });

    it('should load templates through XHR', (done) => {
      xhr.expect('/foo', 'xhr template');
      var template = new Template({url: '/foo'});
      loader.load(template).then((el) => {
        expect(el.content).toHaveText('xhr template');
        done();
      });
      xhr.flush();
    });

    it('should cache template loaded through XHR', (done) => {
      var firstEl;
      xhr.expect('/foo', 'xhr template');
      var template = new Template({url: '/foo'});
      loader.load(template)
        .then((el) => {
          firstEl = el;
          return loader.load(template);
        })
        .then((el) =>{
          expect(el).toBe(firstEl);
          expect(el.content).toHaveText('xhr template');
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
      xhr.expect('/foo', null);
      var template = new Template({url: '/foo'});
      PromiseWrapper.then(loader.load(template),
        function(_) { throw 'Unexpected response'; },
        function(error) {
          expect(error).toEqual('Failed to load /foo');
          done();
        }
      )
      xhr.flush();
    });

  });
}

class SomeComponent {
}
