export declare class RenderStore {
    private _nextIndex;
    private _lookupById;
    private _lookupByObject;
    constructor();
    allocateId(): number;
    store(obj: any, id: number): void;
    remove(obj: any): void;
    deserialize(id: number): any;
    serialize(obj: any): number;
}
