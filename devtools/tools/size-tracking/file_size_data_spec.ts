/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FileSizeData, omitCommonPathPrefix, sortFileSizeData} from './file_size_data';

describe('file size data', () => {
  it('should be able to properly omit the common path prefix', () => {
    const data: FileSizeData = {
      unmapped: 0,
      files: {
        size: 3,
        'parent/': {
          size: 3,
          'parent2/': {
            size: 3,
            'a/': {
              size: 3,
              'file.ts': 3,
            },
            'b/': {
              size: 0,
            }
          }
        }
      }
    };

    expect(omitCommonPathPrefix(data.files)).toEqual({
      size: 3,
      'a/': {
        size: 3,
        'file.ts': 3,
      },
      'b/': {
        size: 0,
      }
    });
  });

  it('should be able to properly sort file size data in alphabetical order', () => {
    const data: FileSizeData = {
      unmapped: 0,
      files: {
        size: 7,
        'b/': {'c.ts': 3, 'a.ts': 3, size: 6},
        'a/': {'nested/': {size: 1, 'a.ts': 1}, size: 1},
      }
    };

    expect(sortFileSizeData(data)).toEqual({
      unmapped: 0,
      files: {
        size: 7,
        'a/': {size: 1, 'nested/': {size: 1, 'a.ts': 1}},
        'b/': {size: 6, 'a.ts': 3, 'c.ts': 3},
      },
    });
  });
});
