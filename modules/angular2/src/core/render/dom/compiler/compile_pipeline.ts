import {isPresent, isBlank} from 'angular2/src/core/facade/lang';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {CompileStep} from './compile_step';
import {ProtoViewBuilder} from '../view/proto_view_builder';
import {ProtoViewDto, ViewType, ViewDefinition} from '../../api';

/**
 * CompilePipeline for executing CompileSteps recursively for
 * all elements in a template.
 */
export class CompilePipeline {
  _control: CompileControl;
  constructor(public steps: CompileStep[]) { this._control = new CompileControl(steps); }

  processStyles(styles: string[]): string[] {
    return styles.map(style => {
      this.steps.forEach(step => { style = step.processStyle(style); });
      return style;
    });
  }

  processElements(rootElement: Element, protoViewType: ViewType,
                  viewDef: ViewDefinition): CompileElement[] {
    var results: CompileElement[] = [];
    var compilationCtxtDescription = viewDef.componentId;
    var rootCompileElement = new CompileElement(rootElement, compilationCtxtDescription);
    rootCompileElement.inheritedProtoView =
        new ProtoViewBuilder(rootElement, protoViewType, viewDef.encapsulation);
    rootCompileElement.isViewRoot = true;
    this._processElement(results, null, rootCompileElement, compilationCtxtDescription);
    return results;
  }

  _processElement(results: CompileElement[], parent: CompileElement, current: CompileElement,
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
          this._processElement(results, current, childCompileElement);
        }
        node = nextNode;
      }
    }

    if (isPresent(additionalChildren)) {
      for (var i = 0; i < additionalChildren.length; i++) {
        this._processElement(results, current, additionalChildren[i]);
      }
    }
  }
}
