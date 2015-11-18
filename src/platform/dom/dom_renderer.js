var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var di_1 = require('angular2/src/core/di');
var animation_builder_1 = require('angular2/src/animate/animation_builder');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var shared_styles_host_1 = require('./shared_styles_host');
var profile_1 = require('angular2/src/core/profile/profile');
var core_1 = require('angular2/core');
var dom_tokens_1 = require('./dom_tokens');
var view_factory_1 = require('angular2/src/core/render/view_factory');
var view_1 = require('angular2/src/core/render/view');
var util_1 = require('./util');
var metadata_1 = require('angular2/src/core/metadata');
// TODO move it once DomAdapter is moved
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
// TODO(tbosch): solve SVG properly once https://github.com/angular/angular/issues/4417 is done
var XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
var SVG_ELEMENT_NAMES = lang_1.CONST_EXPR({
    'altGlyph': true,
    'altGlyphDef': true,
    'altGlyphItem': true,
    'animate': true,
    'animateColor': true,
    'animateMotion': true,
    'animateTransform': true,
    'circle': true,
    'clipPath': true,
    'color-profile': true,
    'cursor': true,
    'defs': true,
    'desc': true,
    'ellipse': true,
    'feBlend': true,
    'feColorMatrix': true,
    'feComponentTransfer': true,
    'feComposite': true,
    'feConvolveMatrix': true,
    'feDiffuseLighting': true,
    'feDisplacementMap': true,
    'feDistantLight': true,
    'feFlood': true,
    'feFuncA': true,
    'feFuncB': true,
    'feFuncG': true,
    'feFuncR': true,
    'feGaussianBlur': true,
    'feImage': true,
    'feMerge': true,
    'feMergeNode': true,
    'feMorphology': true,
    'feOffset': true,
    'fePointLight': true,
    'feSpecularLighting': true,
    'feSpotLight': true,
    'feTile': true,
    'feTurbulence': true,
    'filter': true,
    'font': true,
    'font-face': true,
    'font-face-format': true,
    'font-face-name': true,
    'font-face-src': true,
    'font-face-uri': true,
    'foreignObject': true,
    'g': true,
    // TODO(tbosch): this needs to be disabled
    // because of an internal project.
    // We will fix SVG soon, so this will go away...
    // 'glyph': true,
    'glyphRef': true,
    'hkern': true,
    'image': true,
    'line': true,
    'linearGradient': true,
    'marker': true,
    'mask': true,
    'metadata': true,
    'missing-glyph': true,
    'mpath': true,
    'path': true,
    'pattern': true,
    'polygon': true,
    'polyline': true,
    'radialGradient': true,
    'rect': true,
    'set': true,
    'stop': true,
    'style': true,
    'svg': true,
    'switch': true,
    'symbol': true,
    'text': true,
    'textPath': true,
    'title': true,
    'tref': true,
    'tspan': true,
    'use': true,
    'view': true,
    'vkern': true
});
var SVG_ATTR_NAMESPACES = lang_1.CONST_EXPR({ 'href': XLINK_NAMESPACE, 'xlink:href': XLINK_NAMESPACE });
var DomRenderer = (function (_super) {
    __extends(DomRenderer, _super);
    function DomRenderer() {
        _super.apply(this, arguments);
    }
    DomRenderer.prototype.getNativeElementSync = function (location) {
        return resolveInternalDomView(location.renderView).boundElements[location.boundElementIndex];
    };
    DomRenderer.prototype.getRootNodes = function (fragment) { return resolveInternalDomFragment(fragment); };
    DomRenderer.prototype.attachFragmentAfterFragment = function (previousFragmentRef, fragmentRef) {
        var previousFragmentNodes = resolveInternalDomFragment(previousFragmentRef);
        if (previousFragmentNodes.length > 0) {
            var sibling = previousFragmentNodes[previousFragmentNodes.length - 1];
            var nodes = resolveInternalDomFragment(fragmentRef);
            moveNodesAfterSibling(sibling, nodes);
            this.animateNodesEnter(nodes);
        }
    };
    /**
     * Iterates through all nodes being added to the DOM and animates them if necessary
     * @param nodes
     */
    DomRenderer.prototype.animateNodesEnter = function (nodes) {
        for (var i = 0; i < nodes.length; i++)
            this.animateNodeEnter(nodes[i]);
    };
    DomRenderer.prototype.attachFragmentAfterElement = function (elementRef, fragmentRef) {
        var parentView = resolveInternalDomView(elementRef.renderView);
        var element = parentView.boundElements[elementRef.boundElementIndex];
        var nodes = resolveInternalDomFragment(fragmentRef);
        moveNodesAfterSibling(element, nodes);
        this.animateNodesEnter(nodes);
    };
    DomRenderer.prototype.hydrateView = function (viewRef) { resolveInternalDomView(viewRef).hydrate(); };
    DomRenderer.prototype.dehydrateView = function (viewRef) { resolveInternalDomView(viewRef).dehydrate(); };
    DomRenderer.prototype.createTemplateAnchor = function (attrNameAndValues) {
        return this.createElement('script', attrNameAndValues);
    };
    DomRenderer.prototype.createText = function (value) { return dom_adapter_1.DOM.createTextNode(lang_1.isPresent(value) ? value : ''); };
    DomRenderer.prototype.appendChild = function (parent, child) { dom_adapter_1.DOM.appendChild(parent, child); };
    DomRenderer.prototype.setElementProperty = function (location, propertyName, propertyValue) {
        var view = resolveInternalDomView(location.renderView);
        dom_adapter_1.DOM.setProperty(view.boundElements[location.boundElementIndex], propertyName, propertyValue);
    };
    DomRenderer.prototype.setElementAttribute = function (location, attributeName, attributeValue) {
        var view = resolveInternalDomView(location.renderView);
        var element = view.boundElements[location.boundElementIndex];
        var dashCasedAttributeName = util_1.camelCaseToDashCase(attributeName);
        if (lang_1.isPresent(attributeValue)) {
            dom_adapter_1.DOM.setAttribute(element, dashCasedAttributeName, lang_1.stringify(attributeValue));
        }
        else {
            dom_adapter_1.DOM.removeAttribute(element, dashCasedAttributeName);
        }
    };
    DomRenderer.prototype.setElementClass = function (location, className, isAdd) {
        var view = resolveInternalDomView(location.renderView);
        var element = view.boundElements[location.boundElementIndex];
        if (isAdd) {
            dom_adapter_1.DOM.addClass(element, className);
        }
        else {
            dom_adapter_1.DOM.removeClass(element, className);
        }
    };
    DomRenderer.prototype.setElementStyle = function (location, styleName, styleValue) {
        var view = resolveInternalDomView(location.renderView);
        var element = view.boundElements[location.boundElementIndex];
        var dashCasedStyleName = util_1.camelCaseToDashCase(styleName);
        if (lang_1.isPresent(styleValue)) {
            dom_adapter_1.DOM.setStyle(element, dashCasedStyleName, lang_1.stringify(styleValue));
        }
        else {
            dom_adapter_1.DOM.removeStyle(element, dashCasedStyleName);
        }
    };
    DomRenderer.prototype.invokeElementMethod = function (location, methodName, args) {
        var view = resolveInternalDomView(location.renderView);
        var element = view.boundElements[location.boundElementIndex];
        dom_adapter_1.DOM.invoke(element, methodName, args);
    };
    DomRenderer.prototype.setText = function (viewRef, textNodeIndex, text) {
        var view = resolveInternalDomView(viewRef);
        dom_adapter_1.DOM.setText(view.boundTextNodes[textNodeIndex], text);
    };
    DomRenderer.prototype.setEventDispatcher = function (viewRef, dispatcher) {
        resolveInternalDomView(viewRef).setEventDispatcher(dispatcher);
    };
    return DomRenderer;
})(core_1.Renderer);
exports.DomRenderer = DomRenderer;
var DomRenderer_ = (function (_super) {
    __extends(DomRenderer_, _super);
    function DomRenderer_(_eventManager, _domSharedStylesHost, _animate, document) {
        _super.call(this);
        this._eventManager = _eventManager;
        this._domSharedStylesHost = _domSharedStylesHost;
        this._animate = _animate;
        this._componentTpls = new Map();
        /** @internal */
        this._createRootHostViewScope = profile_1.wtfCreateScope('DomRenderer#createRootHostView()');
        /** @internal */
        this._createViewScope = profile_1.wtfCreateScope('DomRenderer#createView()');
        /** @internal */
        this._detachFragmentScope = profile_1.wtfCreateScope('DomRenderer#detachFragment()');
        this._document = document;
    }
    DomRenderer_.prototype.registerComponentTemplate = function (template) {
        this._componentTpls.set(template.id, template);
        if (template.encapsulation !== metadata_1.ViewEncapsulation.Native) {
            var encapsulatedStyles = view_factory_1.encapsulateStyles(template);
            this._domSharedStylesHost.addStyles(encapsulatedStyles);
        }
    };
    DomRenderer_.prototype.createProtoView = function (componentTemplateId, cmds) {
        return new view_1.DefaultProtoViewRef(this._componentTpls.get(componentTemplateId), cmds);
    };
    DomRenderer_.prototype.resolveComponentTemplate = function (templateId) {
        return this._componentTpls.get(templateId);
    };
    DomRenderer_.prototype.createRootHostView = function (hostProtoViewRef, fragmentCount, hostElementSelector) {
        var s = this._createRootHostViewScope();
        var element = dom_adapter_1.DOM.querySelector(this._document, hostElementSelector);
        if (lang_1.isBlank(element)) {
            profile_1.wtfLeave(s);
            throw new exceptions_1.BaseException("The selector \"" + hostElementSelector + "\" did not match any elements");
        }
        return profile_1.wtfLeave(s, this._createView(hostProtoViewRef, element));
    };
    DomRenderer_.prototype.createView = function (protoViewRef, fragmentCount) {
        var s = this._createViewScope();
        return profile_1.wtfLeave(s, this._createView(protoViewRef, null));
    };
    DomRenderer_.prototype._createView = function (protoViewRef, inplaceElement) {
        var dpvr = protoViewRef;
        var view = view_factory_1.createRenderView(dpvr.template, dpvr.cmds, inplaceElement, this);
        var sdRoots = view.nativeShadowRoots;
        for (var i = 0; i < sdRoots.length; i++) {
            this._domSharedStylesHost.addHost(sdRoots[i]);
        }
        return new core_1.RenderViewWithFragments(view, view.fragments);
    };
    DomRenderer_.prototype.destroyView = function (viewRef) {
        var view = viewRef;
        var sdRoots = view.nativeShadowRoots;
        for (var i = 0; i < sdRoots.length; i++) {
            this._domSharedStylesHost.removeHost(sdRoots[i]);
        }
    };
    DomRenderer_.prototype.animateNodeEnter = function (node) {
        if (dom_adapter_1.DOM.isElementNode(node) && dom_adapter_1.DOM.hasClass(node, 'ng-animate')) {
            dom_adapter_1.DOM.addClass(node, 'ng-enter');
            this._animate.css()
                .addAnimationClass('ng-enter-active')
                .start(node)
                .onComplete(function () { dom_adapter_1.DOM.removeClass(node, 'ng-enter'); });
        }
    };
    DomRenderer_.prototype.animateNodeLeave = function (node) {
        if (dom_adapter_1.DOM.isElementNode(node) && dom_adapter_1.DOM.hasClass(node, 'ng-animate')) {
            dom_adapter_1.DOM.addClass(node, 'ng-leave');
            this._animate.css()
                .addAnimationClass('ng-leave-active')
                .start(node)
                .onComplete(function () {
                dom_adapter_1.DOM.removeClass(node, 'ng-leave');
                dom_adapter_1.DOM.remove(node);
            });
        }
        else {
            dom_adapter_1.DOM.remove(node);
        }
    };
    DomRenderer_.prototype.detachFragment = function (fragmentRef) {
        var s = this._detachFragmentScope();
        var fragmentNodes = resolveInternalDomFragment(fragmentRef);
        for (var i = 0; i < fragmentNodes.length; i++) {
            this.animateNodeLeave(fragmentNodes[i]);
        }
        profile_1.wtfLeave(s);
    };
    DomRenderer_.prototype.createElement = function (name, attrNameAndValues) {
        var isSvg = SVG_ELEMENT_NAMES[name] == true;
        var el = isSvg ? dom_adapter_1.DOM.createElementNS(SVG_NAMESPACE, name) : dom_adapter_1.DOM.createElement(name);
        this._setAttributes(el, attrNameAndValues, isSvg);
        return el;
    };
    DomRenderer_.prototype.mergeElement = function (existing, attrNameAndValues) {
        dom_adapter_1.DOM.clearNodes(existing);
        this._setAttributes(existing, attrNameAndValues, false);
    };
    DomRenderer_.prototype._setAttributes = function (node, attrNameAndValues, isSvg) {
        for (var attrIdx = 0; attrIdx < attrNameAndValues.length; attrIdx += 2) {
            var attrName = attrNameAndValues[attrIdx];
            var attrValue = attrNameAndValues[attrIdx + 1];
            var attrNs = isSvg ? SVG_ATTR_NAMESPACES[attrName] : null;
            if (lang_1.isPresent(attrNs)) {
                dom_adapter_1.DOM.setAttributeNS(node, XLINK_NAMESPACE, attrName, attrValue);
            }
            else {
                dom_adapter_1.DOM.setAttribute(node, attrName, attrValue);
            }
        }
    };
    DomRenderer_.prototype.createRootContentInsertionPoint = function () {
        return dom_adapter_1.DOM.createComment('root-content-insertion-point');
    };
    DomRenderer_.prototype.createShadowRoot = function (host, templateId) {
        var sr = dom_adapter_1.DOM.createShadowRoot(host);
        var tpl = this._componentTpls.get(templateId);
        for (var i = 0; i < tpl.styles.length; i++) {
            dom_adapter_1.DOM.appendChild(sr, dom_adapter_1.DOM.createStyleElement(tpl.styles[i]));
        }
        return sr;
    };
    DomRenderer_.prototype.on = function (element, eventName, callback) {
        this._eventManager.addEventListener(element, eventName, decoratePreventDefault(callback));
    };
    DomRenderer_.prototype.globalOn = function (target, eventName, callback) {
        return this._eventManager.addGlobalEventListener(target, eventName, decoratePreventDefault(callback));
    };
    DomRenderer_ = __decorate([
        di_1.Injectable(),
        __param(3, di_1.Inject(dom_tokens_1.DOCUMENT)), 
        __metadata('design:paramtypes', [core_1.EventManager, shared_styles_host_1.DomSharedStylesHost, animation_builder_1.AnimationBuilder, Object])
    ], DomRenderer_);
    return DomRenderer_;
})(DomRenderer);
exports.DomRenderer_ = DomRenderer_;
function resolveInternalDomView(viewRef) {
    return viewRef;
}
function resolveInternalDomFragment(fragmentRef) {
    return fragmentRef.nodes;
}
function moveNodesAfterSibling(sibling, nodes) {
    if (nodes.length > 0 && lang_1.isPresent(dom_adapter_1.DOM.parentElement(sibling))) {
        for (var i = 0; i < nodes.length; i++) {
            dom_adapter_1.DOM.insertBefore(sibling, nodes[i]);
        }
        dom_adapter_1.DOM.insertBefore(nodes[0], sibling);
    }
}
function decoratePreventDefault(eventHandler) {
    return function (event) {
        var allowDefaultBehavior = eventHandler(event);
        if (!allowDefaultBehavior) {
            // TODO(tbosch): move preventDefault into event plugins...
            dom_adapter_1.DOM.preventDefault(event);
        }
    };
}
//# sourceMappingURL=dom_renderer.js.map