export declare class SharedStylesHost {
    constructor();
    addStyles(styles: string[]): void;
    onStylesAdded(additions: string[]): void;
    getAllStyles(): string[];
}
export declare class DomSharedStylesHost extends SharedStylesHost {
    private _hostNodes;
    constructor(doc: any);
    addHost(hostNode: Node): void;
    removeHost(hostNode: Node): void;
    onStylesAdded(additions: string[]): void;
}
