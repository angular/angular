import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';
import {StyleInliner} from 'angular2/src/core/compiler/style_inliner';

import {isBlank} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {Map, MapWrapper} from 'angular2/src/facade/collection';

import {XHR} from 'angular2/src/core/compiler/xhr/xhr';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {StyleUrlResolver} from 'angular2/src/core/compiler/style_url_resolver';

export function main() {
  describe('StyleInliner', () => {
    var xhr, inliner;

    beforeEach(() => {
      xhr = new FakeXHR();
      var urlResolver = new UrlResolver();
      var styleUrlResolver = new StyleUrlResolver(urlResolver);
      inliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
    });

    describe('loading', () => {
      it('should return a string when there is no import statement', () => {
        var css = '.main {}';
        var loadedCss = inliner.inlineImports(css, 'http://base');
        expect(loadedCss).not.toBePromise();
        expect(loadedCss).toEqual(css);
      });

      it('should inline @import rules', (done) => {
        xhr.reply('http://base/one.css', '.one {}');
        var css = '@import url("one.css");.main {}';
        var loadedCss = inliner.inlineImports(css, 'http://base');
        expect(loadedCss).toBePromise();
        PromiseWrapper.then(
          loadedCss,
          function(css) {
            expect(css).toEqual('.one {}\n.main {}');
            done();
          },
          function(e) {
            throw 'fail;'
          }
        );
      });

      // TODO(vicb): fix the StyleInliner
      xit('should support url([unquoted url]) in @import rules', (done) => {
        xhr.reply('http://base/one.css', '.one {}');
        var css = '@import url(one.css);.main {}';
        var loadedCss = inliner.inlineImports(css, 'http://base');
        expect(loadedCss).toBePromise();
        PromiseWrapper.then(
          loadedCss,
          function(css) {
            expect(css).toEqual('.one {}\n.main {}');
            done();
          },
          function(e) {
            throw 'fail;'
          }
        );
      });

      it('should handle @import error gracefuly', (done) => {
        var css = '@import "one.css";.main {}';
        var loadedCss = inliner.inlineImports(css, 'http://base');
        expect(loadedCss).toBePromise();
        PromiseWrapper.then(
          loadedCss,
          function(css) {
            expect(css).toEqual('/* failed to import http://base/one.css */\n.main {}');
            done();
          },
          function(e) {
            throw 'fail;'
          }
        );
      });

      it('should inline multiple @import rules', (done) => {
        xhr.reply('http://base/one.css', '.one {}');
        xhr.reply('http://base/two.css', '.two {}');
        var css = '@import "one.css";@import "two.css";.main {}';
        var loadedCss = inliner.inlineImports(css, 'http://base');
        expect(loadedCss).toBePromise();
        PromiseWrapper.then(
          loadedCss,
          function(css) {
            expect(css).toEqual('.one {}\n.two {}\n.main {}');
            done();
          },
          function(e) {
            throw 'fail;'
          }
        );
      });

      it('should inline nested @import rules', (done) => {
        xhr.reply('http://base/one.css', '@import "two.css";.one {}');
        xhr.reply('http://base/two.css', '.two {}');
        var css = '@import "one.css";.main {}';
        var loadedCss = inliner.inlineImports(css, 'http://base/');
        expect(loadedCss).toBePromise();
        PromiseWrapper.then(
          loadedCss,
          function(css) {
            expect(css).toEqual('.two {}\n.one {}\n.main {}');
            done();
          },
          function(e) {
            throw 'fail;'
          }
        );
      });

      it('should handle circular dependencies gracefuly', (done) => {
        xhr.reply('http://base/one.css', '@import "two.css";.one {}');
        xhr.reply('http://base/two.css', '@import "one.css";.two {}');
        var css = '@import "one.css";.main {}';
        var loadedCss = inliner.inlineImports(css, 'http://base/');
        expect(loadedCss).toBePromise();
        PromiseWrapper.then(
          loadedCss,
          function(css) {
            expect(css).toEqual('.two {}\n.one {}\n.main {}');
            done();
          },
          function(e) {
            throw 'fail;'
          }
        );
      });

      it('should handle invalid @import fracefuly', (done) => {
        // Invalid rule: the url is not quoted
        var css = '@import one.css;.main {}';
        var loadedCss = inliner.inlineImports(css, 'http://base/');
        expect(loadedCss).toBePromise();
        PromiseWrapper.then(
          loadedCss,
          function(css) {
            expect(css).toEqual('/* Invalid import rule: "@import one.css;" */.main {}');
            done();
          },
          function(e) {
            throw 'fail;'
          }
        );
      });
    });

    describe('media query', () => {
      it('should wrap inlined content in media query', (done) => {
        xhr.reply('http://base/one.css', '.one {}');
        var css = '@import "one.css" (min-width: 700px) and (orientation: landscape);';
        var loadedCss = inliner.inlineImports(css, 'http://base/');
        expect(loadedCss).toBePromise();
        PromiseWrapper.then(
          loadedCss,
          function(css) {
            expect(css).toEqual('@media (min-width: 700px) and (orientation: landscape) {\n.one {}\n}\n');
            done();
          },
          function(e) {
            throw 'fail;'
          }
        );
      });
    });

    describe('url rewritting', () => {
      it('should rewrite url in inlined content', (done) => {
        // it should rewrite both '@import' and 'url()'
        xhr.reply('http://base/one.css', '@import "./nested/two.css";.one {background-image: url("one.jpg");}');
        xhr.reply('http://base/nested/two.css', '.two {background-image: url("../img/two.jpg");}');
        var css = '@import "one.css";'
        var loadedCss = inliner.inlineImports(css, 'http://base/');
        expect(loadedCss).toBePromise();
        PromiseWrapper.then(
          loadedCss,
          function(css) {
            expect(css).toEqual(
              ".two {background-image: url('http://base/img/two.jpg');}\n" +
              ".one {background-image: url('http://base/one.jpg');}\n"
            );
            done();
          },
          function(e) {
            throw 'fail;'
          }
        );
      });
    });
  });
}

class FakeXHR extends XHR {
  _responses: Map;

  constructor() {
    super();
    this._responses = MapWrapper.create();
  }

  get(url: string): Promise<string> {
    var response = MapWrapper.get(this._responses, url);
    if (isBlank(response)) {
      return PromiseWrapper.reject('xhr error');
    }

    return PromiseWrapper.resolve(response);
  }

  reply(url: string, response: string) {
    MapWrapper.set(this._responses, url, response);
  }
}
