import { Type } from "angular2/src/facade/lang";
import { RenderStore } from 'angular2/src/web_workers/shared/render_store';
export declare const PRIMITIVE: Type;
export declare class Serializer {
    private _renderStore;
    constructor(_renderStore: RenderStore);
    serialize(obj: any, type: any): Object;
    deserialize(map: any, type: any, data?: any): any;
    mapToObject(map: Map<string, any>, type?: Type): Object;
    objectToMap(obj: {
        [key: string]: any;
    }, type?: Type, data?: any): Map<string, any>;
    private _serializeLocation(loc);
    private _deserializeLocation(loc);
    private _serializeRenderComponentType(obj);
    private _deserializeRenderComponentType(map);
}
export declare class RenderStoreObject {
}
