import { ComponentTreeNode, ComponentInstanceType, DirectiveInstanceType } from './component-tree';
import { isCustomElement } from './utils';
import { getDirectiveName } from './highlighter';

const HEADER_OFFSET = 19;
const TYPE = 1;
const ELEMENT = 0;
const LVIEW_TVIEW = 1;
export const METADATA_PROPERTY_NAME = '__ngContext__';

const isLContainer = (value: any): boolean => {
  return Array.isArray(value) && value[TYPE] === true;
};

const isLView = (value: any): boolean => {
  return Array.isArray(value) && typeof value[TYPE] === 'object';
};

export const getLViewFromDirectiveOrElementInstance = (dir: any): null | {} => {
  if (!dir) {
    return null;
  }
  const context = dir[METADATA_PROPERTY_NAME];
  if (!context) {
    return null;
  }
  if (isLView(context)) {
    return context;
  }
  return context.lView;
};

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
  const directives: DirectiveInstanceType[] = [];
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
        name: getDirectiveName(dir),
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

const extractNodes = (lViewOrLContainer: any, nodes: ComponentTreeNode[] = []): ComponentTreeNode[] => {
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

      // TODO(mgechev): verify if this won't make us skip projected content.
      if (node.component || node.directives.length) {
        nodes.push(node);
        extractNodes(lView[i], node.children);
      }
    }
  }
  return nodes;
};

export const buildDirectiveTree = (lView: any) => extractNodes(lView);
