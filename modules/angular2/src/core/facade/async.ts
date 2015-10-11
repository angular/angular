import {global, isPresent} from 'angular2/src/core/facade/lang';
// TODO(jeffbcross): use ES6 import once typings are available
var Subject = require('@reactivex/rxjs/dist/cjs/Subject');

export {Promise};

export interface PromiseCompleter<R> {
  promise: Promise<R>;
  resolve: (value?: R | PromiseLike<R>) => void;
  reject: (error?: any, stackTrace?: string) => void;
}

export class PromiseWrapper {
  static resolve<T>(obj: T): Promise<T> { return Promise.resolve(obj); }

  static reject(obj: any, _): Promise<any> { return Promise.reject(obj); }

  // Note: We can't rename this method into `catch`, as this is not a valid
  // method name in Dart.
  static catchError<T>(promise: Promise<T>,
                       onError: (error: any) => T | PromiseLike<T>): Promise<T> {
    return promise.catch(onError);
  }

  static all(promises: any[]): Promise<any> {
    if (promises.length == 0) return Promise.resolve([]);
    return Promise.all(promises);
  }

  static then<T, U>(promise: Promise<T>, success: (value: T) => U | PromiseLike<U>,
                    rejection?: (error: any, stack?: any) => U | PromiseLike<U>): Promise<U> {
    return promise.then(success, rejection);
  }

  static wrap<T>(computation: () => T): Promise<T> {
    return new Promise((res, rej) => {
      try {
        res(computation());
      } catch (e) {
        rej(e);
      }
    });
  }

  static completer(): PromiseCompleter<any> {
    var resolve;
    var reject;

    var p = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });

    return {promise: p, resolve: resolve, reject: reject};
  }
}

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
  static subscribe<T>(emitter: Observable, onNext: (value: T) => void,
                      onThrow: (exception: any) => void = null,
                      onReturn: () => void = null): Object {
    return emitter.observer({next: onNext, throw: onThrow, return: onReturn});
  }

  static isObservable(obs: any): boolean { return obs instanceof Observable; }

  static dispose(subscription: any) { subscription.unsubscribe(); }

  static callNext(emitter: EventEmitter, value: any) { emitter.next(value); }

  static callThrow(emitter: EventEmitter, error: any) { emitter.throw(error); }

  static callReturn(emitter: EventEmitter) { emitter.return (null); }
}

// TODO: vsavkin change to interface
export class Observable {
  observer(generator: any): Object { return null; }
}

/**
 * Use by directives and components to emit custom Events.
 *
 * ## Examples
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
export class EventEmitter extends Observable {
  /** @internal */
  _subject = new Subject();

  observer(generator: any): any {
    return this._subject.subscribe((value) => { setTimeout(() => generator.next(value)); },
                                   (error) => generator.throw ? generator.throw(error) : null,
                                   () => generator.return ? generator.return () : null);
  }

  toRx(): any { return this._subject; }

  next(value: any) { this._subject.next(value); }

  throw(error: any) { this._subject.error(error); }

  return (value?: any) { this._subject.complete(); }
}
