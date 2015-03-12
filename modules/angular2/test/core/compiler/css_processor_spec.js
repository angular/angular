import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';
import {CssProcessor, CssTransformer} from 'angular2/src/core/compiler/css_processor';

import {ShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';

import {CompilePipeline} from 'angular2/src/core/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'angular2/src/core/compiler/pipeline/compile_element';
import {CompileStep} from 'angular2/src/core/compiler/pipeline/compile_step';
import {CompileControl} from 'angular2/src/core/compiler/pipeline/compile_control';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {Component} from 'angular2/src/core/annotations/annotations';

import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';

import {ListWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('CssProcessor', () => {
    describe('compile step', () => {
      function createPipeline(cssProcessor: CssProcessor, strategy: ShadowDomStrategy,
                              templateUrl: string) {
        var annotation = new Component();
        var meta = new DirectiveMetadata(SomeComponent, annotation);
        return new CompilePipeline([
          cssProcessor.getCompileStep(meta, strategy, templateUrl)
        ]);
      }

      it('it should set ignoreBindings to true for style elements', () => {
        var strategy = new FakeShadowDomStrategy(null);
        var cssProcessor = new CssProcessor(null);

        var pipeline = createPipeline(cssProcessor, strategy, 'http://base');
        var results = pipeline.process(el('<div><style></style></div>'));

        expect(results[0].ignoreBindings).toBe(false);
        expect(results[1].ignoreBindings).toBe(true);
      });

      it('should execute the strategy step for style elements', () => {
        var processedEls = [];
        var compileStep = new MockStep((parent, current, control) => {
          ListWrapper.push(processedEls, current.element);
        });
        var strategy = new FakeShadowDomStrategy(compileStep);

        var cssProcessor = new CssProcessor(null);
        var pipeline = createPipeline(cssProcessor, strategy, 'http://base');
        var results = pipeline.process(el('<div><style></style></div>'));

        expect(processedEls.length).toEqual(1);
        expect(processedEls[0]).toBe(results[1].element);
      });

      it('should apply the given transformers', () => {
        var strategy = new FakeShadowDomStrategy(null);
        var cssProcessor = new CssProcessor([
          new FakeCssTransformer('/*transformer1 */'),
          new FakeCssTransformer('/*transformer2 */'),
        ]);

        var pipeline = createPipeline(cssProcessor, strategy, 'http://base');
        var results = pipeline.process(el('<div><style></style></div>'));

        expect(results[1].element).toHaveText('/*transformer1 *//*transformer2 */');
      });
    });
  });
}

class FakeShadowDomStrategy extends ShadowDomStrategy {
  _compileStep: CompileStep;

  constructor(compileStep: CompileStep) {
    super();
    this._compileStep = compileStep;
  }

  getStyleCompileStep(cmpMetadata: DirectiveMetadata, templateUrl: string): CompileStep {
    return this._compileStep;
  }
}

class MockStep extends CompileStep {
  processClosure:Function;
  constructor(process) {
    super();
    this.processClosure = process;
  }
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    this.processClosure(parent, current, control);
  }
}

class FakeCssTransformer extends CssTransformer {
  _css: string;

  constructor(css: string) {
    super();
    this._css = css;
  }

  transform(styleEl) {
    var cssText = DOM.getText(styleEl);
    cssText += this._css;
    DOM.setText(styleEl, cssText);
  }
}

class SomeComponent {}
