import {RegExpWrapper, StringWrapper, isPresent} from 'angular2/src/facade/lang';
import {Node, DOM} from 'angular2/src/facade/dom';

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
  _compilationUnit:any;
  constructor(parser:Parser, compilationUnit:any) {
    this._parser = parser;
    this._compilationUnit = compilationUnit;
  }

  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    if (!current.compileChildren) {
      return;
    }
    var element = current.element;
    var childNodes = DOM.templateAwareRoot(element).childNodes;
    for (var i=0; i<childNodes.length; i++) {
      var node = childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        this._parseTextNode(current, node, i);
      }
    }
  }

  _parseTextNode(pipelineElement, node, nodeIndex) {
    var ast = this._parser.parseInterpolation(node.nodeValue, this._compilationUnit);
    if (isPresent(ast)) {
      DOM.setText(node, ' ');
      pipelineElement.addTextNodeBinding(nodeIndex, ast);
    }
  }
}
