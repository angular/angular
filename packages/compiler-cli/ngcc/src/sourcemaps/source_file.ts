/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {removeComments, removeMapFileComments} from 'convert-source-map';
import {SourceMapMappings, SourceMapSegment, decode, encode} from 'sourcemap-codec';
import {AbsoluteFsPath, dirname, relative} from '../../../src/ngtsc/file_system';
import {RawSourceMap} from './raw_source_map';
import {SegmentMarker, compareSegments, offsetSegment, segmentDiff} from './segment_marker';

export function removeSourceMapComments(contents: string): string {
  return removeMapFileComments(removeComments(contents)).replace(/\n\n$/, '\n');
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
  readonly lineLengths: number[];

  constructor(
      /** The path to this source file. */
      readonly sourcePath: AbsoluteFsPath,
      /** The contents of this source file. */
      readonly contents: string,
      /** The raw source map (if any) associated with this source file. */
      readonly rawMap: RawSourceMap|null,
      /** Whether this source file's source map was inline or external. */
      readonly inline: boolean,
      /** Any source files referenced by the raw source map associated with this source file. */
      readonly sources: (SourceFile|null)[]) {
    this.contents = removeSourceMapComments(contents);
    this.lineLengths = computeLineLengths(this.contents);
    this.flattenedMappings = this.flattenMappings();
  }

  /**
   * Render the raw source map generated from the flattened mappings.
   */
  renderFlattenedSourceMap(): RawSourceMap {
    const sources: SourceFile[] = [];
    const names: string[] = [];

    // Ensure a mapping line array for each line in the generated source.
    const mappings: SourceMapMappings = this.lineLengths.map(() => []);

    for (const mapping of this.flattenedMappings) {
      const mappingLine = mappings[mapping.generatedSegment.line];
      const sourceIndex = findIndexOrAdd(sources, mapping.originalSource);
      const mappingArray: SourceMapSegment = [
        mapping.generatedSegment.column,
        sourceIndex,
        mapping.originalSegment.line,
        mapping.originalSegment.column,
      ];
      if (mapping.name !== undefined) {
        const nameIndex = findIndexOrAdd(names, mapping.name);
        mappingArray.push(nameIndex);
      }
      mappingLine.push(mappingArray);
    }

    const sourcePathDir = dirname(this.sourcePath);
    const sourceMap: RawSourceMap = {
      version: 3,
      file: relative(sourcePathDir, this.sourcePath),
      sources: sources.map(sf => relative(sourcePathDir, sf.sourcePath)), names,
      mappings: encode(mappings),
      sourcesContent: sources.map(sf => sf.contents),
    };
    return sourceMap;
  }

  /**
   * Flatten the parsed mappings for this source file, so that all the mappings are to pure original
   * source files with no transitive source maps.
   */
  private flattenMappings(): Mapping[] {
    const mappings = parseMappings(this.rawMap, this.sources);
    const originalSegments = extractOriginalSegments(mappings);
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
      const incomingEndIndex = originalSegments.indexOf(incomingStart) + 1;
      const incomingEnd = incomingEndIndex < originalSegments.length ?
          originalSegments[incomingEndIndex] :
          undefined;

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
      let outgoingStartIndex = findLastIndex(
          bSource.flattenedMappings,
          mapping => compareSegments(mapping.generatedSegment, incomingStart) <= 0);
      if (outgoingStartIndex < 0) {
        outgoingStartIndex = 0;
      }
      const outgoingEndIndex = incomingEnd !== undefined ?
          findLastIndex(
              bSource.flattenedMappings,
              mapping => compareSegments(mapping.generatedSegment, incomingEnd) < 0) :
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

function findLastIndex<T>(items: T[], predicate: (item: T) => boolean): number {
  for (let index = items.length - 1; index >= 0; index--) {
    if (predicate(items[index])) {
      return index;
    }
  }
  return -1;
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
 * Find the index of `item` in the `items` array.
 * If it is not found, then push `item` to the end of the array and return its new index.
 *
 * @param items the collection in which to look for `item`.
 * @param item the item to look for.
 * @returns the index of the `item` in the `items` array.
 */
function findIndexOrAdd<T>(items: T[], item: T): number {
  const itemIndex = items.indexOf(item);
  if (itemIndex > -1) {
    return itemIndex;
  } else {
    items.push(item);
    return items.length - 1;
  }
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

  const diff = segmentDiff(ab.originalSource.lineLengths, ab.originalSegment, bc.generatedSegment);
  if (diff > 0) {
    return {
      name,
      generatedSegment: offsetSegment(generatedSource.lineLengths, ab.generatedSegment, diff),
      originalSource: bc.originalSource,
      originalSegment: bc.originalSegment,
    };
  } else {
    return {
      name,
      generatedSegment: ab.generatedSegment,
      originalSource: bc.originalSource,
      originalSegment: offsetSegment(bc.originalSource.lineLengths, bc.originalSegment, -diff),
    };
  }
}

/**
 * Parse the `rawMappings` into an array of parsed mappings, which reference source-files provided
 * in the `sources` parameter.
 */
export function parseMappings(
    rawMap: RawSourceMap | null, sources: (SourceFile | null)[]): Mapping[] {
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
        const generatedColumn = rawMapping[0];
        const name = rawMapping.length === 5 ? rawMap.names[rawMapping[4]] : undefined;
        const mapping: Mapping = {
          generatedSegment: {line: generatedLine, column: generatedColumn},
          originalSource: sources[rawMapping[1] !] !,
          originalSegment: {line: rawMapping[2] !, column: rawMapping[3] !}, name
        };
        mappings.push(mapping);
      }
    }
  }
  return mappings;
}

export function extractOriginalSegments(mappings: Mapping[]): SegmentMarker[] {
  return mappings.map(mapping => mapping.originalSegment).sort(compareSegments);
}

export function computeLineLengths(str: string): number[] {
  return (str.split(/\r?\n/)).map(s => s.length);
}
