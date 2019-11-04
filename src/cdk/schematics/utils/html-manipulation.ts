/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {getChildElementIndentation} from './parse5-element';
import {DefaultTreeDocument, DefaultTreeElement, parse as parseHtml} from 'parse5';

/** Appends the given element HTML fragment to the `<head>` element of the specified HTML file. */
export function appendHtmlElementToHead(host: Tree, htmlFilePath: string, elementHtml: string) {
  const htmlFileBuffer = host.read(htmlFilePath);

  if (!htmlFileBuffer) {
    throw new SchematicsException(`Could not read file for path: ${htmlFilePath}`);
  }

  const htmlContent = htmlFileBuffer.toString();

  if (htmlContent.includes(elementHtml)) {
    return;
  }

  const headTag = getHtmlHeadTagElement(htmlContent);

  if (!headTag) {
    throw Error(`Could not find '<head>' element in HTML file: ${htmlFileBuffer}`);
  }

  // We always have access to the source code location here because the `getHeadTagElement`
  // function explicitly has the `sourceCodeLocationInfo` option enabled.
  const endTagOffset = headTag.sourceCodeLocation!.endTag.startOffset;
  const indentationOffset = getChildElementIndentation(headTag);
  const insertion = `${' '.repeat(indentationOffset)}${elementHtml}`;

  const recordedChange = host
    .beginUpdate(htmlFilePath)
    .insertRight(endTagOffset, `${insertion}\n`);

  host.commitUpdate(recordedChange);
}

/** Parses the given HTML file and returns the head element if available. */
export function getHtmlHeadTagElement(htmlContent: string): DefaultTreeElement | null {
  return getElementByTagName('head', htmlContent);
}

/** Adds a class to the body of the document. */
export function addBodyClass(host: Tree, htmlFilePath: string, className: string): void {
  const htmlFileBuffer = host.read(htmlFilePath);

  if (!htmlFileBuffer) {
    throw new SchematicsException(`Could not read file for path: ${htmlFilePath}`);
  }

  const htmlContent = htmlFileBuffer.toString();
  const body = getElementByTagName('body', htmlContent);

  if (!body) {
    throw Error(`Could not find <body> element in HTML file: ${htmlFileBuffer}`);
  }

  const classAttribute = body.attrs.find(attribute => attribute.name === 'class');

  if (classAttribute) {
    const hasClass = classAttribute.value.split(' ').map(part => part.trim()).includes(className);

    if (!hasClass) {
      const classAttributeLocation = body.sourceCodeLocation!.attrs.class;
      const recordedChange = host
        .beginUpdate(htmlFilePath)
        .insertRight(classAttributeLocation.endOffset - 1, ` ${className}`);
      host.commitUpdate(recordedChange);
    }
  } else {
    const recordedChange = host
      .beginUpdate(htmlFilePath)
      .insertRight(body.sourceCodeLocation!.startTag.endOffset - 1, ` class="${className}"`);
    host.commitUpdate(recordedChange);
  }
}

/** Finds an element by its tag name. */
function getElementByTagName(tagName: string, htmlContent: string):
  DefaultTreeElement | null {
  const document = parseHtml(htmlContent, {sourceCodeLocationInfo: true}) as DefaultTreeDocument;
  const nodeQueue = [...document.childNodes];

  while (nodeQueue.length) {
    const node = nodeQueue.shift() as DefaultTreeElement;

    if (node.nodeName.toLowerCase() === tagName) {
      return node;
    } else if (node.childNodes) {
      nodeQueue.push(...node.childNodes);
    }
  }

  return null;
}
