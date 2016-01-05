import { RenderComponentTemplate, RenderViewRef, RenderEventDispatcher, RenderTemplateCmd, RenderProtoViewRef, RenderFragmentRef } from './api';
export declare class DefaultProtoViewRef extends RenderProtoViewRef {
    template: RenderComponentTemplate;
    cmds: RenderTemplateCmd[];
    constructor(template: RenderComponentTemplate, cmds: RenderTemplateCmd[]);
}
export declare class DefaultRenderFragmentRef<N> extends RenderFragmentRef {
    nodes: N[];
    constructor(nodes: N[]);
}
export declare class DefaultRenderView<N> extends RenderViewRef {
    fragments: DefaultRenderFragmentRef<N>[];
    boundTextNodes: N[];
    boundElements: N[];
    nativeShadowRoots: N[];
    globalEventAdders: Function[];
    rootContentInsertionPoints: N[];
    hydrated: boolean;
    eventDispatcher: RenderEventDispatcher;
    globalEventRemovers: Function[];
    constructor(fragments: DefaultRenderFragmentRef<N>[], boundTextNodes: N[], boundElements: N[], nativeShadowRoots: N[], globalEventAdders: Function[], rootContentInsertionPoints: N[]);
    hydrate(): void;
    dehydrate(): void;
    setEventDispatcher(dispatcher: RenderEventDispatcher): void;
    dispatchRenderEvent(boundElementIndex: number, eventName: string, event: any): boolean;
}
