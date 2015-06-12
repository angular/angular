import {RegExpWrapper, StringWrapper, isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {Parser} from 'angular2/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

/**
 * Parses interpolations in direct text child nodes of the current element.
 */
export class TextInterpolationParser implements CompileStep {
  constructor(public _parser: Parser) {}

  process(parent: CompileElement, current: CompileElement, control: CompileControl) {
    if (!current.compileChildren) {
      return;
    }
    var element = current.element;
    var childNodes = DOM.childNodes(DOM.templateAwareRoot(element));
    for (var i = 0; i < childNodes.length; i++) {
      var node = childNodes[i];
      if (DOM.isTextNode(node)) {
        var text = DOM.nodeValue(node);
        var expr = this._parser.parseInterpolation(text, current.elementDescription);
        if (isPresent(expr)) {
          DOM.setText(node, ' ');
          current.bindElement().bindText(i, expr);
        }
      }
    }
  }
}
