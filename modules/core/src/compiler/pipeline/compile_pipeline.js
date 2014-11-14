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
  constructor(steps:List<CompileStep>) {
    this._control = new CompileControl(steps);
  }

  process(rootElement:Element):List {
    var results = ListWrapper.create();
    this._process(results, null, rootElement);
    return results;
  }

  _process(results, parent:CompileElement, element:Element) {
    var current = new CompileElement(element);
    this._control.internalProcess(results, 0, parent, current);
    var childNodes = DOM.templateAwareRoot(element).childNodes;
    for (var i=0; i<childNodes.length; i++) {
      var node = childNodes[i];
      if (node.nodeType === Node.ELEMENT_NODE) {
        this._process(results, current, node);
      }
    }
  }
}
