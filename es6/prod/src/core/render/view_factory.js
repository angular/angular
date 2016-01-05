import { isBlank, isPresent, StringWrapper } from 'angular2/src/facade/lang';
import { DefaultRenderView, DefaultRenderFragmentRef } from './view';
import { ViewEncapsulation } from 'angular2/src/core/metadata';
import { ListWrapper } from 'angular2/src/facade/collection';
export function encapsulateStyles(componentTemplate) {
    var processedStyles = componentTemplate.styles;
    if (componentTemplate.encapsulation === ViewEncapsulation.Emulated) {
        processedStyles = ListWrapper.createFixedSize(componentTemplate.styles.length);
        for (var i = 0; i < componentTemplate.styles.length; i++) {
            processedStyles[i] = StringWrapper.replaceAll(componentTemplate.styles[i], COMPONENT_REGEX, componentTemplate.shortId);
        }
    }
    return processedStyles;
}
export function createRenderView(componentTemplate, cmds, inplaceElement, nodeFactory) {
    var view;
    var eventDispatcher = (boundElementIndex, eventName, event) => view.dispatchRenderEvent(boundElementIndex, eventName, event);
    var context = new BuildContext(eventDispatcher, nodeFactory, inplaceElement);
    context.build(componentTemplate, cmds);
    var fragments = [];
    for (var i = 0; i < context.fragments.length; i++) {
        fragments.push(new DefaultRenderFragmentRef(context.fragments[i]));
    }
    view = new DefaultRenderView(fragments, context.boundTextNodes, context.boundElements, context.nativeShadowRoots, context.globalEventAdders, context.rootContentInsertionPoints);
    return view;
}
class BuildContext {
    constructor(_eventDispatcher, factory, _inplaceElement) {
        this._eventDispatcher = _eventDispatcher;
        this.factory = factory;
        this._inplaceElement = _inplaceElement;
        this._builders = [];
        this.globalEventAdders = [];
        this.boundElements = [];
        this.boundTextNodes = [];
        this.nativeShadowRoots = [];
        this.fragments = [];
        this.rootContentInsertionPoints = [];
        this.componentCount = 0;
        this.isHost = isPresent((_inplaceElement));
    }
    build(template, cmds) {
        this.enqueueRootBuilder(template, cmds);
        this._build(this._builders[0]);
    }
    _build(builder) {
        this._builders = [];
        builder.build(this);
        var enqueuedBuilders = this._builders;
        for (var i = 0; i < enqueuedBuilders.length; i++) {
            this._build(enqueuedBuilders[i]);
        }
    }
    enqueueComponentBuilder(component) {
        this.componentCount++;
        this._builders.push(new RenderViewBuilder(component, null, component.template, component.template.commands));
    }
    enqueueFragmentBuilder(parentComponent, parentTemplate, commands) {
        var rootNodes = [];
        this.fragments.push(rootNodes);
        this._builders.push(new RenderViewBuilder(parentComponent, rootNodes, parentTemplate, commands));
    }
    enqueueRootBuilder(template, cmds) {
        var rootNodes = [];
        this.fragments.push(rootNodes);
        this._builders.push(new RenderViewBuilder(null, rootNodes, template, cmds));
    }
    consumeInplaceElement() {
        var result = this._inplaceElement;
        this._inplaceElement = null;
        return result;
    }
    addEventListener(boundElementIndex, target, eventName) {
        if (isPresent(target)) {
            var handler = createEventHandler(boundElementIndex, `${target}:${eventName}`, this._eventDispatcher);
            this.globalEventAdders.push(createGlobalEventAdder(target, eventName, handler, this.factory));
        }
        else {
            var handler = createEventHandler(boundElementIndex, eventName, this._eventDispatcher);
            this.factory.on(this.boundElements[boundElementIndex], eventName, handler);
        }
    }
}
function createEventHandler(boundElementIndex, eventName, eventDispatcher) {
    return ($event) => eventDispatcher(boundElementIndex, eventName, $event);
}
function createGlobalEventAdder(target, eventName, eventHandler, nodeFactory) {
    return () => nodeFactory.globalOn(target, eventName, eventHandler);
}
class RenderViewBuilder {
    constructor(parentComponent, fragmentRootNodes, template, cmds) {
        this.parentComponent = parentComponent;
        this.fragmentRootNodes = fragmentRootNodes;
        this.template = template;
        this.cmds = cmds;
        var rootNodesParent = isPresent(fragmentRootNodes) ? null : parentComponent.shadowRoot;
        this.parentStack = [rootNodesParent];
    }
    build(context) {
        var cmds = this.cmds;
        for (var i = 0; i < cmds.length; i++) {
            cmds[i].visit(this, context);
        }
    }
    get parent() { return this.parentStack[this.parentStack.length - 1]; }
    visitText(cmd, context) {
        var text = context.factory.createText(cmd.value);
        this._addChild(text, cmd.ngContentIndex, context);
        if (cmd.isBound) {
            context.boundTextNodes.push(text);
        }
        return null;
    }
    visitNgContent(cmd, context) {
        if (isPresent(this.parentComponent)) {
            if (this.parentComponent.isRoot) {
                var insertionPoint = context.factory.createRootContentInsertionPoint();
                if (this.parent instanceof Component) {
                    context.factory.appendChild(this.parent.shadowRoot, insertionPoint);
                }
                else {
                    context.factory.appendChild(this.parent, insertionPoint);
                }
                context.rootContentInsertionPoints.push(insertionPoint);
            }
            else {
                var projectedNodes = this.parentComponent.project(cmd.index);
                for (var i = 0; i < projectedNodes.length; i++) {
                    var node = projectedNodes[i];
                    this._addChild(node, cmd.ngContentIndex, context);
                }
            }
        }
        return null;
    }
    visitBeginElement(cmd, context) {
        this.parentStack.push(this._beginElement(cmd, context, null));
        return null;
    }
    visitEndElement(context) {
        this._endElement();
        return null;
    }
    visitBeginComponent(cmd, context) {
        var templateId = cmd.templateId;
        var tpl = context.factory.resolveComponentTemplate(templateId);
        var el = this._beginElement(cmd, context, tpl);
        var root = el;
        if (tpl.encapsulation === ViewEncapsulation.Native) {
            root = context.factory.createShadowRoot(el, templateId);
            context.nativeShadowRoots.push(root);
        }
        var isRoot = context.componentCount === 0 && context.isHost;
        var component = new Component(el, root, isRoot, tpl);
        context.enqueueComponentBuilder(component);
        this.parentStack.push(component);
        return null;
    }
    visitEndComponent(context) {
        this._endElement();
        return null;
    }
    visitEmbeddedTemplate(cmd, context) {
        var el = context.factory.createTemplateAnchor(cmd.attrNameAndValues);
        this._addChild(el, cmd.ngContentIndex, context);
        context.boundElements.push(el);
        if (cmd.isMerged) {
            context.enqueueFragmentBuilder(this.parentComponent, this.template, cmd.children);
        }
        return null;
    }
    _beginElement(cmd, context, componentTemplate) {
        var el = context.consumeInplaceElement();
        var attrNameAndValues = cmd.attrNameAndValues;
        var templateEmulatedEncapsulation = this.template.encapsulation === ViewEncapsulation.Emulated;
        var componentEmulatedEncapsulation = isPresent(componentTemplate) &&
            componentTemplate.encapsulation === ViewEncapsulation.Emulated;
        var newAttrLength = attrNameAndValues.length + (templateEmulatedEncapsulation ? 2 : 0) +
            (componentEmulatedEncapsulation ? 2 : 0);
        if (newAttrLength > attrNameAndValues.length) {
            // Note: Need to clone attrNameAndValues to make it writable!
            var newAttrNameAndValues = ListWrapper.createFixedSize(newAttrLength);
            var attrIndex;
            for (attrIndex = 0; attrIndex < attrNameAndValues.length; attrIndex++) {
                newAttrNameAndValues[attrIndex] = attrNameAndValues[attrIndex];
            }
            if (templateEmulatedEncapsulation) {
                newAttrNameAndValues[attrIndex++] = _shimContentAttribute(this.template.shortId);
                newAttrNameAndValues[attrIndex++] = '';
            }
            if (componentEmulatedEncapsulation) {
                newAttrNameAndValues[attrIndex++] = _shimHostAttribute(componentTemplate.shortId);
                newAttrNameAndValues[attrIndex++] = '';
            }
            attrNameAndValues = newAttrNameAndValues;
        }
        if (isPresent(el)) {
            context.factory.mergeElement(el, attrNameAndValues);
            this.fragmentRootNodes.push(el);
        }
        else {
            el = context.factory.createElement(cmd.name, attrNameAndValues);
            this._addChild(el, cmd.ngContentIndex, context);
        }
        if (cmd.isBound) {
            var boundElementIndex = context.boundElements.length;
            context.boundElements.push(el);
            for (var i = 0; i < cmd.eventTargetAndNames.length; i += 2) {
                var target = cmd.eventTargetAndNames[i];
                var eventName = cmd.eventTargetAndNames[i + 1];
                context.addEventListener(boundElementIndex, target, eventName);
            }
        }
        return el;
    }
    _endElement() { this.parentStack.pop(); }
    _addChild(node, ngContentIndex, context) {
        var parent = this.parent;
        if (isPresent(parent)) {
            if (parent instanceof Component) {
                parent.addContentNode(ngContentIndex, node, context);
            }
            else {
                context.factory.appendChild(parent, node);
            }
        }
        else {
            this.fragmentRootNodes.push(node);
        }
    }
}
class Component {
    constructor(hostElement, shadowRoot, isRoot, template) {
        this.hostElement = hostElement;
        this.shadowRoot = shadowRoot;
        this.isRoot = isRoot;
        this.template = template;
        this.contentNodesByNgContentIndex = [];
    }
    addContentNode(ngContentIndex, node, context) {
        if (isBlank(ngContentIndex)) {
            if (this.template.encapsulation === ViewEncapsulation.Native) {
                context.factory.appendChild(this.hostElement, node);
            }
        }
        else {
            while (this.contentNodesByNgContentIndex.length <= ngContentIndex) {
                this.contentNodesByNgContentIndex.push([]);
            }
            this.contentNodesByNgContentIndex[ngContentIndex].push(node);
        }
    }
    project(ngContentIndex) {
        return ngContentIndex < this.contentNodesByNgContentIndex.length ?
            this.contentNodesByNgContentIndex[ngContentIndex] :
            [];
    }
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
