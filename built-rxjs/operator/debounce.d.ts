import { Observable } from '../Observable';
export declare function debounce<T>(durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T>;
