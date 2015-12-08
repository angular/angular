import { Observable } from '../Observable';
export declare function skipWhile<T>(predicate: (x: T, index: number) => boolean): Observable<T>;
