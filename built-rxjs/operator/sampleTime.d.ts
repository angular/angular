import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
export declare function sampleTime<T>(delay: number, scheduler?: Scheduler): Observable<T>;
