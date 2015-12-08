import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare function merge<R>(...observables: Array<Observable<any> | Scheduler | number>): Observable<R>;
