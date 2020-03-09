import { ComponentTreeNode, ComponentInstanceType } from './component-tree';
import { isCustomElement } from './utils';

const HEADER_OFFSET = 19;
const TYPE = 1;
const ELEMENT = 0;
const LVIEW_TVIEW = 1;
const COMPONENTS = 8;
export const METADATA_PROPERTY_NAME = '__ngContext__';

export function isLContainer(value: any): boolean {
  return Array.isArray(value) && value[TYPE] === true;
}

export const getDirectiveHostElement = (dir: any) => {
  const ctx = dir[METADATA_PROPERTY_NAME];
  if (ctx[0] !== null) {
    return ctx[0];
  }
  const components = ctx[LVIEW_TVIEW].components;
  if (!components || components.length !== 1) {
    return false;
  }
  return ctx[components[0]][0];
};

const getNode = (lView: any, data: any, idx: number): ComponentTreeNode => {
  const directives = [];
  let component: ComponentInstanceType | null = null;
  const tNode = data[idx];
  const node = lView[idx][ELEMENT] || lView[idx][ELEMENT];
  const elementName = (node.tagName || node.nodeName).toLowerCase();
  for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
    const dir = lView[i];
    const dirMeta = data[i];
    if (dirMeta && dirMeta.template) {
      component = {
        name: elementName,
        instance: dir,
        isElement: isCustomElement(node),
      };
    } else if (dirMeta) {
      directives.push({
        name: dir.constructor.name,
        instance: dir,
      });
    }
  }
  return {
    element: elementName,
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
