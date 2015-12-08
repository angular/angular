import { Observable } from '../Observable';
export declare function last<T, R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, resultSelector?: (value: T, index: number) => R, defaultValue?: any): Observable<T> | Observable<R>;
