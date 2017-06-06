export declare class PromiseCompleter<R> {
    promise: Promise<R>;
    resolve: (value?: R | PromiseLike<R>) => void;
    reject: (error?: any, stackTrace?: string) => void;
    constructor();
}
export declare class PromiseWrapper {
    static resolve<T>(obj: T): Promise<T>;
    static reject(obj: any, _: any): Promise<any>;
    static catchError<T>(promise: Promise<T>, onError: (error: any) => T | PromiseLike<T>): Promise<T>;
    static all<T>(promises: (T | Promise<T>)[]): Promise<T[]>;
    static then<T, U>(promise: Promise<T>, success: (value: T) => U | PromiseLike<U>, rejection?: (error: any, stack?: any) => U | PromiseLike<U>): Promise<U>;
    static wrap<T>(computation: () => T): Promise<T>;
    static scheduleMicrotask(computation: () => any): void;
    static isPromise(obj: any): boolean;
    static completer<T>(): PromiseCompleter<T>;
}
