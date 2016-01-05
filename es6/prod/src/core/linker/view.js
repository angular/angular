import { MapWrapper, Map, StringMapWrapper } from 'angular2/src/facade/collection';
import { Locals } from 'angular2/src/core/change_detection/change_detection';
import { DebugContext } from 'angular2/src/core/change_detection/interfaces';
import { isPresent } from 'angular2/src/facade/lang';
import { BaseException, WrappedException } from 'angular2/src/facade/exceptions';
import { internalView } from './view_ref';
import { camelCaseToDashCase } from 'angular2/src/core/render/util';
import { ViewRef_, ProtoViewRef_ } from "./view_ref";
export { DebugContext } from 'angular2/src/core/change_detection/interfaces';
const REFLECT_PREFIX = 'ng-reflect-';
export var ViewType;
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
})(ViewType || (ViewType = {}));
export class AppViewContainer {
    constructor() {
        // The order in this list matches the DOM order.
        this.views = [];
    }
}
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export class AppView {
    constructor(renderer, proto, viewOffset, elementOffset, textOffset, protoLocals, render, renderFragment, containerElementInjector) {
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
        this.ref = new ViewRef_(this);
        this.locals = new Locals(null, MapWrapper.clone(protoLocals)); // TODO optimize this
    }
    init(changeDetector, elementInjectors, rootElementInjectors, preBuiltObjects, views, elementRefs, viewContainers) {
        this.changeDetector = changeDetector;
        this.elementInjectors = elementInjectors;
        this.rootElementInjectors = rootElementInjectors;
        this.preBuiltObjects = preBuiltObjects;
        this.views = views;
        this.elementRefs = elementRefs;
        this.viewContainers = viewContainers;
    }
    setLocal(contextName, value) {
        if (!this.hydrated())
            throw new BaseException('Cannot set locals on dehydrated view.');
        if (!this.proto.templateVariableBindings.has(contextName)) {
            return;
        }
        var templateName = this.proto.templateVariableBindings.get(contextName);
        this.locals.set(templateName, value);
    }
    hydrated() { return isPresent(this.context); }
    /**
     * Triggers the event handlers for the element and the directives.
     *
     * This method is intended to be called from directive EventEmitters.
     *
     * @param {string} eventName
     * @param {*} eventObj
     * @param {number} boundElementIndex
     */
    triggerEventHandlers(eventName, eventObj, boundElementIndex) {
        var locals = new Map();
        locals.set('$event', eventObj);
        this.dispatchEvent(boundElementIndex, eventName, locals);
    }
    // dispatch to element injector or text nodes based on context
    notifyOnBinding(b, currentValue) {
        if (b.isTextNode()) {
            this.renderer.setText(this.render, b.elementIndex + this.textOffset, currentValue);
        }
        else {
            var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
            if (b.isElementProperty()) {
                this.renderer.setElementProperty(elementRef, b.name, currentValue);
            }
            else if (b.isElementAttribute()) {
                this.renderer.setElementAttribute(elementRef, b.name, isPresent(currentValue) ? `${currentValue}` : null);
            }
            else if (b.isElementClass()) {
                this.renderer.setElementClass(elementRef, b.name, currentValue);
            }
            else if (b.isElementStyle()) {
                var unit = isPresent(b.unit) ? b.unit : '';
                this.renderer.setElementStyle(elementRef, b.name, isPresent(currentValue) ? `${currentValue}${unit}` : null);
            }
            else {
                throw new BaseException('Unsupported directive record');
            }
        }
    }
    logBindingUpdate(b, value) {
        if (b.isDirective() || b.isElementProperty()) {
            var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
            this.renderer.setBindingDebugInfo(elementRef, `${REFLECT_PREFIX}${camelCaseToDashCase(b.name)}`, `${value}`);
        }
    }
    notifyAfterContentChecked() {
        var eiCount = this.proto.elementBinders.length;
        var ei = this.elementInjectors;
        for (var i = eiCount - 1; i >= 0; i--) {
            if (isPresent(ei[i + this.elementOffset]))
                ei[i + this.elementOffset].ngAfterContentChecked();
        }
    }
    notifyAfterViewChecked() {
        var eiCount = this.proto.elementBinders.length;
        var ei = this.elementInjectors;
        for (var i = eiCount - 1; i >= 0; i--) {
            if (isPresent(ei[i + this.elementOffset]))
                ei[i + this.elementOffset].ngAfterViewChecked();
        }
    }
    getDirectiveFor(directive) {
        var elementInjector = this.elementInjectors[this.elementOffset + directive.elementIndex];
        return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
    }
    getNestedView(boundElementIndex) {
        var eli = this.elementInjectors[boundElementIndex];
        return isPresent(eli) ? eli.getNestedView() : null;
    }
    getContainerElement() {
        return isPresent(this.containerElementInjector) ?
            this.containerElementInjector.getElementRef() :
            null;
    }
    getDebugContext(elementIndex, directiveIndex) {
        try {
            var offsettedIndex = this.elementOffset + elementIndex;
            var hasRefForIndex = offsettedIndex < this.elementRefs.length;
            var elementRef = hasRefForIndex ? this.elementRefs[this.elementOffset + elementIndex] : null;
            var container = this.getContainerElement();
            var ei = hasRefForIndex ? this.elementInjectors[this.elementOffset + elementIndex] : null;
            var element = isPresent(elementRef) ? elementRef.nativeElement : null;
            var componentElement = isPresent(container) ? container.nativeElement : null;
            var directive = isPresent(directiveIndex) ? this.getDirectiveFor(directiveIndex) : null;
            var injector = isPresent(ei) ? ei.getInjector() : null;
            return new DebugContext(element, componentElement, directive, this.context, _localsToStringMap(this.locals), injector);
        }
        catch (e) {
            // TODO: vsavkin log the exception once we have a good way to log errors and warnings
            // if an error happens during getting the debug context, we return null.
            return null;
        }
    }
    getDetectorFor(directive) {
        var childView = this.getNestedView(this.elementOffset + directive.elementIndex);
        return isPresent(childView) ? childView.changeDetector : null;
    }
    invokeElementMethod(elementIndex, methodName, args) {
        this.renderer.invokeElementMethod(this.elementRefs[elementIndex], methodName, args);
    }
    // implementation of RenderEventDispatcher#dispatchRenderEvent
    dispatchRenderEvent(boundElementIndex, eventName, locals) {
        var elementRef = this.elementRefs[boundElementIndex];
        var view = internalView(elementRef.parentView);
        return view.dispatchEvent(elementRef.boundElementIndex, eventName, locals);
    }
    // returns false if preventDefault must be applied to the DOM event
    dispatchEvent(boundElementIndex, eventName, locals) {
        try {
            if (this.hydrated()) {
                return !this.changeDetector.handleEvent(eventName, boundElementIndex - this.elementOffset, new Locals(this.locals, locals));
            }
            else {
                return true;
            }
        }
        catch (e) {
            var c = this.getDebugContext(boundElementIndex - this.elementOffset, null);
            var context = isPresent(c) ? new _Context(c.element, c.componentElement, c.context, c.locals, c.injector) :
                null;
            throw new EventEvaluationError(eventName, e, e.stack, context);
        }
    }
    get ownBindersCount() { return this.proto.elementBinders.length; }
}
function _localsToStringMap(locals) {
    var res = {};
    var c = locals;
    while (isPresent(c)) {
        res = StringMapWrapper.merge(res, MapWrapper.toStringMap(c.current));
        c = c.parent;
    }
    return res;
}
/**
 * Error context included when an event handler throws an exception.
 */
class _Context {
    constructor(element, componentElement, context, locals, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.context = context;
        this.locals = locals;
        this.injector = injector;
    }
}
/**
 * Wraps an exception thrown by an event handler.
 */
class EventEvaluationError extends WrappedException {
    constructor(eventName, originalException, originalStack, context) {
        super(`Error during evaluation of "${eventName}"`, originalException, originalStack, context);
    }
}
export class AppProtoViewMergeInfo {
    constructor(embeddedViewCount, elementCount, viewCount) {
        this.embeddedViewCount = embeddedViewCount;
        this.elementCount = elementCount;
        this.viewCount = viewCount;
    }
}
/**
 *
 */
export class AppProtoView {
    constructor(templateId, templateCmds, type, isMergable, changeDetectorFactory, templateVariableBindings, pipes) {
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
        this.ref = new ProtoViewRef_(this);
    }
    init(render, elementBinders, textBindingCount, mergeInfo, variableLocations) {
        this.render = render;
        this.elementBinders = elementBinders;
        this.textBindingCount = textBindingCount;
        this.mergeInfo = mergeInfo;
        this.variableLocations = variableLocations;
        this.protoLocals = new Map();
        if (isPresent(this.templateVariableBindings)) {
            this.templateVariableBindings.forEach((templateName, _) => { this.protoLocals.set(templateName, null); });
        }
        if (isPresent(variableLocations)) {
            // The view's locals needs to have a full set of variable names at construction time
            // in order to prevent new variables from being set later in the lifecycle. Since we don't
            // want
            // to actually create variable bindings for the $implicit bindings, add to the
            // protoLocals manually.
            variableLocations.forEach((_, templateName) => { this.protoLocals.set(templateName, null); });
        }
    }
    isInitialized() { return isPresent(this.elementBinders); }
}
