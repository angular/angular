/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '../primitives/signals';
import {PartialObserver, Subject, Subscription} from 'rxjs';

import {OutputRef} from './authoring/output/output_ref';
import {isInInjectionContext} from './di/contextual';
import {inject} from './di/injector_compatibility';
import {DestroyRef} from './linker/destroy_ref';
import {PendingTasksInternal} from './pending_tasks_internal';

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
 * ```angular-ts
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
 * @publicApi
 */
export interface EventEmitter<T> extends Subject<T>, OutputRef<T> {
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
  new (isAsync?: boolean): EventEmitter<T>;

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
  subscribe(
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void,
  ): Subscription;
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

class EventEmitter_ extends Subject<any> implements OutputRef<any> {
  // tslint:disable-next-line:require-internal-with-underscore
  __isAsync: boolean;
  destroyRef: DestroyRef | undefined = undefined;
  private readonly pendingTasks: PendingTasksInternal | undefined = undefined;

  constructor(isAsync: boolean = false) {
    super();
    this.__isAsync = isAsync;

    // Attempt to retrieve a `DestroyRef` and `PendingTasks` optionally.
    // For backwards compatibility reasons, this cannot be required.
    if (isInInjectionContext()) {
      // `DestroyRef` is optional because it is not available in all contexts.
      // But it is useful to properly complete the `EventEmitter` if used with `outputToObservable`
      // when the component/directive is destroyed. (See `outputToObservable` for more details.)
      this.destroyRef = inject(DestroyRef, {optional: true}) ?? undefined;
      this.pendingTasks = inject(PendingTasksInternal, {optional: true}) ?? undefined;
    }
  }

  emit(value?: any) {
    const prevConsumer = setActiveConsumer(null);
    try {
      super.next(value);
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }

  override subscribe(observerOrNext?: any, error?: any, complete?: any): Subscription {
    let nextFn = observerOrNext;
    let errorFn = error || (() => null);
    let completeFn = complete;

    if (observerOrNext && typeof observerOrNext === 'object') {
      const observer = observerOrNext as PartialObserver<unknown>;
      nextFn = observer.next?.bind(observer);
      errorFn = observer.error?.bind(observer);
      completeFn = observer.complete?.bind(observer);
    }

    if (this.__isAsync) {
      errorFn = this.wrapInTimeout(errorFn);

      if (nextFn) {
        nextFn = this.wrapInTimeout(nextFn);
      }

      if (completeFn) {
        completeFn = this.wrapInTimeout(completeFn);
      }
    }

    const sink = super.subscribe({next: nextFn, error: errorFn, complete: completeFn});

    if (observerOrNext instanceof Subscription) {
      observerOrNext.add(sink);
    }

    return sink;
  }

  private wrapInTimeout(fn: (value: unknown) => any) {
    return (value: unknown) => {
      const taskId = this.pendingTasks?.add();
      setTimeout(() => {
        try {
          fn(value);
        } finally {
          if (taskId !== undefined) {
            this.pendingTasks?.remove(taskId);
          }
        }
      });
    };
  }
}

/**
 * @publicApi
 */
export const EventEmitter: {
  new (isAsync?: boolean): EventEmitter<any>;
  new <T>(isAsync?: boolean): EventEmitter<T>;
  readonly prototype: EventEmitter<any>;
} = EventEmitter_ as any;
