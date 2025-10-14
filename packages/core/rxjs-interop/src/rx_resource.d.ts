/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ResourceLoaderParams, ResourceRef, BaseResourceOptions } from '../../src/core';
import { Observable } from 'rxjs';
/**
 * Like `ResourceOptions` but uses an RxJS-based `loader`.
 *
 * @experimental
 */
export interface RxResourceOptions<T, R> extends BaseResourceOptions<T, R> {
    stream: (params: ResourceLoaderParams<R>) => Observable<T>;
}
/**
 * Like `resource` but uses an RxJS based `loader` which maps the request to an `Observable` of the
 * resource's value.
 *
 * @experimental
 */
export declare function rxResource<T, R>(opts: RxResourceOptions<T, R> & {
    defaultValue: NoInfer<T>;
}): ResourceRef<T>;
/**
 * Like `resource` but uses an RxJS based `loader` which maps the request to an `Observable` of the
 * resource's value.
 *
 * @experimental
 */
export declare function rxResource<T, R>(opts: RxResourceOptions<T, R>): ResourceRef<T | undefined>;
