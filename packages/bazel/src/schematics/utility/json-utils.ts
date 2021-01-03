/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {JsonAstNode, JsonAstObject, JsonValue} from '@angular-devkit/core';
import {UpdateRecorder} from '@angular-devkit/schematics';
import {findPropertyInAstObject} from '@schematics/angular/utility/json-utils';

/**
 * Replace the value of the key-value pair in the 'node' object with a different
 * 'value' and record the update using the specified 'recorder'.
 */
export function replacePropertyInAstObject(
    recorder: UpdateRecorder, node: JsonAstObject, propertyName: string, value: JsonValue,
    indent: number = 0) {
  const property = findPropertyInAstObject(node, propertyName);
  if (property === null) {
    throw new Error(`Property '${propertyName}' does not exist in JSON object`);
  }
  const {start, text} = property;
  recorder.remove(start.offset, text.length);
  const indentStr = '\n' +
      ' '.repeat(indent);
  const content = JSON.stringify(value, null, '  ').replace(/\n/g, indentStr);
  recorder.insertLeft(start.offset, content);
}

/**
 * Remove the key-value pair with the specified 'key' in the specified 'node'
 * object and record the update using the specified 'recorder'.
 */
export function removeKeyValueInAstObject(
    recorder: UpdateRecorder, content: string, node: JsonAstObject, key: string) {
  for (const [i, prop] of node.properties.entries()) {
    if (prop.key.value === key) {
      const start = prop.start.offset;
      const end = prop.end.offset;
      let length = end - start;
      const match = content.slice(end).match(/^[,\s]+/);
      if (match) {
        length += match.pop()!.length;
      }
      recorder.remove(start, length);
      if (i === node.properties.length - 1) {  // last property
        let offset = 0;
        while (/(,|\s)/.test(content.charAt(start - offset - 1))) {
          offset++;
        }
        recorder.remove(start - offset, offset);
      }
      return;
    }
  }
}

/**
 * Returns true if the specified 'node' is a JsonAstObject, false otherwise.
 */
export function isJsonAstObject(node: JsonAstNode|null): node is JsonAstObject {
  return !!node && node.kind === 'object';
}
