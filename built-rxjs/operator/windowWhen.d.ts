import { Observable } from '../Observable';
export declare function windowWhen<T>(closingSelector: () => Observable<any>): Observable<Observable<T>>;
