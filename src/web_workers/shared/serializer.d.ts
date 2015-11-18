import { Type } from "angular2/src/facade/lang";
import { RenderProtoViewRefStore } from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import { RenderViewWithFragmentsStore } from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
export declare const PRIMITIVE: Type;
export declare class Serializer {
    private _protoViewStore;
    private _renderViewStore;
    constructor(_protoViewStore: RenderProtoViewRefStore, _renderViewStore: RenderViewWithFragmentsStore);
    serialize(obj: any, type: any): Object;
    deserialize(map: any, type: any, data?: any): any;
    mapToObject(map: Map<string, any>, type?: Type): Object;
    objectToMap(obj: {
        [key: string]: any;
    }, type?: Type, data?: any): Map<string, any>;
    allocateRenderViews(fragmentCount: number): void;
    private _serializeWorkerElementRef(elementRef);
    private _deserializeWorkerElementRef(map);
    private _serializeRenderTemplate(obj);
    private _deserializeRenderTemplate(map);
}
