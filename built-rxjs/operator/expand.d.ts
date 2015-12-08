import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
export declare function expand<T, R>(project: (value: T, index: number) => Observable<R>, concurrent?: number, scheduler?: Scheduler): Observable<R>;
