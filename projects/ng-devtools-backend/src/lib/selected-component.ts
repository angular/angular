import { ComponentTreeNode } from './component-tree';
import { arrayEquals } from 'shared-utils';

declare const ng: any;

const SELECTED_COMPONENT_PROPERTY_KEY_PREFIX = '$ng';
let selectedComponentKeyPostfix = 0;
const getSelectedComponentKey = () => `${SELECTED_COMPONENT_PROPERTY_KEY_PREFIX}${selectedComponentKeyPostfix}`;

const nodesForConsoleReference: ComponentTreeNode[] = [];

export const setConsoleReference = (node: ComponentTreeNode | null) => {
  if (node === null) {
    return;
  }
  _setConsoleReference(node);
};

const _setConsoleReference = (node: ComponentTreeNode) => {
  prepareCurrentReferencesForInsertion(node);
  nodesForConsoleReference.unshift(node);
  assignConsoleReferencesFrom(nodesForConsoleReference);
};

const prepareCurrentReferencesForInsertion = (node: ComponentTreeNode) => {
  const foundIndex = nodesForConsoleReference.findIndex(nodeToLookFor =>
    arrayEquals(nodeToLookFor.position, node.position)
  );
  if (foundIndex !== -1) {
    nodesForConsoleReference.splice(foundIndex, 1);
  } else if (nodesForConsoleReference.length === 5) {
    nodesForConsoleReference.pop();
  }
};

const assignConsoleReferencesFrom = (nodes: ComponentTreeNode[]) => {
  nodes.forEach((node, index) => {
    selectedComponentKeyPostfix = index;
    setDirectiveKey(node, getSelectedComponentKey());
  });
};

const setDirectiveKey = (node: ComponentTreeNode | null, key) => {
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
