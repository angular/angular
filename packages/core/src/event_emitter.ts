/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="rxjs" />

import {Subject, Subscription} from 'rxjs';

/**
 * Use in components with the `@Output` directive to emit custom events
 * synchronously or asynchronously, and register handlers for those events
 * by subscribing to an instance.
 *
 * @usageNotes
 *
 * Extends
 * [RxJS `Subject`](https://rxjs.dev/api/index/class/Subject)
 * for Angular by adding the `emit()` method.
 *
 * In the following example, a component defines two output properties
 * that create event emitters. When the title is clicked, the emitter
 * emits an open or close event to toggle the current visibility state.
 *
 * ```html
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
 * Access the event object with the `$event` argument passed to the output event
 * handler:
 *
 * ```html
 * <zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>
 * ```
 *
 * @see [Observables in Angular](guide/observables-in-angular)
 * @publicApi
 */
export interface EventEmitter<T> extends Subject<T> {
  /**
   * @internal
   */
  __isAsync: boolean;

  /**
   * Creates an instance of this class that can
   * deliver events synchronously or asynchronously.
   *
   * @param [isAsync=false] When true, deliver events asynchronously.
   *
   */
  new(isAsync?: boolean): EventEmitter<T>;

  /**
   * Emits an event containing a given value.
   * @param value The value to emit.
   */
  emit(value?: T): void;

  /**
   * Registers handlers for events emitted by this instance.
   * @param next When supplied, a custom handler for emitted events.
   * @param error When supplied, a custom handler for an error notification from this emitter.
   * @param complete When supplied, a custom handler for a completion notification from this
   *     emitter.
   */
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void):
      Subscription;
  /**
   * Registers handlers for events emitted by this instance.
   * @param observerOrNext When supplied, a custom handler for emitted events, or an observer
   *     object.
   * @param error When supplied, a custom handler for an error notification from this emitter.
   * @param complete When supplied, a custom handler for a completion notification from this
   *     emitter.
   */
  subscribe(observerOrNext?: any, error?: any, complete?: any): Subscription;
}

class EventEmitter_ extends Subject<any> {
  __isAsync: boolean;  // tslint:disable-line

  constructor(isAsync: boolean = false) {
    super();
    this.__isAsync = isAsync;
  }

  emit(value?: any) {
    super.next(value);
  }

  subscribe(observerOrNext?: any, error?: any, complete?: any): Subscription {
    let schedulerFn: (t: any) => any;
    let errorFn = (err: any): any => null;
    let completeFn = (): any => null;

    if (observerOrNext && typeof observerOrNext === 'object') {
      schedulerFn = this.__isAsync ? (value: any) => {
        setTimeout(() => observerOrNext.next(value));
      } : (value: any) => {
        observerOrNext.next(value);
      };

      if (observerOrNext.error) {
        errorFn = this.__isAsync ? (err) => {
          setTimeout(() => observerOrNext.error(err));
        } : (err) => {
          observerOrNext.error(err);
        };
      }

      if (observerOrNext.complete) {
        completeFn = this.__isAsync ? () => {
          setTimeout(() => observerOrNext.complete());
        } : () => {
          observerOrNext.complete();
        };
      }
    } else {
      schedulerFn = this.__isAsync ? (value: any) => {
        setTimeout(() => observerOrNext(value));
      } : (value: any) => {
        observerOrNext(value);
      };

      if (error) {
        errorFn = this.__isAsync ? (err) => {
          setTimeout(() => error(err));
        } : (err) => {
          error(err);
        };
      }

      if (complete) {
        completeFn = this.__isAsync ? () => {
          setTimeout(() => complete());
        } : () => {
          complete();
        };
      }
    }

    const sink = super.subscribe(schedulerFn, errorFn, completeFn);

    if (observerOrNext instanceof Subscription) {
      observerOrNext.add(sink);
    }

    return sink;
  }
}

/**
 * @publicApi
 */
export const EventEmitter: {
  new (isAsync?: boolean): EventEmitter<any>; new<T>(isAsync?: boolean): EventEmitter<T>;
  readonly prototype: EventEmitter<any>;
} = EventEmitter_ as any;
