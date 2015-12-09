import { Subject } from './Subject';
import { Observable } from './Observable';
import { CoreOperators } from './CoreOperators';
import { Scheduler as IScheduler } from './Scheduler';
export interface KitchenSinkOperators<T> extends CoreOperators<T> {
    isEmpty?: () => Observable<boolean>;
    elementAt?: (index: number, defaultValue?: any) => Observable<T>;
    distinctUntilKeyChanged?: (key: string, compare?: (x: any, y: any) => boolean, thisArg?: any) => Observable<T>;
    find?: (predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any) => Observable<T>;
    findIndex?: (predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any) => Observable<number>;
    max?: <T, R>(comparer?: (x: R, y: T) => R) => Observable<R>;
    min?: <T, R>(comparer?: (x: R, y: T) => R) => Observable<R>;
    timeInterval?: <T>(scheduler?: IScheduler) => Observable<T>;
    mergeScan?: <T, R>(project: (acc: R, x: T) => Observable<R>, seed: R, concurrent?: number) => Observable<R>;
    switchFirst?: () => Observable<T>;
    switchFirstMap?: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
}
import { Subscription } from './Subscription';
import { Subscriber } from './Subscriber';
import { AsyncSubject } from './subject/AsyncSubject';
import { ReplaySubject } from './subject/ReplaySubject';
import { BehaviorSubject } from './subject/BehaviorSubject';
import { ConnectableObservable } from './observable/ConnectableObservable';
import { Notification } from './Notification';
import { EmptyError } from './util/EmptyError';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';
import { ArgumentOutOfRangeError } from './util/ArgumentOutOfRangeError';
import { AsapScheduler } from './scheduler/AsapScheduler';
import { QueueScheduler } from './scheduler/QueueScheduler';
import { TimeInterval } from './operator/extended/timeInterval';
import { TestScheduler } from './testing/TestScheduler';
import { VirtualTimeScheduler } from './scheduler/VirtualTimeScheduler';
declare var Scheduler: {
    asap: AsapScheduler;
    queue: QueueScheduler;
};
declare var Symbol: {
    rxSubscriber: any;
};
export { Subject, Scheduler, Observable, Subscriber, Subscription, AsyncSubject, ReplaySubject, BehaviorSubject, ConnectableObservable, Notification, EmptyError, ArgumentOutOfRangeError, ObjectUnsubscribedError, TestScheduler, VirtualTimeScheduler, TimeInterval, Symbol };
