/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compareFileSizeData} from './file_size_compare';

describe('file size compare', () => {
  it('should report if size entry differ by more than the specified max percentage diff', () => {
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
        {maxPercentageDiff: 0, maxByteDiff: 25});

    expect(diffs.length).toBe(2);
    expect(diffs[0].filePath).toBe('/');
    expect(diffs[0].message).toMatch(/40.00% from the expected size/);
    expect(diffs[1].filePath).toBe('/a.ts');
    expect(diffs[1].message).toMatch(/40.00% from the expected size/);
  });

  it('should report if size entry differ by more than the specified max byte diff', () => {
    const diffs = compareFileSizeData(
        {
          unmapped: 0,
          files: {
            size: 1000,
            'a.ts': 1000,
          }
        },
        {
          unmapped: 0,
          files: {
            size: 1055,
            'a.ts': 1055,
          }
        },
        {maxPercentageDiff: 6, maxByteDiff: 50});

    expect(diffs.length).toBe(2);
    expect(diffs[0].filePath).toBe('/');
    expect(diffs[0].message).toMatch(/55B from the expected size/);
    expect(diffs[1].filePath).toBe('/a.ts');
    expect(diffs[1].message).toMatch(/55B from the expected size/);
  });

  it('should report if unmapped bytes differ by more than specified threshold', () => {
    const diffs = compareFileSizeData(
        {unmapped: 1000, files: {size: 0}}, {unmapped: 1055, files: {size: 0}},
        {maxPercentageDiff: 6, maxByteDiff: 50});

    expect(diffs.length).toBe(1);
    expect(diffs[0].filePath).toBe('<unmapped>');
    expect(diffs[0].message).toMatch(/55B from the expected size/);
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
        {maxPercentageDiff: 40, maxByteDiff: 25});

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
        {unmapped: 0, files: {size: 100, 'a.ts': 100}}, {maxByteDiff: 10, maxPercentageDiff: 1});

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
        {unmapped: 0, files: {size: 101, 'a.ts': 100, 'b.ts': 1}},
        {maxByteDiff: 10, maxPercentageDiff: 1});

    expect(diffs.length).toBe(1);
    expect(diffs[0].filePath).toBe('/b.ts');
    expect(diffs[0].message).toMatch(/Expected file.*not included./);
  });
});
