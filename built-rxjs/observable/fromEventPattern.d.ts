import { Observable } from '../Observable';
export declare class FromEventPatternObservable<T, R> extends Observable<T> {
    private addHandler;
    private removeHandler;
    private selector;
    static create<T>(addHandler: (handler: Function) => any, removeHandler: (handler: Function) => void, selector?: (...args: Array<any>) => T): FromEventPatternObservable<T, {}>;
    constructor(addHandler: (handler: Function) => any, removeHandler: (handler: Function) => void, selector?: (...args: Array<any>) => T);
    _subscribe(subscriber: any): void;
}
