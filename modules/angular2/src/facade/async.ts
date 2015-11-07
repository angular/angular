import {global, isPresent} from 'angular2/src/facade/lang';
// We make sure promises are in a separate file so that we can use promises
// without depending on rxjs.
import {PromiseWrapper, Promise, PromiseCompleter} from 'angular2/src/facade/promise';
export {PromiseWrapper, Promise, PromiseCompleter} from 'angular2/src/facade/promise';
import {Subject, Subscription, Observable as RxObservable} from '@reactivex/rxjs/dist/cjs/Rx';
export {Subject} from '@reactivex/rxjs/dist/cjs/Rx';
import Operator from '@reactivex/rxjs/dist/cjs/Operator';

export namespace NodeJS {
  export interface Timer {}
}

export class TimerWrapper {
  static setTimeout(fn: (...args: any[]) => void, millis: number): NodeJS.Timer {
    return global.setTimeout(fn, millis);
  }
  static clearTimeout(id: NodeJS.Timer): void { global.clearTimeout(id); }

  static setInterval(fn: (...args: any[]) => void, millis: number): NodeJS.Timer {
    return global.setInterval(fn, millis);
  }
  static clearInterval(id: NodeJS.Timer): void { global.clearInterval(id); }
}

export class ObservableWrapper {
  // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
  static subscribe<T>(emitter: any, onNext: (value: T) => void, onError?: (exception: any) => void,
                      onComplete: () => void = () => {}): Object {
    return emitter.subscribe({next: onNext, error: onError, complete: onComplete});
  }

  static isObservable(obs: any): boolean { return obs instanceof RxObservable; }

  /**
   * Returns whether `obs` has any subscribers listening to events.
   */
  static hasSubscribers(obs: EventEmitter<any>): boolean { return obs.observers.length > 0; }

  static dispose(subscription: any) { subscription.unsubscribe(); }

  static callNext(emitter: EventEmitter<any>, value: any) { emitter.next(value); }

  static callError(emitter: EventEmitter<any>, error: any) { emitter.error(error); }

  static callComplete(emitter: EventEmitter<any>) { emitter.complete(); }

  static fromPromise(promise: Promise<any>): Observable<any> {
    return RxObservable.fromPromise(promise);
  }

  static toPromise(obj: Observable<any>): Promise<any> { return (<any>obj).toPromise(); }
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
export class EventEmitter<T> extends Subject<T> {
  /** @internal */
  _isAsync: boolean;

  /**
   * Creates an instance of [EventEmitter], which depending on [isAsync],
   * delivers events synchronously or asynchronously.
   */
  constructor(isAsync: boolean = true) {
    super();
    this._isAsync = isAsync;
  }

  subscribe(generatorOrNext?: any, error?: any, complete?: any): any {
    if (generatorOrNext && typeof generatorOrNext === 'object') {
      let schedulerFn = this._isAsync ?
                            (value) => { setTimeout(() => generatorOrNext.next(value)); } :
                            (value) => { generatorOrNext.next(value); };
      return super.subscribe(schedulerFn,
                             (err) => generatorOrNext.error ? generatorOrNext.error(err) : null,
                             () => generatorOrNext.complete ? generatorOrNext.complete() : null);
    } else {
      let schedulerFn = this._isAsync ? (value) => { setTimeout(() => generatorOrNext(value)); } :
                                        (value) => { generatorOrNext(value); };

      return super.subscribe(schedulerFn, (err) => error ? error(err) : null,
                             () => complete ? complete() : null);
    }
  }
}

// todo(robwormald): ts2dart should handle this properly
export class Observable<T> extends RxObservable<T> {
  lift<T, R>(operator: Operator<T, R>): Observable<T> {
    const observable = new Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
}
