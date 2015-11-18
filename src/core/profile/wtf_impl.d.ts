export interface WtfScopeFn {
    (arg0?: any, arg1?: any): any;
}
export interface Range {
}
export interface Scope {
    (...args: any[]): any;
}
export declare function detectWTF(): boolean;
export declare function createScope(signature: string, flags?: any): any;
export declare function leave<T>(scope: Scope, returnValue?: T): T;
export declare function startTimeRange(rangeType: string, action: string): Range;
export declare function endTimeRange(range: Range): void;
