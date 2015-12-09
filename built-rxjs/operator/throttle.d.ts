import { Observable } from '../Observable';
export declare function throttle<T>(durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T>;
