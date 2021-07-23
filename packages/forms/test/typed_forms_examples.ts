/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// These are some examples of how to use Typed Forms.

import {AbstractControl, FormArray, FormControl, FormGroup} from '../src/forms';

describe('Typed Forms', () => {
  type Party = {
    address: {
      number: number,
      street: string,
    },
    formal: boolean,
    foodOptions: Array<{
      food: string,
      price: number,
    }>
  };

  const partyForm = new FormGroup<any>({
    address: new FormGroup({number: new FormControl(1234), street: new FormControl('Main St')}),
    formal: new FormControl(false),
    foodOptions: new FormArray([])
  });
});
