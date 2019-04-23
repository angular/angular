/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compareFileSizeData} from './file_size_compare';

describe('file size compare', () => {

  it('should report if size entry differ by more than the specified threshold', () => {
    const diffs = compareFileSizeData(
        {
          unmapped: 0,
          files: {
            size: 50,
            'a.ts': 50,
          }
        },
        {
          unmapped: 0,
          files: {
            size: 75,
            'a.ts': 75,
          }
        },
        0);

    expect(diffs.length).toBe(2);
    expect(diffs[0].filePath).toBe('/');
    expect(diffs[0].message).toMatch(/40.00% from the expected size/);
    expect(diffs[1].filePath).toBe('/a.ts');
    expect(diffs[1].message).toMatch(/40.00% from the expected size/);
  });

  it('should not report if size percentage difference does not exceed threshold', () => {
    const diffs = compareFileSizeData(
        {
          unmapped: 0,
          files: {
            size: 50,
            'a.ts': 50,
          }
        },
        {
          unmapped: 0,
          files: {
            size: 75,
            'a.ts': 75,
          }
        },
        40);

    expect(diffs.length).toBe(0);
  });


  it('should report if expected file size data misses a file size entry', () => {
    const diffs = compareFileSizeData(
        {
          unmapped: 0,
          files: {
            size: 101,
            'a.ts': 100,
            'b.ts': 1,
          }
        },
        {unmapped: 0, files: {size: 100, 'a.ts': 100}}, 1);

    expect(diffs.length).toBe(1);
    expect(diffs[0].filePath).toBe('/b.ts');
    expect(diffs[0].message).toMatch(/Unexpected file.*not part of golden./);
  });

  it('should report if actual file size data misses an expected file size entry', () => {
    const diffs = compareFileSizeData(
        {
          unmapped: 0,
          files: {
            size: 100,
            'a.ts': 100,
          }
        },
        {unmapped: 0, files: {size: 101, 'a.ts': 100, 'b.ts': 1}}, 1);

    expect(diffs.length).toBe(1);
    expect(diffs[0].filePath).toBe('/b.ts');
    expect(diffs[0].message).toMatch(/Expected file.*not included./);
  });
});
