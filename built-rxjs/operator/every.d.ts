import { Observable } from '../Observable';
export declare function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<boolean>;
