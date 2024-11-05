/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 * This file contains various signal `resource()` patterns and ensures
 * the resulting types match our expectations (via comments asserting the `.d.ts`).
 */

import {resource} from '@angular/core';
// import preserved to simplify `.d.ts` emit and simplify the `type_tester` logic.
// tslint:disable-next-line no-duplicate-imports
import {ResourceRef} from '@angular/core';

export class ResourceSignatureTest {
  /** ResourceRef<string> */
  noRequest = resource({
    loader: () => new Promise<string>(() => {}),
  });

  /** number | undefined */
  inferredValue = (() => {
    const res = resource({
      loader: () => new Promise<number>(() => {}),
    });
    return res.value();
  })();

  /** number */
  inferredValueAfterCallingHasValue = (() => {
    const res = resource({
      loader: () => new Promise<number>(() => {}),
    });
    if (res.hasValue()) {
      return res.value();
    }
    throw new Error('error thrown to stop type inference from this branch');
  })();
}
