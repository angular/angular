import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {CompileStep} from './compile_step';
import {ProtoViewBuilder} from '../view/proto_view_builder';
import {ProtoViewDto, ViewType} from '../../api';

/**
 * CompilePipeline for executing CompileSteps recursively for
 * all elements in a template.
 */
export class CompilePipeline {
  _control: CompileControl;
  constructor(steps: List<CompileStep>) { this._control = new CompileControl(steps); }

  process(rootElement, protoViewType: ViewType = null,
          compilationCtxtDescription: string = ''): List<CompileElement> {
    if (isBlank(protoViewType)) {
      protoViewType = ViewType.COMPONENT;
    }
    var results = ListWrapper.create();
    var rootCompileElement = new CompileElement(rootElement, compilationCtxtDescription);
    rootCompileElement.inheritedProtoView = new ProtoViewBuilder(rootElement, protoViewType);
    rootCompileElement.isViewRoot = true;
    this._process(results, null, rootCompileElement, compilationCtxtDescription);
    return results;
  }

  _process(results, parent: CompileElement, current: CompileElement,
           compilationCtxtDescription: string = '') {
    var additionalChildren = this._control.internalProcess(results, 0, parent, current);

    if (current.compileChildren) {
      var node = DOM.firstChild(DOM.templateAwareRoot(current.element));
      while (isPresent(node)) {
        // compiliation can potentially move the node, so we need to store the
        // next sibling before recursing.
        var nextNode = DOM.nextSibling(node);
        if (DOM.isElementNode(node)) {
          var childCompileElement = new CompileElement(node, compilationCtxtDescription);
          childCompileElement.inheritedProtoView = current.inheritedProtoView;
          childCompileElement.inheritedElementBinder = current.inheritedElementBinder;
          childCompileElement.distanceToInheritedBinder = current.distanceToInheritedBinder + 1;
          this._process(results, current, childCompileElement);
        }
        node = nextNode;
      }
    }

    if (isPresent(additionalChildren)) {
      for (var i = 0; i < additionalChildren.length; i++) {
        this._process(results, current, additionalChildren[i]);
      }
    }
  }
}
