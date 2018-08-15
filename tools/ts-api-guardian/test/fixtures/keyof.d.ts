export declare type SimpleChanges<T = any> = {
    [P in keyof T]?: any;
};