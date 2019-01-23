/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbstractControl} from '@angular/forms';
import {DISABLED, INVALID, PENDING, VALID} from '@angular/forms/src/model';

describe('AbstractControl', () => {

  it('should have a static \'disabled\' property',
     () => { expect(AbstractControl.disabled).toBe(DISABLED); });

  it('should have a static \'invalid\' property',
     () => { expect(AbstractControl.invalid).toBe(INVALID); });

  it('should have a static \'pending\' property',
     () => { expect(AbstractControl.pending).toBe(PENDING); });

  it('should have a static \'valid\' property',
     () => { expect(AbstractControl.valid).toBe(VALID); });

});
