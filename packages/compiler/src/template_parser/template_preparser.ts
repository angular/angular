/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as html from '../ml_parser/ast';
import {isNgContent} from '../ml_parser/tags';

const NG_CONTENT_SELECT_ATTR = 'select';
const LINK_ELEMENT = 'link';
const LINK_STYLE_REL_ATTR = 'rel';
const LINK_STYLE_HREF_ATTR = 'href';
const LINK_STYLE_REL_VALUE = 'stylesheet';
const STYLE_ELEMENTS: ReadonlySet<string> = new Set([':svg:style', 'style']);
const SCRIPT_ELEMENTS: ReadonlySet<string> = new Set([':svg:script', 'script']);
const NG_NON_BINDABLE_ATTR = 'ngNonBindable';
const NG_PROJECT_AS = 'ngProjectAs';

export function preparseElement(ast: html.Element): PreparsedElement {
  let selectAttr: string | null = null;
  let hrefAttr: string | null = null;
  let relAttr: string | null = null;
  let nonBindable = false;
  let projectAs = '';

  for (const attr of ast.attrs) {
    const lcAttrName = attr.name.toLowerCase();
    if (lcAttrName == NG_CONTENT_SELECT_ATTR) {
      selectAttr = attr.value;
    } else if (lcAttrName == LINK_STYLE_HREF_ATTR) {
      hrefAttr = attr.value;
    } else if (lcAttrName == LINK_STYLE_REL_ATTR) {
      relAttr = attr.value;
    } else if (attr.name == NG_NON_BINDABLE_ATTR) {
      nonBindable = true;
    } else if (attr.name == NG_PROJECT_AS) {
      if (attr.value.length > 0) {
        projectAs = attr.value;
      }
    }
  }

  // Normalize selector to '*' if empty
  selectAttr ||= '*';

  const nodeName = ast.name.toLowerCase();
  let type = PreparsedElementType.OTHER;
  if (isNgContent(nodeName)) {
    type = PreparsedElementType.NG_CONTENT;
  } else if (STYLE_ELEMENTS.has(nodeName)) {
    type = PreparsedElementType.STYLE;
  } else if (SCRIPT_ELEMENTS.has(nodeName)) {
    type = PreparsedElementType.SCRIPT;
  } else if (nodeName == LINK_ELEMENT && relAttr == LINK_STYLE_REL_VALUE) {
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
