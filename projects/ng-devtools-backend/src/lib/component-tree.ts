import { deeplySerializeSelectedProperties } from './state-serializer/state-serializer';

import {
  ComponentType,
  DirectiveType,
  Node,
  ElementPosition,
  ComponentExplorerViewQuery,
  DirectivesProperties,
} from 'protocol';
import { getComponentName } from './highlighter';
import { DebuggingAPI } from './interfaces';
import { getDirectiveId } from './dom-observer';
import { IndexedNode } from './observer/identity-tracker';

export interface DirectiveInstanceType extends DirectiveType {
  instance: any;
}

export interface ComponentInstanceType extends ComponentType {
  instance: any;
}

export interface ComponentTreeNode extends Node<DirectiveInstanceType, ComponentInstanceType> {
  children: ComponentTreeNode[];
}

export const getLatestComponentState = (query: ComponentExplorerViewQuery): DirectivesProperties | undefined => {
  let result: DirectivesProperties | undefined;
  if (query.selectedElement && query.expandedProperties) {
    const node = queryComponentForest(
      query.selectedElement,
      getDirectiveForest(document.documentElement, (window as any).ng)
    );
    if (!node) {
      return undefined;
    }

    result = {};
    node.directives.forEach(dir => {
      if (!query.expandedProperties[dir.name]) {
        return;
      }
      result[dir.name] = {
        props: deeplySerializeSelectedProperties(dir.instance, query.expandedProperties[dir.name]),
      };
    });

    if (node.component) {
      if (!query.expandedProperties[node.component.name]) {
        return;
      }
      result[node.component.name] = {
        props: deeplySerializeSelectedProperties(
          node.component.instance,
          query.expandedProperties[node.component.name]
        ),
      };
    }
  }
  return result;
};

// Here we drop properties to prepare the tree for serialization.
// We don't need the component instance, so we just traverse the tree
// and leave the component name.
export const prepareForestForSerialization = (roots: ComponentTreeNode[]): ComponentTreeNode[] => {
  return roots.map(node => {
    return {
      element: node.element,
      component: node.component
        ? {
            name: node.component.name,
            id: node.component.id,
          }
        : null,
      directives: node.directives.map(d => ({ name: d.name, id: d.id })),
      children: prepareForestForSerialization(node.children),
    } as ComponentTreeNode;
  });
};

export const getDirectiveForest = (root: HTMLElement, ngd: DebuggingAPI): ComponentTreeNode[] =>
  buildDirectiveForest(root, { element: '__ROOT__', component: null, directives: [], children: [] }, ngd);

const buildDirectiveForest = (
  node: Element,
  tree: ComponentTreeNode | undefined,
  ngd: DebuggingAPI
): ComponentTreeNode[] => {
  if (!node) {
    return [tree];
  }
  let dirs = [];
  if (tree.element !== '__ROOT__') {
    // Need to make sure we're in a component tree
    // otherwise, ngd.getDirectives will throw without
    // a root node.
    try {
      dirs = ngd.getDirectives(node) || [];
    } catch (e) {
      console.warn('Cannot find context for element', node);
    }
  }
  const cmp = ngd.getComponent(node);
  if (!cmp && !dirs.length) {
    Array.from(node.children).forEach(c => buildDirectiveForest(c, tree, ngd));
    return tree.children;
  }
  const current: ComponentTreeNode = {
    element: node.constructor.name,
    directives: dirs.map(dir => {
      return {
        instance: dir,
        name: getComponentName(dir),
        id: getDirectiveId(dir),
      } as DirectiveInstanceType;
    }),
    component: null,
    children: [],
    nativeElement: node,
  };

  if (cmp) {
    current.component = {
      instance: cmp,
      name: node.tagName.toLowerCase(),
      id: getDirectiveId(cmp),
    };
  } else {
    current.element = node.tagName.toLowerCase();
  }
  tree.children.push(current);
  Array.from(node.children).forEach(c => buildDirectiveForest(c, current, ngd));
  return tree.children;
};

// Based on an ElementID we return a specific component node.
// If we can't find any, we return null.
export const queryComponentForest = (
  position: ElementPosition,
  forest: ComponentTreeNode[]
): ComponentTreeNode | null => {
  if (!position.length) {
    return null;
  }
  let node: null | ComponentTreeNode = null;
  for (const i of position) {
    node = forest[i];
    if (!node) {
      return null;
    }
    forest = node.children;
  }
  return node;
};

export const findNodeInForest = (position: ElementPosition, forest: ComponentTreeNode[]): HTMLElement | null => {
  const foundComponent: ComponentTreeNode = queryComponentForest(position, forest);
  return foundComponent ? (foundComponent.nativeElement as HTMLElement) : null;
};

export const getIndexForNativeElementInForest = (
  nativeElement: HTMLElement,
  forest: IndexedNode[]
): ElementPosition | null => {
  const foundElementPosition: ElementPosition = findElementIDFromNativeElementInForest(forest, nativeElement);
  return foundElementPosition || null;
};

const findElementIDFromNativeElementInForest = (
  forest: IndexedNode[],
  nativeElement: HTMLElement
): ElementPosition | null => {
  for (const el of forest) {
    if (el.nativeElement === nativeElement) {
      return el.position;
    }
  }

  for (const el of forest) {
    if (el.children.length) {
      return findElementIDFromNativeElementInForest(el.children, nativeElement);
    }
  }
  return null;
};

export const findNodeFromSerializedPosition = (serializedPosition: string) => {
  const position: number[] = serializedPosition.split(',').map(index => parseInt(index, 10));
  return queryComponentForest(position, getDirectiveForest(document.documentElement, (window as any).ng));
};
