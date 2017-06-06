export { PromiseWrapper, PromiseCompleter } from 'angular2/src/facade/promise';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
export { Observable } from 'rxjs/Observable';
export { Subject } from 'rxjs/Subject';
export declare class TimerWrapper {
    static setTimeout(fn: (...args: any[]) => void, millis: number): number;
    static clearTimeout(id: number): void;
    static setInterval(fn: (...args: any[]) => void, millis: number): number;
    static clearInterval(id: number): void;
}
export declare class ObservableWrapper {
    static subscribe<T>(emitter: any, onNext: (value: T) => void, onError?: (exception: any) => void, onComplete?: () => void): Object;
    static isObservable(obs: any): boolean;
    /**
     * Returns whether `obs` has any subscribers listening to events.
     */
    static hasSubscribers(obs: EventEmitter<any>): boolean;
    static dispose(subscription: any): void;
    /**
     * @deprecated - use callEmit() instead
     */
    static callNext(emitter: EventEmitter<any>, value: any): void;
    static callEmit(emitter: EventEmitter<any>, value: any): void;
    static callError(emitter: EventEmitter<any>, error: any): void;
    static callComplete(emitter: EventEmitter<any>): void;
    static fromPromise(promise: Promise<any>): Observable<any>;
    static toPromise(obj: Observable<any>): Promise<any>;
}
/**
 * Use by directives and components to emit custom Events.
 *
 * ### Examples
 *
 * In the following example, `Zippy` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
export declare class EventEmitter<T> extends Subject<T> {
    /**
     * Creates an instance of [EventEmitter], which depending on [isAsync],
     * delivers events synchronously or asynchronously.
     */
    constructor(isAsync?: boolean);
    emit(value: T): void;
    /**
     * @deprecated - use .emit(value) instead
     */
    next(value: any): void;
    subscribe(generatorOrNext?: any, error?: any, complete?: any): any;
}
