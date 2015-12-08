import { Observable } from '../Observable';
export declare function single<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<T>;
