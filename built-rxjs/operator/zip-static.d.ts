import { Observable } from '../Observable';
export declare function zip<T, R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R>;
