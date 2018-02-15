/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EntriesPipe} from '@angular/common';

{
  describe('EntriesPipe', () => {
    let pipe: EntriesPipe;

    beforeEach(() => { pipe = new EntriesPipe(); });

    describe('transform', () => {
      it('should return key value pairs', () => {
        const object = {key1: 'value1', key2: 'value2'};
        const entries = [{key: 'key1', value: 'value1'}, {key: 'key2', value: 'value2'}];
        const val = pipe.transform(object);
        expect(val).toEqual(entries);
      });

      it('should return empty array if value is undefined',
         () => { expect(pipe.transform(undefined as any)).toEqual([]); });

      it('should return empty array if value is null',
         () => { expect(pipe.transform(null as any)).toEqual([]); });

    });
  });
}
