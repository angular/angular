import {Observable, of} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';

/**
 * Converts an AbortSignal to an Observable<void>.
 * Emits and completes when the signal is aborted.
 * If the signal is already aborted, it emits and completes immediately.
 */
export function abortSignalToObservable(signal: AbortSignal): Observable<void> {
  if (signal.aborted) {
    return of(undefined).pipe(take(1)); // Emit and complete immediately
  }
  return new Observable<void>((subscriber) => {
    const handler = () => {
      subscriber.next();
      subscriber.complete();
    };
    signal.addEventListener('abort', handler);
    return () => signal.removeEventListener('abort', handler);
  });
}

export function takeUntilAbort<T>(signal: AbortSignal) {
  return takeUntil<T>(abortSignalToObservable(signal));
}
