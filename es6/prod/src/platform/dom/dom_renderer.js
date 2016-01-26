var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from 'angular2/src/core/di';
import { AnimationBuilder } from 'angular2/src/animate/animation_builder';
import { isPresent, isBlank, Json, RegExpWrapper, CONST_EXPR, stringify, StringWrapper, isArray } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { DomSharedStylesHost } from './shared_styles_host';
import { EventManager } from './events/event_manager';
import { DOCUMENT } from './dom_tokens';
import { ViewEncapsulation } from 'angular2/src/core/metadata';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { camelCaseToDashCase } from './util';
const NAMESPACE_URIS = CONST_EXPR({ 'xlink': 'http://www.w3.org/1999/xlink', 'svg': 'http://www.w3.org/2000/svg' });
const TEMPLATE_COMMENT_TEXT = 'template bindings={}';
var TEMPLATE_BINDINGS_EXP = /^template bindings=(.*)$/g;
export class DomRootRenderer {
    constructor(document, eventManager, sharedStylesHost, animate) {
        this.document = document;
        this.eventManager = eventManager;
        this.sharedStylesHost = sharedStylesHost;
        this.animate = animate;
        this._registeredComponents = new Map();
    }
    renderComponent(componentProto) {
        var renderer = this._registeredComponents.get(componentProto.id);
        if (isBlank(renderer)) {
            renderer = new DomRenderer(this, componentProto);
            this._registeredComponents.set(componentProto.id, renderer);
        }
        return renderer;
    }
}
export let DomRootRenderer_ = class extends DomRootRenderer {
    constructor(_document, _eventManager, sharedStylesHost, animate) {
        super(_document, _eventManager, sharedStylesHost, animate);
    }
};
DomRootRenderer_ = __decorate([
    Injectable(),
    __param(0, Inject(DOCUMENT)), 
    __metadata('design:paramtypes', [Object, EventManager, DomSharedStylesHost, AnimationBuilder])
], DomRootRenderer_);
export class DomRenderer {
    constructor(_rootRenderer, componentProto) {
        this._rootRenderer = _rootRenderer;
        this.componentProto = componentProto;
        this._styles = _flattenStyles(componentProto.id, componentProto.styles, []);
        if (componentProto.encapsulation !== ViewEncapsulation.Native) {
            this._rootRenderer.sharedStylesHost.addStyles(this._styles);
        }
        if (this.componentProto.encapsulation === ViewEncapsulation.Emulated) {
            this._contentAttr = _shimContentAttribute(componentProto.id);
            this._hostAttr = _shimHostAttribute(componentProto.id);
        }
        else {
            this._contentAttr = null;
            this._hostAttr = null;
        }
    }
    renderComponent(componentProto) {
        return this._rootRenderer.renderComponent(componentProto);
    }
    selectRootElement(selector) {
        var el = DOM.querySelector(this._rootRenderer.document, selector);
        if (isBlank(el)) {
            throw new BaseException(`The selector "${selector}" did not match any elements`);
        }
        DOM.clearNodes(el);
        return el;
    }
    createElement(parent, name) {
        var nsAndName = splitNamespace(name);
        var el = isPresent(nsAndName[0]) ?
            DOM.createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1]) :
            DOM.createElement(nsAndName[1]);
        if (isPresent(this._contentAttr)) {
            DOM.setAttribute(el, this._contentAttr, '');
        }
        if (isPresent(parent)) {
            DOM.appendChild(parent, el);
        }
        return el;
    }
    createViewRoot(hostElement) {
        var nodesParent;
        if (this.componentProto.encapsulation === ViewEncapsulation.Native) {
            nodesParent = DOM.createShadowRoot(hostElement);
            this._rootRenderer.sharedStylesHost.addHost(nodesParent);
            for (var i = 0; i < this._styles.length; i++) {
                DOM.appendChild(nodesParent, DOM.createStyleElement(this._styles[i]));
            }
        }
        else {
            if (isPresent(this._hostAttr)) {
                DOM.setAttribute(hostElement, this._hostAttr, '');
            }
            nodesParent = hostElement;
        }
        return nodesParent;
    }
    createTemplateAnchor(parentElement) {
        var comment = DOM.createComment(TEMPLATE_COMMENT_TEXT);
        if (isPresent(parentElement)) {
            DOM.appendChild(parentElement, comment);
        }
        return comment;
    }
    createText(parentElement, value) {
        var node = DOM.createTextNode(value);
        if (isPresent(parentElement)) {
            DOM.appendChild(parentElement, node);
        }
        return node;
    }
    projectNodes(parentElement, nodes) {
        if (isBlank(parentElement))
            return;
        appendNodes(parentElement, nodes);
    }
    attachViewAfter(node, viewRootNodes) {
        moveNodesAfterSibling(node, viewRootNodes);
        for (let i = 0; i < viewRootNodes.length; i++)
            this.animateNodeEnter(viewRootNodes[i]);
    }
    detachView(viewRootNodes) {
        for (var i = 0; i < viewRootNodes.length; i++) {
            var node = viewRootNodes[i];
            DOM.remove(node);
            this.animateNodeLeave(node);
        }
    }
    destroyView(hostElement, viewAllNodes) {
        if (this.componentProto.encapsulation === ViewEncapsulation.Native && isPresent(hostElement)) {
            this._rootRenderer.sharedStylesHost.removeHost(DOM.getShadowRoot(hostElement));
        }
    }
    listen(renderElement, name, callback) {
        return this._rootRenderer.eventManager.addEventListener(renderElement, name, decoratePreventDefault(callback));
    }
    listenGlobal(target, name, callback) {
        return this._rootRenderer.eventManager.addGlobalEventListener(target, name, decoratePreventDefault(callback));
    }
    setElementProperty(renderElement, propertyName, propertyValue) {
        DOM.setProperty(renderElement, propertyName, propertyValue);
    }
    setElementAttribute(renderElement, attributeName, attributeValue) {
        var attrNs;
        var nsAndName = splitNamespace(attributeName);
        if (isPresent(nsAndName[0])) {
            attributeName = nsAndName[0] + ':' + nsAndName[1];
            attrNs = NAMESPACE_URIS[nsAndName[0]];
        }
        if (isPresent(attributeValue)) {
            if (isPresent(attrNs)) {
                DOM.setAttributeNS(renderElement, attrNs, attributeName, attributeValue);
            }
            else {
                DOM.setAttribute(renderElement, nsAndName[1], attributeValue);
            }
        }
        else {
            DOM.removeAttribute(renderElement, attributeName);
        }
    }
    setBindingDebugInfo(renderElement, propertyName, propertyValue) {
        var dashCasedPropertyName = camelCaseToDashCase(propertyName);
        if (DOM.isCommentNode(renderElement)) {
            var existingBindings = RegExpWrapper.firstMatch(TEMPLATE_BINDINGS_EXP, StringWrapper.replaceAll(DOM.getText(renderElement), /\n/g, ''));
            var parsedBindings = Json.parse(existingBindings[1]);
            parsedBindings[dashCasedPropertyName] = propertyValue;
            DOM.setText(renderElement, StringWrapper.replace(TEMPLATE_COMMENT_TEXT, '{}', Json.stringify(parsedBindings)));
        }
        else {
            this.setElementAttribute(renderElement, propertyName, propertyValue);
        }
    }
    setElementClass(renderElement, className, isAdd) {
        if (isAdd) {
            DOM.addClass(renderElement, className);
        }
        else {
            DOM.removeClass(renderElement, className);
        }
    }
    setElementStyle(renderElement, styleName, styleValue) {
        if (isPresent(styleValue)) {
            DOM.setStyle(renderElement, styleName, stringify(styleValue));
        }
        else {
            DOM.removeStyle(renderElement, styleName);
        }
    }
    invokeElementMethod(renderElement, methodName, args) {
        DOM.invoke(renderElement, methodName, args);
    }
    setText(renderNode, text) { DOM.setText(renderNode, text); }
    /**
     * Performs animations if necessary
     * @param node
     */
    animateNodeEnter(node) {
        if (DOM.isElementNode(node) && DOM.hasClass(node, 'ng-animate')) {
            DOM.addClass(node, 'ng-enter');
            this._rootRenderer.animate.css()
                .addAnimationClass('ng-enter-active')
                .start(node)
                .onComplete(() => { DOM.removeClass(node, 'ng-enter'); });
        }
    }
    /**
     * If animations are necessary, performs animations then removes the element; otherwise, it just
     * removes the element.
     * @param node
     */
    animateNodeLeave(node) {
        if (DOM.isElementNode(node) && DOM.hasClass(node, 'ng-animate')) {
            DOM.addClass(node, 'ng-leave');
            this._rootRenderer.animate.css()
                .addAnimationClass('ng-leave-active')
                .start(node)
                .onComplete(() => {
                DOM.removeClass(node, 'ng-leave');
                DOM.remove(node);
            });
        }
        else {
            DOM.remove(node);
        }
    }
}
function moveNodesAfterSibling(sibling, nodes) {
    var parent = DOM.parentElement(sibling);
    if (nodes.length > 0 && isPresent(parent)) {
        var nextSibling = DOM.nextSibling(sibling);
        if (isPresent(nextSibling)) {
            for (var i = 0; i < nodes.length; i++) {
                DOM.insertBefore(nextSibling, nodes[i]);
            }
        }
        else {
            for (var i = 0; i < nodes.length; i++) {
                DOM.appendChild(parent, nodes[i]);
            }
        }
    }
}
function appendNodes(parent, nodes) {
    for (var i = 0; i < nodes.length; i++) {
        DOM.appendChild(parent, nodes[i]);
    }
}
function decoratePreventDefault(eventHandler) {
    return (event) => {
        var allowDefaultBehavior = eventHandler(event);
        if (allowDefaultBehavior === false) {
            // TODO(tbosch): move preventDefault into event plugins...
            DOM.preventDefault(event);
        }
    };
}
var COMPONENT_REGEX = /%COMP%/g;
export const COMPONENT_VARIABLE = '%COMP%';
export const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
export const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;
function _shimContentAttribute(componentShortId) {
    return StringWrapper.replaceAll(CONTENT_ATTR, COMPONENT_REGEX, componentShortId);
}
function _shimHostAttribute(componentShortId) {
    return StringWrapper.replaceAll(HOST_ATTR, COMPONENT_REGEX, componentShortId);
}
function _flattenStyles(compId, styles, target) {
    for (var i = 0; i < styles.length; i++) {
        var style = styles[i];
        if (isArray(style)) {
            _flattenStyles(compId, style, target);
        }
        else {
            style = StringWrapper.replaceAll(style, COMPONENT_REGEX, compId);
            target.push(style);
        }
    }
    return target;
}
var NS_PREFIX_RE = /^@([^:]+):(.+)/g;
function splitNamespace(name) {
    if (name[0] != '@') {
        return [null, name];
    }
    let match = RegExpWrapper.firstMatch(NS_PREFIX_RE, name);
    return [match[1], match[2]];
}
