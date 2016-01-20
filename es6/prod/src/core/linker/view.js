var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ListWrapper, MapWrapper, Map, StringMapWrapper } from 'angular2/src/facade/collection';
import { Locals } from 'angular2/src/core/change_detection/change_detection';
import { DebugContext } from 'angular2/src/core/change_detection/interfaces';
import { AppElement } from './element';
import { isPresent, isBlank, CONST, CONST_EXPR } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ViewRef_ } from './view_ref';
import { ProtoPipes } from 'angular2/src/core/pipes/pipes';
import { camelCaseToDashCase } from 'angular2/src/core/render/util';
export { DebugContext } from 'angular2/src/core/change_detection/interfaces';
import { Pipes } from 'angular2/src/core/pipes/pipes';
import { ViewType } from './view_type';
const REFLECT_PREFIX = 'ng-reflect-';
const EMPTY_CONTEXT = CONST_EXPR(new Object());
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export class AppView {
    constructor(proto, renderer, viewManager, projectableNodes, containerAppElement, imperativelyCreatedProviders, rootInjector, changeDetector) {
        this.proto = proto;
        this.renderer = renderer;
        this.viewManager = viewManager;
        this.projectableNodes = projectableNodes;
        this.containerAppElement = containerAppElement;
        this.changeDetector = changeDetector;
        /**
         * The context against which data-binding expressions in this view are evaluated against.
         * This is always a component instance.
         */
        this.context = null;
        this.destroyed = false;
        this.ref = new ViewRef_(this);
        var injectorWithHostBoundary = AppElement.getViewParentInjector(this.proto.type, containerAppElement, imperativelyCreatedProviders, rootInjector);
        this.parentInjector = injectorWithHostBoundary.injector;
        this.hostInjectorBoundary = injectorWithHostBoundary.hostInjectorBoundary;
        var pipes;
        var context;
        switch (proto.type) {
            case ViewType.COMPONENT:
                pipes = new Pipes(proto.protoPipes, containerAppElement.getInjector());
                context = containerAppElement.getComponent();
                break;
            case ViewType.EMBEDDED:
                pipes = containerAppElement.parentView.pipes;
                context = containerAppElement.parentView.context;
                break;
            case ViewType.HOST:
                pipes = null;
                context = EMPTY_CONTEXT;
                break;
        }
        this.pipes = pipes;
        this.context = context;
    }
    init(rootNodesOrAppElements, allNodes, disposables, appElements) {
        this.rootNodesOrAppElements = rootNodesOrAppElements;
        this.allNodes = allNodes;
        this.disposables = disposables;
        this.appElements = appElements;
        var localsMap = new Map();
        StringMapWrapper.forEach(this.proto.templateVariableBindings, (templateName, _) => { localsMap.set(templateName, null); });
        for (var i = 0; i < appElements.length; i++) {
            var appEl = appElements[i];
            StringMapWrapper.forEach(appEl.proto.directiveVariableBindings, (directiveIndex, name) => {
                if (isBlank(directiveIndex)) {
                    localsMap.set(name, appEl.nativeElement);
                }
                else {
                    localsMap.set(name, appEl.getDirectiveAtIndex(directiveIndex));
                }
            });
        }
        var parentLocals = null;
        if (this.proto.type !== ViewType.COMPONENT) {
            parentLocals =
                isPresent(this.containerAppElement) ? this.containerAppElement.parentView.locals : null;
        }
        if (this.proto.type === ViewType.COMPONENT) {
            // Note: the render nodes have been attached to their host element
            // in the ViewFactory already.
            this.containerAppElement.attachComponentView(this);
            this.containerAppElement.parentView.changeDetector.addViewChild(this.changeDetector);
        }
        this.locals = new Locals(parentLocals, localsMap);
        this.changeDetector.hydrate(this.context, this.locals, this, this.pipes);
        this.viewManager.onViewCreated(this);
    }
    destroy() {
        if (this.destroyed) {
            throw new BaseException('This view has already been destroyed!');
        }
        this.changeDetector.destroyRecursive();
    }
    notifyOnDestroy() {
        this.destroyed = true;
        var hostElement = this.proto.type === ViewType.COMPONENT ? this.containerAppElement.nativeElement : null;
        this.renderer.destroyView(hostElement, this.allNodes);
        for (var i = 0; i < this.disposables.length; i++) {
            this.disposables[i]();
        }
        this.viewManager.onViewDestroyed(this);
    }
    get changeDetectorRef() { return this.changeDetector.ref; }
    get flatRootNodes() { return flattenNestedViewRenderNodes(this.rootNodesOrAppElements); }
    hasLocal(contextName) {
        return StringMapWrapper.contains(this.proto.templateVariableBindings, contextName);
    }
    setLocal(contextName, value) {
        if (!this.hasLocal(contextName)) {
            return;
        }
        var templateName = this.proto.templateVariableBindings[contextName];
        this.locals.set(templateName, value);
    }
    // dispatch to element injector or text nodes based on context
    notifyOnBinding(b, currentValue) {
        if (b.isTextNode()) {
            this.renderer.setText(this.allNodes[b.elementIndex], currentValue);
        }
        else {
            var nativeElement = this.appElements[b.elementIndex].nativeElement;
            if (b.isElementProperty()) {
                this.renderer.setElementProperty(nativeElement, b.name, currentValue);
            }
            else if (b.isElementAttribute()) {
                this.renderer.setElementAttribute(nativeElement, b.name, isPresent(currentValue) ? `${currentValue}` : null);
            }
            else if (b.isElementClass()) {
                this.renderer.setElementClass(nativeElement, b.name, currentValue);
            }
            else if (b.isElementStyle()) {
                var unit = isPresent(b.unit) ? b.unit : '';
                this.renderer.setElementStyle(nativeElement, b.name, isPresent(currentValue) ? `${currentValue}${unit}` : null);
            }
            else {
                throw new BaseException('Unsupported directive record');
            }
        }
    }
    logBindingUpdate(b, value) {
        if (b.isDirective() || b.isElementProperty()) {
            var nativeElement = this.appElements[b.elementIndex].nativeElement;
            this.renderer.setBindingDebugInfo(nativeElement, `${REFLECT_PREFIX}${camelCaseToDashCase(b.name)}`, `${value}`);
        }
    }
    notifyAfterContentChecked() {
        var count = this.appElements.length;
        for (var i = count - 1; i >= 0; i--) {
            this.appElements[i].ngAfterContentChecked();
        }
    }
    notifyAfterViewChecked() {
        var count = this.appElements.length;
        for (var i = count - 1; i >= 0; i--) {
            this.appElements[i].ngAfterViewChecked();
        }
    }
    getDebugContext(appElement, elementIndex, directiveIndex) {
        try {
            if (isBlank(appElement) && elementIndex < this.appElements.length) {
                appElement = this.appElements[elementIndex];
            }
            var container = this.containerAppElement;
            var element = isPresent(appElement) ? appElement.nativeElement : null;
            var componentElement = isPresent(container) ? container.nativeElement : null;
            var directive = isPresent(directiveIndex) ? appElement.getDirectiveAtIndex(directiveIndex) : null;
            var injector = isPresent(appElement) ? appElement.getInjector() : null;
            return new DebugContext(element, componentElement, directive, this.context, _localsToStringMap(this.locals), injector);
        }
        catch (e) {
            // TODO: vsavkin log the exception once we have a good way to log errors and warnings
            // if an error happens during getting the debug context, we return null.
            return null;
        }
    }
    getDirectiveFor(directive) {
        return this.appElements[directive.elementIndex].getDirectiveAtIndex(directive.directiveIndex);
    }
    getDetectorFor(directive) {
        var componentView = this.appElements[directive.elementIndex].componentView;
        return isPresent(componentView) ? componentView.changeDetector : null;
    }
    /**
     * Triggers the event handlers for the element and the directives.
     *
     * This method is intended to be called from directive EventEmitters.
     *
     * @param {string} eventName
     * @param {*} eventObj
     * @param {number} boundElementIndex
     * @return false if preventDefault must be applied to the DOM event
     */
    triggerEventHandlers(eventName, eventObj, boundElementIndex) {
        return this.changeDetector.handleEvent(eventName, boundElementIndex, eventObj);
    }
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
 *
 */
export class AppProtoView {
    constructor(type, protoPipes, templateVariableBindings) {
        this.type = type;
        this.protoPipes = protoPipes;
        this.templateVariableBindings = templateVariableBindings;
    }
    static create(metadataCache, type, pipes, templateVariableBindings) {
        var protoPipes = null;
        if (isPresent(pipes) && pipes.length > 0) {
            var boundPipes = ListWrapper.createFixedSize(pipes.length);
            for (var i = 0; i < pipes.length; i++) {
                boundPipes[i] = metadataCache.getResolvedPipeMetadata(pipes[i]);
            }
            protoPipes = ProtoPipes.fromProviders(boundPipes);
        }
        return new AppProtoView(type, protoPipes, templateVariableBindings);
    }
}
export let HostViewFactory = class {
    constructor(selector, viewFactory) {
        this.selector = selector;
        this.viewFactory = viewFactory;
    }
};
HostViewFactory = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Function])
], HostViewFactory);
export function flattenNestedViewRenderNodes(nodes) {
    return _flattenNestedViewRenderNodes(nodes, []);
}
function _flattenNestedViewRenderNodes(nodes, renderNodes) {
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node instanceof AppElement) {
            var appEl = node;
            renderNodes.push(appEl.nativeElement);
            if (isPresent(appEl.nestedViews)) {
                for (var k = 0; k < appEl.nestedViews.length; k++) {
                    _flattenNestedViewRenderNodes(appEl.nestedViews[k].rootNodesOrAppElements, renderNodes);
                }
            }
        }
        else {
            renderNodes.push(node);
        }
    }
    return renderNodes;
}
export function checkSlotCount(componentName, expectedSlotCount, projectableNodes) {
    var givenSlotCount = isPresent(projectableNodes) ? projectableNodes.length : 0;
    if (givenSlotCount < expectedSlotCount) {
        throw new BaseException(`The component ${componentName} has ${expectedSlotCount} <ng-content> elements,` +
            ` but only ${givenSlotCount} slots were provided.`);
    }
}
