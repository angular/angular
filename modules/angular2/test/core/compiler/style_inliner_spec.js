import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';
import {StyleInliner} from 'angular2/src/core/compiler/style_inliner';

import {isBlank} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {Map, MapWrapper} from 'angular2/src/facade/collection';

import {XHR} from 'angular2/src/core/compiler/xhr/xhr';

export function main() {
  describe('StyleInliner', () => {
    describe('loading', () => {
      it('should return a string when there is no import statement', () => {
        var css = '.main {}';
        var loader = new StyleInliner(null);
        var loadedCss = loader.inlineImports(css);
        expect(loadedCss).not.toBePromise();
        expect(loadedCss).toEqual(css);
      });

      it('should inline @import rules', (done) => {
        var xhr = new FakeXHR();
        xhr.reply('one.css', '.one {}');
        var css = '@import "one.css";.main {}';
        var loader = new StyleInliner(xhr);
        var loadedCss = loader.inlineImports(css);
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
        var xhr = new FakeXHR();
        var css = '@import "one.css";.main {}';
        var loader = new StyleInliner(xhr);
        var loadedCss = loader.inlineImports(css);
        expect(loadedCss).toBePromise();
        PromiseWrapper.then(
          loadedCss,
          function(css) {
            expect(css).toEqual('/* failed to import one.css */\n.main {}');
            done();
          },
          function(e) {
            throw 'fail;'
          }
        );
      });

      it('should inline multiple @import rules', (done) => {
        var xhr = new FakeXHR();
        xhr.reply('one.css', '.one {}');
        xhr.reply('two.css', '.two {}');
        var css = '@import "one.css";@import "two.css";.main {}';
        var loader = new StyleInliner(xhr);
        var loadedCss = loader.inlineImports(css);
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
        var xhr = new FakeXHR();
        xhr.reply('one.css', '@import "two.css";.one {}');
        xhr.reply('two.css', '.two {}');
        var css = '@import "one.css";.main {}';
        var loader = new StyleInliner(xhr);
        var loadedCss = loader.inlineImports(css);
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
        var xhr = new FakeXHR();
        xhr.reply('one.css', '@import "two.css";.one {}');
        xhr.reply('two.css', '@import "one.css";.two {}');
        var css = '@import "one.css";.main {}';
        var loader = new StyleInliner(xhr);
        var loadedCss = loader.inlineImports(css);
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

    });

    describe('media query', () => {
      it('should wrap inlined content in media query', (done) => {
        var xhr = new FakeXHR();
        xhr.reply('one.css', '.one {}');
        var css = '@import "one.css" (min-width: 700px) and (orientation: landscape);';
        var loader = new StyleInliner(xhr);
        var loadedCss = loader.inlineImports(css);
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
