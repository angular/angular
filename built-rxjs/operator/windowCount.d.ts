import { Observable } from '../Observable';
export declare function windowCount<T>(windowSize: number, startWindowEvery?: number): Observable<Observable<T>>;
