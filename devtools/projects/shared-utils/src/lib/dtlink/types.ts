/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Describes all types of remote calls on the target.
 */
export enum TargetCallType {
  Sync = 0,
  Async = 1,
  VoidSync = 2,
  VoidAsync = 3,
  AsyncGenerator = 4,
}

/**
 * Describes all types of remote calls on the target
 * available to call from the initiator.
 * All sync calls are converted to async.
 */
export enum InitiatorApiType {
  Async = 1,
  VoidAsync = 3,
  AsyncGenerator = 4,
}

// These types describe the actual callables that reside on the target.
export type SyncFn = (...args: any[]) => unknown;
export type AsyncFn = (...args: any[]) => Promise<unknown>;
export type VoidSyncFn = (...args: any[]) => void;
export type VoidAsyncFn = (...args: any[]) => Promise<void>;
export type AsyncGeneratorFn = (...args: any[]) => AsyncGenerator<unknown>;

/**
 * Describes all types of callables on the target (e.g. sync/async functions, generators, etc.)
 */
export type ApiCallable = SyncFn | AsyncFn | VoidSyncFn | VoidAsyncFn | AsyncGeneratorFn;

/**
 * Describes the metadata of a callable (e.g. sync/async functions, generators, etc.).
 */
// NOTE: The compiler needs the N and F template types to successfully
// convert a DtLinkApi to a DtLinkRemoteApi.
export interface ApiMetadata<N extends string = string, F extends ApiCallable = ApiCallable> {
  name: N;
  type: TargetCallType;
  fn: F;
}

/**
 * Serialized remote `ApiMetadata` ready to be consumed by the initiator.
 */
export type RemoteApiMetadata = Record<string, InitiatorApiType>;

/**
 * Payload sent to the target from the initiator
 */
export interface RemoteCallPayload {
  /** Call/request ID */
  id: string;

  /** Remote call arguments */
  args: any[];
}

/**
 * `DtLink` exposed API as observed on the target.
 */
export type DtLinkApi = ApiMetadata[];

/**
 * `DtLink` exposed API as observed by the initiator.
 */
// What the type does?:
// It converts the DtLinkApi to initiator-consumable DtLinkRemoteApi. Basically:
// - Sync callables on the target are converted to Promises on the initiator,
// including async generators
export type DtLinkRemoteApi<T extends DtLinkApi> = {
  [M in T[number] as M['name']]: (
    ...args: Parameters<M['fn']>
  ) => ReturnType<M['fn']> extends Promise<unknown>
    ? ReturnType<M['fn']>
    : Promise<ReturnType<M['fn']>>;
};
