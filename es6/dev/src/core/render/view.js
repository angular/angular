import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper, Map } from 'angular2/src/facade/collection';
import { isPresent } from 'angular2/src/facade/lang';
import { RenderViewRef, RenderProtoViewRef, RenderFragmentRef } from './api';
export class DefaultProtoViewRef extends RenderProtoViewRef {
    constructor(template, cmds) {
        super();
        this.template = template;
        this.cmds = cmds;
    }
}
export class DefaultRenderFragmentRef extends RenderFragmentRef {
    constructor(nodes) {
        super();
        this.nodes = nodes;
    }
}
export class DefaultRenderView extends RenderViewRef {
    constructor(fragments, boundTextNodes, boundElements, nativeShadowRoots, globalEventAdders, rootContentInsertionPoints) {
        super();
        this.fragments = fragments;
        this.boundTextNodes = boundTextNodes;
        this.boundElements = boundElements;
        this.nativeShadowRoots = nativeShadowRoots;
        this.globalEventAdders = globalEventAdders;
        this.rootContentInsertionPoints = rootContentInsertionPoints;
        this.hydrated = false;
        this.eventDispatcher = null;
        this.globalEventRemovers = null;
    }
    hydrate() {
        if (this.hydrated)
            throw new BaseException('The view is already hydrated.');
        this.hydrated = true;
        this.globalEventRemovers = ListWrapper.createFixedSize(this.globalEventAdders.length);
        for (var i = 0; i < this.globalEventAdders.length; i++) {
            this.globalEventRemovers[i] = this.globalEventAdders[i]();
        }
    }
    dehydrate() {
        if (!this.hydrated)
            throw new BaseException('The view is already dehydrated.');
        for (var i = 0; i < this.globalEventRemovers.length; i++) {
            this.globalEventRemovers[i]();
        }
        this.globalEventRemovers = null;
        this.hydrated = false;
    }
    setEventDispatcher(dispatcher) { this.eventDispatcher = dispatcher; }
    dispatchRenderEvent(boundElementIndex, eventName, event) {
        var allowDefaultBehavior = true;
        if (isPresent(this.eventDispatcher)) {
            var locals = new Map();
            locals.set('$event', event);
            allowDefaultBehavior =
                this.eventDispatcher.dispatchRenderEvent(boundElementIndex, eventName, locals);
        }
        return allowDefaultBehavior;
    }
}
//# sourceMappingURL=view.js.map