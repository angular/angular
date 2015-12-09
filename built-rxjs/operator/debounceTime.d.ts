import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
export declare function debounceTime<T>(dueTime: number, scheduler?: Scheduler): Observable<T>;
