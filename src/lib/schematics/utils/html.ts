/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Tree, SchematicsException} from '@angular-devkit/schematics';
import {parse as parseHtml, DefaultTreeDocument, DefaultTreeElement} from 'parse5';
import {getIndexHtmlPath} from './ast';
import {InsertChange} from '@schematics/angular/utility/change';
import {WorkspaceProject} from '@schematics/angular/utility/config';

/**
 * Parses the index.html file to get the HEAD tag position.
 * @param src the src path of the html file to parse
 */
export function getHeadTag(src: string) {
  const document = parseHtml(src, {sourceCodeLocationInfo: true}) as DefaultTreeDocument;

  let head: DefaultTreeElement;
  const visitNodes = nodes => {
    nodes.forEach(node => {
      if (node.tagName === 'head') {
        head = node;
      } else {
        if (node.childNodes) {
          visitNodes(node.childNodes);
        }
      }
    });
  };

  visitNodes(document.childNodes);

  if (!head) {
    throw new SchematicsException('Head element could not be found!');
  }

  return {
    position: head.sourceCodeLocation.startTag.endOffset
  };
}

/**
 * Adds a link to the index.html head tag Example:
 * `<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">`
 * @param host The tree we are updating
 * @param project The project we're targeting.
 * @param link html element string we are inserting.
 */
export function addHeadLink(host: Tree, project: WorkspaceProject, link: string) {
  const indexPath = getIndexHtmlPath(project);
  const buffer = host.read(indexPath);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${indexPath}`);
  }

  const src = buffer.toString();
  if (src.indexOf(link) === -1) {
    const node = getHeadTag(src);
    const insertion = new InsertChange(indexPath, node.position, link);
    const recorder = host.beginUpdate(indexPath);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
  }
}
