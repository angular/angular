import { deeplySerializeSelectedProperties } from './state-serializer';

declare const ng: any;

import {
  ComponentType,
  DirectiveType,
  Node,
  ElementID,
  ComponentExplorerViewQuery,
  DirectivesProperties,
} from 'protocol';
import { getComponentName } from './highlighter';

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
  let result;
  if (query.selectedElement && query.expandedProperties) {
    const node = queryComponentTree(query.selectedElement);
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
export const trimComponents = (roots: ComponentTreeNode[]): ComponentTreeNode[] => {
  return roots.map(node => {
    return {
      element: node.element,
      component: node.component
        ? {
          name: node.component.name,
        }
        : null,
      directives: node.directives.map(d => ({ name: d.name })),
      children: trimComponents(node.children),
    } as ComponentTreeNode;
  });
};

export const getDirectiveForest = (root = document.documentElement): ComponentTreeNode[] =>
  buildDirectiveForest(root, { element: '__ROOT__', component: null, directives: [], children: [] }, true);

export const getComponentForest = (root = document.documentElement): ComponentTreeNode[] =>
  buildDirectiveForest(root, { element: '__ROOT__', component: null, directives: [], children: [] }, false);

const buildDirectiveForest = (
  node: Element,
  tree: ComponentTreeNode | undefined,
  getDirectives: boolean
): ComponentTreeNode[] => {
  if (!node) {
    return [tree];
  }
  let dirs = [];
  if (tree.element !== '__ROOT__' && getDirectives) {
    // Need to make sure we're in a component tree
    // otherwise, ng.getDirectives will throw without
    // a root node.
    try {
      dirs = ng.getDirectives(node) || [];
    } catch (e) {
      console.warn('Cannot find context for element', node);
    }
  }
  const cmp = ng.getComponent(node);
  if (!cmp && !dirs.length) {
    Array.from(node.children).forEach(c => buildDirectiveForest(c, tree, getDirectives));
    return tree.children;
  }
  const current: ComponentTreeNode = {
    element: node.constructor.name,
    directives: dirs.map(dir => {
      return {
        instance: dir,
        name: getComponentName(dir),
      } as DirectiveInstanceType;
    }),
    component: null,
    children: [],
  };

  if (cmp) {
    current.component = {
      instance: cmp,
      // name: getComponentName(cmp),
      name: node.tagName.toLowerCase()
    };
  } else {
    current.element = node.tagName.toLowerCase();
  }
  tree.children.push(current);
  Array.from(node.children).forEach(c => buildDirectiveForest(c, current, getDirectives));
  return tree.children;
};

// Based on an ElementID we return a specific component node.
// If we can't find any, we return null.
export const queryComponentTree = (id: ElementID): ComponentTreeNode | null => {
  if (!id.length) {
    return null;
  }
  let forest = getDirectiveForest();
  let node: null | ComponentTreeNode = null;
  for (const i of id) {
    node = forest[i];
    if (!node) {
      return null;
    }
    forest = node.children;
  }
  return node;
};
