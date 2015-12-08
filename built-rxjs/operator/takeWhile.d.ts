import { Observable } from '../Observable';
export declare function takeWhile<T>(predicate: (value: T, index: number) => boolean): Observable<T>;
