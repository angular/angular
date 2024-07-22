/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import {MetadataFile, SerializableForBatching} from './metadata_file';
import {InputReference, InputReferenceKind} from '../utils/input_reference';

/** Merges a list of metadata files into a combined global file. */
export async function mergeMetadataFilesViaPath(absoluteMetadataFiles: string[]) {
  mergeMetadataFiles(
    await Promise.all(
      absoluteMetadataFiles.map(
        async (filePath) =>
          JSON.parse(await fs.promises.readFile(filePath, 'utf8')) as MetadataFile,
      ),
    ),
  );
}

/** Merges a list of metadata files into a combined global file. */
export function mergeMetadataFiles(metadataFiles: MetadataFile[]) {
  const result: MetadataFile = {
    knownInputs: {},
    references: [],
  };

  const seenReferenceFromIds = new Set<string>();

  for (const file of metadataFiles) {
    for (const [key, info] of Object.entries(file.knownInputs)) {
      const existing = result.knownInputs[key];
      if (existing === undefined) {
        result.knownInputs[key] = info;
      } else if (existing.isIncompatible === null && info.isIncompatible) {
        // input might not be incompatible in one target, but others might invalidate it.
        // merge the incompatibility state.
        existing.isIncompatible = info.isIncompatible;
      }
    }

    for (const reference of file.references) {
      const referenceId = computeReferenceId(reference);
      if (seenReferenceFromIds.has(referenceId)) {
        continue;
      }
      seenReferenceFromIds.add(referenceId);
      result.references.push(reference);
    }
  }

  process.stdout.write(JSON.stringify(result));
}

/** Computes a unique ID for the given reference. */
function computeReferenceId(reference: SerializableForBatching<InputReference>): string {
  if (reference.kind === InputReferenceKind.InTemplate) {
    return `${reference.from.templateFileId}@@${reference.from.read.positionEndInFile}`;
  } else if (reference.kind === InputReferenceKind.InHostBinding) {
    // `read` position is commonly relative to the host property node position— so we need
    // to make it absolute by incorporating the host node position.
    return (
      `${reference.from.fileId}@@${reference.from.hostPropertyNode.positionEndInFile}` +
      `@@${reference.from.read.positionEndInFile}`
    );
  } else {
    return `${reference.from.fileId}@@${reference.from.node.positionEndInFile}`;
  }
}
