/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector} from './selector';

/*
 * The following items are copied from the Angular Compiler to be used here
 * without the need to import the entire compiler into the build
 */

const CLASS_ATTR = 'class';

export function createElementCssSelector(
    elementName: string, attributes: [string, string][]): CssSelector {
  const cssSelector = new CssSelector();
  const elNameNoNs = splitNsName(elementName)[1];

  cssSelector.setElement(elNameNoNs);

  for (let i = 0; i < attributes.length; i++) {
    const attrName = attributes[i][0];
    const attrNameNoNs = splitNsName(attrName)[1];
    const attrValue = attributes[i][1];

    cssSelector.addAttribute(attrNameNoNs, attrValue);
    if (attrName.toLowerCase() == CLASS_ATTR) {
      const classes = splitClasses(attrValue);
      classes.forEach(className => cssSelector.addClassName(className));
    }
  }
  return cssSelector;
}

export function splitNsName(elementName: string): [string, string] {
  if (elementName[0] != ':') {
    return [null, elementName];
  }

  const colonIndex = elementName.indexOf(':', 1);

  if (colonIndex == -1) {
    throw new Error(`Unsupported format "${elementName}" expecting ":namespace:name"`);
  }

  return [elementName.slice(1, colonIndex), elementName.slice(colonIndex + 1)];
}

export function splitClasses(classAttrValue: string): string[] {
  return classAttrValue.trim().split(/\s+/g);
}
