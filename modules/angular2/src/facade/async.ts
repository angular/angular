import {global, isPresent, noop} from 'angular2/src/facade/lang';
// We make sure promises are in a separate file so that we can use promises
// without depending on rxjs.
import {Promise} from 'angular2/src/facade/promise';
export {PromiseWrapper, Promise, PromiseCompleter} from 'angular2/src/facade/promise';

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {Operator} from 'rxjs/Operator';

import {PromiseObservable} from 'rxjs/observable/fromPromise';
import {toPromise} from 'rxjs/operator/toPromise';

export {Observable} from 'rxjs/Observable';
export {Subject} from 'rxjs/Subject';

export class TimerWrapper {
  static setTimeout(fn: (...args: any[]) => void, millis: number): number {
    return global.setTimeout(fn, millis);
  }
  static clearTimeout(id: number): void { global.clearTimeout(id); }

  static setInterval(fn: (...args: any[]) => void, millis: number): number {
    return global.setInterval(fn, millis);
  }
  static clearInterval(id: number): void { global.clearInterval(id); }
}

export class ObservableWrapper {
  // TODO(vsavkin): when we use rxnext, try inferring the generic type from the first arg
  static subscribe<T>(emitter: any, onNext: (value: T) => void, onError?: (exception: any) => void,
                      onComplete: () => void = () => {}): Object {
    onError = (typeof onError === "function") && onError || noop;
    onComplete = (typeof onComplete === "function") && onComplete || noop;
    return emitter.subscribe({next: onNext, error: onError, complete: onComplete});
  }

  static isObservable(obs: any): boolean { return !!obs.subscribe; }

  /**
   * Returns whether `obs` has any subscribers listening to events.
   */
  static hasSubscribers(obs: EventEmitter<any>): boolean { return obs.observers.length > 0; }

  static dispose(subscription: any) { subscription.unsubscribe(); }

  /**
   * @deprecated - use callEmit() instead
   */
  static callNext(emitter: EventEmitter<any>, value: any) { emitter.next(value); }

  static callEmit(emitter: EventEmitter<any>, value: any) { emitter.emit(value); }

  static callError(emitter: EventEmitter<any>, error: any) { emitter.error(error); }

  static callComplete(emitter: EventEmitter<any>) { emitter.complete(); }

  static fromPromise(promise: Promise<any>): Observable<any> {
    return PromiseObservable.create(promise);
  }

  static toPromise(obj: Observable<any>): Promise<any> { return toPromise.call(obj); }
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
 */
export class EventEmitter<T> extends Subject<T> {
  emit(value: T) { super.next(value); }
}
