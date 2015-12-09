import { Observable } from '../Observable';
export declare function zipProto<R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R>;
