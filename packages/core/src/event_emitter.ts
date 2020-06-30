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
   * @param generatorOrNext When supplied, a custom handler for emitted events.
   * @param error When supplied, a custom handler for an error notification
   * from this emitter.
   * @param complete When supplied, a custom handler for a completion
   * notification from this emitter.
   */
  subscribe(generatorOrNext?: any, error?: any, complete?: any): Subscription;
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

  /**
   * @internal
   */
  _subscribe(subscriber: any): Subscription {
    if (this.__isAsync) {
      subscriber.next = (value: any) =>
          setTimeout(subscriber.constructor.prototype.next.bind(subscriber, value));
      subscriber.error = (err: any) =>
          setTimeout(subscriber.constructor.prototype.error.bind(subscriber, err));
      subscriber.complete = () =>
          setTimeout(subscriber.constructor.prototype.complete.bind(subscriber));
    }

    return super._subscribe(subscriber);
  }
}

/**
 * @publicApi
 */
export const EventEmitter: {
  new (isAsync?: boolean): EventEmitter<any>; new<T>(isAsync?: boolean): EventEmitter<T>;
  readonly prototype: EventEmitter<any>;
} = EventEmitter_ as any;
