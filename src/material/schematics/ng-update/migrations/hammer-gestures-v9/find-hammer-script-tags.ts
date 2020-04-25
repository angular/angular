/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parse5} from '@angular/cdk/schematics';

/**
 * Parses the specified HTML content and looks for "script" elements which
 * potentially import HammerJS. These elements will be returned.
 */
export function findHammerScriptImportElements(htmlContent: string): parse5.DefaultTreeElement[] {
  const document =
      parse5.parse(htmlContent, {sourceCodeLocationInfo: true}) as parse5.DefaultTreeDocument;
  const nodeQueue = [...document.childNodes];
  const result: parse5.DefaultTreeElement[] = [];

  while (nodeQueue.length) {
    const node = nodeQueue.shift() as parse5.DefaultTreeElement;

    if (node.childNodes) {
      nodeQueue.push(...node.childNodes);
    }

    if (node.nodeName.toLowerCase() === 'script' && node.attrs.length !== 0) {
      const srcAttribute = node.attrs.find(a => a.name === 'src');
      if (srcAttribute && isPotentialHammerScriptReference(srcAttribute.value)) {
        result.push(node);
      }
    }
  }
  return result;
}

/**
 * Checks whether the specified source path is potentially referring to the
 * HammerJS script output.
 */
function isPotentialHammerScriptReference(srcPath: string): boolean {
  return /\/hammer(\.min)?\.js($|\?)/.test(srcPath);
}
