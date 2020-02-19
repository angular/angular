import { deeplySerializeSelectedProperties } from './state-serializer/state-serializer';

import { DevToolsNode, ElementPosition, ComponentExplorerViewQuery, DirectivesProperties } from 'protocol';
import { getComponentName } from './highlighter';
import { DebuggingAPI } from './interfaces';
import { IndexedNode } from './observer/identity-tracker';

export interface DirectiveInstanceType {
  instance: any;
  name: string;
}

export interface ComponentInstanceType {
  instance: any;
  name: string;
}

export interface ComponentTreeNode extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType> {
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

export const getDirectiveForest = (root: HTMLElement, ngd: DebuggingAPI): ComponentTreeNode[] =>
  buildDirectiveForest(root, { element: '__ROOT__', component: null, directives: [], children: [] }, ngd);

const buildDirectiveForest = (
  node: Node,
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
    } catch (e) {}
  }
  const cmp = node instanceof HTMLElement && ngd.getComponent(node);
  if (!cmp && !dirs.length) {
    Array.from(node.childNodes).forEach(c => buildDirectiveForest(c, tree, ngd));
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
    nativeElement: node,
  };

  const name = node instanceof HTMLElement ? node.tagName.toLowerCase() : node.nodeName.toLowerCase();
  if (cmp) {
    current.component = {
      instance: cmp,
      name,
    };
  } else {
    current.element = name;
  }
  tree.children.push(current);
  Array.from(node.childNodes).forEach(c => buildDirectiveForest(c, current, ngd));
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

export const updateState = (updatedStateData: UpdatedStateData) => {
  const node = queryComponentForest(updatedStateData.directiveId.element, getDirectiveForest());
  if (updatedStateData.directiveId.directive === undefined) {
    const comp = node.component.instance;
    mutateComponentOrDirective(updatedStateData, comp);
    ng.applyChanges(comp);
  } else {
    const directive = node.directives[updatedStateData.directiveId.directive].instance;
    mutateComponentOrDirective(updatedStateData, directive);
    ng.applyChanges(ng.getOwningComponent(directive));
  }
};

const mutateComponentOrDirective = (updatedStateData: UpdatedStateData, compOrDirective) => {
  const valueKey = updatedStateData.keyPath.pop();

  let parentObjectOfValueToUpdate = compOrDirective;
  updatedStateData.keyPath.forEach(key => {
    parentObjectOfValueToUpdate = parentObjectOfValueToUpdate[key];
  });
  parentObjectOfValueToUpdate[valueKey] = updatedStateData.newValue;
};
