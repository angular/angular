import {describe, beforeEach, expect, it, iit, ddescribe, el} from 'test_lib/test_lib';

import {CompilePipeline} from 'core/src/compiler/pipeline/compile_pipeline';
import {ShadowDomTransformer} from 'core/src/compiler/pipeline/shadow_dom_transformer';
import {Component} from 'core/src/annotations/annotations';
import {DirectiveMetadata} from 'core/src/compiler/directive_metadata';
import {ShadowDomStrategy} from 'core/src/compiler/shadow_dom_strategy';
import {shimCssText} from 'core/src/compiler/shadow_dom_emulation/shim_css';

import {DOM} from 'facade/src/dom';
import {MapWrapper} from 'facade/src/collection';

export function main() {
  describe('ShadowDomTransformer', () => {
    function createPipeline(selector, strategy:ShadowDomStrategy, styleHost) {
      var component = new Component({selector: selector});
      var meta = new DirectiveMetadata(null, component, null);
      return new CompilePipeline([
        new ShadowDomTransformer(meta, strategy, styleHost),
      ]);
    }

    it('it should set ignoreBindings to true for style elements', () => {
      var host = DOM.createElement('div');
      var pipeline = createPipeline('foo', new FakeStrategy(false, false), host);
      var results = pipeline.process(el('<div><style></style></div>'));
      expect(results[0].ignoreBindings).toBe(false);
      expect(results[1].ignoreBindings).toBe(true);
    });

    describe('css', () => {
      it('should not extract the styles when extractStyles() is false', () => {
        var host = DOM.createElement('div');
        var pipeline = createPipeline('foo', new FakeStrategy(false, false), host);
        var template = el('<style>.s{}</style>');
        pipeline.process(template);
        expect(template).toHaveText('.s{}');
      });

      it('should move the styles to the host when extractStyles() is true', () => {
        var host = DOM.createElement('div');
        var pipeline = createPipeline('foo', new FakeStrategy(true, false), host);
        var template = el('<div><style>.s{}</style></div>');
        pipeline.process(template);
        expect(template).toHaveText('');
        expect(host).toHaveText('.s{}');
      });

      it('should preserve original content when moving styles', () => {
        var host = el('<div>original content</div>');
        var pipeline = createPipeline('foo', new FakeStrategy(true, false), host);
        var template = el('<div><style>.s{}</style></div>');
        pipeline.process(template);
        expect(template).toHaveText('');
        expect(host).toHaveText('.s{}original content');
      });

      it('should move the styles to the host in the original order', () => {
        var host = DOM.createElement('div');
        var pipeline = createPipeline('foo', new FakeStrategy(true, false), host);
        var template = el('<div><style>.s1{}</style><style>.s2{}</style></div>');
        pipeline.process(template);
        expect(host).toHaveText('.s1{}.s2{}');
      });

      it('should shim the styles when shim() and extractStyles() are true', () => {
        var host = DOM.createElement('div');
        var pipeline = createPipeline('foo', new FakeStrategy(true, true), host);
        var template = el('<div><style>.s1{}</style></div>');
        pipeline.process(template);
        expect(host).toHaveText(shimCssText('.s1{}', 'foo'));
      });
    });

    describe('html', () => {
      it('should add an attribute to all children when shim() is true', () => {
        var host = DOM.createElement('div');
        var pipeline = createPipeline('foo', new FakeStrategy(false, true), host);
        var template = el('<div><span></span></div>');
        pipeline.process(template);
        expect(DOM.getOuterHTML(template)).toEqual('<div foo=""><span foo=""></span></div>')
      });

      it('should not modify the template when shim() is false', () => {
        var host = DOM.createElement('div');
        var pipeline = createPipeline('foo', new FakeStrategy(false, false), host);
        var template = el('<div><span></span></div>');
        pipeline.process(template);
        expect(DOM.getOuterHTML(template)).toEqual('<div><span></span></div>')
      });
    });
  });
}

class FakeStrategy extends ShadowDomStrategy {
  _extractStyles: boolean;
  _shim: boolean;

  constructor(extractStyles: boolean, shim: boolean) {
    this._extractStyles = extractStyles;
    this._shim = shim;
  }

  extractStyles(): boolean {
    return this._extractStyles;
  }

  shim(): boolean {
    return this._shim;
  }
}
