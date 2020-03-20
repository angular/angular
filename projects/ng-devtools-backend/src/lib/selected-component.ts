import { ComponentTreeNode } from './component-tree';

declare const ng: any;

const SELECTED_COMPONENT_PROPERTY_KEY_BASE = '$ng0';

export const setConsoleReference = (node: ComponentTreeNode | null) => {
  Object.defineProperty(window, SELECTED_COMPONENT_PROPERTY_KEY_BASE, {
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
