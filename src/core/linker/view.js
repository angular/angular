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
            this.renderer.setBindingDebugInfo(elementRef, "" + REFLECT_PREFIX + util_1.camelCaseToDashCase(b.name), "" + value);
        }
    };
    AppView.prototype.notifyAfterContentChecked = function () {
        var eiCount = this.proto.elementBinders.length;
        var ei = this.elementInjectors;
        for (var i = eiCount - 1; i >= 0; i--) {
            if (lang_1.isPresent(ei[i + this.elementOffset]))
                ei[i + this.elementOffset].ngAfterContentChecked();
        }
    };
    AppView.prototype.notifyAfterViewChecked = function () {
        var eiCount = this.proto.elementBinders.length;
        var ei = this.elementInjectors;
        for (var i = eiCount - 1; i >= 0; i--) {
            if (lang_1.isPresent(ei[i + this.elementOffset]))
                ei[i + this.elementOffset].ngAfterViewChecked();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3LnRzIl0sIm5hbWVzIjpbIlZpZXdUeXBlIiwiQXBwVmlld0NvbnRhaW5lciIsIkFwcFZpZXdDb250YWluZXIuY29uc3RydWN0b3IiLCJBcHBWaWV3IiwiQXBwVmlldy5jb25zdHJ1Y3RvciIsIkFwcFZpZXcuaW5pdCIsIkFwcFZpZXcuc2V0TG9jYWwiLCJBcHBWaWV3Lmh5ZHJhdGVkIiwiQXBwVmlldy50cmlnZ2VyRXZlbnRIYW5kbGVycyIsIkFwcFZpZXcubm90aWZ5T25CaW5kaW5nIiwiQXBwVmlldy5sb2dCaW5kaW5nVXBkYXRlIiwiQXBwVmlldy5ub3RpZnlBZnRlckNvbnRlbnRDaGVja2VkIiwiQXBwVmlldy5ub3RpZnlBZnRlclZpZXdDaGVja2VkIiwiQXBwVmlldy5nZXREaXJlY3RpdmVGb3IiLCJBcHBWaWV3LmdldE5lc3RlZFZpZXciLCJBcHBWaWV3LmdldENvbnRhaW5lckVsZW1lbnQiLCJBcHBWaWV3LmdldERlYnVnQ29udGV4dCIsIkFwcFZpZXcuZ2V0RGV0ZWN0b3JGb3IiLCJBcHBWaWV3Lmludm9rZUVsZW1lbnRNZXRob2QiLCJBcHBWaWV3LmRpc3BhdGNoUmVuZGVyRXZlbnQiLCJBcHBWaWV3LmRpc3BhdGNoRXZlbnQiLCJBcHBWaWV3Lm93bkJpbmRlcnNDb3VudCIsIl9sb2NhbHNUb1N0cmluZ01hcCIsIl9Db250ZXh0IiwiX0NvbnRleHQuY29uc3RydWN0b3IiLCJFdmVudEV2YWx1YXRpb25FcnJvciIsIkV2ZW50RXZhbHVhdGlvbkVycm9yLmNvbnN0cnVjdG9yIiwiQXBwUHJvdG9WaWV3TWVyZ2VJbmZvIiwiQXBwUHJvdG9WaWV3TWVyZ2VJbmZvLmNvbnN0cnVjdG9yIiwiQXBwUHJvdG9WaWV3IiwiQXBwUHJvdG9WaWV3LmNvbnN0cnVjdG9yIiwiQXBwUHJvdG9WaWV3LmluaXQiLCJBcHBQcm90b1ZpZXcuaXNJbml0aWFs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Q0FBQ0EsWUFBWUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUVBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxvRkFBb0ZBO1lBQ3BGQSwwRkFBMEZBO1lBQzFGQSxPQUFPQTtZQUNQQSw4RUFBOEVBO1lBQzlFQSx3QkFBd0JBO1lBQ3hCQSxpQkFBaUJBLENBQUNBLE9BQU9BLENBQUNBLFVBQUNBLENBQUNBLEVBQUVBLFlBQVlBLElBQU9BLEtBQUlBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLFlBQVlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ2hHQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVERixvQ0FBYUEsR0FBYkEsY0FBMkJHLE1BQU1BLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNyRUgsbUJBQUNBO0FBQURBLENBQUNBLEFBeENELElBd0NDO0FBeENZLG9CQUFZLGVBd0N4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgTGlzdFdyYXBwZXIsXG4gIE1hcFdyYXBwZXIsXG4gIE1hcCxcbiAgU3RyaW5nTWFwV3JhcHBlcixcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yLFxuICBDaGFuZ2VEaXNwYXRjaGVyLFxuICBEaXJlY3RpdmVJbmRleCxcbiAgQmluZGluZ1RhcmdldCxcbiAgTG9jYWxzLFxuICBQcm90b0NoYW5nZURldGVjdG9yXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge0RlYnVnQ29udGV4dH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtcbiAgUHJvdG9FbGVtZW50SW5qZWN0b3IsXG4gIEVsZW1lbnRJbmplY3RvcixcbiAgUHJlQnVpbHRPYmplY3RzLFxuICBEaXJlY3RpdmVQcm92aWRlclxufSBmcm9tICcuL2VsZW1lbnRfaW5qZWN0b3InO1xuaW1wb3J0IHtFbGVtZW50QmluZGVyfSBmcm9tICcuL2VsZW1lbnRfYmluZGVyJztcbmltcG9ydCB7aXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0ICogYXMgcmVuZGVyQXBpIGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtSZW5kZXJFdmVudERpc3BhdGNoZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtWaWV3UmVmLCBQcm90b1ZpZXdSZWYsIGludGVybmFsVmlld30gZnJvbSAnLi92aWV3X3JlZic7XG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtQcm90b1BpcGVzfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9waXBlcy9waXBlcyc7XG5pbXBvcnQge2NhbWVsQ2FzZVRvRGFzaENhc2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci91dGlsJztcbmltcG9ydCB7VGVtcGxhdGVDbWR9IGZyb20gJy4vdGVtcGxhdGVfY29tbWFuZHMnO1xuaW1wb3J0IHtWaWV3UmVmXywgUHJvdG9WaWV3UmVmX30gZnJvbSBcIi4vdmlld19yZWZcIjtcblxuZXhwb3J0IHtEZWJ1Z0NvbnRleHR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vaW50ZXJmYWNlcyc7XG5cbmNvbnN0IFJFRkxFQ1RfUFJFRklYOiBzdHJpbmcgPSAnbmctcmVmbGVjdC0nO1xuXG5leHBvcnQgZW51bSBWaWV3VHlwZSB7XG4gIC8vIEEgdmlldyB0aGF0IGNvbnRhaW5zIHRoZSBob3N0IGVsZW1lbnQgd2l0aCBib3VuZCBjb21wb25lbnQgZGlyZWN0aXZlLlxuICAvLyBDb250YWlucyBhIENPTVBPTkVOVCB2aWV3XG4gIEhPU1QsXG4gIC8vIFRoZSB2aWV3IG9mIHRoZSBjb21wb25lbnRcbiAgLy8gQ2FuIGNvbnRhaW4gMCB0byBuIEVNQkVEREVEIHZpZXdzXG4gIENPTVBPTkVOVCxcbiAgLy8gQSB2aWV3IHRoYXQgaXMgZW1iZWRkZWQgaW50byBhbm90aGVyIFZpZXcgdmlhIGEgPHRlbXBsYXRlPiBlbGVtZW50XG4gIC8vIGluc2lkZSBvZiBhIENPTVBPTkVOVCB2aWV3XG4gIEVNQkVEREVEXG59XG5cbmV4cG9ydCBjbGFzcyBBcHBWaWV3Q29udGFpbmVyIHtcbiAgLy8gVGhlIG9yZGVyIGluIHRoaXMgbGlzdCBtYXRjaGVzIHRoZSBET00gb3JkZXIuXG4gIHZpZXdzOiBBcHBWaWV3W10gPSBbXTtcbn1cblxuLyoqXG4gKiBDb3N0IG9mIG1ha2luZyBvYmplY3RzOiBodHRwOi8vanNwZXJmLmNvbS9pbnN0YW50aWF0ZS1zaXplLW9mLW9iamVjdFxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIEFwcFZpZXcgaW1wbGVtZW50cyBDaGFuZ2VEaXNwYXRjaGVyLCBSZW5kZXJFdmVudERpc3BhdGNoZXIge1xuICAvLyBBcHBWaWV3cyB0aGF0IGhhdmUgYmVlbiBtZXJnZWQgaW4gZGVwdGggZmlyc3Qgb3JkZXIuXG4gIC8vIFRoaXMgbGlzdCBpcyBzaGFyZWQgYmV0d2VlbiBhbGwgbWVyZ2VkIHZpZXdzLiBVc2UgdGhpcy5lbGVtZW50T2Zmc2V0IHRvIGdldCB0aGUgbG9jYWxcbiAgLy8gZW50cmllcy5cbiAgdmlld3M6IEFwcFZpZXdbXSA9IG51bGw7XG4gIC8vIHJvb3QgZWxlbWVudEluamVjdG9ycyBvZiB0aGlzIEFwcFZpZXdcbiAgLy8gVGhpcyBsaXN0IGlzIGxvY2FsIHRvIHRoaXMgQXBwVmlldyBhbmQgbm90IHNoYXJlZCB3aXRoIG90aGVyIFZpZXdzLlxuICByb290RWxlbWVudEluamVjdG9yczogRWxlbWVudEluamVjdG9yW107XG4gIC8vIEVsZW1lbnRJbmplY3RvcnMgb2YgYWxsIEFwcFZpZXdzIGluIHZpZXdzIGdyb3VwZWQgYnkgdmlldy5cbiAgLy8gVGhpcyBsaXN0IGlzIHNoYXJlZCBiZXR3ZWVuIGFsbCBtZXJnZWQgdmlld3MuIFVzZSB0aGlzLmVsZW1lbnRPZmZzZXQgdG8gZ2V0IHRoZSBsb2NhbFxuICAvLyBlbnRyaWVzLlxuICBlbGVtZW50SW5qZWN0b3JzOiBFbGVtZW50SW5qZWN0b3JbXSA9IG51bGw7XG4gIC8vIFZpZXdDb250YWluZXJzIG9mIGFsbCBBcHBWaWV3cyBpbiB2aWV3cyBncm91cGVkIGJ5IHZpZXcuXG4gIC8vIFRoaXMgbGlzdCBpcyBzaGFyZWQgYmV0d2VlbiBhbGwgbWVyZ2VkIHZpZXdzLiBVc2UgdGhpcy5lbGVtZW50T2Zmc2V0IHRvIGdldCB0aGUgbG9jYWxcbiAgLy8gZW50cmllcy5cbiAgdmlld0NvbnRhaW5lcnM6IEFwcFZpZXdDb250YWluZXJbXSA9IG51bGw7XG4gIC8vIFByZUJ1aWx0T2JqZWN0cyBvZiBhbGwgQXBwVmlld3MgaW4gdmlld3MgZ3JvdXBlZCBieSB2aWV3LlxuICAvLyBUaGlzIGxpc3QgaXMgc2hhcmVkIGJldHdlZW4gYWxsIG1lcmdlZCB2aWV3cy4gVXNlIHRoaXMuZWxlbWVudE9mZnNldCB0byBnZXQgdGhlIGxvY2FsXG4gIC8vIGVudHJpZXMuXG4gIHByZUJ1aWx0T2JqZWN0czogUHJlQnVpbHRPYmplY3RzW10gPSBudWxsO1xuICAvLyBFbGVtZW50UmVmIG9mIGFsbCBBcHBWaWV3cyBpbiB2aWV3cyBncm91cGVkIGJ5IHZpZXcuXG4gIC8vIFRoaXMgbGlzdCBpcyBzaGFyZWQgYmV0d2VlbiBhbGwgbWVyZ2VkIHZpZXdzLiBVc2UgdGhpcy5lbGVtZW50T2Zmc2V0IHRvIGdldCB0aGUgbG9jYWxcbiAgLy8gZW50cmllcy5cbiAgZWxlbWVudFJlZnM6IEVsZW1lbnRSZWZbXTtcblxuICByZWY6IFZpZXdSZWY7XG4gIGNoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvciA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBjb250ZXh0IGFnYWluc3Qgd2hpY2ggZGF0YS1iaW5kaW5nIGV4cHJlc3Npb25zIGluIHRoaXMgdmlldyBhcmUgZXZhbHVhdGVkIGFnYWluc3QuXG4gICAqIFRoaXMgaXMgYWx3YXlzIGEgY29tcG9uZW50IGluc3RhbmNlLlxuICAgKi9cblxuICBjb250ZXh0OiBhbnkgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBWYXJpYWJsZXMsIGxvY2FsIHRvIHRoaXMgdmlldywgdGhhdCBjYW4gYmUgdXNlZCBpbiBiaW5kaW5nIGV4cHJlc3Npb25zIChpbiBhZGRpdGlvbiB0byB0aGVcbiAgICogY29udGV4dCkuIFRoaXMgaXMgdXNlZCBmb3IgdGhpbmcgbGlrZSBgPHZpZGVvICNwbGF5ZXI+YCBvclxuICAgKiBgPGxpIHRlbXBsYXRlPVwiZm9yICNpdGVtIG9mIGl0ZW1zXCI+YCwgd2hlcmUgXCJwbGF5ZXJcIiBhbmQgXCJpdGVtXCIgYXJlIGxvY2FscywgcmVzcGVjdGl2ZWx5LlxuICAgKi9cbiAgbG9jYWxzOiBMb2NhbHM7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlbmRlcmVyOiByZW5kZXJBcGkuUmVuZGVyZXIsIHB1YmxpYyBwcm90bzogQXBwUHJvdG9WaWV3LFxuICAgICAgICAgICAgICBwdWJsaWMgdmlld09mZnNldDogbnVtYmVyLCBwdWJsaWMgZWxlbWVudE9mZnNldDogbnVtYmVyLCBwdWJsaWMgdGV4dE9mZnNldDogbnVtYmVyLFxuICAgICAgICAgICAgICBwcm90b0xvY2FsczogTWFwPHN0cmluZywgYW55PiwgcHVibGljIHJlbmRlcjogcmVuZGVyQXBpLlJlbmRlclZpZXdSZWYsXG4gICAgICAgICAgICAgIHB1YmxpYyByZW5kZXJGcmFnbWVudDogcmVuZGVyQXBpLlJlbmRlckZyYWdtZW50UmVmLFxuICAgICAgICAgICAgICBwdWJsaWMgY29udGFpbmVyRWxlbWVudEluamVjdG9yOiBFbGVtZW50SW5qZWN0b3IpIHtcbiAgICB0aGlzLnJlZiA9IG5ldyBWaWV3UmVmXyh0aGlzKTtcblxuICAgIHRoaXMubG9jYWxzID0gbmV3IExvY2FscyhudWxsLCBNYXBXcmFwcGVyLmNsb25lKHByb3RvTG9jYWxzKSk7ICAvLyBUT0RPIG9wdGltaXplIHRoaXNcbiAgfVxuXG4gIGluaXQoY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yLCBlbGVtZW50SW5qZWN0b3JzOiBFbGVtZW50SW5qZWN0b3JbXSxcbiAgICAgICByb290RWxlbWVudEluamVjdG9yczogRWxlbWVudEluamVjdG9yW10sIHByZUJ1aWx0T2JqZWN0czogUHJlQnVpbHRPYmplY3RzW10sXG4gICAgICAgdmlld3M6IEFwcFZpZXdbXSwgZWxlbWVudFJlZnM6IEVsZW1lbnRSZWZbXSwgdmlld0NvbnRhaW5lcnM6IEFwcFZpZXdDb250YWluZXJbXSkge1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IgPSBjaGFuZ2VEZXRlY3RvcjtcbiAgICB0aGlzLmVsZW1lbnRJbmplY3RvcnMgPSBlbGVtZW50SW5qZWN0b3JzO1xuICAgIHRoaXMucm9vdEVsZW1lbnRJbmplY3RvcnMgPSByb290RWxlbWVudEluamVjdG9ycztcbiAgICB0aGlzLnByZUJ1aWx0T2JqZWN0cyA9IHByZUJ1aWx0T2JqZWN0cztcbiAgICB0aGlzLnZpZXdzID0gdmlld3M7XG4gICAgdGhpcy5lbGVtZW50UmVmcyA9IGVsZW1lbnRSZWZzO1xuICAgIHRoaXMudmlld0NvbnRhaW5lcnMgPSB2aWV3Q29udGFpbmVycztcbiAgfVxuXG4gIHNldExvY2FsKGNvbnRleHROYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaHlkcmF0ZWQoKSkgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ0Nhbm5vdCBzZXQgbG9jYWxzIG9uIGRlaHlkcmF0ZWQgdmlldy4nKTtcbiAgICBpZiAoIXRoaXMucHJvdG8udGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzLmhhcyhjb250ZXh0TmFtZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRlbXBsYXRlTmFtZSA9IHRoaXMucHJvdG8udGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzLmdldChjb250ZXh0TmFtZSk7XG4gICAgdGhpcy5sb2NhbHMuc2V0KHRlbXBsYXRlTmFtZSwgdmFsdWUpO1xuICB9XG5cbiAgaHlkcmF0ZWQoKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5jb250ZXh0KTsgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyB0aGUgZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSBlbGVtZW50IGFuZCB0aGUgZGlyZWN0aXZlcy5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgaW50ZW5kZWQgdG8gYmUgY2FsbGVkIGZyb20gZGlyZWN0aXZlIEV2ZW50RW1pdHRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcbiAgICogQHBhcmFtIHsqfSBldmVudE9ialxuICAgKiBAcGFyYW0ge251bWJlcn0gYm91bmRFbGVtZW50SW5kZXhcbiAgICovXG4gIHRyaWdnZXJFdmVudEhhbmRsZXJzKGV2ZW50TmFtZTogc3RyaW5nLCBldmVudE9iajogRXZlbnQsIGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB2YXIgbG9jYWxzID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcbiAgICBsb2NhbHMuc2V0KCckZXZlbnQnLCBldmVudE9iaik7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGJvdW5kRWxlbWVudEluZGV4LCBldmVudE5hbWUsIGxvY2Fscyk7XG4gIH1cblxuICAvLyBkaXNwYXRjaCB0byBlbGVtZW50IGluamVjdG9yIG9yIHRleHQgbm9kZXMgYmFzZWQgb24gY29udGV4dFxuICBub3RpZnlPbkJpbmRpbmcoYjogQmluZGluZ1RhcmdldCwgY3VycmVudFZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoYi5pc1RleHROb2RlKCkpIHtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0VGV4dCh0aGlzLnJlbmRlciwgYi5lbGVtZW50SW5kZXggKyB0aGlzLnRleHRPZmZzZXQsIGN1cnJlbnRWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlbGVtZW50UmVmID0gdGhpcy5lbGVtZW50UmVmc1t0aGlzLmVsZW1lbnRPZmZzZXQgKyBiLmVsZW1lbnRJbmRleF07XG4gICAgICBpZiAoYi5pc0VsZW1lbnRQcm9wZXJ0eSgpKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0RWxlbWVudFByb3BlcnR5KGVsZW1lbnRSZWYsIGIubmFtZSwgY3VycmVudFZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoYi5pc0VsZW1lbnRBdHRyaWJ1dGUoKSkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldEVsZW1lbnRBdHRyaWJ1dGUoZWxlbWVudFJlZiwgYi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcmVzZW50KGN1cnJlbnRWYWx1ZSkgPyBgJHtjdXJyZW50VmFsdWV9YCA6IG51bGwpO1xuICAgICAgfSBlbHNlIGlmIChiLmlzRWxlbWVudENsYXNzKCkpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRFbGVtZW50Q2xhc3MoZWxlbWVudFJlZiwgYi5uYW1lLCBjdXJyZW50VmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChiLmlzRWxlbWVudFN0eWxlKCkpIHtcbiAgICAgICAgdmFyIHVuaXQgPSBpc1ByZXNlbnQoYi51bml0KSA/IGIudW5pdCA6ICcnO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldEVsZW1lbnRTdHlsZShlbGVtZW50UmVmLCBiLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJlc2VudChjdXJyZW50VmFsdWUpID8gYCR7Y3VycmVudFZhbHVlfSR7dW5pdH1gIDogbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignVW5zdXBwb3J0ZWQgZGlyZWN0aXZlIHJlY29yZCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxvZ0JpbmRpbmdVcGRhdGUoYjogQmluZGluZ1RhcmdldCwgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIGlmIChiLmlzRGlyZWN0aXZlKCkgfHwgYi5pc0VsZW1lbnRQcm9wZXJ0eSgpKSB7XG4gICAgICB2YXIgZWxlbWVudFJlZiA9IHRoaXMuZWxlbWVudFJlZnNbdGhpcy5lbGVtZW50T2Zmc2V0ICsgYi5lbGVtZW50SW5kZXhdO1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRCaW5kaW5nRGVidWdJbmZvKFxuICAgICAgICAgIGVsZW1lbnRSZWYsIGAke1JFRkxFQ1RfUFJFRklYfSR7Y2FtZWxDYXNlVG9EYXNoQ2FzZShiLm5hbWUpfWAsIGAke3ZhbHVlfWApO1xuICAgIH1cbiAgfVxuXG4gIG5vdGlmeUFmdGVyQ29udGVudENoZWNrZWQoKTogdm9pZCB7XG4gICAgdmFyIGVpQ291bnQgPSB0aGlzLnByb3RvLmVsZW1lbnRCaW5kZXJzLmxlbmd0aDtcbiAgICB2YXIgZWkgPSB0aGlzLmVsZW1lbnRJbmplY3RvcnM7XG4gICAgZm9yICh2YXIgaSA9IGVpQ291bnQgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKGlzUHJlc2VudChlaVtpICsgdGhpcy5lbGVtZW50T2Zmc2V0XSkpIGVpW2kgKyB0aGlzLmVsZW1lbnRPZmZzZXRdLm5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpO1xuICAgIH1cbiAgfVxuXG4gIG5vdGlmeUFmdGVyVmlld0NoZWNrZWQoKTogdm9pZCB7XG4gICAgdmFyIGVpQ291bnQgPSB0aGlzLnByb3RvLmVsZW1lbnRCaW5kZXJzLmxlbmd0aDtcbiAgICB2YXIgZWkgPSB0aGlzLmVsZW1lbnRJbmplY3RvcnM7XG4gICAgZm9yICh2YXIgaSA9IGVpQ291bnQgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKGlzUHJlc2VudChlaVtpICsgdGhpcy5lbGVtZW50T2Zmc2V0XSkpIGVpW2kgKyB0aGlzLmVsZW1lbnRPZmZzZXRdLm5nQWZ0ZXJWaWV3Q2hlY2tlZCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldERpcmVjdGl2ZUZvcihkaXJlY3RpdmU6IERpcmVjdGl2ZUluZGV4KTogYW55IHtcbiAgICB2YXIgZWxlbWVudEluamVjdG9yID0gdGhpcy5lbGVtZW50SW5qZWN0b3JzW3RoaXMuZWxlbWVudE9mZnNldCArIGRpcmVjdGl2ZS5lbGVtZW50SW5kZXhdO1xuICAgIHJldHVybiBlbGVtZW50SW5qZWN0b3IuZ2V0RGlyZWN0aXZlQXRJbmRleChkaXJlY3RpdmUuZGlyZWN0aXZlSW5kZXgpO1xuICB9XG5cbiAgZ2V0TmVzdGVkVmlldyhib3VuZEVsZW1lbnRJbmRleDogbnVtYmVyKTogQXBwVmlldyB7XG4gICAgdmFyIGVsaSA9IHRoaXMuZWxlbWVudEluamVjdG9yc1tib3VuZEVsZW1lbnRJbmRleF07XG4gICAgcmV0dXJuIGlzUHJlc2VudChlbGkpID8gZWxpLmdldE5lc3RlZFZpZXcoKSA6IG51bGw7XG4gIH1cblxuICBnZXRDb250YWluZXJFbGVtZW50KCk6IEVsZW1lbnRSZWYge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5jb250YWluZXJFbGVtZW50SW5qZWN0b3IpID9cbiAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyRWxlbWVudEluamVjdG9yLmdldEVsZW1lbnRSZWYoKSA6XG4gICAgICAgICAgICAgICBudWxsO1xuICB9XG5cbiAgZ2V0RGVidWdDb250ZXh0KGVsZW1lbnRJbmRleDogbnVtYmVyLCBkaXJlY3RpdmVJbmRleDogRGlyZWN0aXZlSW5kZXgpOiBEZWJ1Z0NvbnRleHQge1xuICAgIHRyeSB7XG4gICAgICB2YXIgb2Zmc2V0dGVkSW5kZXggPSB0aGlzLmVsZW1lbnRPZmZzZXQgKyBlbGVtZW50SW5kZXg7XG4gICAgICB2YXIgaGFzUmVmRm9ySW5kZXggPSBvZmZzZXR0ZWRJbmRleCA8IHRoaXMuZWxlbWVudFJlZnMubGVuZ3RoO1xuXG4gICAgICB2YXIgZWxlbWVudFJlZiA9IGhhc1JlZkZvckluZGV4ID8gdGhpcy5lbGVtZW50UmVmc1t0aGlzLmVsZW1lbnRPZmZzZXQgKyBlbGVtZW50SW5kZXhdIDogbnVsbDtcbiAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLmdldENvbnRhaW5lckVsZW1lbnQoKTtcbiAgICAgIHZhciBlaSA9IGhhc1JlZkZvckluZGV4ID8gdGhpcy5lbGVtZW50SW5qZWN0b3JzW3RoaXMuZWxlbWVudE9mZnNldCArIGVsZW1lbnRJbmRleF0gOiBudWxsO1xuXG4gICAgICB2YXIgZWxlbWVudCA9IGlzUHJlc2VudChlbGVtZW50UmVmKSA/IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCA6IG51bGw7XG4gICAgICB2YXIgY29tcG9uZW50RWxlbWVudCA9IGlzUHJlc2VudChjb250YWluZXIpID8gY29udGFpbmVyLm5hdGl2ZUVsZW1lbnQgOiBudWxsO1xuICAgICAgdmFyIGRpcmVjdGl2ZSA9IGlzUHJlc2VudChkaXJlY3RpdmVJbmRleCkgPyB0aGlzLmdldERpcmVjdGl2ZUZvcihkaXJlY3RpdmVJbmRleCkgOiBudWxsO1xuICAgICAgdmFyIGluamVjdG9yID0gaXNQcmVzZW50KGVpKSA/IGVpLmdldEluamVjdG9yKCkgOiBudWxsO1xuXG4gICAgICByZXR1cm4gbmV3IERlYnVnQ29udGV4dChlbGVtZW50LCBjb21wb25lbnRFbGVtZW50LCBkaXJlY3RpdmUsIHRoaXMuY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9sb2NhbHNUb1N0cmluZ01hcCh0aGlzLmxvY2FscyksIGluamVjdG9yKTtcblxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRPRE86IHZzYXZraW4gbG9nIHRoZSBleGNlcHRpb24gb25jZSB3ZSBoYXZlIGEgZ29vZCB3YXkgdG8gbG9nIGVycm9ycyBhbmQgd2FybmluZ3NcbiAgICAgIC8vIGlmIGFuIGVycm9yIGhhcHBlbnMgZHVyaW5nIGdldHRpbmcgdGhlIGRlYnVnIGNvbnRleHQsIHdlIHJldHVybiBudWxsLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgZ2V0RGV0ZWN0b3JGb3IoZGlyZWN0aXZlOiBEaXJlY3RpdmVJbmRleCk6IGFueSB7XG4gICAgdmFyIGNoaWxkVmlldyA9IHRoaXMuZ2V0TmVzdGVkVmlldyh0aGlzLmVsZW1lbnRPZmZzZXQgKyBkaXJlY3RpdmUuZWxlbWVudEluZGV4KTtcbiAgICByZXR1cm4gaXNQcmVzZW50KGNoaWxkVmlldykgPyBjaGlsZFZpZXcuY2hhbmdlRGV0ZWN0b3IgOiBudWxsO1xuICB9XG5cbiAgaW52b2tlRWxlbWVudE1ldGhvZChlbGVtZW50SW5kZXg6IG51bWJlciwgbWV0aG9kTmFtZTogc3RyaW5nLCBhcmdzOiBhbnlbXSkge1xuICAgIHRoaXMucmVuZGVyZXIuaW52b2tlRWxlbWVudE1ldGhvZCh0aGlzLmVsZW1lbnRSZWZzW2VsZW1lbnRJbmRleF0sIG1ldGhvZE5hbWUsIGFyZ3MpO1xuICB9XG5cbiAgLy8gaW1wbGVtZW50YXRpb24gb2YgUmVuZGVyRXZlbnREaXNwYXRjaGVyI2Rpc3BhdGNoUmVuZGVyRXZlbnRcbiAgZGlzcGF0Y2hSZW5kZXJFdmVudChib3VuZEVsZW1lbnRJbmRleDogbnVtYmVyLCBldmVudE5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICBsb2NhbHM6IE1hcDxzdHJpbmcsIGFueT4pOiBib29sZWFuIHtcbiAgICB2YXIgZWxlbWVudFJlZiA9IHRoaXMuZWxlbWVudFJlZnNbYm91bmRFbGVtZW50SW5kZXhdO1xuICAgIHZhciB2aWV3ID0gaW50ZXJuYWxWaWV3KGVsZW1lbnRSZWYucGFyZW50Vmlldyk7XG4gICAgcmV0dXJuIHZpZXcuZGlzcGF0Y2hFdmVudChlbGVtZW50UmVmLmJvdW5kRWxlbWVudEluZGV4LCBldmVudE5hbWUsIGxvY2Fscyk7XG4gIH1cblxuXG4gIC8vIHJldHVybnMgZmFsc2UgaWYgcHJldmVudERlZmF1bHQgbXVzdCBiZSBhcHBsaWVkIHRvIHRoZSBET00gZXZlbnRcbiAgZGlzcGF0Y2hFdmVudChib3VuZEVsZW1lbnRJbmRleDogbnVtYmVyLCBldmVudE5hbWU6IHN0cmluZywgbG9jYWxzOiBNYXA8c3RyaW5nLCBhbnk+KTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLmh5ZHJhdGVkKCkpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmNoYW5nZURldGVjdG9yLmhhbmRsZUV2ZW50KGV2ZW50TmFtZSwgYm91bmRFbGVtZW50SW5kZXggLSB0aGlzLmVsZW1lbnRPZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgTG9jYWxzKHRoaXMubG9jYWxzLCBsb2NhbHMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHZhciBjID0gdGhpcy5nZXREZWJ1Z0NvbnRleHQoYm91bmRFbGVtZW50SW5kZXggLSB0aGlzLmVsZW1lbnRPZmZzZXQsIG51bGwpO1xuICAgICAgdmFyIGNvbnRleHQgPSBpc1ByZXNlbnQoYykgPyBuZXcgX0NvbnRleHQoYy5lbGVtZW50LCBjLmNvbXBvbmVudEVsZW1lbnQsIGMuY29udGV4dCwgYy5sb2NhbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLmluamVjdG9yKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gICAgICB0aHJvdyBuZXcgRXZlbnRFdmFsdWF0aW9uRXJyb3IoZXZlbnROYW1lLCBlLCBlLnN0YWNrLCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBnZXQgb3duQmluZGVyc0NvdW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLnByb3RvLmVsZW1lbnRCaW5kZXJzLmxlbmd0aDsgfVxufVxuXG5mdW5jdGlvbiBfbG9jYWxzVG9TdHJpbmdNYXAobG9jYWxzOiBMb2NhbHMpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIHZhciByZXMgPSB7fTtcbiAgdmFyIGMgPSBsb2NhbHM7XG4gIHdoaWxlIChpc1ByZXNlbnQoYykpIHtcbiAgICByZXMgPSBTdHJpbmdNYXBXcmFwcGVyLm1lcmdlKHJlcywgTWFwV3JhcHBlci50b1N0cmluZ01hcChjLmN1cnJlbnQpKTtcbiAgICBjID0gYy5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBFcnJvciBjb250ZXh0IGluY2x1ZGVkIHdoZW4gYW4gZXZlbnQgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuICovXG5jbGFzcyBfQ29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50OiBhbnksIHB1YmxpYyBjb21wb25lbnRFbGVtZW50OiBhbnksIHB1YmxpYyBjb250ZXh0OiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyBsb2NhbHM6IGFueSwgcHVibGljIGluamVjdG9yOiBhbnkpIHt9XG59XG5cbi8qKlxuICogV3JhcHMgYW4gZXhjZXB0aW9uIHRocm93biBieSBhbiBldmVudCBoYW5kbGVyLlxuICovXG5jbGFzcyBFdmVudEV2YWx1YXRpb25FcnJvciBleHRlbmRzIFdyYXBwZWRFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihldmVudE5hbWU6IHN0cmluZywgb3JpZ2luYWxFeGNlcHRpb246IGFueSwgb3JpZ2luYWxTdGFjazogYW55LCBjb250ZXh0OiBhbnkpIHtcbiAgICBzdXBlcihgRXJyb3IgZHVyaW5nIGV2YWx1YXRpb24gb2YgXCIke2V2ZW50TmFtZX1cImAsIG9yaWdpbmFsRXhjZXB0aW9uLCBvcmlnaW5hbFN0YWNrLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQXBwUHJvdG9WaWV3TWVyZ2VJbmZvIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVtYmVkZGVkVmlld0NvdW50OiBudW1iZXIsIHB1YmxpYyBlbGVtZW50Q291bnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIHZpZXdDb3VudDogbnVtYmVyKSB7fVxufVxuXG4vKipcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBBcHBQcm90b1ZpZXcge1xuICByZWY6IFByb3RvVmlld1JlZjtcbiAgcHJvdG9Mb2NhbHM6IE1hcDxzdHJpbmcsIGFueT47XG5cbiAgZWxlbWVudEJpbmRlcnM6IEVsZW1lbnRCaW5kZXJbXSA9IG51bGw7XG4gIG1lcmdlSW5mbzogQXBwUHJvdG9WaWV3TWVyZ2VJbmZvID0gbnVsbDtcbiAgdmFyaWFibGVMb2NhdGlvbnM6IE1hcDxzdHJpbmcsIG51bWJlcj4gPSBudWxsO1xuICB0ZXh0QmluZGluZ0NvdW50ID0gbnVsbDtcbiAgcmVuZGVyOiByZW5kZXJBcGkuUmVuZGVyUHJvdG9WaWV3UmVmID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGVJZDogc3RyaW5nLCBwdWJsaWMgdGVtcGxhdGVDbWRzOiBUZW1wbGF0ZUNtZFtdLCBwdWJsaWMgdHlwZTogVmlld1R5cGUsXG4gICAgICAgICAgICAgIHB1YmxpYyBpc01lcmdhYmxlOiBib29sZWFuLCBwdWJsaWMgY2hhbmdlRGV0ZWN0b3JGYWN0b3J5OiBGdW5jdGlvbixcbiAgICAgICAgICAgICAgcHVibGljIHRlbXBsYXRlVmFyaWFibGVCaW5kaW5nczogTWFwPHN0cmluZywgc3RyaW5nPiwgcHVibGljIHBpcGVzOiBQcm90b1BpcGVzKSB7XG4gICAgdGhpcy5yZWYgPSBuZXcgUHJvdG9WaWV3UmVmXyh0aGlzKTtcbiAgfVxuXG4gIGluaXQocmVuZGVyOiByZW5kZXJBcGkuUmVuZGVyUHJvdG9WaWV3UmVmLCBlbGVtZW50QmluZGVyczogRWxlbWVudEJpbmRlcltdLFxuICAgICAgIHRleHRCaW5kaW5nQ291bnQ6IG51bWJlciwgbWVyZ2VJbmZvOiBBcHBQcm90b1ZpZXdNZXJnZUluZm8sXG4gICAgICAgdmFyaWFibGVMb2NhdGlvbnM6IE1hcDxzdHJpbmcsIG51bWJlcj4pIHtcbiAgICB0aGlzLnJlbmRlciA9IHJlbmRlcjtcbiAgICB0aGlzLmVsZW1lbnRCaW5kZXJzID0gZWxlbWVudEJpbmRlcnM7XG4gICAgdGhpcy50ZXh0QmluZGluZ0NvdW50ID0gdGV4dEJpbmRpbmdDb3VudDtcbiAgICB0aGlzLm1lcmdlSW5mbyA9IG1lcmdlSW5mbztcbiAgICB0aGlzLnZhcmlhYmxlTG9jYXRpb25zID0gdmFyaWFibGVMb2NhdGlvbnM7XG4gICAgdGhpcy5wcm90b0xvY2FscyA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnRlbXBsYXRlVmFyaWFibGVCaW5kaW5ncykpIHtcbiAgICAgIHRoaXMudGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzLmZvckVhY2goXG4gICAgICAgICAgKHRlbXBsYXRlTmFtZSwgXykgPT4geyB0aGlzLnByb3RvTG9jYWxzLnNldCh0ZW1wbGF0ZU5hbWUsIG51bGwpOyB9KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh2YXJpYWJsZUxvY2F0aW9ucykpIHtcbiAgICAgIC8vIFRoZSB2aWV3J3MgbG9jYWxzIG5lZWRzIHRvIGhhdmUgYSBmdWxsIHNldCBvZiB2YXJpYWJsZSBuYW1lcyBhdCBjb25zdHJ1Y3Rpb24gdGltZVxuICAgICAgLy8gaW4gb3JkZXIgdG8gcHJldmVudCBuZXcgdmFyaWFibGVzIGZyb20gYmVpbmcgc2V0IGxhdGVyIGluIHRoZSBsaWZlY3ljbGUuIFNpbmNlIHdlIGRvbid0XG4gICAgICAvLyB3YW50XG4gICAgICAvLyB0byBhY3R1YWxseSBjcmVhdGUgdmFyaWFibGUgYmluZGluZ3MgZm9yIHRoZSAkaW1wbGljaXQgYmluZGluZ3MsIGFkZCB0byB0aGVcbiAgICAgIC8vIHByb3RvTG9jYWxzIG1hbnVhbGx5LlxuICAgICAgdmFyaWFibGVMb2NhdGlvbnMuZm9yRWFjaCgoXywgdGVtcGxhdGVOYW1lKSA9PiB7IHRoaXMucHJvdG9Mb2NhbHMuc2V0KHRlbXBsYXRlTmFtZSwgbnVsbCk7IH0pO1xuICAgIH1cbiAgfVxuXG4gIGlzSW5pdGlhbGl6ZWQoKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5lbGVtZW50QmluZGVycyk7IH1cbn1cbiJdfQ==