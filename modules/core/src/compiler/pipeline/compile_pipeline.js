import {isPresent} from 'facade/lang';
import {List, ListWrapper} from 'facade/collection';
import {Element, Node, DOM} from 'facade/dom';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {CompileStep} from './compile_step';
import {AnnotatedType} from '../annotated_type';

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

    var childNodes = DOM.templateAwareRoot(current.element).childNodes;
    for (var i=0; i<childNodes.length; i++) {
      var node = childNodes[i];
      if (node.nodeType === Node.ELEMENT_NODE) {
        this._process(results, current, new CompileElement(node));
      }
    }

    if (isPresent(additionalChildren)) {
      for (var i=0; i<additionalChildren.length; i++) {
        this._process(results, current, additionalChildren[i]);
      }
    }
  }
}
