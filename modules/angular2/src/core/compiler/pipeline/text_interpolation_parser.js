import {RegExpWrapper, StringWrapper, isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/facade/dom';

import {Parser} from 'angular2/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

/**
 * Parses interpolations in direct text child nodes of the current element.
 *
 * Fills:
 * - CompileElement#textNodeBindings
 */
export class TextInterpolationParser extends CompileStep {
  _parser:Parser;
  constructor(parser:Parser) {
    super();
    this._parser = parser;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    if (!current.compileChildren || current.ignoreBindings) {
      return;
    }
    var element = current.element;
    var childNodes = DOM.childNodes(DOM.templateAwareRoot(element));
    for (var i=0; i<childNodes.length; i++) {
      var node = childNodes[i];
      if (DOM.isTextNode(node)) {
        this._parseTextNode(current, node, i);
      }
    }
  }

  _parseTextNode(pipelineElement, node, nodeIndex) {
    var ast = this._parser.parseInterpolation(DOM.nodeValue(node), pipelineElement.elementDescription);
    if (isPresent(ast)) {
      DOM.setText(node, ' ');
      pipelineElement.addTextNodeBinding(nodeIndex, ast);
    }
  }
}
