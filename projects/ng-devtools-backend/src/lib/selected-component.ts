import { ComponentTreeNode } from './component-tree';

declare const ng: any;

const SELECTED_COMPONENT_PROPERTY_KEY_PREFIX = '$ng';
let selectedComponentKeyPostfix = 0;
const getSelectedComponentKey = () => `${SELECTED_COMPONENT_PROPERTY_KEY_PREFIX}${selectedComponentKeyPostfix}`;

const selectedNodes: (ComponentTreeNode | null)[] = [];

export const setConsoleReference = (node: ComponentTreeNode | null) => {
  if (selectedNodes.length === 5) {
    selectedNodes.pop();
  }
  selectedNodes.unshift(node);
  assignConsoleReferencesFromSelectedNodesArray();
};

const assignConsoleReferencesFromSelectedNodesArray = () => {
  selectedNodes.forEach((node, index) => {
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
