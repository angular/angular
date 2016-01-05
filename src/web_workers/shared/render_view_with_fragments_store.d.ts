import { RenderViewRef, RenderFragmentRef, RenderViewWithFragments } from "angular2/src/core/render/api";
export declare class RenderViewWithFragmentsStore {
    private _nextIndex;
    private _onWebWorker;
    private _lookupByIndex;
    private _lookupByView;
    private _viewFragments;
    constructor(onWebWorker: any);
    allocate(fragmentCount: number): RenderViewWithFragments;
    store(view: RenderViewWithFragments, startIndex: number): void;
    remove(view: RenderViewRef): void;
    private _removeRef(ref);
    serializeRenderViewRef(viewRef: RenderViewRef): number;
    serializeRenderFragmentRef(fragmentRef: RenderFragmentRef): number;
    deserializeRenderViewRef(ref: number): RenderViewRef;
    deserializeRenderFragmentRef(ref: number): RenderFragmentRef;
    private _retrieve(ref);
    private _serializeRenderFragmentOrViewRef(ref);
    serializeViewWithFragments(view: RenderViewWithFragments): {
        [key: string]: any;
    };
    deserializeViewWithFragments(obj: {
        [key: string]: any;
    }): RenderViewWithFragments;
}
export declare class WebWorkerRenderViewRef extends RenderViewRef {
    refNumber: number;
    constructor(refNumber: number);
    serialize(): number;
    static deserialize(ref: number): WebWorkerRenderViewRef;
}
export declare class WebWorkerRenderFragmentRef extends RenderFragmentRef {
    refNumber: number;
    constructor(refNumber: number);
    serialize(): number;
    static deserialize(ref: number): WebWorkerRenderFragmentRef;
}
