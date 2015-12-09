import { Observable } from '../Observable';
export declare function windowToggle<T, O>(openings: Observable<O>, closingSelector: (openValue: O) => Observable<any>): Observable<Observable<T>>;
