import { Observable } from '../Observable';
export declare function scan<T, R>(accumulator: (acc: R, x: T) => R, seed?: T | R): Observable<R>;
