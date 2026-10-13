/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as html from '../ml_parser/ast';
import {isNgContent, splitNsName} from '../ml_parser/tags';

export function preparseElement(ast: html.Element): PreparsedElement {
  let selectAttr: string | null = null;
  let hrefAttr: string | null = null;
  let relAttr: string | null = null;
  let nonBindable = false;
  let projectAs = '';

  for (const attr of ast.attrs) {
    const lcAttrName = attr.name.toLowerCase();
    if (lcAttrName === 'select') {
      selectAttr = attr.value;
    } else if (lcAttrName === 'href') {
      hrefAttr = attr.value;
    } else if (lcAttrName === 'rel') {
      relAttr = attr.value;
    } else if (attr.name === 'ngNonBindable') {
      nonBindable = true;
    } else if (attr.value.length > 0 && attr.name === 'ngProjectAs') {
      projectAs = attr.value;
    }
  }

  // Normalize selector to '*' if empty
  selectAttr ||= '*';

  const nodeName = ast.name.toLowerCase();
  // Custom namespaces fall back to HTML, where script elements are executable.
  const nodeNameWithoutNamespace = splitNsName(nodeName)[1];
  let type = PreparsedElementType.OTHER;
  if (isNgContent(nodeName)) {
    type = PreparsedElementType.NG_CONTENT;
  } else if (nodeNameWithoutNamespace === 'style') {
    type = PreparsedElementType.STYLE;
  } else if (nodeNameWithoutNamespace === 'script') {
    type = PreparsedElementType.SCRIPT;
  } else if (nodeName === 'link' && relAttr === 'stylesheet') {
    type = PreparsedElementType.STYLESHEET;
  }
  return new PreparsedElement(type, selectAttr, hrefAttr, nonBindable, projectAs);
}

export enum PreparsedElementType {
  NG_CONTENT,
  STYLE,
  STYLESHEET,
  SCRIPT,
  OTHER,
}

export class PreparsedElement {
  constructor(
    public type: PreparsedElementType,
    public selectAttr: string,
    public hrefAttr: string | null,
    public nonBindable: boolean,
    public projectAs: string,
  ) {}
}
