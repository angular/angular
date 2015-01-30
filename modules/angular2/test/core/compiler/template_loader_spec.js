import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {Component} from 'angular2/src/core/annotations/annotations';
import {TemplateConfig} from 'angular2/src/core/annotations/template_config';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';

import {PromiseWrapper} from 'angular2/src/facade/async';

import {XHRMock} from 'angular2/src/mock/xhr_mock';

export function main() {
  describe('TemplateLoader', () => {
    var loader, xhr;

    beforeEach(() => {
      xhr = new XHRMock()
      loader = new TemplateLoader(xhr);
    });

    function createMetadata({inline = null, url = null}={}) {
      var config = new TemplateConfig({url: url, inline: inline});
      var component = new Component({template: config});
      return new DirectiveMetadata(FakeComponent, component, null);
    }

    it('should load inline templates', (done) => {
      var template = 'inline template';
      var md = createMetadata({inline: template});
      loader.load(md).then((el) => {
        expect(el.content).toHaveText(template);
        done();
      });
    });

    it('should load templates through XHR', (done) => {
      var url = '/foo';
      var template = 'xhr template';
      xhr.expect(url, template);
      var md = createMetadata({url: '/foo'});
      loader.load(md).then((el) => {
        expect(el.content).toHaveText(template);
        done();
      });
      xhr.flush();
    });

    it('should cache template loaded through XHR', (done) => {
      var firstEl;
      var url = '/foo';
      var template = 'xhr template';
      xhr.expect(url, template);
      var md = createMetadata({url: '/foo'});
      loader.load(md)
        .then((el) => {
          firstEl = el;
          return loader.load(md);
        })
        .then((el) =>{
          expect(el).toBe(firstEl);
          expect(el.content).toHaveText(template);
          done();
        });
      xhr.flush();
    });

    it('should throw when no template is defined', () => {
      var md = createMetadata();
      expect(() => loader.load(md))
        .toThrowError('No template configured for component FakeComponent');
    });

    it('should return a rejected Promise when xhr loading fails', (done) => {
      var url = '/foo';
      xhr.expect(url, null);
      var md = createMetadata({url: '/foo'});
      PromiseWrapper.then(loader.load(md),
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

class FakeComponent {
}
