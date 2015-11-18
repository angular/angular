export declare const IS_DART: boolean;
declare var _global: BrowserNodeGlobal;
export { _global as global };
export declare var Type: FunctionConstructor;
/**
 * Runtime representation a type that a Component or other object is instances of.
 *
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is be represented by
 * the `MyCustomComponent` constructor function.
 */
export interface Type extends Function {
}
export interface ConcreteType extends Type {
    new (...args: any[]): any;
}
export declare function getTypeNameForDebugging(type: Type): string;
export declare var Math: Math;
export declare var Date: DateConstructor;
export declare function lockDevMode(): void;
/**
 * Enable Angular's development mode, which turns on assertions and other
 * checks within the framework.
 *
 * One important assertion this enables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 *
 * {@example core/ts/dev_mode/dev_mode_example.ts region='enableDevMode'}
 */
export declare function enableDevMode(): void;
export declare function assertionsEnabled(): boolean;
export declare function CONST_EXPR<T>(expr: T): T;
export declare function CONST(): ClassDecorator & PropertyDecorator;
export declare function isPresent(obj: any): boolean;
export declare function isBlank(obj: any): boolean;
export declare function isString(obj: any): boolean;
export declare function isFunction(obj: any): boolean;
export declare function isType(obj: any): boolean;
export declare function isStringMap(obj: any): boolean;
export declare function isPromise(obj: any): boolean;
export declare function isArray(obj: any): boolean;
export declare function isNumber(obj: any): boolean;
export declare function isDate(obj: any): boolean;
export declare function stringify(token: any): string;
export declare function serializeEnum(val: any): number;
export declare function deserializeEnum(val: any, values: Map<number, any>): any;
export declare class StringWrapper {
    static fromCharCode(code: number): string;
    static charCodeAt(s: string, index: number): number;
    static split(s: string, regExp: RegExp): string[];
    static equals(s: string, s2: string): boolean;
    static replace(s: string, from: string, replace: string): string;
    static replaceAll(s: string, from: RegExp, replace: string): string;
    static slice<T>(s: string, from?: number, to?: number): string;
    static replaceAllMapped(s: string, from: RegExp, cb: Function): string;
    static contains(s: string, substr: string): boolean;
    static compare(a: string, b: string): number;
}
export declare class StringJoiner {
    parts: any[];
    constructor(parts?: any[]);
    add(part: string): void;
    toString(): string;
}
export declare class NumberParseError extends Error {
    message: string;
    name: string;
    constructor(message: string);
    toString(): string;
}
export declare class NumberWrapper {
    static toFixed(n: number, fractionDigits: number): string;
    static equal(a: number, b: number): boolean;
    static parseIntAutoRadix(text: string): number;
    static parseInt(text: string, radix: number): number;
    static parseFloat(text: string): number;
    static NaN: number;
    static isNaN(value: any): boolean;
    static isInteger(value: any): boolean;
}
export declare var RegExp: RegExpConstructor;
export declare class RegExpWrapper {
    static create(regExpStr: string, flags?: string): RegExp;
    static firstMatch(regExp: RegExp, input: string): RegExpExecArray;
    static test(regExp: RegExp, input: string): boolean;
    static matcher(regExp: RegExp, input: string): {
        re: RegExp;
        input: string;
    };
}
export declare class RegExpMatcherWrapper {
    static next(matcher: {
        re: RegExp;
        input: string;
    }): RegExpExecArray;
}
export declare class FunctionWrapper {
    static apply(fn: Function, posArgs: any): any;
}
export declare function looseIdentical(a: any, b: any): boolean;
export declare function getMapKey<T>(value: T): T;
export declare function normalizeBlank(obj: Object): any;
export declare function normalizeBool(obj: boolean): boolean;
export declare function isJsObject(o: any): boolean;
export declare function print(obj: Error | Object): void;
export declare class Json {
    static parse(s: string): Object;
    static stringify(data: Object): string;
}
export declare class DateWrapper {
    static create(year: number, month?: number, day?: number, hour?: number, minutes?: number, seconds?: number, milliseconds?: number): Date;
    static fromISOString(str: string): Date;
    static fromMillis(ms: number): Date;
    static toMillis(date: Date): number;
    static now(): Date;
    static toJson(date: Date): string;
}
export declare function setValueOnPath(global: any, path: string, value: any): void;
export declare function getSymbolIterator(): string | symbol;
