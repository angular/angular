import {Injectable} from 'angular2/di';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {isPresent} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';

import {CompileStep} from './pipeline/compile_step';
import {CompileElement} from './pipeline/compile_element';
import {CompileControl} from './pipeline/compile_control';

import {ShadowDomStrategy} from './shadow_dom_strategy';
import {DirectiveMetadata} from './directive_metadata';

/**
 * Processes the <style> tags during the compilation:
 * - Apply any given transformers,
 * - Apply the shadow DOM strategy style step.
 */
@Injectable()
export class CssProcessor {
  _transformers: List<CssTransformer>;

  constructor(transformers: List<CssTransformer>) {
    this._transformers = transformers;
  }

  /**
   * Returns a compile step to be added to the compiler pipeline.
   *
   * @param {DirectiveMetadata} cmpMetadata
   * @param {ShadowDomStrategy} shadowDomStrategy
   * @param {string} templateUrl The base URL of the template
   */
  getCompileStep(cmpMetadata: DirectiveMetadata, shadowDomStrategy: ShadowDomStrategy,
    templateUrl: string) {
    var strategyStep = shadowDomStrategy.getStyleCompileStep(cmpMetadata, templateUrl);
    return new _CssProcessorStep(strategyStep, this._transformers);
  }
}

export class CssTransformer {
  transform(styleElement) {};
}

class _CssProcessorStep extends CompileStep {
  _strategyStep: CompileStep;
  _transformers: List<CssTransformer>;

  constructor(strategyStep: CompileStep, transformers: List<CssTransformer>) {
    super();
    this._strategyStep = strategyStep;
    this._transformers = transformers;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    if (DOM.tagName(current.element) == 'STYLE') {
      current.ignoreBindings = true;

      if (isPresent(this._transformers)) {
        var styleEl = current.element;
        for (var i = 0; i < this._transformers.length; i++) {
          this._transformers[i].transform(styleEl);
        }
      }

      if (isPresent(this._strategyStep)) {
        this._strategyStep.process(parent, current, control);
      }
    }
  }
}
