/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ChangeDetectorRef, OnDestroy, PipeTransform } from '@angular/core';
import type { Observable, Subscribable } from 'rxjs';
/**
 * @ngModule CommonModule
 * @description
 *
 * Unwraps a value from an asynchronous primitive.
 *
 * The `async` pipe subscribes to an `Observable` or `Promise` and returns the latest value it has
 * emitted. When a new value is emitted, the `async` pipe marks the component to be checked for
 * changes. When the component gets destroyed, the `async` pipe unsubscribes automatically to avoid
 * potential memory leaks. When the reference of the expression changes, the `async` pipe
 * automatically unsubscribes from the old `Observable` or `Promise` and subscribes to the new one.
 *
 * @usageNotes
 *
 * ### Examples
 *
 * This example binds a `Promise` to the view. Clicking the `Resolve` button resolves the
 * promise.
 *
 * {@example common/pipes/ts/async_pipe.ts region='AsyncPipePromise'}
 *
 * It's also possible to use `async` with Observables. The example below binds the `time` Observable
 * to the view. The Observable continuously updates the view with the current time.
 *
 * {@example common/pipes/ts/async_pipe.ts region='AsyncPipeObservable'}
 *
 * @publicApi
 */
export declare class AsyncPipe implements OnDestroy, PipeTransform {
    private _ref;
    private _latestValue;
    private markForCheckOnValueUpdate;
    private _subscription;
    private _obj;
    private _strategy;
    private readonly applicationErrorHandler;
    constructor(ref: ChangeDetectorRef);
    ngOnDestroy(): void;
    transform<T>(obj: Observable<T> | Subscribable<T> | PromiseLike<T>): T | null;
    transform<T>(obj: null | undefined): null;
    transform<T>(obj: Observable<T> | Subscribable<T> | PromiseLike<T> | null | undefined): T | null;
    private _subscribe;
    private _selectStrategy;
    private _dispose;
    private _updateLatestValue;
}
