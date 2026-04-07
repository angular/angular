/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 * This file contains various signal `input()` patterns and ensures
 * the resulting types match our expectations (via comments asserting the `.d.ts`).
 */

import {signal, linkedSignal} from '@angular/core';
// import preserved to simplify `.d.ts` emit and simplify the `type_tester` logic.
// tslint:disable-next-line no-duplicate-imports
import {WritableSignal} from '@angular/core';

const source = signal(0);

declare function stringEqual(a: string, b: string): boolean;
declare function numberEqual(a: number, b: number): boolean;

export class LinkedSignalSignatureTest {
  /** number */
  simple = linkedSignal(() => 0);

  /** number */
  simpleWithCompatibleEqual = linkedSignal(source, {
    equal: numberEqual,
  });

  /** number */
  simpleWithIncompatibleEqual = linkedSignal(source, {
    // @ts-expect-error assignability error
    equal: stringEqual,
  });

  /** number */
  advanced = linkedSignal({source, computation: (s) => s * 2});

  /** string */
  advancedWithCompatibleEqual = linkedSignal({
    source,
    computation: (s) => String(s),
    equal: (a, b) => true,
  });

  /** unknown */
  /**
   * An incompatible `equal` function results in an overload resolution failure, causing the type `unknown` to be
   * inferred. This test aims to capture this limitation and may be revisited if this were to become supported.
   */
  advancedWithIncompatibleEqual =
    // @ts-expect-error overload resolution error
    linkedSignal({
      source,
      // @ts-expect-error implicit any error
      computation: (s) => String(s),
      equal: numberEqual,
    });

  /** unknown */
  /**
   * Due to the cyclic nature of `previous`'s type and the computation's return type, TypeScript isn't able to infer
   * generic type arguments. This test aims to capture this limitation and may be revisited if this were to become
   * supported.
   *
   * @see https://github.com/microsoft/TypeScript/issues/49618
   * @see https://github.com/angular/angular/issues/60423
   */
  advancedWithPreviousImplicitGenerics = linkedSignal({
    source,
    computation: (s, previous) => String(s),
  });

  /** string */
  advancedWithPreviousExplicitGenerics = linkedSignal<number, string>({
    source,
    computation: (s, previous) => String(s),
  });
}
