import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare function timeoutWith<T, R>(due: number | Date, withObservable: Observable<R>, scheduler?: Scheduler): Observable<T> | Observable<R>;
