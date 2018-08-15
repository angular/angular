/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';
import {join} from 'path';
import {SourceMapGenerator} from 'source-map';

import {SizeTracker} from './size_tracker';

const testTempDir = process.env['TEST_TMPDIR']!;

describe('size tracking', () => {
  let generator: SourceMapGenerator;

  beforeEach(() => {
    generator = new SourceMapGenerator();
  });

  function writeFile(filePath: string, content: string): string {
    const tmpFilePath = join(testTempDir, filePath);
    writeFileSync(tmpFilePath, content);
    return tmpFilePath;
  }

  it('should keep track of unmapped bytes in the file', () => {
    generator.addMapping({
      generated: {line: 1, column: 1},
      original: {line: 1, column: 1},
      source: './origin-a.ts',
    });

    // A => origin-a (2 bytes), U => unmapped (1 byte)
    const mapPath = writeFile('/test.map', generator.toString());
    const inputPath = writeFile('/test.js', `UAA`);

    const {sizeResult} = new SizeTracker(inputPath, mapPath);

    expect(sizeResult.unmapped).toBe(1);
    expect(sizeResult.files).toEqual({
      size: 3,
      'origin-a.ts': 2,
    });
  });

  it('should properly combine mapped characters from same source', () => {
    generator.addMapping(
        {generated: {line: 1, column: 0}, original: {line: 1, column: 0}, source: './origin-a.ts'});

    generator.addMapping(
        {generated: {line: 1, column: 1}, original: {line: 1, column: 0}, source: './origin-b.ts'});

    generator.addMapping({
      generated: {line: 1, column: 2},
      original: {line: 10, column: 0},
      source: './origin-a.ts'
    });

    // A => origin-a (1 byte), B => origin-b (two bytes)
    const mapPath = writeFile('/test.map', generator.toString());
    const inputPath = writeFile('/test.js', `ABB`);

    const {sizeResult} = new SizeTracker(inputPath, mapPath);

    expect(sizeResult.unmapped).toBe(0);
    expect(sizeResult.files).toEqual({
      size: 3,
      'origin-a.ts': 2,
      'origin-b.ts': 1,
    });
  });

  it('should keep track of summed-up byte sizes for directories', () => {
    generator.addMapping({
      generated: {line: 1, column: 0},
      original: {line: 1, column: 0},
      source: '@angular/core/render3/a.ts'
    });

    generator.addMapping({
      generated: {line: 1, column: 2},
      original: {line: 1, column: 0},
      source: '@angular/core/render3/b.ts'
    });

    generator.addMapping({
      generated: {line: 1, column: 3},
      original: {line: 1, column: 0},
      source: '@angular/core/c.ts'
    });

    // A => render3/a.ts (2 bytes), B => render3/b.ts (1 byte), C => c.ts (1 byte)
    const mapPath = writeFile('/test.map', generator.toString());
    const inputPath = writeFile('/test.js', `AABC`);

    const {sizeResult} = new SizeTracker(inputPath, mapPath);

    expect(sizeResult.unmapped).toBe(0);
    expect(sizeResult.files).toEqual({
      size: 4,
      'render3/': {
        size: 3,
        'a.ts': 2,
        'b.ts': 1,
      },
      'c.ts': 1,
    });
  });
});
