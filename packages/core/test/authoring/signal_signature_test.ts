/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 * This file contains various `signal()` patterns and ensures
 * the resulting types match our expectations (via comments asserting the `.d.ts`).
 */

import {signal} from '@angular/core';
// import preserved to simplify `.d.ts` emit and simplify the `type_tester` logic.
// tslint:disable-next-line no-duplicate-imports
import {WritableSignal} from '@angular/core';

export class SignalSignatureTest {
  /** boolean */
  inferredBoolean = signal(false);

  /** string */
  inferredString = signal('hello');

  /** number */
  inferredNumber = signal(0);

  /** undefined */
  explicitUndefinedValue = signal(undefined);

  /** undefined */
  noArgNoType = signal();

  /** string | undefined */
  noArgExplicitType = signal<string>();

  /** string | undefined */
  noArgExplicitUnionType = signal<string | undefined>();

  /** string */
  explicitTypeWithValue = signal<string>('hello');

  /** string */
  withEqualOption = signal('hello', {equal: (a, b) => a === b});

  /** #ignore */
  // @ts-expect-error type mismatch between explicit type and value
  invalidExplicitType = signal<number>('1');
}
