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

import {input} from '../../src/core';
// import preserved to simplify `.d.ts` emit and simplify the `type_tester` logic.
// tslint:disable-next-line no-duplicate-imports
import {InputSignal, InputSignalWithTransform} from '../../src/core';

export class InputSignatureTest {
  /** string | undefined */
  noInitialValueExplicitRead = input<string>();
  /** boolean */
  initialValueBooleanNoType = input(false);
  /** string */
  initialValueStringNoType = input('bla');
  /** number */
  initialValueNumberNoType = input(0);
  /** string[] */
  initialValueObjectNoType = input([] as string[]);
  /** number */
  initialValueEmptyOptions = input(1, {});

  /** @internal */
  // @ts-expect-error Transform is needed
  __explicitWriteTWithoutTransformForbidden = input<string, string>('bla__');

  /** number, string | number */
  noInitialValueWithTransform = input.required({transform: (_v: number | string) => 0});

  /** number, string | number  */
  initialValueWithTransform = input(0, {transform: (_v: number | string) => 0});

  /** boolean | undefined, string | boolean  */
  undefinedInitialValueWithTransform = input(undefined, {
    transform: (_v: boolean | string) => true,
  });

  /** {works: boolean;}, string | boolean  */
  complexTransformWithInitialValue = input(
    {works: true},
    {
      transform: (_v: boolean | string) => ({works: !!_v}),
    },
  );

  /** RegExp */
  nonPrimitiveInitialValue = input(/default regex/);

  /** string, string | null */
  requiredExplicitReadAndWriteButNoTransform = input.required<string, string | null>({
    transform: (_v) => '',
  });

  /** string, string | null */
  withInitialValueExplicitReadAndWrite = input<string, string | null>('', {transform: (bla) => ''});

  /** string | undefined */
  withNoInitialValue = input<string>();

  /** undefined */
  initialValueUndefinedWithoutOptions = input(undefined);
  /** undefined */
  initialValueUndefinedWithOptions = input(undefined, {});
  /** @internal */
  __shouldErrorIfInitialValueUndefinedExplicitReadWithoutOptions = input<string>(
    // @ts-expect-error
    undefined,
  );
  /** string | undefined, unknown */
  initialValueUndefinedWithUntypedTransform = input(undefined, {transform: (bla) => ''});
  /** string | undefined, string */
  initialValueUndefinedWithTypedTransform = input(undefined, {transform: (bla: string) => ''});
  /** string | undefined, string */
  initialValueUndefinedExplicitReadWithTransform = input<string, string>(undefined, {
    transform: (bla) => '',
  });

  /** string */
  requiredNoInitialValue = input.required<string>();
  /** string | undefined */
  requiredNoInitialValueExplicitUndefined = input.required<string | undefined>();

  /** string, string | boolean */
  requiredWithTransform = input.required<string, string | boolean>({
    transform: (v: string | boolean) => '',
  });

  /** @internal */
  __requiredWithTransformButNoWriteT = input.required<string>({
    // @ts-expect-error
    transform: (v: string | boolean) => '',
  });

  /** string, string | boolean */
  requiredWithTransformInferenceNoExplicitGeneric = input.required({
    transform: (v: string | boolean) => '',
  });

  // Unknown as `WriteT` is acceptable because the user explicitly opted into handling
  // the transform- so they will need to work with the `unknown` values.
  /** string, unknown */
  requiredTransformButNoTypes = input.required({transform: (v) => ''});

  /** unknown */
  noInitialValueNoType = input();
  /** string */
  requiredNoInitialValueNoType = input.required<string>();

  /** @internal */
  __shouldErrorIfInitialValueWithRequired = input.required({
    // @ts-expect-error
    initialValue: 0,
  });
}
