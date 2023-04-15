/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * Special flag indicating that a decorator is of type `Inject`. It's used to make `Inject`
 * decorator tree-shakable (so we don't have to rely on the `instanceof` checks).
 * Note: this flag is not included into the `InjectFlags` since it's an internal-only API.
 */
export const enum DecoratorFlags {
  Inject = -1
}

/**
 * Injection flags for DI.
 *
 * @publicApi
 * @deprecated use an options object for `inject` instead.
 */
export const enum InjectFlags {
  /** Check self and check parent injector if needed */
  Default = 0b0000,

  /**
   * Specifies that an injector should retrieve a dependency from any injector until reaching the
   * host element of the current component. (Only used with Element Injector)
   */
  Host = 0b0001,

  /** Don't ascend to ancestors of the node requesting injection. */
  Self = 0b0010,

  /** Skip the node that is requesting injection. */
  SkipSelf = 0b0100,

  /** Inject `defaultValue` instead if token not found. */
  Optional = 0b1000,
}

/**
 * This token is being injected into a pipe.
 *
 * This flag is intentionally not in the public facing `InjectFlags` because it is only added by
 * the compiler and is not a developer applicable flag.
 */
export const ForPipeInjectFlag = 0b10000;


/**
 * Type of the options argument to `inject`.
 *
 * @publicApi
 */
export interface InjectOptions {
  /**
   * Use optional injection, and return `null` if the requested token is not found.
   */
  optional?: boolean;

  /**
   * Start injection at the parent of the current injector.
   */
  skipSelf?: boolean;

  /**
   * Only query the current injector for the token, and don't fall back to the parent injector if
   * it's not found.
   */
  self?: boolean;

  /**
   * Stop injection at the host component's injector. Only relevant when injecting from an element
   * injector, and a no-op for environment injectors.
   */
  host?: boolean;
}
