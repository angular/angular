import { Observable } from '../Observable';
export declare function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>): any;
