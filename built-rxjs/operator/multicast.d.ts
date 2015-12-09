import { Subject } from '../Subject';
import { ConnectableObservable } from '../observable/ConnectableObservable';
export declare function multicast<T>(subjectOrSubjectFactory: Subject<T> | (() => Subject<T>)): ConnectableObservable<T>;
