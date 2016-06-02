export declare function shallowEqual(a: {
    [x: string]: any;
}, b: {
    [x: string]: any;
}): boolean;
export declare function flatten<T>(a: T[][]): T[];
export declare function first<T>(a: T[]): T | null;
export declare function and(bools: boolean[]): boolean;
export declare function merge<V>(m1: {
    [key: string]: V;
}, m2: {
    [key: string]: V;
}): {
    [key: string]: V;
};
export declare function forEach<K, V>(map: {
    [key: string]: V;
}, callback: Function): void;
