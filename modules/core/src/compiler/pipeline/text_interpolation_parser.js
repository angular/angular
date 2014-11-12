import {RegExpWrapper, StringWrapper} from 'facade/lang';
import {TemplateElement, Node, DOM} from 'facade/dom';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

// TODO(tbosch): Cannot make this const/final right now because of the transpiler...
var INTERPOLATION_REGEXP = RegExpWrapper.create('\\{\\{(.*?)\\}\\}');

/**
 * Parses interpolations in direct text child nodes of the current element.
 *
 * Fills:
 * - CompileElement#textNodeBindings
 */
export class TextInterpolationParser extends CompileStep {
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    var element = current.element;
    var childNodes;
    if (element instanceof TemplateElement) {
      childNodes = element.content.childNodes;
    } else {
      childNodes = element.childNodes;
    }
    for (var i=0; i<childNodes.length; i++) {
      var node = childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        this._parseTextNode(current, node, i);
      }
    }
  }

  _parseTextNode(pipelineElement, node, nodeIndex) {
    // TODO: escape fixed string quotes
    // TODO: add braces around the expression
    // TODO: suppress empty strings
    // TODO: add stringify formatter
    var parts = StringWrapper.split(node.nodeValue, INTERPOLATION_REGEXP);
    if (parts.length > 1) {
      for (var i=0; i<parts.length; i++) {
        if (i%2 === 0) {
          // fixed string
          parts[i] = "'" + parts[i] + "'";
        } else {
          // expression
          parts[i] = "" + parts[i] + "";
        }
      }
      DOM.setText(node, ' ');
      pipelineElement.addTextNodeBinding(nodeIndex, parts.join('+'));
    }
  }
}
