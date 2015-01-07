import {isPresent} from 'facade/lang';
import {List, ListWrapper} from 'facade/collection';
import {Element, Node, DOM} from 'facade/dom';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {CompileStep} from './compile_step';
import {DirectiveMetadata} from '../directive_metadata';

/**
 * CompilePipeline for executing CompileSteps recursively for
 * all elements in a template.
 */
export class CompilePipeline {
  _control:CompileControl;
  constructor(steps:List<CompileStep>) {
    this._control = new CompileControl(steps);
  }

  process(rootElement:Element):List {
    var results = ListWrapper.create();
    this._process(results, null, new CompileElement(rootElement));
    return results;
  }

  _process(results, parent:CompileElement, current:CompileElement) {
    var additionalChildren = this._control.internalProcess(results, 0, parent, current);
    var node = DOM.templateAwareRoot(current.element).firstChild;
    while (isPresent(node)) {
      // compiliation can potentially move the node, so we need to store the
      // next sibling before recursing.
      var nextNode = DOM.nextSibling(node);
      if (node.nodeType === Node.ELEMENT_NODE) {
        this._process(results, current, new CompileElement(node));
      }
      node = nextNode;
    }

    if (isPresent(additionalChildren)) {
      for (var i=0; i<additionalChildren.length; i++) {
        this._process(results, current, additionalChildren[i]);
      }
    }
  }
}
