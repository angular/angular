/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {setActiveConsumer} from '../primitives/signals';
import {Subject, Subscription} from 'rxjs';
import {isInInjectionContext} from './di/contextual';
import {inject} from './di/injector_compatibility';
import {DestroyRef} from './linker/destroy_ref';
import {PendingTasksInternal} from './pending_tasks_internal';
class EventEmitter_ extends Subject {
  constructor(isAsync = false) {
    super();
    this.destroyRef = undefined;
    this.pendingTasks = undefined;
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
  emit(value) {
    const prevConsumer = setActiveConsumer(null);
    try {
      super.next(value);
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
  subscribe(observerOrNext, error, complete) {
    let nextFn = observerOrNext;
    let errorFn = error || (() => null);
    let completeFn = complete;
    if (observerOrNext && typeof observerOrNext === 'object') {
      const observer = observerOrNext;
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
  wrapInTimeout(fn) {
    return (value) => {
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
export const EventEmitter = EventEmitter_;
//# sourceMappingURL=event_emitter.js.map
