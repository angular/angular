/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {decode, encode, SourceMapMappings, SourceMapSegment} from '@jridgewell/sourcemap-codec';
import mapHelpers from 'convert-source-map';

import {AbsoluteFsPath, PathManipulation} from '../../file_system';

import {RawSourceMap, SourceMapInfo} from './raw_source_map';
import {compareSegments, offsetSegment, SegmentMarker} from './segment_marker';

export function removeSourceMapComments(contents: string): string {
  return mapHelpers.removeMapFileComments(mapHelpers.removeComments(contents))
      .replace(/\n\n$/, '\n');
}

export class SourceFile {
  /**
   * The parsed mappings that have been flattened so that any intermediate source mappings have been
   * flattened.
   *
   * The result is that any source file mentioned in the flattened mappings have no source map (are
   * pure original source files).
   */
  readonly flattenedMappings: Mapping[];
  readonly startOfLinePositions: number[];

  constructor(
      /** The path to this source file. */
      readonly sourcePath: AbsoluteFsPath,
      /** The contents of this source file. */
      readonly contents: string,
      /** The raw source map (if any) referenced by this source file. */
      readonly rawMap: SourceMapInfo|null,
      /** Any source files referenced by the raw source map associated with this source file. */
      readonly sources: (SourceFile|null)[],
      private fs: PathManipulation,
  ) {
    this.contents = removeSourceMapComments(contents);
    this.startOfLinePositions = computeStartOfLinePositions(this.contents);
    this.flattenedMappings = this.flattenMappings();
  }

  /**
   * Render the raw source map generated from the flattened mappings.
   */
  renderFlattenedSourceMap(): RawSourceMap {
    const sources = new IndexedMap<string, string>();
    const names = new IndexedSet<string>();
    const mappings: SourceMapMappings = [];
    const sourcePathDir = this.fs.dirname(this.sourcePath);
    // Computing the relative path can be expensive, and we are likely to have the same path for
    // many (if not all!) mappings.
    const relativeSourcePathCache =
        new Cache<string, string>(input => this.fs.relative(sourcePathDir, input));

    for (const mapping of this.flattenedMappings) {
      const sourceIndex = sources.set(
          relativeSourcePathCache.get(mapping.originalSource.sourcePath),
          mapping.originalSource.contents);
      const mappingArray: SourceMapSegment = [
        mapping.generatedSegment.column,
        sourceIndex,
        mapping.originalSegment.line,
        mapping.originalSegment.column,
      ];
      if (mapping.name !== undefined) {
        const nameIndex = names.add(mapping.name);
        mappingArray.push(nameIndex);
      }

      // Ensure a mapping line array for this mapping.
      const line = mapping.generatedSegment.line;
      while (line >= mappings.length) {
        mappings.push([]);
      }
      // Add this mapping to the line
      mappings[line].push(mappingArray);
    }

    const sourceMap: RawSourceMap = {
      version: 3,
      file: this.fs.relative(sourcePathDir, this.sourcePath),
      sources: sources.keys,
      names: names.values,
      mappings: encode(mappings),
      sourcesContent: sources.values,
    };
    return sourceMap;
  }

  /**
   * Find the original mapped location for the given `line` and `column` in the generated file.
   *
   * First we search for a mapping whose generated segment is at or directly before the given
   * location. Then we compute the offset between the given location and the matching generated
   * segment. Finally we apply this offset to the original source segment to get the desired
   * original location.
   */
  getOriginalLocation(line: number, column: number):
      {file: AbsoluteFsPath, line: number, column: number}|null {
    if (this.flattenedMappings.length === 0) {
      return null;
    }

    let position: number;
    if (line < this.startOfLinePositions.length) {
      position = this.startOfLinePositions[line] + column;
    } else {
      // The line is off the end of the file, so just assume we are at the end of the file.
      position = this.contents.length;
    }

    const locationSegment: SegmentMarker = {line, column, position, next: undefined};

    let mappingIndex =
        findLastMappingIndexBefore(this.flattenedMappings, locationSegment, false, 0);
    if (mappingIndex < 0) {
      mappingIndex = 0;
    }
    const {originalSegment, originalSource, generatedSegment} =
        this.flattenedMappings[mappingIndex];
    const offset = locationSegment.position - generatedSegment.position;
    const offsetOriginalSegment =
        offsetSegment(originalSource.startOfLinePositions, originalSegment, offset);

    return {
      file: originalSource.sourcePath,
      line: offsetOriginalSegment.line,
      column: offsetOriginalSegment.column,
    };
  }

  /**
   * Flatten the parsed mappings for this source file, so that all the mappings are to pure original
   * source files with no transitive source maps.
   */
  private flattenMappings(): Mapping[] {
    const mappings =
        parseMappings(this.rawMap && this.rawMap.map, this.sources, this.startOfLinePositions);
    ensureOriginalSegmentLinks(mappings);
    const flattenedMappings: Mapping[] = [];
    for (let mappingIndex = 0; mappingIndex < mappings.length; mappingIndex++) {
      const aToBmapping = mappings[mappingIndex];
      const bSource = aToBmapping.originalSource;
      if (bSource.flattenedMappings.length === 0) {
        // The b source file has no mappings of its own (i.e. it is a pure original file)
        // so just use the mapping as-is.
        flattenedMappings.push(aToBmapping);
        continue;
      }

      // The `incomingStart` and `incomingEnd` are the `SegmentMarker`s in `B` that represent the
      // section of `B` source file that is being mapped to by the current `aToBmapping`.
      //
      // For example, consider the mappings from A to B:
      //
      // src A   src B     mapping
      //
      //   a ----- a       [0, 0]
      //   b       b
      //   f -  /- c       [4, 2]
      //   g  \ /  d
      //   c -/\   e
      //   d    \- f       [2, 5]
      //   e
      //
      // For mapping [0,0] the incoming start and end are 0 and 2 (i.e. the range a, b, c)
      // For mapping [4,2] the incoming start and end are 2 and 5 (i.e. the range c, d, e, f)
      //
      const incomingStart = aToBmapping.originalSegment;
      const incomingEnd = incomingStart.next;

      // The `outgoingStartIndex` and `outgoingEndIndex` are the indices of the range of mappings
      // that leave `b` that we are interested in merging with the aToBmapping.
      // We actually care about all the markers from the last bToCmapping directly before the
      // `incomingStart` to the last bToCmaping directly before the `incomingEnd`, inclusive.
      //
      // For example, if we consider the range 2 to 5 from above (i.e. c, d, e, f) with the
      // following mappings from B to C:
      //
      //   src B   src C     mapping
      //     a
      //     b ----- b       [1, 0]
      //   - c       c
      //  |  d       d
      //  |  e ----- 1       [4, 3]
      //   - f  \    2
      //         \   3
      //          \- e       [4, 6]
      //
      // The range with `incomingStart` at 2 and `incomingEnd` at 5 has outgoing start mapping of
      // [1,0] and outgoing end mapping of [4, 6], which also includes [4, 3].
      //
      let outgoingStartIndex =
          findLastMappingIndexBefore(bSource.flattenedMappings, incomingStart, false, 0);
      if (outgoingStartIndex < 0) {
        outgoingStartIndex = 0;
      }
      const outgoingEndIndex = incomingEnd !== undefined ?
          findLastMappingIndexBefore(
              bSource.flattenedMappings, incomingEnd, true, outgoingStartIndex) :
          bSource.flattenedMappings.length - 1;

      for (let bToCmappingIndex = outgoingStartIndex; bToCmappingIndex <= outgoingEndIndex;
           bToCmappingIndex++) {
        const bToCmapping: Mapping = bSource.flattenedMappings[bToCmappingIndex];
        flattenedMappings.push(mergeMappings(this, aToBmapping, bToCmapping));
      }
    }
    return flattenedMappings;
  }
}

/**
 *
 * @param mappings The collection of mappings whose segment-markers we are searching.
 * @param marker The segment-marker to match against those of the given `mappings`.
 * @param exclusive If exclusive then we must find a mapping with a segment-marker that is
 * exclusively earlier than the given `marker`.
 * If not exclusive then we can return the highest mappings with an equivalent segment-marker to the
 * given `marker`.
 * @param lowerIndex If provided, this is used as a hint that the marker we are searching for has an
 * index that is no lower than this.
 */
export function findLastMappingIndexBefore(
    mappings: Mapping[], marker: SegmentMarker, exclusive: boolean, lowerIndex: number): number {
  let upperIndex = mappings.length - 1;
  const test = exclusive ? -1 : 0;

  if (compareSegments(mappings[lowerIndex].generatedSegment, marker) > test) {
    // Exit early since the marker is outside the allowed range of mappings.
    return -1;
  }

  let matchingIndex = -1;
  while (lowerIndex <= upperIndex) {
    const index = (upperIndex + lowerIndex) >> 1;
    if (compareSegments(mappings[index].generatedSegment, marker) <= test) {
      matchingIndex = index;
      lowerIndex = index + 1;
    } else {
      upperIndex = index - 1;
    }
  }
  return matchingIndex;
}

/**
 * A Mapping consists of two segment markers: one in the generated source and one in the original
 * source, which indicate the start of each segment. The end of a segment is indicated by the first
 * segment marker of another mapping whose start is greater or equal to this one.
 *
 * It may also include a name associated with the segment being mapped.
 */
export interface Mapping {
  readonly generatedSegment: SegmentMarker;
  readonly originalSource: SourceFile;
  readonly originalSegment: SegmentMarker;
  readonly name?: string;
}



/**
 * Merge two mappings that go from A to B and B to C, to result in a mapping that goes from A to C.
 */
export function mergeMappings(generatedSource: SourceFile, ab: Mapping, bc: Mapping): Mapping {
  const name = bc.name || ab.name;

  // We need to modify the segment-markers of the new mapping to take into account the shifts that
  // occur due to the combination of the two mappings.
  // For example:

  // * Simple map where the B->C starts at the same place the A->B ends:
  //
  // ```
  // A: 1 2 b c d
  //        |        A->B [2,0]
  //        |              |
  // B:     b c d    A->C [2,1]
  //        |                |
  //        |        B->C [0,1]
  // C:   a b c d e
  // ```

  // * More complicated case where diffs of segment-markers is needed:
  //
  // ```
  // A: b 1 2 c d
  //     \
  //      |            A->B  [0,1*]    [0,1*]
  //      |                   |         |+3
  // B: a b 1 2 c d    A->C  [0,1]     [3,2]
  //    |      /                |+1       |
  //    |     /        B->C [0*,0]    [4*,2]
  //    |    /
  // C: a b c d e
  // ```
  //
  // `[0,1]` mapping from A->C:
  // The difference between the "original segment-marker" of A->B (1*) and the "generated
  // segment-marker of B->C (0*): `1 - 0 = +1`.
  // Since it is positive we must increment the "original segment-marker" with `1` to give [0,1].
  //
  // `[3,2]` mapping from A->C:
  // The difference between the "original segment-marker" of A->B (1*) and the "generated
  // segment-marker" of B->C (4*): `1 - 4 = -3`.
  // Since it is negative we must increment the "generated segment-marker" with `3` to give [3,2].

  const diff = compareSegments(bc.generatedSegment, ab.originalSegment);
  if (diff > 0) {
    return {
      name,
      generatedSegment:
          offsetSegment(generatedSource.startOfLinePositions, ab.generatedSegment, diff),
      originalSource: bc.originalSource,
      originalSegment: bc.originalSegment,
    };
  } else {
    return {
      name,
      generatedSegment: ab.generatedSegment,
      originalSource: bc.originalSource,
      originalSegment:
          offsetSegment(bc.originalSource.startOfLinePositions, bc.originalSegment, -diff),
    };
  }
}

/**
 * Parse the `rawMappings` into an array of parsed mappings, which reference source-files provided
 * in the `sources` parameter.
 */
export function parseMappings(
    rawMap: RawSourceMap|null, sources: (SourceFile|null)[],
    generatedSourceStartOfLinePositions: number[]): Mapping[] {
  if (rawMap === null) {
    return [];
  }

  const rawMappings = decode(rawMap.mappings);
  if (rawMappings === null) {
    return [];
  }

  const mappings: Mapping[] = [];
  for (let generatedLine = 0; generatedLine < rawMappings.length; generatedLine++) {
    const generatedLineMappings = rawMappings[generatedLine];
    for (const rawMapping of generatedLineMappings) {
      if (rawMapping.length >= 4) {
        const originalSource = sources[rawMapping[1]!];
        if (originalSource === null || originalSource === undefined) {
          // the original source is missing so ignore this mapping
          continue;
        }
        const generatedColumn = rawMapping[0];
        const name = rawMapping.length === 5 ? rawMap.names[rawMapping[4]] : undefined;
        const line = rawMapping[2]!;
        const column = rawMapping[3]!;
        const generatedSegment: SegmentMarker = {
          line: generatedLine,
          column: generatedColumn,
          position: generatedSourceStartOfLinePositions[generatedLine] + generatedColumn,
          next: undefined,
        };
        const originalSegment: SegmentMarker = {
          line,
          column,
          position: originalSource.startOfLinePositions[line] + column,
          next: undefined,
        };
        mappings.push({name, generatedSegment, originalSegment, originalSource});
      }
    }
  }
  return mappings;
}

/**
 * Extract the segment markers from the original source files in each mapping of an array of
 * `mappings`.
 *
 * @param mappings The mappings whose original segments we want to extract
 * @returns Return a map from original source-files (referenced in the `mappings`) to arrays of
 * segment-markers sorted by their order in their source file.
 */
export function extractOriginalSegments(mappings: Mapping[]): Map<SourceFile, SegmentMarker[]> {
  const originalSegments = new Map<SourceFile, SegmentMarker[]>();
  for (const mapping of mappings) {
    const originalSource = mapping.originalSource;
    if (!originalSegments.has(originalSource)) {
      originalSegments.set(originalSource, []);
    }
    const segments = originalSegments.get(originalSource)!;
    segments.push(mapping.originalSegment);
  }
  originalSegments.forEach(segmentMarkers => segmentMarkers.sort(compareSegments));
  return originalSegments;
}

/**
 * Update the original segments of each of the given `mappings` to include a link to the next
 * segment in the source file.
 *
 * @param mappings the mappings whose segments should be updated
 */
export function ensureOriginalSegmentLinks(mappings: Mapping[]): void {
  const segmentsBySource = extractOriginalSegments(mappings);
  segmentsBySource.forEach(markers => {
    for (let i = 0; i < markers.length - 1; i++) {
      markers[i].next = markers[i + 1];
    }
  });
}

export function computeStartOfLinePositions(str: string) {
  // The `1` is to indicate a newline character between the lines.
  // Note that in the actual contents there could be more than one character that indicates a
  // newline
  // - e.g. \r\n - but that is not important here since segment-markers are in line/column pairs and
  // so differences in length due to extra `\r` characters do not affect the algorithms.
  const NEWLINE_MARKER_OFFSET = 1;
  const lineLengths = computeLineLengths(str);
  const startPositions = [0];  // First line starts at position 0
  for (let i = 0; i < lineLengths.length - 1; i++) {
    startPositions.push(startPositions[i] + lineLengths[i] + NEWLINE_MARKER_OFFSET);
  }
  return startPositions;
}

function computeLineLengths(str: string): number[] {
  return (str.split(/\n/)).map(s => s.length);
}

/**
 * A collection of mappings between `keys` and `values` stored in the order in which the keys are
 * first seen.
 *
 * The difference between this and a standard `Map` is that when you add a key-value pair the index
 * of the `key` is returned.
 */
class IndexedMap<K, V> {
  private map = new Map<K, number>();

  /**
   * An array of keys added to this map.
   *
   * This array is guaranteed to be in the order of the first time the key was added to the map.
   */
  readonly keys: K[] = [];

  /**
   * An array of values added to this map.
   *
   * This array is guaranteed to be in the order of the first time the associated key was added to
   * the map.
   */
  readonly values: V[] = [];

  /**
   * Associate the `value` with the `key` and return the index of the key in the collection.
   *
   * If the `key` already exists then the `value` is not set and the index of that `key` is
   * returned; otherwise the `key` and `value` are stored and the index of the new `key` is
   * returned.
   *
   * @param key the key to associated with the `value`.
   * @param value the value to associated with the `key`.
   * @returns the index of the `key` in the `keys` array.
   */
  set(key: K, value: V): number {
    if (this.map.has(key)) {
      return this.map.get(key)!;
    }
    const index = this.values.push(value) - 1;
    this.keys.push(key);
    this.map.set(key, index);
    return index;
  }
}

/**
 * A collection of `values` stored in the order in which they were added.
 *
 * The difference between this and a standard `Set` is that when you add a value the index of that
 * item is returned.
 */
class IndexedSet<V> {
  private map = new Map<V, number>();

  /**
   * An array of values added to this set.
   * This array is guaranteed to be in the order of the first time the value was added to the set.
   */
  readonly values: V[] = [];

  /**
   * Add the `value` to the `values` array, if it doesn't already exist; returning the index of the
   * `value` in the `values` array.
   *
   * If the `value` already exists then the index of that `value` is returned, otherwise the new
   * `value` is stored and the new index returned.
   *
   * @param value the value to add to the set.
   * @returns the index of the `value` in the `values` array.
   */
  add(value: V): number {
    if (this.map.has(value)) {
      return this.map.get(value)!;
    }
    const index = this.values.push(value) - 1;
    this.map.set(value, index);
    return index;
  }
}

class Cache<Input, Cached> {
  private map = new Map<Input, Cached>();
  constructor(private computeFn: (input: Input) => Cached) {}
  get(input: Input): Cached {
    if (!this.map.has(input)) {
      this.map.set(input, this.computeFn(input));
    }
    return this.map.get(input)!;
  }
}
