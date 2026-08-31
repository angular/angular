/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {COMPUTING, ERRORED, UNSET} from './computed';
import {producerAccessedPassively, ReactiveNode, SIGNAL} from './graph';

// Required as the signals library is in a separate package, so we need to explicitly ensure the
// global `ngDevMode` type is defined.
declare const ngDevMode: boolean | undefined;

export type PassiveReadResult<T> =
  | {
      /** Whether the signal has a computed value. */
      hasValue: true;
      /** The current value of the signal. */
      value: T;
    }
  | {
      /** The signal is unset or still computing, so no forced recomputation occurred. */
      hasValue: false;
      /** Undefined because the signal has not yet been computed. */
      value: undefined;
    };

export function passiveRead<T>(signal: () => T): PassiveReadResult<T> {
  const node = (signal as any)?.[SIGNAL] as ReactiveNode | undefined;

  if (!node) {
    throw new Error(
      typeof ngDevMode !== 'undefined' && ngDevMode
        ? 'passiveRead: provided value is not a signal'
        : '',
    );
  }

  producerAccessedPassively(node);

  const currentValue = (node as any).value;
  const hasValue = currentValue !== UNSET && currentValue !== COMPUTING && currentValue !== ERRORED;

  return hasValue ? {hasValue: true, value: currentValue} : {hasValue: false, value: undefined};
}
