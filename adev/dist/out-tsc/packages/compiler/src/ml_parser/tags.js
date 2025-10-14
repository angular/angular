/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export var TagContentType;
(function (TagContentType) {
  TagContentType[(TagContentType['RAW_TEXT'] = 0)] = 'RAW_TEXT';
  TagContentType[(TagContentType['ESCAPABLE_RAW_TEXT'] = 1)] = 'ESCAPABLE_RAW_TEXT';
  TagContentType[(TagContentType['PARSABLE_DATA'] = 2)] = 'PARSABLE_DATA';
})(TagContentType || (TagContentType = {}));
export function splitNsName(elementName, fatal = true) {
  if (elementName[0] != ':') {
    return [null, elementName];
  }
  const colonIndex = elementName.indexOf(':', 1);
  if (colonIndex === -1) {
    if (fatal) {
      throw new Error(`Unsupported format "${elementName}" expecting ":namespace:name"`);
    } else {
      return [null, elementName];
    }
  }
  return [elementName.slice(1, colonIndex), elementName.slice(colonIndex + 1)];
}
// `<ng-container>` tags work the same regardless the namespace
export function isNgContainer(tagName) {
  return splitNsName(tagName)[1] === 'ng-container';
}
// `<ng-content>` tags work the same regardless the namespace
export function isNgContent(tagName) {
  return splitNsName(tagName)[1] === 'ng-content';
}
// `<ng-template>` tags work the same regardless the namespace
export function isNgTemplate(tagName) {
  return splitNsName(tagName)[1] === 'ng-template';
}
export function getNsPrefix(fullName) {
  return fullName === null ? null : splitNsName(fullName)[0];
}
export function mergeNsAndName(prefix, localName) {
  return prefix ? `:${prefix}:${localName}` : localName;
}
//# sourceMappingURL=tags.js.map
