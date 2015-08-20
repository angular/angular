import {RegExpWrapper, StringWrapper, isPresent} from 'angular2/src/core/facade/lang';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {Parser} from 'angular2/src/core/change_detection/change_detection';

import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';

/**
 * Parses interpolations in direct text child nodes of the current element.
 */
export class TextInterpolationParser implements CompileStep {
  constructor(public _parser: Parser) {}

  processStyle(style: string): string { return style; }

  processElement(parent: CompileElement, current: CompileElement, control: CompileControl) {
    if (!current.compileChildren) {
      return;
    }
    var element = current.element;
    var childNodes = DOM.childNodes(DOM.templateAwareRoot(element));
    for (var i = 0; i < childNodes.length; i++) {
      var node = childNodes[i];
      if (DOM.isTextNode(node)) {
        var textNode = <Text>node;
        var text = DOM.nodeValue(textNode);
        var expr = this._parser.parseInterpolation(text, current.elementDescription);
        if (isPresent(expr)) {
          DOM.setText(textNode, ' ');
          if (current.element === current.inheritedProtoView.rootElement) {
            current.inheritedProtoView.bindRootText(textNode, expr);
          } else {
            current.bindElement().bindText(textNode, expr);
          }
        }
      }
    }
  }
}
