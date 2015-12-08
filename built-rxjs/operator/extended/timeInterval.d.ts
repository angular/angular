import { Observable } from '../../Observable';
import { Scheduler } from '../../Scheduler';
export declare function timeInterval<T>(scheduler?: Scheduler): Observable<TimeInterval>;
export declare class TimeInterval {
    value: any;
    interval: number;
    constructor(value: any, interval: number);
}
