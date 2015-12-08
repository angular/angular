import { Observable } from '../Observable';
export declare function switchMapTo<T, R, R2>(observable: Observable<R>, projectResult?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2): Observable<R2>;
