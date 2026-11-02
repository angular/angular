/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AngularDevtoolsError} from '../error';
import {
  ApiCallable,
  ApiMetadata,
  AsyncFn,
  AsyncGeneratorFn,
  TargetCallType,
  SyncFn,
  VoidAsyncFn,
  VoidSyncFn,
  InitiatorApiType,
  DtLinkApi,
  RemoteApiMetadata,
} from './types';

//
// `MessageBus` topics
//

export const DTLINK_API_REQUEST = 'dtlink-api#remote-api-request';
export const DTLINK_API_RESPONSE = 'dtlink-api#remote-api-response';

export function dtlinkRequestTopic(name: string) {
  return `dtlink#${name}_request`;
}

export function dtlinkResponseTopic(name: string) {
  return `dtlink#${name}_response`;
}

//
// Metadata decorators
//

// Resolves to `true` if `K` is exactly one string literal,
// i.e. not a union, `string` or `never`.
type IsSingleKey<K extends string, U = K> = [K] extends [never]
  ? false
  : string extends K
    ? false
    : K extends unknown
      ? [U] extends [K]
        ? true
        : false
      : never;

// Constrains `T` to a window.postMessage and chrome.runtime
// serializable value.
type Serializable<T> = T extends string | number | boolean | null
  ? T
  : T extends (...args: any[]) => unknown
    ? never
    : T extends object
      ? {[K in keyof T]: Serializable<T[K]>}
      : never;

type SerializableArgs<F extends ApiCallable> =
  Parameters<F> extends Serializable<Parameters<F>>
    ? F
    : 'DtLink: All arguments of an exposed function must be serializable.';

// An object with a single function property (e.g. `{myFn}`).
type NamedFn<N extends string, F extends ApiCallable> =
  IsSingleKey<N> extends true ? Record<N, SerializableArgs<F>> : never;

function fnMetadata<N extends string, F extends ApiCallable>(
  namedFn: NamedFn<N, F>,
  type: TargetCallType,
): ApiMetadata<N, F> {
  const name = Object.keys(namedFn)[0] as N;
  return {
    name,
    type,
    fn: namedFn[name] as F,
  };
}

/** Decorate a synchronous function when exposing to DtLink. */
export function syncFn<N extends string, F extends SyncFn>(
  namedFn: NamedFn<N, F>,
): ApiMetadata<N, F> {
  return fnMetadata(namedFn, TargetCallType.Sync);
}

/** Decorate an asynchronous function when exposing to DtLink. */
export function asyncFn<N extends string, F extends AsyncFn>(
  namedFn: NamedFn<N, F>,
): ApiMetadata<N, F> {
  return fnMetadata(namedFn, TargetCallType.Async);
}

/** Decorate a synchronous function that doesn't return a value when exposing to DtLink. */
export function voidSyncFn<N extends string, F extends VoidSyncFn>(
  namedFn: NamedFn<N, F>,
): ApiMetadata<N, F> {
  return fnMetadata(namedFn, TargetCallType.VoidSync);
}

/** Decorate an asynchronous function that doesn't return a value when exposing to DtLink. */
export function voidAsyncFn<N extends string, F extends VoidAsyncFn>(
  namedFn: NamedFn<N, F>,
): ApiMetadata<N, F> {
  return fnMetadata(namedFn, TargetCallType.VoidAsync);
}

/** Decorate an asynchronous generator when exposing to DtLink. */
export function asyncGeneratorFn<N extends string, F extends AsyncGeneratorFn>(
  namedFn: NamedFn<N, F>,
): ApiMetadata<N, F> {
  return fnMetadata(namedFn, TargetCallType.AsyncGenerator);
}

//
// Callable checkers
//

export function isSyncFn(fn: ApiCallable, type: TargetCallType): fn is SyncFn {
  return type === TargetCallType.Sync;
}

export function isAsyncFn(fn: ApiCallable, type: TargetCallType): fn is AsyncFn {
  return type === TargetCallType.Async;
}

export function isVoidSyncFn(fn: ApiCallable, type: TargetCallType): fn is VoidSyncFn {
  return type === TargetCallType.VoidSync;
}

export function isVoidAsyncFn(fn: ApiCallable, type: TargetCallType): fn is VoidAsyncFn {
  return type === TargetCallType.VoidAsync;
}

export function isAsyncGeneratorFn(fn: ApiCallable, type: TargetCallType): fn is AsyncGeneratorFn {
  return type === TargetCallType.AsyncGenerator;
}

/** Checks whether a async/sync function or an async generator metadata. */
export function isCallableMetadata(data: ApiMetadata): data is ApiMetadata {
  return !!(data as ApiMetadata).fn;
}

//
// Mapping
//

const TO_INITIATOR_API: {[key in TargetCallType]: InitiatorApiType} = {
  [TargetCallType.Sync]: InitiatorApiType.Async,
  [TargetCallType.Async]: InitiatorApiType.Async,
  [TargetCallType.VoidSync]: InitiatorApiType.VoidAsync,
  [TargetCallType.VoidAsync]: InitiatorApiType.VoidAsync,
  [TargetCallType.AsyncGenerator]: InitiatorApiType.AsyncGenerator,
};

export function serializeApiMetadata(api: DtLinkApi): RemoteApiMetadata {
  return api.reduce((map, metadata) => {
    return Object.assign(map, {[metadata.name]: TO_INITIATOR_API[metadata.type]});
  }, {});
}

export function withTimeout<T>(promise: Promise<T>, timeout: number, msg: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new AngularDevtoolsError(msg)), timeout);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer)) as Promise<T>;
}
