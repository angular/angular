/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TagContentType, TagDefinition} from './tags';

export class XmlTagDefinition implements TagDefinition {
  closedByParent: boolean = false;
  // TODO(issue/24571): remove '!'.
  requiredParents!: {[key: string]: boolean};
  // TODO(issue/24571): remove '!'.
  parentToAdd!: string;
  // TODO(issue/24571): remove '!'.
  implicitNamespacePrefix!: string;
  isVoid: boolean = false;
  ignoreFirstLf: boolean = false;
  canSelfClose: boolean = true;
  preventNamespaceInheritance: boolean = false;

  requireExtraParent(currentParent: string): boolean {
    return false;
  }

  isClosedByChild(name: string): boolean {
    return false;
  }

  getContentType(): TagContentType {
    return TagContentType.PARSABLE_DATA;
  }
}

const _TAG_DEFINITION = new XmlTagDefinition();

export function getXmlTagDefinition(tagName: string): XmlTagDefinition {
  return _TAG_DEFINITION;
}
