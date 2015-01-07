import {RegExpWrapper, StringWrapper, isPresent} from 'facade/lang';
import {Node, DOM} from 'facade/dom';

import {Parser} from 'change_detection/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

// TODO(tbosch): Cannot make this const/final right now because of the transpiler...
var INTERPOLATION_REGEXP = RegExpWrapper.create('\\{\\{(.*?)\\}\\}');
var QUOTE_REGEXP = RegExpWrapper.create("'");

export function interpolationToExpression(value:string):string {
  // TODO: add stringify formatter when we support formatters
  var parts = StringWrapper.split(value, INTERPOLATION_REGEXP);
  if (parts.length <= 1) {
    return null;
  }
  var expression = '';
  for (var i=0; i<parts.length; i++) {
    var expressionPart = null;
    if (i%2 === 0) {
      // fixed string
      if (parts[i].length > 0) {
        expressionPart = "'" + StringWrapper.replaceAll(parts[i], QUOTE_REGEXP, "\\'") + "'";
      }
    } else {
      // expression
      expressionPart = "(" + parts[i] + ")";
    }
    if (isPresent(expressionPart)) {
      if (expression.length > 0) {
        expression += '+';
      }
      expression += expressionPart;
    }
  }
  return expression;
}

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
    var expression = interpolationToExpression(node.nodeValue);
    if (isPresent(expression)) {
      DOM.setText(node, ' ');
      pipelineElement.addTextNodeBinding(nodeIndex, this._parser.parseBinding(expression, this._compilationUnit));
    }
  }
}
