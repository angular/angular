import { RenderProtoViewRef } from "angular2/src/core/render/api";
export declare class RenderProtoViewRefStore {
    private _lookupByIndex;
    private _lookupByProtoView;
    private _nextIndex;
    private _onWebworker;
    constructor(onWebworker: any);
    allocate(): RenderProtoViewRef;
    store(ref: RenderProtoViewRef, index: number): void;
    deserialize(index: number): RenderProtoViewRef;
    serialize(ref: RenderProtoViewRef): number;
}
export declare class WebWorkerRenderProtoViewRef extends RenderProtoViewRef {
    refNumber: number;
    constructor(refNumber: number);
}
