import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare function subscribeOn<T>(scheduler: Scheduler, delay?: number): Observable<T>;
