import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
export declare function merge<R>(...observables: (Observable<any> | Scheduler | number)[]): Observable<R>;
