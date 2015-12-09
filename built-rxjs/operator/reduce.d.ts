import { Observable } from '../Observable';
export declare function reduce<T, R>(project: (acc: R, x: T) => R, seed?: R): Observable<R>;
