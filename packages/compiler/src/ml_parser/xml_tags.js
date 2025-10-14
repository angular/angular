/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TagContentType} from './tags';
export class XmlTagDefinition {
  constructor() {
    this.closedByParent = false;
    this.implicitNamespacePrefix = null;
    this.isVoid = false;
    this.ignoreFirstLf = false;
    this.canSelfClose = true;
    this.preventNamespaceInheritance = false;
  }
  requireExtraParent(currentParent) {
    return false;
  }
  isClosedByChild(name) {
    return false;
  }
  getContentType() {
    return TagContentType.PARSABLE_DATA;
  }
}
const _TAG_DEFINITION = new XmlTagDefinition();
export function getXmlTagDefinition(tagName) {
  return _TAG_DEFINITION;
}
//# sourceMappingURL=xml_tags.js.map
