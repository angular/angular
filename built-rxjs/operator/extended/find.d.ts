import { Observable } from '../../Observable';
export declare function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T>;
