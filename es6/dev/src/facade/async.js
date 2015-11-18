import { global } from 'angular2/src/facade/lang';
export { PromiseWrapper, Promise } from 'angular2/src/facade/promise';
import { Subject, Observable as RxObservable } from '@reactivex/rxjs/dist/cjs/Rx';
export { Subject } from '@reactivex/rxjs/dist/cjs/Rx';
export class TimerWrapper {
    static setTimeout(fn, millis) {
        return global.setTimeout(fn, millis);
    }
    static clearTimeout(id) { global.clearTimeout(id); }
    static setInterval(fn, millis) {
        return global.setInterval(fn, millis);
    }
    static clearInterval(id) { global.clearInterval(id); }
}
export class ObservableWrapper {
    // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
    static subscribe(emitter, onNext, onError, onComplete = () => { }) {
        return emitter.subscribe({ next: onNext, error: onError, complete: onComplete });
    }
    static isObservable(obs) { return obs instanceof RxObservable; }
    /**
     * Returns whether `obs` has any subscribers listening to events.
     */
    static hasSubscribers(obs) { return obs.observers.length > 0; }
    static dispose(subscription) { subscription.unsubscribe(); }
    static callNext(emitter, value) { emitter.next(value); }
    static callError(emitter, error) { emitter.error(error); }
    static callComplete(emitter) { emitter.complete(); }
    static fromPromise(promise) {
        return RxObservable.fromPromise(promise);
    }
    static toPromise(obj) { return obj.toPromise(); }
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
 *   @Output() open: EventEmitter = new EventEmitter();
 *   @Output() close: EventEmitter = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.next(null);
 *     } else {
 *       this.close.next(null);
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
export class EventEmitter extends Subject {
    /**
     * Creates an instance of [EventEmitter], which depending on [isAsync],
     * delivers events synchronously or asynchronously.
     */
    constructor(isAsync = true) {
        super();
        this._isAsync = isAsync;
    }
    subscribe(generatorOrNext, error, complete) {
        if (generatorOrNext && typeof generatorOrNext === 'object') {
            let schedulerFn = this._isAsync ?
                    (value) => { setTimeout(() => generatorOrNext.next(value)); } :
                    (value) => { generatorOrNext.next(value); };
            return super.subscribe(schedulerFn, (err) => generatorOrNext.error ? generatorOrNext.error(err) : null, () => generatorOrNext.complete ? generatorOrNext.complete() : null);
        }
        else {
            let schedulerFn = this._isAsync ? (value) => { setTimeout(() => generatorOrNext(value)); } :
                    (value) => { generatorOrNext(value); };
            return super.subscribe(schedulerFn, (err) => error ? error(err) : null, () => complete ? complete() : null);
        }
    }
}
// todo(robwormald): ts2dart should handle this properly
export class Observable extends RxObservable {
    lift(operator) {
        const observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    }
}
//# sourceMappingURL=async.js.map