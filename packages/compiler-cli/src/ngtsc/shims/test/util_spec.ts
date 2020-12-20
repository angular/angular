/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {generatedModuleName} from '../src/util';

describe('shim utilities', () => {
  describe('generatedModuleName', () => {
    it('should generate a correct module name for index files', () => {
      expect(generatedModuleName('@angular/core', '/angular/packages/core/index.ts', '.ngfactory'))
          .toBe('@angular/core/index.ngfactory');
    });

    it('should generate a correct module name for non-index files', () => {
      expect(generatedModuleName(
                 '@angular/core/src/application_ref',
                 '/angular/packages/core/src/application_ref.ts', '.ngsummary'))
          .toBe('@angular/core/src/application_ref.ngsummary');
    });
  });
});
