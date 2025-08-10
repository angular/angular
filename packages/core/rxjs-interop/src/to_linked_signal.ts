import {Observable, Subscribable} from 'rxjs';
import {toSignal, ToSignalOptions} from '@angular/core/rxjs-interop';
import {linkedSignal, WritableSignal} from '@angular/core';

// Base case: no options -> `undefined` in the result type.
export function toLinkedSignal<T>(
  source: Observable<T> | Subscribable<T>,
): WritableSignal<T | undefined>;

// Options with `undefined` initial value and no `requireSync` -> `undefined`.
export function toLinkedSignal<T>(
  source: Observable<T> | Subscribable<T>,
  options: NoInfer<ToSignalOptions<T | undefined>> & {
    initialValue?: undefined;
    requireSync?: false;
  },
): WritableSignal<T | undefined>;

// Options with `null` initial value -> `null`.
export function toLinkedSignal<T>(
  source: Observable<T> | Subscribable<T>,
  options: NoInfer<ToSignalOptions<T | null>> & {
    initialValue?: null;
    requireSync?: false;
  },
): WritableSignal<T | null>;

// Options with `undefined` initial value and `requireSync` -> strict result type.
export function toLinkedSignal<T>(
  source: Observable<T> | Subscribable<T>,
  options: NoInfer<ToSignalOptions<T>> & {
    initialValue?: undefined;
    requireSync: true;
  },
): WritableSignal<T>;

// Options with a more specific initial value type.
export function toLinkedSignal<T, U extends T>(
  source: Observable<T> | Subscribable<T>,
  options: NoInfer<ToSignalOptions<T | U>> & {
    initialValue: U;
    requireSync?: false;
  },
): WritableSignal<T | U>;

/**
 * Get the current value of an `Observable` as a reactive `WritableSignal`.
 *
 * `toLinkedSignal` returns a `WritableSignal` which provides synchronous reactive access to values produced
 * by the given `Observable` or `Subscribable`, by subscribing to that source. The returned signal will always
 * have the most recent value emitted by the subscription, and will throw an error if the source errors.
 *
 * The options parameter allows configuring the initial value, sync requirements, and other behaviors.
 */
export function toLinkedSignal<T>(
  source: Observable<T> | Subscribable<T>,
  options?:
    | (NoInfer<ToSignalOptions<T | undefined>> & {initialValue?: undefined; requireSync?: false})
    | (NoInfer<ToSignalOptions<T | null>> & {initialValue?: null; requireSync?: false})
    | (NoInfer<ToSignalOptions<T>> & {initialValue?: undefined; requireSync: true})
    | (NoInfer<ToSignalOptions<T>> & {initialValue: T; requireSync?: false}),
): WritableSignal<any> {
  // Convert the Observable/Subscribable to a signal using toSignal
  const derived = toSignal(source, options as any);
  // Link the derived signal to a writable signal
  return linkedSignal(derived);
}
