export declare class TouchMap {
    map: {
        [key: string]: string;
    };
    keys: {
        [key: string]: boolean;
    };
    constructor(map: {
        [key: string]: any;
    });
    get(key: string): string;
    getUnused(): {
        [key: string]: any;
    };
}
export declare function normalizeString(obj: any): string;
