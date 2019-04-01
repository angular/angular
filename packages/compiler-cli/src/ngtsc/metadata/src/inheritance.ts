/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '../../imports';
import {DirectiveMeta, MetadataReader} from '../../metadata';
import {ClassDeclaration} from '../../reflection';

/**
 * Given a reference to a directive, return a flattened version of its `DirectiveMeta` metadata
 * which includes metadata from its entire inheritance chain.
 *
 * The returned `DirectiveMeta` will either have `baseClass: null` if the inheritance chain could be
 * fully resolved, or `baseClass: 'dynamic'` if the inheritance chain could not be completely
 * followed.
 */
export function flattenInheritedDirectiveMetadata(
    reader: MetadataReader, dir: Reference<ClassDeclaration>): DirectiveMeta {
  const topMeta = reader.getDirectiveMetadata(dir);
  if (topMeta === null) {
    throw new Error(`Metadata not found for directive: ${dir.debugName}`);
  }

  let inputs: {[key: string]: string | [string, string]} = {};
  let outputs: {[key: string]: string} = {};
  let isDynamic = false;

  const addMetadata = (meta: DirectiveMeta): void => {
    if (meta.baseClass === 'dynamic') {
      isDynamic = true;
    } else if (meta.baseClass !== null) {
      const baseMeta = reader.getDirectiveMetadata(meta.baseClass);
      if (baseMeta !== null) {
        addMetadata(baseMeta);
      } else {
        // Missing metadata for the base class means it's effectively dynamic.
        isDynamic = true;
      }
    }
    inputs = {...inputs, ...meta.inputs};
    outputs = {...outputs, ...meta.outputs};
  };

  addMetadata(topMeta);

  return {
    ...topMeta,
    inputs,
    outputs,
    baseClass: isDynamic ? 'dynamic' : null,
  };
}
