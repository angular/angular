'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var interfaces_1 = require('angular2/src/core/change_detection/interfaces');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var view_ref_1 = require('./view_ref');
var util_1 = require('angular2/src/core/render/util');
var view_ref_2 = require("./view_ref");
var interfaces_2 = require('angular2/src/core/change_detection/interfaces');
exports.DebugContext = interfaces_2.DebugContext;
var REFLECT_PREFIX = 'ng-reflect-';
(function (ViewType) {
    // A view that contains the host element with bound component directive.
    // Contains a COMPONENT view
    ViewType[ViewType["HOST"] = 0] = "HOST";
    // The view of the component
    // Can contain 0 to n EMBEDDED views
    ViewType[ViewType["COMPONENT"] = 1] = "COMPONENT";
    // A view that is embedded into another View via a <template> element
    // inside of a COMPONENT view
    ViewType[ViewType["EMBEDDED"] = 2] = "EMBEDDED";
})(exports.ViewType || (exports.ViewType = {}));
var ViewType = exports.ViewType;
var AppViewContainer = (function () {
    function AppViewContainer() {
        // The order in this list matches the DOM order.
        this.views = [];
    }
    return AppViewContainer;
})();
exports.AppViewContainer = AppViewContainer;
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
var AppView = (function () {
    function AppView(renderer, proto, viewOffset, elementOffset, textOffset, protoLocals, render, renderFragment, containerElementInjector) {
        this.renderer = renderer;
        this.proto = proto;
        this.viewOffset = viewOffset;
        this.elementOffset = elementOffset;
        this.textOffset = textOffset;
        this.render = render;
        this.renderFragment = renderFragment;
        this.containerElementInjector = containerElementInjector;
        // AppViews that have been merged in depth first order.
        // This list is shared between all merged views. Use this.elementOffset to get the local
        // entries.
        this.views = null;
        // ElementInjectors of all AppViews in views grouped by view.
        // This list is shared between all merged views. Use this.elementOffset to get the local
        // entries.
        this.elementInjectors = null;
        // ViewContainers of all AppViews in views grouped by view.
        // This list is shared between all merged views. Use this.elementOffset to get the local
        // entries.
        this.viewContainers = null;
        // PreBuiltObjects of all AppViews in views grouped by view.
        // This list is shared between all merged views. Use this.elementOffset to get the local
        // entries.
        this.preBuiltObjects = null;
        this.changeDetector = null;
        /**
         * The context against which data-binding expressions in this view are evaluated against.
         * This is always a component instance.
         */
        this.context = null;
        this.ref = new view_ref_2.ViewRef_(this);
        this.locals = new change_detection_1.Locals(null, collection_1.MapWrapper.clone(protoLocals)); // TODO optimize this
    }
    AppView.prototype.init = function (changeDetector, elementInjectors, rootElementInjectors, preBuiltObjects, views, elementRefs, viewContainers) {
        this.changeDetector = changeDetector;
        this.elementInjectors = elementInjectors;
        this.rootElementInjectors = rootElementInjectors;
        this.preBuiltObjects = preBuiltObjects;
        this.views = views;
        this.elementRefs = elementRefs;
        this.viewContainers = viewContainers;
    };
    AppView.prototype.setLocal = function (contextName, value) {
        if (!this.hydrated())
            throw new exceptions_1.BaseException('Cannot set locals on dehydrated view.');
        if (!this.proto.templateVariableBindings.has(contextName)) {
            return;
        }
        var templateName = this.proto.templateVariableBindings.get(contextName);
        this.locals.set(templateName, value);
    };
    AppView.prototype.hydrated = function () { return lang_1.isPresent(this.context); };
    /**
     * Triggers the event handlers for the element and the directives.
     *
     * This method is intended to be called from directive EventEmitters.
     *
     * @param {string} eventName
     * @param {*} eventObj
     * @param {number} boundElementIndex
     */
    AppView.prototype.triggerEventHandlers = function (eventName, eventObj, boundElementIndex) {
        var locals = new collection_1.Map();
        locals.set('$event', eventObj);
        this.dispatchEvent(boundElementIndex, eventName, locals);
    };
    // dispatch to element injector or text nodes based on context
    AppView.prototype.notifyOnBinding = function (b, currentValue) {
        if (b.isTextNode()) {
            this.renderer.setText(this.render, b.elementIndex + this.textOffset, currentValue);
        }
        else {
            var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
            if (b.isElementProperty()) {
                this.renderer.setElementProperty(elementRef, b.name, currentValue);
            }
            else if (b.isElementAttribute()) {
                this.renderer.setElementAttribute(elementRef, b.name, lang_1.isPresent(currentValue) ? "" + currentValue : null);
            }
            else if (b.isElementClass()) {
                this.renderer.setElementClass(elementRef, b.name, currentValue);
            }
            else if (b.isElementStyle()) {
                var unit = lang_1.isPresent(b.unit) ? b.unit : '';
                this.renderer.setElementStyle(elementRef, b.name, lang_1.isPresent(currentValue) ? "" + currentValue + unit : null);
            }
            else {
                throw new exceptions_1.BaseException('Unsupported directive record');
            }
        }
    };
    AppView.prototype.logBindingUpdate = function (b, value) {
        if (b.isDirective() || b.isElementProperty()) {
            var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
            this.renderer.setElementAttribute(elementRef, "" + REFLECT_PREFIX + util_1.camelCaseToDashCase(b.name), "" + value);
        }
    };
    AppView.prototype.notifyAfterContentChecked = function () {
        var eiCount = this.proto.elementBinders.length;
        var ei = this.elementInjectors;
        for (var i = eiCount - 1; i >= 0; i--) {
            if (lang_1.isPresent(ei[i + this.elementOffset]))
                ei[i + this.elementOffset].afterContentChecked();
        }
    };
    AppView.prototype.notifyAfterViewChecked = function () {
        var eiCount = this.proto.elementBinders.length;
        var ei = this.elementInjectors;
        for (var i = eiCount - 1; i >= 0; i--) {
            if (lang_1.isPresent(ei[i + this.elementOffset]))
                ei[i + this.elementOffset].afterViewChecked();
        }
    };
    AppView.prototype.getDirectiveFor = function (directive) {
        var elementInjector = this.elementInjectors[this.elementOffset + directive.elementIndex];
        return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
    };
    AppView.prototype.getNestedView = function (boundElementIndex) {
        var eli = this.elementInjectors[boundElementIndex];
        return lang_1.isPresent(eli) ? eli.getNestedView() : null;
    };
    AppView.prototype.getContainerElement = function () {
        return lang_1.isPresent(this.containerElementInjector) ?
            this.containerElementInjector.getElementRef() :
            null;
    };
    AppView.prototype.getDebugContext = function (elementIndex, directiveIndex) {
        try {
            var offsettedIndex = this.elementOffset + elementIndex;
            var hasRefForIndex = offsettedIndex < this.elementRefs.length;
            var elementRef = hasRefForIndex ? this.elementRefs[this.elementOffset + elementIndex] : null;
            var container = this.getContainerElement();
            var ei = hasRefForIndex ? this.elementInjectors[this.elementOffset + elementIndex] : null;
            var element = lang_1.isPresent(elementRef) ? elementRef.nativeElement : null;
            var componentElement = lang_1.isPresent(container) ? container.nativeElement : null;
            var directive = lang_1.isPresent(directiveIndex) ? this.getDirectiveFor(directiveIndex) : null;
            var injector = lang_1.isPresent(ei) ? ei.getInjector() : null;
            return new interfaces_1.DebugContext(element, componentElement, directive, this.context, _localsToStringMap(this.locals), injector);
        }
        catch (e) {
            // TODO: vsavkin log the exception once we have a good way to log errors and warnings
            // if an error happens during getting the debug context, we return null.
            return null;
        }
    };
    AppView.prototype.getDetectorFor = function (directive) {
        var childView = this.getNestedView(this.elementOffset + directive.elementIndex);
        return lang_1.isPresent(childView) ? childView.changeDetector : null;
    };
    AppView.prototype.invokeElementMethod = function (elementIndex, methodName, args) {
        this.renderer.invokeElementMethod(this.elementRefs[elementIndex], methodName, args);
    };
    // implementation of RenderEventDispatcher#dispatchRenderEvent
    AppView.prototype.dispatchRenderEvent = function (boundElementIndex, eventName, locals) {
        var elementRef = this.elementRefs[boundElementIndex];
        var view = view_ref_1.internalView(elementRef.parentView);
        return view.dispatchEvent(elementRef.boundElementIndex, eventName, locals);
    };
    // returns false if preventDefault must be applied to the DOM event
    AppView.prototype.dispatchEvent = function (boundElementIndex, eventName, locals) {
        try {
            if (this.hydrated()) {
                return !this.changeDetector.handleEvent(eventName, boundElementIndex - this.elementOffset, new change_detection_1.Locals(this.locals, locals));
            }
            else {
                return true;
            }
        }
        catch (e) {
            var c = this.getDebugContext(boundElementIndex - this.elementOffset, null);
            var context = lang_1.isPresent(c) ? new _Context(c.element, c.componentElement, c.context, c.locals, c.injector) :
                null;
            throw new EventEvaluationError(eventName, e, e.stack, context);
        }
    };
    Object.defineProperty(AppView.prototype, "ownBindersCount", {
        get: function () { return this.proto.elementBinders.length; },
        enumerable: true,
        configurable: true
    });
    return AppView;
})();
exports.AppView = AppView;
function _localsToStringMap(locals) {
    var res = {};
    var c = locals;
    while (lang_1.isPresent(c)) {
        res = collection_1.StringMapWrapper.merge(res, collection_1.MapWrapper.toStringMap(c.current));
        c = c.parent;
    }
    return res;
}
/**
 * Error context included when an event handler throws an exception.
 */
var _Context = (function () {
    function _Context(element, componentElement, context, locals, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.context = context;
        this.locals = locals;
        this.injector = injector;
    }
    return _Context;
})();
/**
 * Wraps an exception thrown by an event handler.
 */
var EventEvaluationError = (function (_super) {
    __extends(EventEvaluationError, _super);
    function EventEvaluationError(eventName, originalException, originalStack, context) {
        _super.call(this, "Error during evaluation of \"" + eventName + "\"", originalException, originalStack, context);
    }
    return EventEvaluationError;
})(exceptions_1.WrappedException);
var AppProtoViewMergeInfo = (function () {
    function AppProtoViewMergeInfo(embeddedViewCount, elementCount, viewCount) {
        this.embeddedViewCount = embeddedViewCount;
        this.elementCount = elementCount;
        this.viewCount = viewCount;
    }
    return AppProtoViewMergeInfo;
})();
exports.AppProtoViewMergeInfo = AppProtoViewMergeInfo;
/**
 *
 */
var AppProtoView = (function () {
    function AppProtoView(templateId, templateCmds, type, isMergable, changeDetectorFactory, templateVariableBindings, pipes) {
        this.templateId = templateId;
        this.templateCmds = templateCmds;
        this.type = type;
        this.isMergable = isMergable;
        this.changeDetectorFactory = changeDetectorFactory;
        this.templateVariableBindings = templateVariableBindings;
        this.pipes = pipes;
        this.elementBinders = null;
        this.mergeInfo = null;
        this.variableLocations = null;
        this.textBindingCount = null;
        this.render = null;
        this.ref = new view_ref_2.ProtoViewRef_(this);
    }
    AppProtoView.prototype.init = function (render, elementBinders, textBindingCount, mergeInfo, variableLocations) {
        var _this = this;
        this.render = render;
        this.elementBinders = elementBinders;
        this.textBindingCount = textBindingCount;
        this.mergeInfo = mergeInfo;
        this.variableLocations = variableLocations;
        this.protoLocals = new collection_1.Map();
        if (lang_1.isPresent(this.templateVariableBindings)) {
            this.templateVariableBindings.forEach(function (templateName, _) { _this.protoLocals.set(templateName, null); });
        }
        if (lang_1.isPresent(variableLocations)) {
            // The view's locals needs to have a full set of variable names at construction time
            // in order to prevent new variables from being set later in the lifecycle. Since we don't
            // want
            // to actually create variable bindings for the $implicit bindings, add to the
            // protoLocals manually.
            variableLocations.forEach(function (_, templateName) { _this.protoLocals.set(templateName, null); });
        }
    };
    AppProtoView.prototype.isInitialized = function () { return lang_1.isPresent(this.elementBinders); };
    return AppProtoView;
})();
exports.AppProtoView = AppProtoView;
//# sourceMappingURL=view.js.map