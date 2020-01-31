import { ComponentTreeNode } from './component-tree';

declare const ng: any;

const SELECTED_COMPONENT_PROPERTY_KEY_BASE = '$ng0';

export const setConsoleReference = (windowRef: Window, node: ComponentTreeNode) => {
  Object.defineProperty(windowRef, SELECTED_COMPONENT_PROPERTY_KEY_BASE, {
    get: () => {
      if (node) {
          return ng.getComponent(node.nativeElement()) || ng.getDebugNode(node.nativeElement());
        }
      return node.nativeElement();
      },
    configurable: true
  });
};
