import {isPresent} from 'angular2/src/facade/lang';
import {
  Renderer,
  RootRenderer,
  RenderComponentType,
  RenderDebugInfo
} from 'angular2/src/core/render/api';
import {
  DebugNode,
  DebugElement,
  EventListener,
  getDebugNode,
  indexDebugNode,
  removeDebugNodeFromIndex
} from 'angular2/src/core/debug/debug_node';

export class DebugDomRootRenderer implements RootRenderer {
  constructor(private _delegate: RootRenderer) {}

  renderComponent(componentProto: RenderComponentType): Renderer {
    return new DebugDomRenderer(this, this._delegate.renderComponent(componentProto));
  }
}

export class DebugDomRenderer implements Renderer {
  constructor(private _rootRenderer: DebugDomRootRenderer, private _delegate: Renderer) {}

  renderComponent(componentType: RenderComponentType): Renderer {
    return this._rootRenderer.renderComponent(componentType);
  }

  selectRootElement(selector: string): any {
    var nativeEl = this._delegate.selectRootElement(selector);
    var debugEl = new DebugElement(nativeEl, null);
    indexDebugNode(debugEl);
    return nativeEl;
  }

  createElement(parentElement: any, name: string): any {
    var nativeEl = this._delegate.createElement(parentElement, name);
    var debugEl = new DebugElement(nativeEl, getDebugNode(parentElement));
    debugEl.name = name;
    indexDebugNode(debugEl);
    return nativeEl;
  }

  createViewRoot(hostElement: any): any { return this._delegate.createViewRoot(hostElement); }

  createTemplateAnchor(parentElement: any): any {
    var comment = this._delegate.createTemplateAnchor(parentElement);
    var debugEl = new DebugNode(comment, getDebugNode(parentElement));
    indexDebugNode(debugEl);
    return comment;
  }

  createText(parentElement: any, value: string): any {
    var text = this._delegate.createText(parentElement, value);
    var debugEl = new DebugNode(text, getDebugNode(parentElement));
    indexDebugNode(debugEl);
    return text;
  }

  projectNodes(parentElement: any, nodes: any[]) {
    var debugParent = getDebugNode(parentElement);
    if (isPresent(debugParent) && debugParent instanceof DebugElement) {
      nodes.forEach((node) => { debugParent.addChild(getDebugNode(node)); });
    }
    return this._delegate.projectNodes(parentElement, nodes);
  }

  attachViewAfter(node: any, viewRootNodes: any[]) {
    var debugNode = getDebugNode(node);
    if (isPresent(debugNode)) {
      var debugParent = debugNode.parent;
      if (viewRootNodes.length > 0 && isPresent(debugParent)) {
        var debugViewRootNodes: DebugNode[] = [];
        viewRootNodes.forEach((rootNode) => debugViewRootNodes.push(getDebugNode(rootNode)));
        debugParent.insertChildrenAfter(debugNode, debugViewRootNodes);
      }
    }
    return this._delegate.attachViewAfter(node, viewRootNodes);
  }

  detachView(viewRootNodes: any[]) {
    viewRootNodes.forEach((node) => {
      var debugNode = getDebugNode(node);
      if (isPresent(debugNode) && isPresent(debugNode.parent)) {
        debugNode.parent.removeChild(debugNode);
      }
    });
    return this._delegate.detachView(viewRootNodes);
  }

  destroyView(hostElement: any, viewAllNodes: any[]) {
    viewAllNodes.forEach((node) => { removeDebugNodeFromIndex(getDebugNode(node)); });
    return this._delegate.destroyView(hostElement, viewAllNodes);
  }

  listen(renderElement: any, name: string, callback: Function) {
    var debugEl = getDebugNode(renderElement);
    if (isPresent(debugEl)) {
      debugEl.listeners.push(new EventListener(name, callback));
    }
    return this._delegate.listen(renderElement, name, callback);
  }

  listenGlobal(target: string, name: string, callback: Function): Function {
    return this._delegate.listenGlobal(target, name, callback);
  }

  setElementProperty(renderElement: any, propertyName: string, propertyValue: any) {
    var debugEl = getDebugNode(renderElement);
    if (isPresent(debugEl) && debugEl instanceof DebugElement) {
      debugEl.properties.set(propertyName, propertyValue);
    }
    return this._delegate.setElementProperty(renderElement, propertyName, propertyValue);
  }

  setElementAttribute(renderElement: any, attributeName: string, attributeValue: string) {
    var debugEl = getDebugNode(renderElement);
    if (isPresent(debugEl) && debugEl instanceof DebugElement) {
      debugEl.attributes.set(attributeName, attributeValue);
    }
    return this._delegate.setElementAttribute(renderElement, attributeName, attributeValue);
  }

  /**
   * Used only in debug mode to serialize property changes to comment nodes,
   * such as <template> placeholders.
   */
  setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string) {
    return this._delegate.setBindingDebugInfo(renderElement, propertyName, propertyValue);
  }

  /**
   * Used only in development mode to set information needed by the DebugNode for this element.
   */
  setElementDebugInfo(renderElement: any, info: RenderDebugInfo) {
    var debugEl = getDebugNode(renderElement);
    debugEl.setDebugInfo(info);
    return this._delegate.setElementDebugInfo(renderElement, info);
  }

  setElementClass(renderElement: any, className: string, isAdd: boolean) {
    return this._delegate.setElementClass(renderElement, className, isAdd);
  }

  setElementStyle(renderElement: any, styleName: string, styleValue: string) {
    return this._delegate.setElementStyle(renderElement, styleName, styleValue);
  }

  invokeElementMethod(renderElement: any, methodName: string, args: any[]) {
    return this._delegate.invokeElementMethod(renderElement, methodName, args);
  }

  setText(renderNode: any, text: string) { return this._delegate.setText(renderNode, text); }
}
