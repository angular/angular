import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
/**
 * buffers values from the source for a specific time period. Optionally allows new buffers to be set up at an interval.
 * @param {number} the amount of time to fill each buffer for before emitting them and clearing them.
 * @param {number} [bufferCreationInterval] the interval at which to start new buffers.
 * @param {Scheduler} [scheduler] (optional, defaults to `asap` scheduler) The scheduler on which to schedule the
 *  intervals that determine buffer boundaries.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
export declare function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval?: number, scheduler?: Scheduler): Observable<T[]>;
