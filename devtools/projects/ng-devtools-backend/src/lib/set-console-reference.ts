/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementPosition} from '../../../protocol';
import {arrayEquals} from '../../../shared-utils';

import {ComponentTreeNode} from './interfaces';

interface ConsoleReferenceNode {
  node: ComponentTreeNode | null;
  position: ElementPosition;
}

const CONSOLE_REFERENCE_PREFIX = '$ng';
const CAPACITY = 5;

const nodesForConsoleReference: ConsoleReferenceNode[] = [];

export const setConsoleReference = (referenceNode: ConsoleReferenceNode) => {
  if (referenceNode.node === null) {
    return;
  }
  _setConsoleReference(referenceNode);
};

const _setConsoleReference = (referenceNode: ConsoleReferenceNode) => {
  prepareCurrentReferencesForInsertion(referenceNode);
  nodesForConsoleReference.unshift(referenceNode);
  assignConsoleReferencesFrom(nodesForConsoleReference);
};

const prepareCurrentReferencesForInsertion = (referenceNode: ConsoleReferenceNode) => {
  const foundIndex = nodesForConsoleReference.findIndex((nodeToLookFor) =>
    arrayEquals(nodeToLookFor.position, referenceNode.position),
  );
  if (foundIndex !== -1) {
    nodesForConsoleReference.splice(foundIndex, 1);
  } else if (nodesForConsoleReference.length === CAPACITY) {
    nodesForConsoleReference.pop();
  }
};

const assignConsoleReferencesFrom = (referenceNodes: ConsoleReferenceNode[]) => {
  referenceNodes.forEach((referenceNode, index) =>
    setDirectiveKey(referenceNode.node, getConsoleReferenceWithIndexOf(index)),
  );
};

const setDirectiveKey = (node: ComponentTreeNode | null, key: string) => {
  Object.defineProperty(window, key, {
    get: () => {
      if (node?.component) {
        return node.component.instance;
      }
      if (node?.nativeElement) {
        return node.nativeElement;
      }
      return node;
    },
    configurable: true,
  });
};

const getConsoleReferenceWithIndexOf = (consoleReferenceIndex: number) =>
  `${CONSOLE_REFERENCE_PREFIX}${consoleReferenceIndex}`;
