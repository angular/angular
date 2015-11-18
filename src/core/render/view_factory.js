'use strict';var lang_1 = require('angular2/src/facade/lang');
var view_1 = require('./view');
var metadata_1 = require('angular2/src/core/metadata');
var collection_1 = require('angular2/src/facade/collection');
function encapsulateStyles(componentTemplate) {
    var processedStyles = componentTemplate.styles;
    if (componentTemplate.encapsulation === metadata_1.ViewEncapsulation.Emulated) {
        processedStyles = collection_1.ListWrapper.createFixedSize(componentTemplate.styles.length);
        for (var i = 0; i < componentTemplate.styles.length; i++) {
            processedStyles[i] = lang_1.StringWrapper.replaceAll(componentTemplate.styles[i], COMPONENT_REGEX, componentTemplate.shortId);
        }
    }
    return processedStyles;
}
exports.encapsulateStyles = encapsulateStyles;
function createRenderView(componentTemplate, cmds, inplaceElement, nodeFactory) {
    var view;
    var eventDispatcher = function (boundElementIndex, eventName, event) {
        return view.dispatchRenderEvent(boundElementIndex, eventName, event);
    };
    var context = new BuildContext(eventDispatcher, nodeFactory, inplaceElement);
    context.build(componentTemplate, cmds);
    var fragments = [];
    for (var i = 0; i < context.fragments.length; i++) {
        fragments.push(new view_1.DefaultRenderFragmentRef(context.fragments[i]));
    }
    view = new view_1.DefaultRenderView(fragments, context.boundTextNodes, context.boundElements, context.nativeShadowRoots, context.globalEventAdders, context.rootContentInsertionPoints);
    return view;
}
exports.createRenderView = createRenderView;
var BuildContext = (function () {
    function BuildContext(_eventDispatcher, factory, _inplaceElement) {
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
        this.isHost = lang_1.isPresent((_inplaceElement));
    }
    BuildContext.prototype.build = function (template, cmds) {
        this.enqueueRootBuilder(template, cmds);
        this._build(this._builders[0]);
    };
    BuildContext.prototype._build = function (builder) {
        this._builders = [];
        builder.build(this);
        var enqueuedBuilders = this._builders;
        for (var i = 0; i < enqueuedBuilders.length; i++) {
            this._build(enqueuedBuilders[i]);
        }
    };
    BuildContext.prototype.enqueueComponentBuilder = function (component) {
        this.componentCount++;
        this._builders.push(new RenderViewBuilder(component, null, component.template, component.template.commands));
    };
    BuildContext.prototype.enqueueFragmentBuilder = function (parentComponent, parentTemplate, commands) {
        var rootNodes = [];
        this.fragments.push(rootNodes);
        this._builders.push(new RenderViewBuilder(parentComponent, rootNodes, parentTemplate, commands));
    };
    BuildContext.prototype.enqueueRootBuilder = function (template, cmds) {
        var rootNodes = [];
        this.fragments.push(rootNodes);
        this._builders.push(new RenderViewBuilder(null, rootNodes, template, cmds));
    };
    BuildContext.prototype.consumeInplaceElement = function () {
        var result = this._inplaceElement;
        this._inplaceElement = null;
        return result;
    };
    BuildContext.prototype.addEventListener = function (boundElementIndex, target, eventName) {
        if (lang_1.isPresent(target)) {
            var handler = createEventHandler(boundElementIndex, target + ":" + eventName, this._eventDispatcher);
            this.globalEventAdders.push(createGlobalEventAdder(target, eventName, handler, this.factory));
        }
        else {
            var handler = createEventHandler(boundElementIndex, eventName, this._eventDispatcher);
            this.factory.on(this.boundElements[boundElementIndex], eventName, handler);
        }
    };
    return BuildContext;
})();
function createEventHandler(boundElementIndex, eventName, eventDispatcher) {
    return function ($event) { return eventDispatcher(boundElementIndex, eventName, $event); };
}
function createGlobalEventAdder(target, eventName, eventHandler, nodeFactory) {
    return function () { return nodeFactory.globalOn(target, eventName, eventHandler); };
}
var RenderViewBuilder = (function () {
    function RenderViewBuilder(parentComponent, fragmentRootNodes, template, cmds) {
        this.parentComponent = parentComponent;
        this.fragmentRootNodes = fragmentRootNodes;
        this.template = template;
        this.cmds = cmds;
        var rootNodesParent = lang_1.isPresent(fragmentRootNodes) ? null : parentComponent.shadowRoot;
        this.parentStack = [rootNodesParent];
    }
    RenderViewBuilder.prototype.build = function (context) {
        var cmds = this.cmds;
        for (var i = 0; i < cmds.length; i++) {
            cmds[i].visit(this, context);
        }
    };
    Object.defineProperty(RenderViewBuilder.prototype, "parent", {
        get: function () { return this.parentStack[this.parentStack.length - 1]; },
        enumerable: true,
        configurable: true
    });
    RenderViewBuilder.prototype.visitText = function (cmd, context) {
        var text = context.factory.createText(cmd.value);
        this._addChild(text, cmd.ngContentIndex, context);
        if (cmd.isBound) {
            context.boundTextNodes.push(text);
        }
        return null;
    };
    RenderViewBuilder.prototype.visitNgContent = function (cmd, context) {
        if (lang_1.isPresent(this.parentComponent)) {
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
    };
    RenderViewBuilder.prototype.visitBeginElement = function (cmd, context) {
        this.parentStack.push(this._beginElement(cmd, context, null));
        return null;
    };
    RenderViewBuilder.prototype.visitEndElement = function (context) {
        this._endElement();
        return null;
    };
    RenderViewBuilder.prototype.visitBeginComponent = function (cmd, context) {
        var templateId = cmd.templateId;
        var tpl = context.factory.resolveComponentTemplate(templateId);
        var el = this._beginElement(cmd, context, tpl);
        var root = el;
        if (tpl.encapsulation === metadata_1.ViewEncapsulation.Native) {
            root = context.factory.createShadowRoot(el, templateId);
            context.nativeShadowRoots.push(root);
        }
        var isRoot = context.componentCount === 0 && context.isHost;
        var component = new Component(el, root, isRoot, tpl);
        context.enqueueComponentBuilder(component);
        this.parentStack.push(component);
        return null;
    };
    RenderViewBuilder.prototype.visitEndComponent = function (context) {
        this._endElement();
        return null;
    };
    RenderViewBuilder.prototype.visitEmbeddedTemplate = function (cmd, context) {
        var el = context.factory.createTemplateAnchor(cmd.attrNameAndValues);
        this._addChild(el, cmd.ngContentIndex, context);
        context.boundElements.push(el);
        if (cmd.isMerged) {
            context.enqueueFragmentBuilder(this.parentComponent, this.template, cmd.children);
        }
        return null;
    };
    RenderViewBuilder.prototype._beginElement = function (cmd, context, componentTemplate) {
        var el = context.consumeInplaceElement();
        var attrNameAndValues = cmd.attrNameAndValues;
        var templateEmulatedEncapsulation = this.template.encapsulation === metadata_1.ViewEncapsulation.Emulated;
        var componentEmulatedEncapsulation = lang_1.isPresent(componentTemplate) &&
            componentTemplate.encapsulation === metadata_1.ViewEncapsulation.Emulated;
        var newAttrLength = attrNameAndValues.length + (templateEmulatedEncapsulation ? 2 : 0) +
            (componentEmulatedEncapsulation ? 2 : 0);
        if (newAttrLength > attrNameAndValues.length) {
            // Note: Need to clone attrNameAndValues to make it writable!
            var newAttrNameAndValues = collection_1.ListWrapper.createFixedSize(newAttrLength);
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
        if (lang_1.isPresent(el)) {
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
    };
    RenderViewBuilder.prototype._endElement = function () { this.parentStack.pop(); };
    RenderViewBuilder.prototype._addChild = function (node, ngContentIndex, context) {
        var parent = this.parent;
        if (lang_1.isPresent(parent)) {
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
    };
    return RenderViewBuilder;
})();
var Component = (function () {
    function Component(hostElement, shadowRoot, isRoot, template) {
        this.hostElement = hostElement;
        this.shadowRoot = shadowRoot;
        this.isRoot = isRoot;
        this.template = template;
        this.contentNodesByNgContentIndex = [];
    }
    Component.prototype.addContentNode = function (ngContentIndex, node, context) {
        if (lang_1.isBlank(ngContentIndex)) {
            if (this.template.encapsulation === metadata_1.ViewEncapsulation.Native) {
                context.factory.appendChild(this.hostElement, node);
            }
        }
        else {
            while (this.contentNodesByNgContentIndex.length <= ngContentIndex) {
                this.contentNodesByNgContentIndex.push([]);
            }
            this.contentNodesByNgContentIndex[ngContentIndex].push(node);
        }
    };
    Component.prototype.project = function (ngContentIndex) {
        return ngContentIndex < this.contentNodesByNgContentIndex.length ?
            this.contentNodesByNgContentIndex[ngContentIndex] :
            [];
    };
    return Component;
})();
var COMPONENT_REGEX = /%COMP%/g;
exports.COMPONENT_VARIABLE = '%COMP%';
exports.HOST_ATTR = "_nghost-" + exports.COMPONENT_VARIABLE;
exports.CONTENT_ATTR = "_ngcontent-" + exports.COMPONENT_VARIABLE;
function _shimContentAttribute(componentShortId) {
    return lang_1.StringWrapper.replaceAll(exports.CONTENT_ATTR, COMPONENT_REGEX, componentShortId);
}
function _shimHostAttribute(componentShortId) {
    return lang_1.StringWrapper.replaceAll(exports.HOST_ATTR, COMPONENT_REGEX, componentShortId);
}
//# sourceMappingURL=view_factory.js.map