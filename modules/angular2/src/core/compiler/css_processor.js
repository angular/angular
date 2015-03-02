import {DOM} from 'angular2/src/dom/dom_adapter';

import {isPresent} from 'angular2/src/facade/lang';

import {CompileStep} from './pipeline/compile_step';
import {CompileElement} from './pipeline/compile_element';
import {CompileControl} from './pipeline/compile_control';

import {ShadowDomStrategy} from './shadow_dom_strategy';
import {DirectiveMetadata} from './directive_metadata';

/**
 * Processes the <style> tags during the compilation.
 */
export class CssProcessor {

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
    return new _CssProcessorStep(strategyStep);
  }
}

class _CssProcessorStep extends CompileStep {
  _strategyStep: CompileStep;

  constructor(strategyStep: CompileStep) {
    super();
    this._strategyStep = strategyStep;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    if (DOM.tagName(current.element) == 'STYLE') {
      current.ignoreBindings = true;

      if (isPresent(this._strategyStep)) {
        this._strategyStep.process(parent, current, control);
      }
    }
  }
}
