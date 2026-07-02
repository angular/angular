/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {encode} from '@jridgewell/sourcemap-codec';

import {absoluteFrom, getFileSystem, PathManipulation} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {ContentOrigin} from '../src/content_origin';
import {RawSourceMap, SourceMapInfo} from '../src/raw_source_map';
import {SegmentMarker} from '../src/segment_marker';
import {
  computeStartOfLinePositions,
  ensureOriginalSegmentLinks,
  extractOriginalSegments,
  findLastMappingIndexBefore,
  Mapping,
  parseMappings,
  SourceFile,
} from '../src/source_file';

runInEachFileSystem(() => {
  describe('SourceFile and utilities', () => {
    let fs: PathManipulation;
    let _: typeof absoluteFrom;

    beforeEach(() => {
      fs = getFileSystem();
      _ = absoluteFrom;
    });

    describe('parseMappings()', () => {
      it('should be an empty array for source files with no source map', () => {
        const mappings = parseMappings(null, [], []);
        expect(mappings).toEqual([]);
      });

      it('should be empty array for source files with no source map mappings', () => {
        const rawSourceMap: RawSourceMap = {mappings: '', names: [], sources: [], version: 3};
        const mappings = parseMappings(rawSourceMap, [], []);
        expect(mappings).toEqual([]);
      });

      it('should parse the mappings from the raw source map', () => {
        const rawSourceMap: RawSourceMap = {
          mappings: encode([
            [
              [0, 0, 0, 0],
              [6, 0, 0, 3],
            ],
          ]),
          names: [],
          sources: ['a.js'],
          version: 3,
        };
        const originalSource = new SourceFile(_('/foo/src/a.js'), 'abcdefg', null, [], fs);
        const mappings = parseMappings(rawSourceMap, [originalSource], [0, 8]);
        expect(mappings).toEqual([
          {
            generatedSegment: {line: 0, column: 0, position: 0, next: undefined},
            originalSource,
            originalSegment: {line: 0, column: 0, position: 0, next: undefined},
            name: undefined,
          },
          {
            generatedSegment: {line: 0, column: 6, position: 6, next: undefined},
            originalSource,
            originalSegment: {line: 0, column: 3, position: 3, next: undefined},
            name: undefined,
          },
        ]);
      });
    });

    describe('extractOriginalSegments()', () => {
      it('should return an empty Map for source files with no source map', () => {
        expect(extractOriginalSegments(parseMappings(null, [], []))).toEqual(new Map());
      });

      it('should be empty Map for source files with no source map mappings', () => {
        const rawSourceMap: RawSourceMap = {mappings: '', names: [], sources: [], version: 3};
        expect(extractOriginalSegments(parseMappings(rawSourceMap, [], []))).toEqual(new Map());
      });

      it('should parse the segments in ascending order of original position from the raw source map', () => {
        const originalSource = new SourceFile(_('/foo/src/a.js'), 'abcdefg', null, [], fs);
        const rawSourceMap: RawSourceMap = {
          mappings: encode([
            [
              [0, 0, 0, 0],
              [2, 0, 0, 3],
              [4, 0, 0, 2],
            ],
          ]),
          names: [],
          sources: ['a.js'],
          version: 3,
        };
        const originalSegments = extractOriginalSegments(
          parseMappings(rawSourceMap, [originalSource], [0, 8]),
        );
        expect(originalSegments.get(originalSource)).toEqual([
          {line: 0, column: 0, position: 0, next: undefined},
          {line: 0, column: 2, position: 2, next: undefined},
          {line: 0, column: 3, position: 3, next: undefined},
        ]);
      });

      it('should create separate arrays for each original source file', () => {
        const sourceA = new SourceFile(_('/foo/src/a.js'), 'abcdefg', null, [], fs);
        const sourceB = new SourceFile(_('/foo/src/b.js'), '1234567', null, [], fs);
        const rawSourceMap: RawSourceMap = {
          mappings: encode([
            [
              [0, 0, 0, 0],
              [2, 1, 0, 3],
              [4, 0, 0, 2],
              [5, 1, 0, 5],
              [6, 1, 0, 2],
            ],
          ]),
          names: [],
          sources: ['a.js', 'b.js'],
          version: 3,
        };
        const originalSegments = extractOriginalSegments(
          parseMappings(rawSourceMap, [sourceA, sourceB], [0, 8]),
        );
        expect(originalSegments.get(sourceA)).toEqual([
          {line: 0, column: 0, position: 0, next: undefined},
          {line: 0, column: 2, position: 2, next: undefined},
        ]);
        expect(originalSegments.get(sourceB)).toEqual([
          {line: 0, column: 2, position: 2, next: undefined},
          {line: 0, column: 3, position: 3, next: undefined},
          {line: 0, column: 5, position: 5, next: undefined},
        ]);
      });
    });

    describe('findLastMappingIndexBefore', () => {
      it('should find the highest mapping index that has a segment marker below the given one if there is not an exact match', () => {
        const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
        const marker4: SegmentMarker = {line: 0, column: 40, position: 40, next: marker5};
        const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
        const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
        const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};
        const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
          (marker) => ({generatedSegment: marker}) as Mapping,
        );

        const marker: SegmentMarker = {line: 0, column: 35, position: 35, next: undefined};
        const index = findLastMappingIndexBefore(mappings, marker, /* exclusive */ false, 0);
        expect(index).toEqual(2);
      });

      it('should find the highest mapping index that has a segment marker (when there are duplicates) below the given one if there is not an exact match', () => {
        const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
        const marker4: SegmentMarker = {line: 0, column: 30, position: 30, next: marker5};
        const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
        const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
        const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};
        const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
          (marker) => ({generatedSegment: marker}) as Mapping,
        );

        const marker: SegmentMarker = {line: 0, column: 35, position: 35, next: undefined};
        const index = findLastMappingIndexBefore(mappings, marker, /* exclusive */ false, 0);
        expect(index).toEqual(3);
      });

      it('should find the last mapping if the segment marker is higher than all of them', () => {
        const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
        const marker4: SegmentMarker = {line: 0, column: 40, position: 40, next: marker5};
        const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
        const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
        const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};
        const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
          (marker) => ({generatedSegment: marker}) as Mapping,
        );

        const marker: SegmentMarker = {line: 0, column: 60, position: 60, next: undefined};

        const index = findLastMappingIndexBefore(mappings, marker, /* exclusive */ false, 0);
        expect(index).toEqual(4);
      });

      it('should return -1 if the segment marker is lower than all of them', () => {
        const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
        const marker4: SegmentMarker = {line: 0, column: 40, position: 40, next: marker5};
        const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
        const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
        const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};
        const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
          (marker) => ({generatedSegment: marker}) as Mapping,
        );

        const marker: SegmentMarker = {line: 0, column: 5, position: 5, next: undefined};

        const index = findLastMappingIndexBefore(mappings, marker, /* exclusive */ false, 0);
        expect(index).toEqual(-1);
      });

      describe('[exact match inclusive]', () => {
        it('should find the matching segment marker mapping index if there is only one of them', () => {
          const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
          const marker4: SegmentMarker = {line: 0, column: 40, position: 40, next: marker5};
          const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
          const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
          const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};

          const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
            (marker) => ({generatedSegment: marker}) as Mapping,
          );
          const index = findLastMappingIndexBefore(mappings, marker3, /* exclusive */ false, 0);
          expect(index).toEqual(2);
        });

        it('should find the highest matching segment marker mapping index if there is more than one of them', () => {
          const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
          const marker4: SegmentMarker = {line: 0, column: 30, position: 30, next: marker5};
          const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
          const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
          const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};

          const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
            (marker) => ({generatedSegment: marker}) as Mapping,
          );
          const index = findLastMappingIndexBefore(mappings, marker3, /* exclusive */ false, 0);
          expect(index).toEqual(3);
        });
      });

      describe('[exact match exclusive]', () => {
        it('should find the preceding mapping index if there is a matching segment marker', () => {
          const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
          const marker4: SegmentMarker = {line: 0, column: 40, position: 40, next: marker5};
          const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
          const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
          const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};

          const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
            (marker) => ({generatedSegment: marker}) as Mapping,
          );
          const index = findLastMappingIndexBefore(mappings, marker3, /* exclusive */ true, 0);
          expect(index).toEqual(1);
        });

        it('should find the highest preceding mapping index if there is more than one matching segment marker', () => {
          const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
          const marker4: SegmentMarker = {line: 0, column: 30, position: 30, next: marker5};
          const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
          const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
          const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};

          const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
            (marker) => ({generatedSegment: marker}) as Mapping,
          );
          const index = findLastMappingIndexBefore(mappings, marker3, /* exclusive */ false, 0);
          expect(index).toEqual(3);
        });
      });

      describe('[with lowerIndex hint', () => {
        it('should find the highest mapping index above the lowerIndex hint that has a segment marker below the given one if there is not an exact match', () => {
          const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
          const marker4: SegmentMarker = {line: 0, column: 40, position: 40, next: marker5};
          const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
          const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
          const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};
          const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
            (marker) => ({generatedSegment: marker}) as Mapping,
          );

          const marker: SegmentMarker = {line: 0, column: 35, position: 35, next: undefined};
          const index = findLastMappingIndexBefore(mappings, marker, /* exclusive */ false, 1);
          expect(index).toEqual(2);
        });

        it('should return the lowerIndex mapping index if there is a single exact match and we are not exclusive', () => {
          const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
          const marker4: SegmentMarker = {line: 0, column: 40, position: 40, next: marker5};
          const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
          const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
          const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};
          const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
            (marker) => ({generatedSegment: marker}) as Mapping,
          );

          const marker: SegmentMarker = {line: 0, column: 30, position: 30, next: undefined};
          const index = findLastMappingIndexBefore(mappings, marker, /* exclusive */ false, 2);
          expect(index).toEqual(2);
        });

        it('should return the lowerIndex mapping index if there are multiple exact matches and we are not exclusive', () => {
          const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
          const marker4: SegmentMarker = {line: 0, column: 30, position: 30, next: marker5};
          const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
          const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
          const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};
          const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
            (marker) => ({generatedSegment: marker}) as Mapping,
          );

          const marker: SegmentMarker = {line: 0, column: 30, position: 30, next: undefined};
          const index = findLastMappingIndexBefore(mappings, marker, /* exclusive */ false, 3);
          expect(index).toEqual(3);
        });

        it('should return -1 if the segment marker is lower than the lowerIndex hint', () => {
          const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
          const marker4: SegmentMarker = {line: 0, column: 40, position: 40, next: marker5};
          const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
          const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
          const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};
          const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
            (marker) => ({generatedSegment: marker}) as Mapping,
          );

          const marker: SegmentMarker = {line: 0, column: 25, position: 25, next: undefined};

          const index = findLastMappingIndexBefore(mappings, marker, /* exclusive */ false, 2);
          expect(index).toEqual(-1);
        });

        it('should return -1 if the segment marker is equal to the lowerIndex hint and we are exclusive', () => {
          const marker5: SegmentMarker = {line: 0, column: 50, position: 50, next: undefined};
          const marker4: SegmentMarker = {line: 0, column: 40, position: 40, next: marker5};
          const marker3: SegmentMarker = {line: 0, column: 30, position: 30, next: marker4};
          const marker2: SegmentMarker = {line: 0, column: 20, position: 20, next: marker3};
          const marker1: SegmentMarker = {line: 0, column: 10, position: 10, next: marker2};
          const mappings: Mapping[] = [marker1, marker2, marker3, marker4, marker5].map(
            (marker) => ({generatedSegment: marker}) as Mapping,
          );

          const marker: SegmentMarker = {line: 0, column: 30, position: 30, next: undefined};

          const index = findLastMappingIndexBefore(mappings, marker, /* exclusive */ true, 2);
          expect(index).toEqual(-1);
        });
      });
    });

    describe('ensureOriginalSegmentLinks', () => {
      it('should add `next` properties to each segment that point to the next segment in the same source file', () => {
        const sourceA = new SourceFile(_('/foo/src/a.js'), 'abcdefg', null, [], fs);
        const sourceB = new SourceFile(_('/foo/src/b.js'), '1234567', null, [], fs);
        const rawSourceMap: RawSourceMap = {
          mappings: encode([
            [
              [0, 0, 0, 0],
              [2, 1, 0, 3],
              [4, 0, 0, 2],
              [5, 1, 0, 5],
              [6, 1, 0, 2],
            ],
          ]),
          names: [],
          sources: ['a.js', 'b.js'],
          version: 3,
        };
        const mappings = parseMappings(rawSourceMap, [sourceA, sourceB], [0, 8]);
        ensureOriginalSegmentLinks(mappings);
        expect(mappings[0].originalSegment.next).toBe(mappings[2].originalSegment);
        expect(mappings[1].originalSegment.next).toBe(mappings[3].originalSegment);
        expect(mappings[2].originalSegment.next).toBeUndefined();
        expect(mappings[3].originalSegment.next).toBeUndefined();
        expect(mappings[4].originalSegment.next).toBe(mappings[1].originalSegment);
      });
    });

    describe('SourceFile', () => {
      describe('flattenedMappings', () => {
        it('should be an empty array for source files with no source map', () => {
          const sourceFile = new SourceFile(_('/foo/src/index.js'), 'index contents', null, [], fs);
          expect(sourceFile.flattenedMappings).toEqual([]);
        });

        it('should be empty array for source files with no source map mappings', () => {
          const rawSourceMap: SourceMapInfo = {
            map: {mappings: '', names: [], sources: [], version: 3},
            mapPath: null,
            origin: ContentOrigin.Provided,
          };
          const sourceFile = new SourceFile(
            _('/foo/src/index.js'),
            'index contents',
            rawSourceMap,
            [],
            fs,
          );
          expect(sourceFile.flattenedMappings).toEqual([]);
        });

        it('should be the same as non-flat mappings if there is only one level of source map', () => {
          const rawSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [0, 0, 0, 0],
                  [6, 0, 0, 3],
                ],
              ]),
              names: [],
              sources: ['a.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const originalSource = new SourceFile(_('/foo/src/a.js'), 'abcdefg', null, [], fs);
          const sourceFile = new SourceFile(
            _('/foo/src/index.js'),
            'abc123defg',
            rawSourceMap,
            [originalSource],
            fs,
          );
          expect(removeOriginalSegmentLinks(sourceFile.flattenedMappings)).toEqual(
            parseMappings(rawSourceMap.map, [originalSource], [0, 11]),
          );
        });

        it('should merge mappings from flattened original source files', () => {
          const cSource = new SourceFile(_('/foo/src/c.js'), 'bcd123', null, [], fs);
          const dSource = new SourceFile(_('/foo/src/d.js'), 'aef', null, [], fs);

          const bSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [0, 1, 0, 0],
                  [1, 0, 0, 0],
                  [4, 1, 0, 1],
                ],
              ]),
              names: [],
              sources: ['c.js', 'd.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const bSource = new SourceFile(
            _('/foo/src/b.js'),
            'abcdef',
            bSourceMap,
            [cSource, dSource],
            fs,
          );

          const aSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [0, 0, 0, 0],
                  [2, 0, 0, 3],
                  [4, 0, 0, 2],
                  [5, 0, 0, 5],
                ],
              ]),
              names: [],
              sources: ['b.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const aSource = new SourceFile(_('/foo/src/a.js'), 'abdecf', aSourceMap, [bSource], fs);

          expect(removeOriginalSegmentLinks(aSource.flattenedMappings)).toEqual([
            {
              generatedSegment: {line: 0, column: 0, position: 0, next: undefined},
              originalSource: dSource,
              originalSegment: {line: 0, column: 0, position: 0, next: undefined},
              name: undefined,
            },
            {
              generatedSegment: {line: 0, column: 1, position: 1, next: undefined},
              originalSource: cSource,
              originalSegment: {line: 0, column: 0, position: 0, next: undefined},
              name: undefined,
            },
            {
              generatedSegment: {line: 0, column: 2, position: 2, next: undefined},
              originalSource: cSource,
              originalSegment: {line: 0, column: 2, position: 2, next: undefined},
              name: undefined,
            },
            {
              generatedSegment: {line: 0, column: 3, position: 3, next: undefined},
              originalSource: dSource,
              originalSegment: {line: 0, column: 1, position: 1, next: undefined},
              name: undefined,
            },
            {
              generatedSegment: {line: 0, column: 4, position: 4, next: undefined},
              originalSource: cSource,
              originalSegment: {line: 0, column: 1, position: 1, next: undefined},
              name: undefined,
            },
            {
              generatedSegment: {line: 0, column: 5, position: 5, next: undefined},
              originalSource: dSource,
              originalSegment: {line: 0, column: 2, position: 2, next: undefined},
              name: undefined,
            },
          ]);
        });

        it('should ignore mappings to missing source files', () => {
          const bSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [1, 0, 0, 0],
                  [4, 0, 0, 3],
                  [4, 0, 0, 6],
                  [5, 0, 0, 7],
                ],
              ]),
              names: [],
              sources: ['c.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const bSource = new SourceFile(_('/foo/src/b.js'), 'abcdef', bSourceMap, [null], fs);
          const aSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [0, 0, 0, 0],
                  [2, 0, 0, 3],
                  [4, 0, 0, 2],
                  [5, 0, 0, 5],
                ],
              ]),
              names: [],
              sources: ['b.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const aSource = new SourceFile(_('/foo/src/a.js'), 'abdecf', aSourceMap, [bSource], fs);

          // These flattened mappings are just the mappings from a to b.
          // (The mappings to c are dropped since there is no source file to map
          // to.)
          expect(removeOriginalSegmentLinks(aSource.flattenedMappings)).toEqual(
            parseMappings(aSourceMap.map, [bSource], [0, 7]),
          );
        });

        /**
         * Clean out the links between original segments of each of the given `mappings`.
         *
         * @param mappings the mappings whose segments are to be cleaned.
         */
        function removeOriginalSegmentLinks(mappings: Mapping[]) {
          for (const mapping of mappings) {
            mapping.originalSegment.next = undefined;
          }
          return mappings;
        }
      });

      describe('renderFlattenedSourceMap()', () => {
        it('should convert the flattenedMappings into a raw source-map object', () => {
          const cSource = new SourceFile(_('/foo/src/c.js'), 'bcd123e', null, [], fs);
          const bToCSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [1, 0, 0, 0],
                  [4, 0, 0, 3],
                  [4, 0, 0, 6],
                  [5, 0, 0, 7],
                ],
              ]),
              names: [],
              sources: ['c.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const bSource = new SourceFile(
            _('/foo/src/b.js'),
            'abcdef',
            bToCSourceMap,
            [cSource],
            fs,
          );
          const aToBSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [0, 0, 0, 0],
                  [2, 0, 0, 3],
                  [4, 0, 0, 2],
                  [5, 0, 0, 5],
                ],
              ]),
              names: [],
              sources: ['b.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const aSource = new SourceFile(
            _('/foo/src/a.js'),
            'abdecf',
            aToBSourceMap,
            [bSource],
            fs,
          );

          const aTocSourceMap = aSource.renderFlattenedSourceMap();
          expect(aTocSourceMap.version).toEqual(3);
          expect(aTocSourceMap.file).toEqual('a.js');
          expect(aTocSourceMap.names).toEqual([]);
          expect(aTocSourceMap.sourceRoot).toBeUndefined();
          expect(aTocSourceMap.sources).toEqual(['c.js']);
          expect(aTocSourceMap.sourcesContent).toEqual(['bcd123e']);
          expect(aTocSourceMap.mappings).toEqual(
            encode([
              [
                [1, 0, 0, 0],
                [2, 0, 0, 2],
                [3, 0, 0, 3],
                [3, 0, 0, 6],
                [4, 0, 0, 1],
                [5, 0, 0, 7],
              ],
            ]),
          );
        });

        it('should handle mappings that map from lines outside of the actual content lines', () => {
          const bSource = new SourceFile(_('/foo/src/b.js'), 'abcdef', null, [], fs);
          const aToBSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [0, 0, 0, 0],
                  [2, 0, 0, 3],
                  [4, 0, 0, 2],
                  [5, 0, 0, 5],
                ],
                [
                  [0, 0, 0, 0], // Extra mapping from a non-existent line
                ],
              ]),
              names: [],
              sources: ['b.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const aSource = new SourceFile(
            _('/foo/src/a.js'),
            'abdecf',
            aToBSourceMap,
            [bSource],
            fs,
          );

          const aTocSourceMap = aSource.renderFlattenedSourceMap();
          expect(aTocSourceMap.version).toEqual(3);
          expect(aTocSourceMap.file).toEqual('a.js');
          expect(aTocSourceMap.names).toEqual([]);
          expect(aTocSourceMap.sourceRoot).toBeUndefined();
          expect(aTocSourceMap.sources).toEqual(['b.js']);
          expect(aTocSourceMap.sourcesContent).toEqual(['abcdef']);
          expect(aTocSourceMap.mappings).toEqual(aToBSourceMap.map.mappings);
        });

        it('should consolidate source-files with the same relative path', () => {
          const cSource1 = new SourceFile(_('/foo/src/lib/c.js'), 'bcd123e', null, [], fs);
          const cSource2 = new SourceFile(_('/foo/src/lib/c.js'), 'bcd123e', null, [], fs);

          const bToCSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [1, 0, 0, 0],
                  [4, 0, 0, 3],
                  [4, 0, 0, 6],
                  [5, 0, 0, 7],
                ],
              ]),
              names: [],
              sources: ['c.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const bSource = new SourceFile(
            _('/foo/src/lib/b.js'),
            'abcdef',
            bToCSourceMap,
            [cSource1],
            fs,
          );

          const aToBCSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [0, 0, 0, 0],
                  [2, 0, 0, 3],
                  [4, 0, 0, 2],
                  [5, 0, 0, 5],
                  [6, 1, 0, 3],
                ],
              ]),
              names: [],
              sources: ['lib/b.js', 'lib/c.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const aSource = new SourceFile(
            _('/foo/src/a.js'),
            'abdecf123',
            aToBCSourceMap,
            [bSource, cSource2],
            fs,
          );

          const aTocSourceMap = aSource.renderFlattenedSourceMap();
          expect(aTocSourceMap.version).toEqual(3);
          expect(aTocSourceMap.file).toEqual('a.js');
          expect(aTocSourceMap.names).toEqual([]);
          expect(aTocSourceMap.sourceRoot).toBeUndefined();
          expect(aTocSourceMap.sources).toEqual(['lib/c.js']);
          expect(aTocSourceMap.sourcesContent).toEqual(['bcd123e']);
          expect(aTocSourceMap.mappings).toEqual(
            encode([
              [
                [1, 0, 0, 0],
                [2, 0, 0, 2],
                [3, 0, 0, 3],
                [3, 0, 0, 6],
                [4, 0, 0, 1],
                [5, 0, 0, 7],
                [6, 0, 0, 3],
              ],
            ]),
          );
        });
      });

      describe('getOriginalLocation()', () => {
        it('should return null for source files with no flattened mappings', () => {
          const sourceFile = new SourceFile(_('/foo/src/index.js'), 'index contents', null, [], fs);
          expect(sourceFile.getOriginalLocation(1, 1)).toEqual(null);
        });

        it('should return offset locations in multiple flattened original source files', () => {
          const cSource = new SourceFile(_('/foo/src/c.js'), 'bcd123', null, [], fs);
          const dSource = new SourceFile(_('/foo/src/d.js'), 'aef', null, [], fs);

          const bSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [0, 1, 0, 0], // "a" is in d.js [source 1]
                  [1, 0, 0, 0], // "bcd" are in c.js [source 0]
                  [4, 1, 0, 1], // "ef" are in d.js [source 1]
                ],
              ]),
              names: [],
              sources: ['c.js', 'd.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const bSource = new SourceFile(
            _('/foo/src/b.js'),
            'abcdef',
            bSourceMap,
            [cSource, dSource],
            fs,
          );

          const aSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [0, 0, 0, 0],
                  [2, 0, 0, 3], // "c" is missing from first line
                ],
                [
                  [4, 0, 0, 2], // second line has new indentation, and starts
                  // with "c"
                  [5, 0, 0, 5], // "f" is here
                ],
              ]),
              names: [],
              sources: ['b.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const aSource = new SourceFile(
            _('/foo/src/a.js'),
            'abde\n    cf',
            aSourceMap,
            [bSource],
            fs,
          );

          // Line 0
          expect(aSource.getOriginalLocation(0, 0)) // a
            .toEqual({file: dSource.sourcePath, line: 0, column: 0});
          expect(aSource.getOriginalLocation(0, 1)) // b
            .toEqual({file: cSource.sourcePath, line: 0, column: 0});
          expect(aSource.getOriginalLocation(0, 2)) // d
            .toEqual({file: cSource.sourcePath, line: 0, column: 2});
          expect(aSource.getOriginalLocation(0, 3)) // e
            .toEqual({file: dSource.sourcePath, line: 0, column: 1});
          expect(aSource.getOriginalLocation(0, 4)) // off the end of the line
            .toEqual({file: dSource.sourcePath, line: 0, column: 2});

          // Line 1
          expect(aSource.getOriginalLocation(1, 0)) // indent
            .toEqual({file: dSource.sourcePath, line: 0, column: 3});
          expect(aSource.getOriginalLocation(1, 1)) // indent
            .toEqual({file: dSource.sourcePath, line: 0, column: 4});
          expect(aSource.getOriginalLocation(1, 2)) // indent
            .toEqual({file: dSource.sourcePath, line: 0, column: 5});
          expect(aSource.getOriginalLocation(1, 3)) // indent
            .toEqual({file: dSource.sourcePath, line: 0, column: 6});
          expect(aSource.getOriginalLocation(1, 4)) // c
            .toEqual({file: cSource.sourcePath, line: 0, column: 1});
          expect(aSource.getOriginalLocation(1, 5)) // f
            .toEqual({file: dSource.sourcePath, line: 0, column: 2});
          expect(aSource.getOriginalLocation(1, 6)) // off the end of the line
            .toEqual({file: dSource.sourcePath, line: 0, column: 3});
        });

        it('should return offset locations across multiple lines', () => {
          const originalSource = new SourceFile(
            _('/foo/src/original.js'),
            'abcdef\nghijk\nlmnop',
            null,
            [],
            fs,
          );
          const generatedSourceMap: SourceMapInfo = {
            mapPath: null,
            map: {
              mappings: encode([
                [
                  [0, 0, 0, 0], // "ABC" [0,0] => [0,0]
                ],
                [
                  [0, 0, 1, 0], // "GHIJ" [1, 0] => [1,0]
                  [4, 0, 0, 3], // "DEF" [1, 4] => [0,3]
                  [7, 0, 1, 4], // "K" [1, 7] => [1,4]
                ],
                [
                  [0, 0, 2, 0], // "LMNOP" [2,0] => [2,0]
                ],
              ]),
              names: [],
              sources: ['original.js'],
              version: 3,
            },
            origin: ContentOrigin.Provided,
          };
          const generatedSource = new SourceFile(
            _('/foo/src/generated.js'),
            'ABC\nGHIJDEFK\nLMNOP',
            generatedSourceMap,
            [originalSource],
            fs,
          );

          // Line 0
          expect(generatedSource.getOriginalLocation(0, 0)) // A
            .toEqual({file: originalSource.sourcePath, line: 0, column: 0});
          expect(generatedSource.getOriginalLocation(0, 1)) // B
            .toEqual({file: originalSource.sourcePath, line: 0, column: 1});
          expect(generatedSource.getOriginalLocation(0, 2)) // C
            .toEqual({file: originalSource.sourcePath, line: 0, column: 2});
          expect(generatedSource.getOriginalLocation(0, 3)) // off the end of line 0
            .toEqual({file: originalSource.sourcePath, line: 0, column: 3});

          // Line 1
          expect(generatedSource.getOriginalLocation(1, 0)) // G
            .toEqual({file: originalSource.sourcePath, line: 1, column: 0});
          expect(generatedSource.getOriginalLocation(1, 1)) // H
            .toEqual({file: originalSource.sourcePath, line: 1, column: 1});
          expect(generatedSource.getOriginalLocation(1, 2)) // I
            .toEqual({file: originalSource.sourcePath, line: 1, column: 2});
          expect(generatedSource.getOriginalLocation(1, 3)) // J
            .toEqual({file: originalSource.sourcePath, line: 1, column: 3});
          expect(generatedSource.getOriginalLocation(1, 4)) // D
            .toEqual({file: originalSource.sourcePath, line: 0, column: 3});
          expect(generatedSource.getOriginalLocation(1, 5)) // E
            .toEqual({file: originalSource.sourcePath, line: 0, column: 4});
          expect(generatedSource.getOriginalLocation(1, 6)) // F
            .toEqual({file: originalSource.sourcePath, line: 0, column: 5});
          expect(generatedSource.getOriginalLocation(1, 7)) // K
            .toEqual({file: originalSource.sourcePath, line: 1, column: 4});
          expect(generatedSource.getOriginalLocation(1, 8)) // off the end of line 1
            .toEqual({file: originalSource.sourcePath, line: 1, column: 5});

          // Line 2
          expect(generatedSource.getOriginalLocation(2, 0)) // L
            .toEqual({file: originalSource.sourcePath, line: 2, column: 0});
          expect(generatedSource.getOriginalLocation(2, 1)) // M
            .toEqual({file: originalSource.sourcePath, line: 2, column: 1});
          expect(generatedSource.getOriginalLocation(2, 2)) // N
            .toEqual({file: originalSource.sourcePath, line: 2, column: 2});
          expect(generatedSource.getOriginalLocation(2, 3)) // O
            .toEqual({file: originalSource.sourcePath, line: 2, column: 3});
          expect(generatedSource.getOriginalLocation(2, 4)) // P
            .toEqual({file: originalSource.sourcePath, line: 2, column: 4});
          expect(generatedSource.getOriginalLocation(2, 5)) // off the end of line 2
            .toEqual({file: originalSource.sourcePath, line: 2, column: 5});
        });
      });
    });

    describe('computeStartOfLinePositions()', () => {
      it('should compute the cumulative length of each line in the given string', () => {
        expect(computeStartOfLinePositions('')).toEqual([0]);
        expect(computeStartOfLinePositions('abc')).toEqual([0]);
        expect(computeStartOfLinePositions('\n')).toEqual([0, 1]);
        expect(computeStartOfLinePositions('\n\n')).toEqual([0, 1, 2]);
        expect(computeStartOfLinePositions('abc\n')).toEqual([0, 4]);
        expect(computeStartOfLinePositions('\nabc')).toEqual([0, 1]);
        expect(computeStartOfLinePositions('abc\ndefg')).toEqual([0, 4]);
        expect(computeStartOfLinePositions('abc\r\n')).toEqual([0, 5]);
        expect(computeStartOfLinePositions('abc\r\ndefg')).toEqual([0, 5]);
        expect(computeStartOfLinePositions('abc\uD83D\uDE80\ndef🚀\r\n')).toEqual([0, 6, 13]);
      });
    });
  });
});
