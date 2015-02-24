import {isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {Element, DOM} from 'angular2/src/facade/dom';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {CompileStep} from './compile_step';

/**
 * CompilePipeline for executing CompileSteps recursively for
 * all elements in a template.
 */
export class CompilePipeline {
  _control:CompileControl;
  constructor(steps:List<CompileStep>) {
    this._control = new CompileControl(steps);
  }

  process(rootElement:Element, compilationCtxtDescription:string = ''):List {
    var results = ListWrapper.create();
    this._process(results, null, new CompileElement(rootElement, compilationCtxtDescription), compilationCtxtDescription);
    return results;
  }

  _process(results, parent:CompileElement, current:CompileElement, compilationCtxtDescription:string = '') {
    var additionalChildren = this._control.internalProcess(results, 0, parent, current);

    if (current.compileChildren) {
      var node = DOM.firstChild(DOM.templateAwareRoot(current.element));
      while (isPresent(node)) {
        // compiliation can potentially move the node, so we need to store the
        // next sibling before recursing.
        var nextNode = DOM.nextSibling(node);
        if (DOM.isElementNode(node)) {
          this._process(results, current, new CompileElement(node, compilationCtxtDescription));
        }
        node = nextNode;
      }
    }

    if (isPresent(additionalChildren)) {
      for (var i=0; i<additionalChildren.length; i++) {
        this._process(results, current, additionalChildren[i]);
      }
    }
  }
}
