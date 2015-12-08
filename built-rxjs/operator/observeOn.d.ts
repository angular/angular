import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
export declare function observeOn<T>(scheduler: Scheduler, delay?: number): Observable<T>;
