/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {WorkspaceProject} from '@schematics/angular/utility/config';
import {DefaultTreeDocument, DefaultTreeElement, parse as parseHtml} from 'parse5';
import {getChildElementIndentation} from '../../utils/parse5-element';
import {getIndexHtmlPath} from './project-index-html';

/** Appends the given element HTML fragment to the index.html head tag. */
export function appendElementToHead(host: Tree, project: WorkspaceProject, elementHtml: string) {
  const indexPath = getIndexHtmlPath(project);
  const indexHtmlBuffer = host.read(indexPath);

  if (!indexHtmlBuffer) {
    throw new SchematicsException(`Could not find file for path: ${indexPath}`);
  }

  const htmlContent = indexHtmlBuffer.toString();

  if (htmlContent.includes(elementHtml)) {
    return;
  }

  const headTag = getHeadTagElement(htmlContent);

  if (!headTag) {
    throw `Could not find '<head>' element in HTML file: ${indexPath}`;
  }

  const endTagOffset = headTag.sourceCodeLocation.endTag.startOffset;
  const indentationOffset = getChildElementIndentation(headTag);
  const insertion = `${' '.repeat(indentationOffset)}${elementHtml}`;

  const recordedChange = host
    .beginUpdate(indexPath)
    .insertRight(endTagOffset, `${insertion}\n`);

  host.commitUpdate(recordedChange);
}

/** Parses the given HTML file and returns the head element if available. */
export function getHeadTagElement(src: string): DefaultTreeElement | null {
  const document = parseHtml(src, {sourceCodeLocationInfo: true}) as DefaultTreeDocument;
  const nodeQueue = [...document.childNodes];

  while (nodeQueue.length) {
    const node = nodeQueue.shift() as DefaultTreeElement;

    if (node.nodeName.toLowerCase() === 'head') {
      return node;
    } else if (node.childNodes) {
      nodeQueue.push(...node.childNodes);
    }
  }

  return null;
}
