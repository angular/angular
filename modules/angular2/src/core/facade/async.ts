import {global, isPresent} from 'angular2/src/core/facade/lang';
// We make sure promises are in a separate file so that we can use promises
// without depending on rxjs.
import {PromiseWrapper, Promise, PromiseCompleter} from 'angular2/src/core/facade/promise';
export {PromiseWrapper, Promise, PromiseCompleter} from 'angular2/src/core/facade/promise';
import {Observable, Subject, Subscription} from '@reactivex/rxjs/dist/cjs/Rx';
export {Observable, Subject, Subscription} from '@reactivex/rxjs/dist/cjs/Rx';

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
  static subscribe<T>(emitter: Observable<any>, onNextOrObserver: (value: T) => void,
                      onError: (exception: any) => void = null,
                      onComplete: () => void = null): Object {
    return emitter.subscribe(onNextOrObserver, onError, onComplete);
  }

  static isObservable(obs: any): boolean { return obs instanceof Observable; }

  /**
   * Returns whether `obs` has any subscribers listening to events.
   */
  static hasSubscribers(obs: EventEmitter<any>): boolean { return obs.observers.length > 0; }

  static dispose(subscription: any) { subscription.unsubscribe(); }

  static callNext(emitter: EventEmitter<any>, value: any) { emitter.next(value); }

  static callThrow(emitter: EventEmitter<any>, error: any) { emitter.error(error); }

  static callReturn(emitter: EventEmitter<any>) { emitter.complete(); }
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

  emit(value: any) { this.next(value); }

  subscribe(observerOrNext: any, error?: any, complete?: any): Subscription<T> {
    let generator;

    if (observerOrNext && typeof observerOrNext === 'object') {
      generator = observerOrNext;
    } else if (observerOrNext) {
      generator = {next: observerOrNext, error: error, complete: complete};
    }

    var schedulerFn = this._isAsync ? (value) => { setTimeout(() => generator.next(value)); } :
                                      (value) => { generator.next(value); };
    return super.subscribe(schedulerFn, (error) => generator.error ? generator.error(error) : null,
                           () => generator.complete ? generator.complete() : null);
  }
}