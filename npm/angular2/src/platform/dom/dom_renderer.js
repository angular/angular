'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var di_1 = require('angular2/src/core/di');
var animation_builder_1 = require('angular2/src/animate/animation_builder');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var shared_styles_host_1 = require('./shared_styles_host');
var event_manager_1 = require('./events/event_manager');
var dom_tokens_1 = require('./dom_tokens');
var metadata_1 = require('angular2/src/core/metadata');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var util_1 = require('./util');
var NAMESPACE_URIS = 
/*@ts2dart_const*/
{ 'xlink': 'http://www.w3.org/1999/xlink', 'svg': 'http://www.w3.org/2000/svg' };
var TEMPLATE_COMMENT_TEXT = 'template bindings={}';
var TEMPLATE_BINDINGS_EXP = /^template bindings=(.*)$/g;
var DomRootRenderer = (function () {
    function DomRootRenderer(document, eventManager, sharedStylesHost, animate) {
        this.document = document;
        this.eventManager = eventManager;
        this.sharedStylesHost = sharedStylesHost;
        this.animate = animate;
        this._registeredComponents = new Map();
    }
    DomRootRenderer.prototype.renderComponent = function (componentProto) {
        var renderer = this._registeredComponents.get(componentProto.id);
        if (lang_1.isBlank(renderer)) {
            renderer = new DomRenderer(this, componentProto);
            this._registeredComponents.set(componentProto.id, renderer);
        }
        return renderer;
    };
    return DomRootRenderer;
}());
exports.DomRootRenderer = DomRootRenderer;
var DomRootRenderer_ = (function (_super) {
    __extends(DomRootRenderer_, _super);
    function DomRootRenderer_(_document, _eventManager, sharedStylesHost, animate) {
        _super.call(this, _document, _eventManager, sharedStylesHost, animate);
    }
    DomRootRenderer_ = __decorate([
        di_1.Injectable(),
        __param(0, di_1.Inject(dom_tokens_1.DOCUMENT)), 
        __metadata('design:paramtypes', [Object, event_manager_1.EventManager, shared_styles_host_1.DomSharedStylesHost, animation_builder_1.AnimationBuilder])
    ], DomRootRenderer_);
    return DomRootRenderer_;
}(DomRootRenderer));
exports.DomRootRenderer_ = DomRootRenderer_;
var DomRenderer = (function () {
    function DomRenderer(_rootRenderer, componentProto) {
        this._rootRenderer = _rootRenderer;
        this.componentProto = componentProto;
        this._styles = _flattenStyles(componentProto.id, componentProto.styles, []);
        if (componentProto.encapsulation !== metadata_1.ViewEncapsulation.Native) {
            this._rootRenderer.sharedStylesHost.addStyles(this._styles);
        }
        if (this.componentProto.encapsulation === metadata_1.ViewEncapsulation.Emulated) {
            this._contentAttr = _shimContentAttribute(componentProto.id);
            this._hostAttr = _shimHostAttribute(componentProto.id);
        }
        else {
            this._contentAttr = null;
            this._hostAttr = null;
        }
    }
    DomRenderer.prototype.selectRootElement = function (selectorOrNode, debugInfo) {
        var el;
        if (lang_1.isString(selectorOrNode)) {
            el = dom_adapter_1.DOM.querySelector(this._rootRenderer.document, selectorOrNode);
            if (lang_1.isBlank(el)) {
                throw new exceptions_1.BaseException("The selector \"" + selectorOrNode + "\" did not match any elements");
            }
        }
        else {
            el = selectorOrNode;
        }
        dom_adapter_1.DOM.clearNodes(el);
        return el;
    };
    DomRenderer.prototype.createElement = function (parent, name, debugInfo) {
        var nsAndName = splitNamespace(name);
        var el = lang_1.isPresent(nsAndName[0]) ?
            dom_adapter_1.DOM.createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1]) :
            dom_adapter_1.DOM.createElement(nsAndName[1]);
        if (lang_1.isPresent(this._contentAttr)) {
            dom_adapter_1.DOM.setAttribute(el, this._contentAttr, '');
        }
        if (lang_1.isPresent(parent)) {
            dom_adapter_1.DOM.appendChild(parent, el);
        }
        return el;
    };
    DomRenderer.prototype.createViewRoot = function (hostElement) {
        var nodesParent;
        if (this.componentProto.encapsulation === metadata_1.ViewEncapsulation.Native) {
            nodesParent = dom_adapter_1.DOM.createShadowRoot(hostElement);
            this._rootRenderer.sharedStylesHost.addHost(nodesParent);
            for (var i = 0; i < this._styles.length; i++) {
                dom_adapter_1.DOM.appendChild(nodesParent, dom_adapter_1.DOM.createStyleElement(this._styles[i]));
            }
        }
        else {
            if (lang_1.isPresent(this._hostAttr)) {
                dom_adapter_1.DOM.setAttribute(hostElement, this._hostAttr, '');
            }
            nodesParent = hostElement;
        }
        return nodesParent;
    };
    DomRenderer.prototype.createTemplateAnchor = function (parentElement, debugInfo) {
        var comment = dom_adapter_1.DOM.createComment(TEMPLATE_COMMENT_TEXT);
        if (lang_1.isPresent(parentElement)) {
            dom_adapter_1.DOM.appendChild(parentElement, comment);
        }
        return comment;
    };
    DomRenderer.prototype.createText = function (parentElement, value, debugInfo) {
        var node = dom_adapter_1.DOM.createTextNode(value);
        if (lang_1.isPresent(parentElement)) {
            dom_adapter_1.DOM.appendChild(parentElement, node);
        }
        return node;
    };
    DomRenderer.prototype.projectNodes = function (parentElement, nodes) {
        if (lang_1.isBlank(parentElement))
            return;
        appendNodes(parentElement, nodes);
    };
    DomRenderer.prototype.attachViewAfter = function (node, viewRootNodes) {
        moveNodesAfterSibling(node, viewRootNodes);
        for (var i = 0; i < viewRootNodes.length; i++)
            this.animateNodeEnter(viewRootNodes[i]);
    };
    DomRenderer.prototype.detachView = function (viewRootNodes) {
        for (var i = 0; i < viewRootNodes.length; i++) {
            var node = viewRootNodes[i];
            dom_adapter_1.DOM.remove(node);
            this.animateNodeLeave(node);
        }
    };
    DomRenderer.prototype.destroyView = function (hostElement, viewAllNodes) {
        if (this.componentProto.encapsulation === metadata_1.ViewEncapsulation.Native && lang_1.isPresent(hostElement)) {
            this._rootRenderer.sharedStylesHost.removeHost(dom_adapter_1.DOM.getShadowRoot(hostElement));
        }
    };
    DomRenderer.prototype.listen = function (renderElement, name, callback) {
        return this._rootRenderer.eventManager.addEventListener(renderElement, name, decoratePreventDefault(callback));
    };
    DomRenderer.prototype.listenGlobal = function (target, name, callback) {
        return this._rootRenderer.eventManager.addGlobalEventListener(target, name, decoratePreventDefault(callback));
    };
    DomRenderer.prototype.setElementProperty = function (renderElement, propertyName, propertyValue) {
        dom_adapter_1.DOM.setProperty(renderElement, propertyName, propertyValue);
    };
    DomRenderer.prototype.setElementAttribute = function (renderElement, attributeName, attributeValue) {
        var attrNs;
        var nsAndName = splitNamespace(attributeName);
        if (lang_1.isPresent(nsAndName[0])) {
            attributeName = nsAndName[0] + ':' + nsAndName[1];
            attrNs = NAMESPACE_URIS[nsAndName[0]];
        }
        if (lang_1.isPresent(attributeValue)) {
            if (lang_1.isPresent(attrNs)) {
                dom_adapter_1.DOM.setAttributeNS(renderElement, attrNs, attributeName, attributeValue);
            }
            else {
                dom_adapter_1.DOM.setAttribute(renderElement, attributeName, attributeValue);
            }
        }
        else {
            if (lang_1.isPresent(attrNs)) {
                dom_adapter_1.DOM.removeAttributeNS(renderElement, attrNs, nsAndName[1]);
            }
            else {
                dom_adapter_1.DOM.removeAttribute(renderElement, attributeName);
            }
        }
    };
    DomRenderer.prototype.setBindingDebugInfo = function (renderElement, propertyName, propertyValue) {
        var dashCasedPropertyName = util_1.camelCaseToDashCase(propertyName);
        if (dom_adapter_1.DOM.isCommentNode(renderElement)) {
            var existingBindings = lang_1.RegExpWrapper.firstMatch(TEMPLATE_BINDINGS_EXP, lang_1.StringWrapper.replaceAll(dom_adapter_1.DOM.getText(renderElement), /\n/g, ''));
            var parsedBindings = lang_1.Json.parse(existingBindings[1]);
            parsedBindings[dashCasedPropertyName] = propertyValue;
            dom_adapter_1.DOM.setText(renderElement, lang_1.StringWrapper.replace(TEMPLATE_COMMENT_TEXT, '{}', lang_1.Json.stringify(parsedBindings)));
        }
        else {
            this.setElementAttribute(renderElement, propertyName, propertyValue);
        }
    };
    DomRenderer.prototype.setElementClass = function (renderElement, className, isAdd) {
        if (isAdd) {
            dom_adapter_1.DOM.addClass(renderElement, className);
        }
        else {
            dom_adapter_1.DOM.removeClass(renderElement, className);
        }
    };
    DomRenderer.prototype.setElementStyle = function (renderElement, styleName, styleValue) {
        if (lang_1.isPresent(styleValue)) {
            dom_adapter_1.DOM.setStyle(renderElement, styleName, lang_1.stringify(styleValue));
        }
        else {
            dom_adapter_1.DOM.removeStyle(renderElement, styleName);
        }
    };
    DomRenderer.prototype.invokeElementMethod = function (renderElement, methodName, args) {
        dom_adapter_1.DOM.invoke(renderElement, methodName, args);
    };
    DomRenderer.prototype.setText = function (renderNode, text) { dom_adapter_1.DOM.setText(renderNode, text); };
    /**
     * Performs animations if necessary
     * @param node
     */
    DomRenderer.prototype.animateNodeEnter = function (node) {
        if (dom_adapter_1.DOM.isElementNode(node) && dom_adapter_1.DOM.hasClass(node, 'ng-animate')) {
            dom_adapter_1.DOM.addClass(node, 'ng-enter');
            this._rootRenderer.animate.css()
                .addAnimationClass('ng-enter-active')
                .start(node)
                .onComplete(function () { dom_adapter_1.DOM.removeClass(node, 'ng-enter'); });
        }
    };
    /**
     * If animations are necessary, performs animations then removes the element; otherwise, it just
     * removes the element.
     * @param node
     */
    DomRenderer.prototype.animateNodeLeave = function (node) {
        if (dom_adapter_1.DOM.isElementNode(node) && dom_adapter_1.DOM.hasClass(node, 'ng-animate')) {
            dom_adapter_1.DOM.addClass(node, 'ng-leave');
            this._rootRenderer.animate.css()
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
    return DomRenderer;
}());
exports.DomRenderer = DomRenderer;
function moveNodesAfterSibling(sibling, nodes) {
    var parent = dom_adapter_1.DOM.parentElement(sibling);
    if (nodes.length > 0 && lang_1.isPresent(parent)) {
        var nextSibling = dom_adapter_1.DOM.nextSibling(sibling);
        if (lang_1.isPresent(nextSibling)) {
            for (var i = 0; i < nodes.length; i++) {
                dom_adapter_1.DOM.insertBefore(nextSibling, nodes[i]);
            }
        }
        else {
            for (var i = 0; i < nodes.length; i++) {
                dom_adapter_1.DOM.appendChild(parent, nodes[i]);
            }
        }
    }
}
function appendNodes(parent, nodes) {
    for (var i = 0; i < nodes.length; i++) {
        dom_adapter_1.DOM.appendChild(parent, nodes[i]);
    }
}
function decoratePreventDefault(eventHandler) {
    return function (event) {
        var allowDefaultBehavior = eventHandler(event);
        if (allowDefaultBehavior === false) {
            // TODO(tbosch): move preventDefault into event plugins...
            dom_adapter_1.DOM.preventDefault(event);
        }
    };
}
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
function _flattenStyles(compId, styles, target) {
    for (var i = 0; i < styles.length; i++) {
        var style = styles[i];
        if (lang_1.isArray(style)) {
            _flattenStyles(compId, style, target);
        }
        else {
            style = lang_1.StringWrapper.replaceAll(style, COMPONENT_REGEX, compId);
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
    var match = lang_1.RegExpWrapper.firstMatch(NS_PREFIX_RE, name);
    return [match[1], match[2]];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX3JlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQThDLHNCQUFzQixDQUFDLENBQUE7QUFDckUsa0NBQStCLHdDQUF3QyxDQUFDLENBQUE7QUFDeEUscUJBU08sMEJBQTBCLENBQUMsQ0FBQTtBQUVsQywyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSxtQ0FBa0Msc0JBQXNCLENBQUMsQ0FBQTtBQVN6RCw4QkFBMkIsd0JBQXdCLENBQUMsQ0FBQTtBQUVwRCwyQkFBdUIsY0FBYyxDQUFDLENBQUE7QUFDdEMseUJBQWdDLDRCQUE0QixDQUFDLENBQUE7QUFDN0QsNEJBQWtCLHVDQUF1QyxDQUFDLENBQUE7QUFDMUQscUJBQWtDLFFBQVEsQ0FBQyxDQUFBO0FBRTNDLElBQU0sY0FBYztBQUNoQixrQkFBa0I7QUFDbEIsRUFBQyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixFQUFDLENBQUM7QUFDbkYsSUFBTSxxQkFBcUIsR0FBRyxzQkFBc0IsQ0FBQztBQUNyRCxJQUFJLHFCQUFxQixHQUFHLDJCQUEyQixDQUFDO0FBRXhEO0lBR0UseUJBQW1CLFFBQWEsRUFBUyxZQUEwQixFQUNoRCxnQkFBcUMsRUFBUyxPQUF5QjtRQUR2RSxhQUFRLEdBQVIsUUFBUSxDQUFLO1FBQVMsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDaEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFxQjtRQUFTLFlBQU8sR0FBUCxPQUFPLENBQWtCO1FBSGxGLDBCQUFxQixHQUE2QixJQUFJLEdBQUcsRUFBdUIsQ0FBQztJQUdJLENBQUM7SUFFOUYseUNBQWUsR0FBZixVQUFnQixjQUFtQztR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Q0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUN2QyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixjQUFjLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixLQUFLLEdBQUcsb0JBQWEsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFDO0lBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsSUFBSSxZQUFZLEdBQUcsaUJBQWlCLENBQUM7QUFFckMsd0JBQXdCLElBQVk7SUFDbEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFDRCxJQUFJLEtBQUssR0FBRyxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekQsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7QW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2FuaW1hdGUvYW5pbWF0aW9uX2J1aWxkZXInO1xuaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBKc29uLFxuICBSZWdFeHBXcmFwcGVyLFxuICBzdHJpbmdpZnksXG4gIFN0cmluZ1dyYXBwZXIsXG4gIGlzQXJyYXksXG4gIGlzU3RyaW5nXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7RG9tU2hhcmVkU3R5bGVzSG9zdH0gZnJvbSAnLi9zaGFyZWRfc3R5bGVzX2hvc3QnO1xuXG5pbXBvcnQge1xuICBSZW5kZXJlcixcbiAgUm9vdFJlbmRlcmVyLFxuICBSZW5kZXJDb21wb25lbnRUeXBlLFxuICBSZW5kZXJEZWJ1Z0luZm9cbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5cbmltcG9ydCB7RXZlbnRNYW5hZ2VyfSBmcm9tICcuL2V2ZW50cy9ldmVudF9tYW5hZ2VyJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi9kb21fdG9rZW5zJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7Y2FtZWxDYXNlVG9EYXNoQ2FzZX0gZnJvbSAnLi91dGlsJztcblxuY29uc3QgTkFNRVNQQUNFX1VSSVMgPVxuICAgIC8qQHRzMmRhcnRfY29uc3QqL1xuICAgIHsneGxpbmsnOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICdzdmcnOiAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnfTtcbmNvbnN0IFRFTVBMQVRFX0NPTU1FTlRfVEVYVCA9ICd0ZW1wbGF0ZSBiaW5kaW5ncz17fSc7XG52YXIgVEVNUExBVEVfQklORElOR1NfRVhQID0gL150ZW1wbGF0ZSBiaW5kaW5ncz0oLiopJC9nO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRG9tUm9vdFJlbmRlcmVyIGltcGxlbWVudHMgUm9vdFJlbmRlcmVyIHtcbiAgcHJpdmF0ZSBfcmVnaXN0ZXJlZENvbXBvbmVudHM6IE1hcDxzdHJpbmcsIERvbVJlbmRlcmVyPiA9IG5ldyBNYXA8c3RyaW5nLCBEb21SZW5kZXJlcj4oKTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZG9jdW1lbnQ6IGFueSwgcHVibGljIGV2ZW50TWFuYWdlcjogRXZlbnRNYW5hZ2VyLFxuICAgICAgICAgICAgICBwdWJsaWMgc2hhcmVkU3R5bGVzSG9zdDogRG9tU2hhcmVkU3R5bGVzSG9zdCwgcHVibGljIGFuaW1hdGU6IEFuaW1hdGlvbkJ1aWxkZXIpIHt9XG5cbiAgcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudFByb3RvOiBSZW5kZXJDb21wb25lbnRUeXBlKTogUmVuZGVyZXIge1xuICAgIHZhciByZW5kZXJlciA9IHRoaXMuX3JlZ2lzdGVyZWRDb21wb25lbnRzLmdldChjb21wb25lbnRQcm90by5pZCk7XG4gICAgaWYgKGlzQmxhbmsocmVuZGVyZXIpKSB7XG4gICAgICByZW5kZXJlciA9IG5ldyBEb21SZW5kZXJlcih0aGlzLCBjb21wb25lbnRQcm90byk7XG4gICAgICB0aGlzLl9yZWdpc3RlcmVkQ29tcG9uZW50cy5zZXQoY29tcG9uZW50UHJvdG8uaWQsIHJlbmRlcmVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlbmRlcmVyO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEb21Sb290UmVuZGVyZXJfIGV4dGVuZHMgRG9tUm9vdFJlbmRlcmVyIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50OiBhbnksIF9ldmVudE1hbmFnZXI6IEV2ZW50TWFuYWdlcixcbiAgICAgICAgICAgICAgc2hhcmVkU3R5bGVzSG9zdDogRG9tU2hhcmVkU3R5bGVzSG9zdCwgYW5pbWF0ZTogQW5pbWF0aW9uQnVpbGRlcikge1xuICAgIHN1cGVyKF9kb2N1bWVudCwgX2V2ZW50TWFuYWdlciwgc2hhcmVkU3R5bGVzSG9zdCwgYW5pbWF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERvbVJlbmRlcmVyIGltcGxlbWVudHMgUmVuZGVyZXIge1xuICBwcml2YXRlIF9jb250ZW50QXR0cjogc3RyaW5nO1xuICBwcml2YXRlIF9ob3N0QXR0cjogc3RyaW5nO1xuICBwcml2YXRlIF9zdHlsZXM6IHN0cmluZ1tdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Jvb3RSZW5kZXJlcjogRG9tUm9vdFJlbmRlcmVyLCBwcml2YXRlIGNvbXBvbmVudFByb3RvOiBSZW5kZXJDb21wb25lbnRUeXBlKSB7XG4gICAgdGhpcy5fc3R5bGVzID0gX2ZsYXR0ZW5TdHlsZXMoY29tcG9uZW50UHJvdG8uaWQsIGNvbXBvbmVudFByb3RvLnN0eWxlcywgW10pO1xuICAgIGlmIChjb21wb25lbnRQcm90by5lbmNhcHN1bGF0aW9uICE9PSBWaWV3RW5jYXBzdWxhdGlvbi5OYXRpdmUpIHtcbiAgICAgIHRoaXMuX3Jvb3RSZW5kZXJlci5zaGFyZWRTdHlsZXNIb3N0LmFkZFN0eWxlcyh0aGlzLl9zdHlsZXMpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jb21wb25lbnRQcm90by5lbmNhcHN1bGF0aW9uID09PSBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZCkge1xuICAgICAgdGhpcy5fY29udGVudEF0dHIgPSBfc2hpbUNvbnRlbnRBdHRyaWJ1dGUoY29tcG9uZW50UHJvdG8uaWQpO1xuICAgICAgdGhpcy5faG9zdEF0dHIgPSBfc2hpbUhvc3RBdHRyaWJ1dGUoY29tcG9uZW50UHJvdG8uaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jb250ZW50QXR0ciA9IG51bGw7XG4gICAgICB0aGlzLl9ob3N0QXR0ciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgc2VsZWN0Um9vdEVsZW1lbnQoc2VsZWN0b3JPck5vZGU6IHN0cmluZyB8IGFueSwgZGVidWdJbmZvOiBSZW5kZXJEZWJ1Z0luZm8pOiBFbGVtZW50IHtcbiAgICB2YXIgZWw7XG4gICAgaWYgKGlzU3RyaW5nKHNlbGVjdG9yT3JOb2RlKSkge1xuICAgICAgZWwgPSBET00ucXVlcnlTZWxlY3Rvcih0aGlzLl9yb290UmVuZGVyZXIuZG9jdW1lbnQsIHNlbGVjdG9yT3JOb2RlKTtcbiAgICAgIGlmIChpc0JsYW5rKGVsKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVGhlIHNlbGVjdG9yIFwiJHtzZWxlY3Rvck9yTm9kZX1cIiBkaWQgbm90IG1hdGNoIGFueSBlbGVtZW50c2ApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlbCA9IHNlbGVjdG9yT3JOb2RlO1xuICAgIH1cbiAgICBET00uY2xlYXJOb2RlcyhlbCk7XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgY3JlYXRlRWxlbWVudChwYXJlbnQ6IEVsZW1lbnQsIG5hbWU6IHN0cmluZywgZGVidWdJbmZvOiBSZW5kZXJEZWJ1Z0luZm8pOiBOb2RlIHtcbiAgICB2YXIgbnNBbmROYW1lID0gc3BsaXROYW1lc3BhY2UobmFtZSk7XG4gICAgdmFyIGVsID0gaXNQcmVzZW50KG5zQW5kTmFtZVswXSkgP1xuICAgICAgICAgICAgICAgICBET00uY3JlYXRlRWxlbWVudE5TKE5BTUVTUEFDRV9VUklTW25zQW5kTmFtZVswXV0sIG5zQW5kTmFtZVsxXSkgOlxuICAgICAgICAgICAgICAgICBET00uY3JlYXRlRWxlbWVudChuc0FuZE5hbWVbMV0pO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY29udGVudEF0dHIpKSB7XG4gICAgICBET00uc2V0QXR0cmlidXRlKGVsLCB0aGlzLl9jb250ZW50QXR0ciwgJycpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHBhcmVudCkpIHtcbiAgICAgIERPTS5hcHBlbmRDaGlsZChwYXJlbnQsIGVsKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgY3JlYXRlVmlld1Jvb3QoaG9zdEVsZW1lbnQ6IGFueSk6IGFueSB7XG4gICAgdmFyIG5vZGVzUGFyZW50O1xuICAgIGlmICh0aGlzLmNvbXBvbmVudFByb3RvLmVuY2Fwc3VsYXRpb24gPT09IFZpZXdFbmNhcHN1bGF0aW9uLk5hdGl2ZSkge1xuICAgICAgbm9kZXNQYXJlbnQgPSBET00uY3JlYXRlU2hhZG93Um9vdChob3N0RWxlbWVudCk7XG4gICAgICB0aGlzLl9yb290UmVuZGVyZXIuc2hhcmVkU3R5bGVzSG9zdC5hZGRIb3N0KG5vZGVzUGFyZW50KTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIERPTS5hcHBlbmRDaGlsZChub2Rlc1BhcmVudCwgRE9NLmNyZWF0ZVN0eWxlRWxlbWVudCh0aGlzLl9zdHlsZXNbaV0pKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9ob3N0QXR0cikpIHtcbiAgICAgICAgRE9NLnNldEF0dHJpYnV0ZShob3N0RWxlbWVudCwgdGhpcy5faG9zdEF0dHIsICcnKTtcbiAgICAgIH1cbiAgICAgIG5vZGVzUGFyZW50ID0gaG9zdEVsZW1lbnQ7XG4gICAgfVxuICAgIHJldHVybiBub2Rlc1BhcmVudDtcbiAgfVxuXG4gIGNyZWF0ZVRlbXBsYXRlQW5jaG9yKHBhcmVudEVsZW1lbnQ6IGFueSwgZGVidWdJbmZvOiBSZW5kZXJEZWJ1Z0luZm8pOiBhbnkge1xuICAgIHZhciBjb21tZW50ID0gRE9NLmNyZWF0ZUNvbW1lbnQoVEVNUExBVEVfQ09NTUVOVF9URVhUKTtcbiAgICBpZiAoaXNQcmVzZW50KHBhcmVudEVsZW1lbnQpKSB7XG4gICAgICBET00uYXBwZW5kQ2hpbGQocGFyZW50RWxlbWVudCwgY29tbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBjb21tZW50O1xuICB9XG5cbiAgY3JlYXRlVGV4dChwYXJlbnRFbGVtZW50OiBhbnksIHZhbHVlOiBzdHJpbmcsIGRlYnVnSW5mbzogUmVuZGVyRGVidWdJbmZvKTogYW55IHtcbiAgICB2YXIgbm9kZSA9IERPTS5jcmVhdGVUZXh0Tm9kZSh2YWx1ZSk7XG4gICAgaWYgKGlzUHJlc2VudChwYXJlbnRFbGVtZW50KSkge1xuICAgICAgRE9NLmFwcGVuZENoaWxkKHBhcmVudEVsZW1lbnQsIG5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHByb2plY3ROb2RlcyhwYXJlbnRFbGVtZW50OiBhbnksIG5vZGVzOiBhbnlbXSkge1xuICAgIGlmIChpc0JsYW5rKHBhcmVudEVsZW1lbnQpKSByZXR1cm47XG4gICAgYXBwZW5kTm9kZXMocGFyZW50RWxlbWVudCwgbm9kZXMpO1xuICB9XG5cbiAgYXR0YWNoVmlld0FmdGVyKG5vZGU6IGFueSwgdmlld1Jvb3ROb2RlczogYW55W10pIHtcbiAgICBtb3ZlTm9kZXNBZnRlclNpYmxpbmcobm9kZSwgdmlld1Jvb3ROb2Rlcyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2aWV3Um9vdE5vZGVzLmxlbmd0aDsgaSsrKSB0aGlzLmFuaW1hdGVOb2RlRW50ZXIodmlld1Jvb3ROb2Rlc1tpXSk7XG4gIH1cblxuICBkZXRhY2hWaWV3KHZpZXdSb290Tm9kZXM6IGFueVtdKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Um9vdE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbm9kZSA9IHZpZXdSb290Tm9kZXNbaV07XG4gICAgICBET00ucmVtb3ZlKG5vZGUpO1xuICAgICAgdGhpcy5hbmltYXRlTm9kZUxlYXZlKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3lWaWV3KGhvc3RFbGVtZW50OiBhbnksIHZpZXdBbGxOb2RlczogYW55W10pIHtcbiAgICBpZiAodGhpcy5jb21wb25lbnRQcm90by5lbmNhcHN1bGF0aW9uID09PSBWaWV3RW5jYXBzdWxhdGlvbi5OYXRpdmUgJiYgaXNQcmVzZW50KGhvc3RFbGVtZW50KSkge1xuICAgICAgdGhpcy5fcm9vdFJlbmRlcmVyLnNoYXJlZFN0eWxlc0hvc3QucmVtb3ZlSG9zdChET00uZ2V0U2hhZG93Um9vdChob3N0RWxlbWVudCkpO1xuICAgIH1cbiAgfVxuXG4gIGxpc3RlbihyZW5kZXJFbGVtZW50OiBhbnksIG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLl9yb290UmVuZGVyZXIuZXZlbnRNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIocmVuZGVyRWxlbWVudCwgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY29yYXRlUHJldmVudERlZmF1bHQoY2FsbGJhY2spKTtcbiAgfVxuXG4gIGxpc3Rlbkdsb2JhbCh0YXJnZXQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Jvb3RSZW5kZXJlci5ldmVudE1hbmFnZXIuYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcih0YXJnZXQsIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNvcmF0ZVByZXZlbnREZWZhdWx0KGNhbGxiYWNrKSk7XG4gIH1cblxuICBzZXRFbGVtZW50UHJvcGVydHkocmVuZGVyRWxlbWVudDogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgRE9NLnNldFByb3BlcnR5KHJlbmRlckVsZW1lbnQsIHByb3BlcnR5TmFtZSwgcHJvcGVydHlWYWx1ZSk7XG4gIH1cblxuICBzZXRFbGVtZW50QXR0cmlidXRlKHJlbmRlckVsZW1lbnQ6IGFueSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCBhdHRyaWJ1dGVWYWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdmFyIGF0dHJOcztcbiAgICB2YXIgbnNBbmROYW1lID0gc3BsaXROYW1lc3BhY2UoYXR0cmlidXRlTmFtZSk7XG4gICAgaWYgKGlzUHJlc2VudChuc0FuZE5hbWVbMF0pKSB7XG4gICAgICBhdHRyaWJ1dGVOYW1lID0gbnNBbmROYW1lWzBdICsgJzonICsgbnNBbmROYW1lWzFdO1xuICAgICAgYXR0ck5zID0gTkFNRVNQQUNFX1VSSVNbbnNBbmROYW1lWzBdXTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChhdHRyaWJ1dGVWYWx1ZSkpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQoYXR0ck5zKSkge1xuICAgICAgICBET00uc2V0QXR0cmlidXRlTlMocmVuZGVyRWxlbWVudCwgYXR0ck5zLCBhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBET00uc2V0QXR0cmlidXRlKHJlbmRlckVsZW1lbnQsIGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzUHJlc2VudChhdHRyTnMpKSB7XG4gICAgICAgIERPTS5yZW1vdmVBdHRyaWJ1dGVOUyhyZW5kZXJFbGVtZW50LCBhdHRyTnMsIG5zQW5kTmFtZVsxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBET00ucmVtb3ZlQXR0cmlidXRlKHJlbmRlckVsZW1lbnQsIGF0dHJpYnV0ZU5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldEJpbmRpbmdEZWJ1Z0luZm8ocmVuZGVyRWxlbWVudDogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdmFyIGRhc2hDYXNlZFByb3BlcnR5TmFtZSA9IGNhbWVsQ2FzZVRvRGFzaENhc2UocHJvcGVydHlOYW1lKTtcbiAgICBpZiAoRE9NLmlzQ29tbWVudE5vZGUocmVuZGVyRWxlbWVudCkpIHtcbiAgICAgIHZhciBleGlzdGluZ0JpbmRpbmdzID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKFxuICAgICAgICAgIFRFTVBMQVRFX0JJTkRJTkdTX0VYUCwgU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKERPTS5nZXRUZXh0KHJlbmRlckVsZW1lbnQpLCAvXFxuL2csICcnKSk7XG4gICAgICB2YXIgcGFyc2VkQmluZGluZ3MgPSBKc29uLnBhcnNlKGV4aXN0aW5nQmluZGluZ3NbMV0pO1xuICAgICAgcGFyc2VkQmluZGluZ3NbZGFzaENhc2VkUHJvcGVydHlOYW1lXSA9IHByb3BlcnR5VmFsdWU7XG4gICAgICBET00uc2V0VGV4dChyZW5kZXJFbGVtZW50LCBTdHJpbmdXcmFwcGVyLnJlcGxhY2UoVEVNUExBVEVfQ09NTUVOVF9URVhULCAne30nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpzb24uc3RyaW5naWZ5KHBhcnNlZEJpbmRpbmdzKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldEVsZW1lbnRBdHRyaWJ1dGUocmVuZGVyRWxlbWVudCwgcHJvcGVydHlOYW1lLCBwcm9wZXJ0eVZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBzZXRFbGVtZW50Q2xhc3MocmVuZGVyRWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZywgaXNBZGQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoaXNBZGQpIHtcbiAgICAgIERPTS5hZGRDbGFzcyhyZW5kZXJFbGVtZW50LCBjbGFzc05hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBET00ucmVtb3ZlQ2xhc3MocmVuZGVyRWxlbWVudCwgY2xhc3NOYW1lKTtcbiAgICB9XG4gIH1cblxuICBzZXRFbGVtZW50U3R5bGUocmVuZGVyRWxlbWVudDogYW55LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudChzdHlsZVZhbHVlKSkge1xuICAgICAgRE9NLnNldFN0eWxlKHJlbmRlckVsZW1lbnQsIHN0eWxlTmFtZSwgc3RyaW5naWZ5KHN0eWxlVmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgRE9NLnJlbW92ZVN0eWxlKHJlbmRlckVsZW1lbnQsIHN0eWxlTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgaW52b2tlRWxlbWVudE1ldGhvZChyZW5kZXJFbGVtZW50OiBhbnksIG1ldGhvZE5hbWU6IHN0cmluZywgYXJnczogYW55W10pOiB2b2lkIHtcbiAgICBET00uaW52b2tlKHJlbmRlckVsZW1lbnQsIG1ldGhvZE5hbWUsIGFyZ3MpO1xuICB9XG5cbiAgc2V0VGV4dChyZW5kZXJOb2RlOiBhbnksIHRleHQ6IHN0cmluZyk6IHZvaWQgeyBET00uc2V0VGV4dChyZW5kZXJOb2RlLCB0ZXh0KTsgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhbmltYXRpb25zIGlmIG5lY2Vzc2FyeVxuICAgKiBAcGFyYW0gbm9kZVxuICAgKi9cbiAgYW5pbWF0ZU5vZGVFbnRlcihub2RlOiBOb2RlKSB7XG4gICAgaWYgKERPTS5pc0VsZW1lbnROb2RlKG5vZGUpICYmIERPTS5oYXNDbGFzcyhub2RlLCAnbmctYW5pbWF0ZScpKSB7XG4gICAgICBET00uYWRkQ2xhc3Mobm9kZSwgJ25nLWVudGVyJyk7XG4gICAgICB0aGlzLl9yb290UmVuZGVyZXIuYW5pbWF0ZS5jc3MoKVxuICAgICAgICAgIC5hZGRBbmltYXRpb25DbGFzcygnbmctZW50ZXItYWN0aXZlJylcbiAgICAgICAgICAuc3RhcnQoPEhUTUxFbGVtZW50Pm5vZGUpXG4gICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4geyBET00ucmVtb3ZlQ2xhc3Mobm9kZSwgJ25nLWVudGVyJyk7IH0pO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIElmIGFuaW1hdGlvbnMgYXJlIG5lY2Vzc2FyeSwgcGVyZm9ybXMgYW5pbWF0aW9ucyB0aGVuIHJlbW92ZXMgdGhlIGVsZW1lbnQ7IG90aGVyd2lzZSwgaXQganVzdFxuICAgKiByZW1vdmVzIHRoZSBlbGVtZW50LlxuICAgKiBAcGFyYW0gbm9kZVxuICAgKi9cbiAgYW5pbWF0ZU5vZGVMZWF2ZShub2RlOiBOb2RlKSB7XG4gICAgaWYgKERPTS5pc0VsZW1lbnROb2RlKG5vZGUpICYmIERPTS5oYXNDbGFzcyhub2RlLCAnbmctYW5pbWF0ZScpKSB7XG4gICAgICBET00uYWRkQ2xhc3Mobm9kZSwgJ25nLWxlYXZlJyk7XG4gICAgICB0aGlzLl9yb290UmVuZGVyZXIuYW5pbWF0ZS5jc3MoKVxuICAgICAgICAgIC5hZGRBbmltYXRpb25DbGFzcygnbmctbGVhdmUtYWN0aXZlJylcbiAgICAgICAgICAuc3RhcnQoPEhUTUxFbGVtZW50Pm5vZGUpXG4gICAgICAgICAgLm9uQ29tcGxldGUoKCkgPT4ge1xuICAgICAgICAgICAgRE9NLnJlbW92ZUNsYXNzKG5vZGUsICduZy1sZWF2ZScpO1xuICAgICAgICAgICAgRE9NLnJlbW92ZShub2RlKTtcbiAgICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgRE9NLnJlbW92ZShub2RlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbW92ZU5vZGVzQWZ0ZXJTaWJsaW5nKHNpYmxpbmcsIG5vZGVzKSB7XG4gIHZhciBwYXJlbnQgPSBET00ucGFyZW50RWxlbWVudChzaWJsaW5nKTtcbiAgaWYgKG5vZGVzLmxlbmd0aCA+IDAgJiYgaXNQcmVzZW50KHBhcmVudCkpIHtcbiAgICB2YXIgbmV4dFNpYmxpbmcgPSBET00ubmV4dFNpYmxpbmcoc2libGluZyk7XG4gICAgaWYgKGlzUHJlc2VudChuZXh0U2libGluZykpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgRE9NLmluc2VydEJlZm9yZShuZXh0U2libGluZywgbm9kZXNbaV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIERPTS5hcHBlbmRDaGlsZChwYXJlbnQsIG5vZGVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwZW5kTm9kZXMocGFyZW50LCBub2Rlcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgRE9NLmFwcGVuZENoaWxkKHBhcmVudCwgbm9kZXNbaV0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlY29yYXRlUHJldmVudERlZmF1bHQoZXZlbnRIYW5kbGVyOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuIChldmVudCkgPT4ge1xuICAgIHZhciBhbGxvd0RlZmF1bHRCZWhhdmlvciA9IGV2ZW50SGFuZGxlcihldmVudCk7XG4gICAgaWYgKGFsbG93RGVmYXVsdEJlaGF2aW9yID09PSBmYWxzZSkge1xuICAgICAgLy8gVE9ETyh0Ym9zY2gpOiBtb3ZlIHByZXZlbnREZWZhdWx0IGludG8gZXZlbnQgcGx1Z2lucy4uLlxuICAgICAgRE9NLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICB9XG4gIH07XG59XG5cbnZhciBDT01QT05FTlRfUkVHRVggPSAvJUNPTVAlL2c7XG5leHBvcnQgY29uc3QgQ09NUE9ORU5UX1ZBUklBQkxFID0gJyVDT01QJSc7XG5leHBvcnQgY29uc3QgSE9TVF9BVFRSID0gLypAdHMyZGFydF9jb25zdCovIGBfbmdob3N0LSR7Q09NUE9ORU5UX1ZBUklBQkxFfWA7XG5leHBvcnQgY29uc3QgQ09OVEVOVF9BVFRSID0gLypAdHMyZGFydF9jb25zdCovIGBfbmdjb250ZW50LSR7Q09NUE9ORU5UX1ZBUklBQkxFfWA7XG5cbmZ1bmN0aW9uIF9zaGltQ29udGVudEF0dHJpYnV0ZShjb21wb25lbnRTaG9ydElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKENPTlRFTlRfQVRUUiwgQ09NUE9ORU5UX1JFR0VYLCBjb21wb25lbnRTaG9ydElkKTtcbn1cblxuZnVuY3Rpb24gX3NoaW1Ib3N0QXR0cmlidXRlKGNvbXBvbmVudFNob3J0SWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoSE9TVF9BVFRSLCBDT01QT05FTlRfUkVHRVgsIGNvbXBvbmVudFNob3J0SWQpO1xufVxuXG5mdW5jdGlvbiBfZmxhdHRlblN0eWxlcyhjb21wSWQ6IHN0cmluZywgc3R5bGVzOiBBcnJheTxhbnkgfCBhbnlbXT4sIHRhcmdldDogc3RyaW5nW10pOiBzdHJpbmdbXSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHN0eWxlID0gc3R5bGVzW2ldO1xuICAgIGlmIChpc0FycmF5KHN0eWxlKSkge1xuICAgICAgX2ZsYXR0ZW5TdHlsZXMoY29tcElkLCBzdHlsZSwgdGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc3R5bGUsIENPTVBPTkVOVF9SRUdFWCwgY29tcElkKTtcbiAgICAgIHRhcmdldC5wdXNoKHN0eWxlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxudmFyIE5TX1BSRUZJWF9SRSA9IC9eQChbXjpdKyk6KC4rKS9nO1xuXG5mdW5jdGlvbiBzcGxpdE5hbWVzcGFjZShuYW1lOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGlmIChuYW1lWzBdICE9ICdAJykge1xuICAgIHJldHVybiBbbnVsbCwgbmFtZV07XG4gIH1cbiAgbGV0IG1hdGNoID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKE5TX1BSRUZJWF9SRSwgbmFtZSk7XG4gIHJldHVybiBbbWF0Y2hbMV0sIG1hdGNoWzJdXTtcbn1cbiJdfQ==