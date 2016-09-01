/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, ddescribe, describe, expect, iit, inject, it, xit} from '@angular/core/testing/testing_internal';
import {BaseRequestOptions, RequestOptions} from '../src/base_request_options';
import {RequestMethod} from '../src/enums';

export function main() {
  describe('BaseRequestOptions', () => {
    it('should create a new object when calling merge', () => {
      var options1 = new BaseRequestOptions();
      var options2 = options1.merge(new RequestOptions({method: RequestMethod.Delete}));
      expect(options2).not.toBe(options1);
      expect(options2.method).toBe(RequestMethod.Delete);
    });

    it('should retain previously merged values when merging again', () => {
      var options1 = new BaseRequestOptions();
      var options2 = options1.merge(new RequestOptions({method: RequestMethod.Delete}));
      expect(options2.method).toBe(RequestMethod.Delete);
    });
  });
}
