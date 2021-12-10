/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type Parameters<F> = F extends(...args: infer T) => any ? T : never;

export abstract class MessageBus<T> {
  abstract on<E extends keyof T>(topic: E, cb: T[E]): void;
  abstract once<E extends keyof T>(topic: E, cb: T[E]): void;
  abstract emit<E extends keyof T>(topic: E, args?: Parameters<T[E]>): boolean;
  abstract destroy(): void;
}
