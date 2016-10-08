/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from '../ml_parser/ast';
import {splitNsName} from '../ml_parser/tags';

const NG_CONTENT_SELECT_ATTR = 'select';
const NG_CONTENT_ELEMENT = 'ng-content';
const LINK_ELEMENT = 'link';
const LINK_STYLE_REL_ATTR = 'rel';
const LINK_STYLE_HREF_ATTR = 'href';
const LINK_STYLE_REL_VALUE = 'stylesheet';
const STYLE_ELEMENT = 'style';
const SCRIPT_ELEMENT = 'script';
const SCRIPT_TYPE_ATTR = 'type';
const NG_NON_BINDABLE_ATTR = 'ngNonBindable';
const NG_PROJECT_AS = 'ngProjectAs';

export function preparseElement(ast: html.Element): PreparsedElement {
  let selectAttr: string = null;
  let hrefAttr: string = null;
  let relAttr: string = null;
  let nonBindable = false;
  let projectAs: string = null;
  let typeAttr: string = null;

  ast.attrs.forEach(attr => {
    let lcAttrName = attr.name.toLowerCase();
    if (lcAttrName == NG_CONTENT_SELECT_ATTR) {
      selectAttr = attr.value;
    } else if (lcAttrName == LINK_STYLE_HREF_ATTR) {
      hrefAttr = attr.value;
    } else if (lcAttrName == LINK_STYLE_REL_ATTR) {
      relAttr = attr.value;
    } else if (lcAttrName == SCRIPT_TYPE_ATTR) {
      typeAttr = attr.value;
    } else if (attr.name == NG_NON_BINDABLE_ATTR) {
      nonBindable = true;
    } else if (attr.name == NG_PROJECT_AS) {
      projectAs = attr.value || null;
    }
  });

  selectAttr = normalizeNgContentSelect(selectAttr);
  let lcTagName = ast.name.toLowerCase();
  let type = PreparsedElementType.OTHER;
  if (splitNsName(lcTagName)[1] == NG_CONTENT_ELEMENT) {
    type = PreparsedElementType.NG_CONTENT;
  } else if (lcTagName == STYLE_ELEMENT) {
    type = PreparsedElementType.STYLE;
  } else if (isJavascriptScriptTag(lcTagName, typeAttr)) {
    type = PreparsedElementType.JAVASCRIPT;
  } else if (lcTagName == LINK_ELEMENT && relAttr == LINK_STYLE_REL_VALUE) {
    type = PreparsedElementType.STYLESHEET;
  }
  return new PreparsedElement(type, selectAttr, hrefAttr, nonBindable, projectAs);
}

export enum PreparsedElementType {
  NG_CONTENT,
  STYLE,
  STYLESHEET,
  JAVASCRIPT,
  OTHER
}

export class PreparsedElement {
  constructor(
      public type: PreparsedElementType, public selectAttr: string, public hrefAttr: string,
      public nonBindable: boolean, public projectAs: string) {}
}


function normalizeNgContentSelect(selectAttr: string): string {
  if (selectAttr === null || selectAttr.length === 0) {
    return '*';
  }
  return selectAttr;
}

// see https://html.spec.whatwg.org/multipage/scripting.html#javascript-mime-type
// The following Regexp is intentionally more lenient
const IS_JS_MIME_TYPE = /(javascript|ecmascript|jscript|livescript)/i;

function isJavascriptScriptTag(lcTagName: string, type: string): boolean {
  if (lcTagName !== SCRIPT_ELEMENT) return false;
  // javascript is the default when no type is specified
  if (!type) return true;
  return IS_JS_MIME_TYPE.test(type);
}
