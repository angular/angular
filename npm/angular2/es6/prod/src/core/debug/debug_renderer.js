import { isPresent } from 'angular2/src/facade/lang';
import { DebugNode, DebugElement, EventListener, getDebugNode, indexDebugNode, removeDebugNodeFromIndex } from 'angular2/src/core/debug/debug_node';
export class DebugDomRootRenderer {
    constructor(_delegate) {
        this._delegate = _delegate;
    }
    renderComponent(componentProto) {
        return new DebugDomRenderer(this._delegate.renderComponent(componentProto));
    }
}
export class DebugDomRenderer {
    constructor(_delegate) {
        this._delegate = _delegate;
    }
    selectRootElement(selectorOrNode, debugInfo) {
        var nativeEl = this._delegate.selectRootElement(selectorOrNode, debugInfo);
        var debugEl = new DebugElement(nativeEl, null, debugInfo);
        indexDebugNode(debugEl);
        return nativeEl;
    }
    createElement(parentElement, name, debugInfo) {
        var nativeEl = this._delegate.createElement(parentElement, name, debugInfo);
        var debugEl = new DebugElement(nativeEl, getDebugNode(parentElement), debugInfo);
        debugEl.name = name;
        indexDebugNode(debugEl);
        return nativeEl;
    }
    createViewRoot(hostElement) { return this._delegate.createViewRoot(hostElement); }
    createTemplateAnchor(parentElement, debugInfo) {
        var comment = this._delegate.createTemplateAnchor(parentElement, debugInfo);
        var debugEl = new DebugNode(comment, getDebugNode(parentElement), debugInfo);
        indexDebugNode(debugEl);
        return comment;
    }
    createText(parentElement, value, debugInfo) {
        var text = this._delegate.createText(parentElement, value, debugInfo);
        var debugEl = new DebugNode(text, getDebugNode(parentElement), debugInfo);
        indexDebugNode(debugEl);
        return text;
    }
    projectNodes(parentElement, nodes) {
        var debugParent = getDebugNode(parentElement);
        if (isPresent(debugParent) && debugParent instanceof DebugElement) {
            let debugElement = debugParent;
            nodes.forEach((node) => { debugElement.addChild(getDebugNode(node)); });
        }
        this._delegate.projectNodes(parentElement, nodes);
    }
    attachViewAfter(node, viewRootNodes) {
        var debugNode = getDebugNode(node);
        if (isPresent(debugNode)) {
            var debugParent = debugNode.parent;
            if (viewRootNodes.length > 0 && isPresent(debugParent)) {
                var debugViewRootNodes = [];
                viewRootNodes.forEach((rootNode) => debugViewRootNodes.push(getDebugNode(rootNode)));
                debugParent.insertChildrenAfter(debugNode, debugViewRootNodes);
            }
        }
        this._delegate.attachViewAfter(node, viewRootNodes);
    }
    detachView(viewRootNodes) {
        viewRootNodes.forEach((node) => {
            var debugNode = getDebugNode(node);
            if (isPresent(debugNode) && isPresent(debugNode.parent)) {
                debugNode.parent.removeChild(debugNode);
            }
        });
        this._delegate.detachView(viewRootNodes);
    }
    destroyView(hostElement, viewAllNodes) {
        viewAllNodes.forEach((node) => { removeDebugNodeFromIndex(getDebugNode(node)); });
        this._delegate.destroyView(hostElement, viewAllNodes);
    }
    listen(renderElement, name, callback) {
        var debugEl = getDebugNode(renderElement);
        if (isPresent(debugEl)) {
            debugEl.listeners.push(new EventListener(name, callback));
        }
        return this._delegate.listen(renderElement, name, callback);
    }
    listenGlobal(target, name, callback) {
        return this._delegate.listenGlobal(target, name, callback);
    }
    setElementProperty(renderElement, propertyName, propertyValue) {
        var debugEl = getDebugNode(renderElement);
        if (isPresent(debugEl) && debugEl instanceof DebugElement) {
            debugEl.properties[propertyName] = propertyValue;
        }
        this._delegate.setElementProperty(renderElement, propertyName, propertyValue);
    }
    setElementAttribute(renderElement, attributeName, attributeValue) {
        var debugEl = getDebugNode(renderElement);
        if (isPresent(debugEl) && debugEl instanceof DebugElement) {
            debugEl.attributes[attributeName] = attributeValue;
        }
        this._delegate.setElementAttribute(renderElement, attributeName, attributeValue);
    }
    setBindingDebugInfo(renderElement, propertyName, propertyValue) {
        this._delegate.setBindingDebugInfo(renderElement, propertyName, propertyValue);
    }
    setElementClass(renderElement, className, isAdd) {
        this._delegate.setElementClass(renderElement, className, isAdd);
    }
    setElementStyle(renderElement, styleName, styleValue) {
        this._delegate.setElementStyle(renderElement, styleName, styleValue);
    }
    invokeElementMethod(renderElement, methodName, args) {
        this._delegate.invokeElementMethod(renderElement, methodName, args);
    }
    setText(renderNode, text) { this._delegate.setText(renderNode, text); }
}
