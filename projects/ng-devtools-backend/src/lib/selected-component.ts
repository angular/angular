import { arrayEquals } from 'shared-utils';
import { IndexedNode } from './observer/identity-tracker';

declare const ng: any;

const CONSOLE_REFERENCE_PREFIX = '$ng';
const CAPACITY = 5;
const nodesForConsoleReference: IndexedNode[] = [];

export const setConsoleReference = (node: IndexedNode | null) => {
  if (node === null) {
    return;
  }
  _setConsoleReference(node);
};

const _setConsoleReference = (node: IndexedNode) => {
  prepareCurrentReferencesForInsertion(node);
  nodesForConsoleReference.unshift(node);
  assignConsoleReferencesFrom(nodesForConsoleReference);
};

const prepareCurrentReferencesForInsertion = (node: IndexedNode) => {
  const foundIndex = nodesForConsoleReference.findIndex(nodeToLookFor =>
    arrayEquals(nodeToLookFor.position, node.position)
  );
  if (foundIndex !== -1) {
    nodesForConsoleReference.splice(foundIndex, 1);
  } else if (nodesForConsoleReference.length === CAPACITY) {
    nodesForConsoleReference.pop();
  }
};

const assignConsoleReferencesFrom = (nodes: IndexedNode[]) => {
  nodes.forEach((node, index) => setDirectiveKey(node, getConsoleReferenceWithIndexOf(index)));
};

const setDirectiveKey = (node: IndexedNode | null, key) => {
  Object.defineProperty(window, key, {
    get: () => {
      if (node && node.nativeElement instanceof HTMLElement) {
        return ng.getComponent(node.nativeElement) || node;
      }
      if (node) {
        return node.nativeElement;
      }
      return node;
    },
    configurable: true,
  });
};

const getConsoleReferenceWithIndexOf = (consoleReferenceIndex: number) =>
  `${CONSOLE_REFERENCE_PREFIX}${consoleReferenceIndex}`;
