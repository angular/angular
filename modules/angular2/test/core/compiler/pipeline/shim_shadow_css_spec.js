import {describe, beforeEach, expect, it, iit, ddescribe, el} from 'angular2/test_lib';

import {CompilePipeline} from 'angular2/src/core/compiler/pipeline/compile_pipeline';
import {ShimShadowCss} from 'angular2/src/core/compiler/pipeline/shim_shadow_css';
import {ShimComponent} from 'angular2/src/core/compiler/shadow_dom_emulation/shim_component';

import {Component} from 'angular2/src/core/annotations/annotations';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';
import {ShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';

import {Type} from 'angular2/src/facade/lang';

export function main() {
  describe('ShimShadowCss', () => {
    function createPipeline(strategy:ShadowDomStrategy, styleHost) {
      var component = new Component({selector: 'selector'});
      var meta = new DirectiveMetadata(null, component);
      var shimShadowCss = new ShimShadowCss(meta, strategy, styleHost);
      return new CompilePipeline([shimShadowCss]);
    }

    it('it should set ignoreBindings to true for style elements', () => {
      var host = el('<div></div>');
      var pipeline = createPipeline(new FakeStrategy(false), host);
      var results = pipeline.process(el('<div><style></style></div>'));
      expect(results[0].ignoreBindings).toBe(false);
      expect(results[1].ignoreBindings).toBe(true);
    });

    it('should not extract the styles when extractStyles() is false', () => {
      var host = el('<div></div>');
      var pipeline = createPipeline(new FakeStrategy(false), host);
      var template = el('<style>.s{}</style>');
      pipeline.process(template);
      expect(template).toHaveText('.s{}');
    });

    it('should move the styles to the host when extractStyles() is true', () => {
      var host = el('<div></div>');
      var pipeline = createPipeline(new FakeStrategy(true), host);
      var template = el('<div><style>.s{}</style></div>');
      pipeline.process(template);
      expect(template).toHaveText('');
      expect(host).toHaveText('/* shim */.s{}');
    });

    it('should preserve original content when moving styles', () => {
      var host = el('<div>original content</div>');
      var pipeline = createPipeline(new FakeStrategy(true), host);
      var template = el('<div><style>.s{}</style></div>');
      pipeline.process(template);
      expect(template).toHaveText('');
      expect(host).toHaveText('/* shim */.s{}original content');
    });

    it('should move the styles to the host in the original order', () => {
      var host = el('<div></div>');
      var pipeline = createPipeline(new FakeStrategy(true), host);
      var template = el('<div><style>.s1{}</style><style>.s2{}</style></div>');
      pipeline.process(template);
      expect(host).toHaveText('/* shim */.s1{}/* shim */.s2{}');
    });
  });
}

class FakeStrategy extends ShadowDomStrategy {
  _extractStyles: boolean;

  constructor(extractStyles: boolean) {
    super();
    this._extractStyles = extractStyles;
  }

  extractStyles(): boolean {
    return this._extractStyles;
  }

  getShimComponent(component: Type): ShimComponent {
    return new FakeShimComponent(component);
  }
}

class FakeShimComponent extends ShimComponent {
  constructor(component: Type) {
    super(component);
  }

  shimCssText(cssText: string): string {
    return '/* shim */' + cssText;
  }
}
