import { deeplySerializeSelectedProperties } from './state-serializer/state-serializer';

import {
  DevToolsNode,
  ElementPosition,
  ComponentExplorerViewQuery,
  DirectivesProperties,
  UpdatedStateData,
} from 'protocol';
import { DebuggingAPI } from './interfaces';
import { IndexedNode } from './observer/identity-tracker';
import { buildDirectiveTree, getLViewFromDirectiveOrElementInstance } from './lview-transform';

const ngDebug = (window as any).ng;

export interface DirectiveInstanceType {
  instance: any;
  name: string;
}

export interface ComponentInstanceType {
  instance: any;
  name: string;
  isElement: boolean;
}

export interface ComponentTreeNode extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType> {
  children: ComponentTreeNode[];
}

export const getLatestComponentState = (query: ComponentExplorerViewQuery): DirectivesProperties | undefined => {
  let result: DirectivesProperties | undefined;
  if (query.selectedElement && query.expandedProperties) {
    const node = queryDirectiveForest(query.selectedElement, buildDirectiveForest((window as any).ng));
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

const getRootLViewsHelper = (element: Element, rootLViews = new Set<any>()) => {
  if (!(element instanceof HTMLElement)) {
    return;
  }
  const lView = getLViewFromDirectiveOrElementInstance(element);
  if (lView) {
    rootLViews.add(lView);
    return;
  }
  // tslint:disable-next-line: prefer-for-of
  for (let i = 0; i < element.children.length; i++) {
    getRootLViewsHelper(element.children[i], rootLViews);
  }
  return rootLViews;
};

const getRootLViews = (element: Element) => {
  const roots = element.querySelectorAll('[ng-version]');
  return getRootLViewsHelper(element, new Set(Array.from(roots).map(getLViewFromDirectiveOrElementInstance)));
};

export const buildDirectiveForest = (ngd: DebuggingAPI): ComponentTreeNode[] => {
  // const then = performance.now();
  const roots = getRootLViews(document.documentElement);
  // console.info('%cTime to find roots: ' + (performance.now() - then), 'color: blue');
  const result = Array.prototype.concat.apply([], [...roots].map(buildDirectiveTree));
  // console.info('%cTime to generate tree: ' + (performance.now() - then), 'color: blue');
  return result;
};

// Based on an ElementID we return a specific component node.
// If we can't find any, we return null.
export const queryDirectiveForest = (
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
  const foundComponent: ComponentTreeNode = queryDirectiveForest(position, forest);
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
  return queryDirectiveForest(position, buildDirectiveForest(ngDebug));
};

export const updateState = (updatedStateData: UpdatedStateData) => {
  const node = queryDirectiveForest(updatedStateData.directiveId.element, buildDirectiveForest(ngDebug));
  if (updatedStateData.directiveId.directive === undefined) {
    const comp = node.component.instance;
    mutateComponentOrDirective(updatedStateData, comp);
    ngDebug.applyChanges(comp);
  } else {
    const directive = node.directives[updatedStateData.directiveId.directive].instance;
    mutateComponentOrDirective(updatedStateData, directive);
    ngDebug.applyChanges(ngDebug.getOwningComponent(directive));
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
