import { ComponentTreeNode } from './component-tree';

const HEADER_OFFSET = 19;
const TYPE = 1;
const ELEMENT = 0;
const LVIEW_TVIEW = 1;

export function isLContainer(value: any): boolean {
  return Array.isArray(value) && value[TYPE] === true;
}

const getNode = (lView: any, data: any, idx: number): ComponentTreeNode => {
  const directives = [];
  let component = null;
  const tNode = data[idx];
  const element = (lView[idx][ELEMENT].tagName || lView[idx][ELEMENT].nodeName).toLowerCase();
  for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
    const dir = lView[i];
    const dirMeta = data[i];
    if (dirMeta && dirMeta.template) {
      component = {
        name: element,
        instance: dir,
      };
    } else if (dirMeta) {
      directives.push({
        name: dir.constructor.name,
        instance: dir,
      });
    }
  }
  return {
    element,
    nativeElement: lView[idx][ELEMENT],
    directives,
    component,
    children: [],
  };
};

const extractNodes = (lViewOrLContainer: any, nodes = []): ComponentTreeNode[] => {
  if (isLContainer(lViewOrLContainer)) {
    for (let i = 9; i < lViewOrLContainer.length; i++) {
      extractNodes(lViewOrLContainer[i], nodes);
    }
    return nodes;
  }
  const lView = lViewOrLContainer;
  const tView = lView[LVIEW_TVIEW];
  for (let i = HEADER_OFFSET; i < lView.length; i++) {
    if (lView[i] && lView[i][ELEMENT] instanceof Node) {
      const node = getNode(lView, tView.data, i);
      nodes.push(node);
      extractNodes(lView[i], node.children);
    }
  }
  return nodes;
};

export const buildDirectiveTree = (lView: any) => extractNodes(lView);
