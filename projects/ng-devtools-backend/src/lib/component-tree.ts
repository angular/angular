import { deeplySerializeSelectedProperties, serializeDirectiveState } from './state-serializer/state-serializer';

import {
  DevToolsNode,
  ElementPosition,
  ComponentExplorerViewQuery,
  DirectivesProperties,
  UpdatedStateData,
  PropertyQueryTypes,
} from 'protocol';
import { DebuggingAPI } from './interfaces';
import { IndexedNode } from './observer/identity-tracker';
import { buildDirectiveTree, getLViewFromDirectiveOrElementInstance } from './lview-transform';

const ngDebug = () => (window as any).ng;

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
  const node = queryDirectiveForest(query.selectedElement, buildDirectiveForest((window as any).ng));
  if (!node) {
    return;
  }

  const result: DirectivesProperties = {};

  const populateResultSet = (dir: DirectiveInstanceType | ComponentInstanceType) => {
    if (query.propertyQuery.type === PropertyQueryTypes.All) {
      result[dir.name] = {
        props: serializeDirectiveState(dir.instance),
      };
    }
    if (query.propertyQuery.type === PropertyQueryTypes.Specified) {
      result[dir.name] = {
        props: deeplySerializeSelectedProperties(dir.instance, query.propertyQuery.properties[dir.name] || []),
      };
    }
  };

  node.directives.forEach(populateResultSet);
  if (node.component) {
    populateResultSet(node.component);
  }

  return result;
};

const getRootLViewsHelper = (element: Element, rootLViews = new Set<any>()): Set<any> => {
  if (!(element instanceof HTMLElement)) {
    return rootLViews;
  }
  const lView = getLViewFromDirectiveOrElementInstance(element);
  if (lView) {
    rootLViews.add(lView);
    return rootLViews;
  }
  // tslint:disable-next-line: prefer-for-of
  for (let i = 0; i < element.children.length; i++) {
    getRootLViewsHelper(element.children[i], rootLViews);
  }
  return rootLViews;
};

// To get all roots, we first get all elements with ng-version attribute.
// This includes all app roots plus Angular Elements.
// We may also have overlays which are on the same level as the top-level
// app. We get these by traversing the DOM starting from the root DOM
// element and stopping once we hit a node which is not HTMLElement or
// has lView data associated with it.
const getRootLViews = (element: Element): Set<any> => {
  const roots = element.querySelectorAll('[ng-version]');
  return getRootLViewsHelper(element, new Set(Array.from(roots).map(getLViewFromDirectiveOrElementInstance)));
};

export const buildDirectiveForest = (ngd: DebuggingAPI): ComponentTreeNode[] => {
  const roots = getRootLViews(document.documentElement);
  const result = Array.prototype.concat.apply([], [...roots].map(buildDirectiveTree));
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
  const foundComponent: ComponentTreeNode | null = queryDirectiveForest(position, forest);
  return foundComponent ? (foundComponent.nativeElement as HTMLElement) : null;
};

export const getIndexForNativeElementInForest = (
  nativeElement: HTMLElement,
  forest: IndexedNode[]
): ElementPosition | null => {
  const foundElementPosition: ElementPosition | null = findElementIDFromNativeElementInForest(forest, nativeElement);
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
  return queryDirectiveForest(position, buildDirectiveForest(ngDebug()));
};

export const updateState = (updatedStateData: UpdatedStateData): void => {
  const ngd = ngDebug();
  const node = queryDirectiveForest(updatedStateData.directiveId.element, buildDirectiveForest(ngd));
  if (!node) {
    console.warn('Could not update the state of component', updateState, 'because the component was not found');
    return;
  }
  if (updatedStateData.directiveId.directive !== undefined) {
    const directive = node.directives[updatedStateData.directiveId.directive].instance;
    mutateComponentOrDirective(updatedStateData, directive);
    ngd.applyChanges(ngd.getOwningComponent(directive));
    return;
  }
  if (node.component) {
    const comp = node.component.instance;
    mutateComponentOrDirective(updatedStateData, comp);
    ngd.applyChanges(comp);
    return;
  }
};

const mutateComponentOrDirective = (updatedStateData: UpdatedStateData, compOrDirective: any) => {
  const valueKey = updatedStateData.keyPath.pop();
  if (valueKey === undefined) {
    return;
  }

  let parentObjectOfValueToUpdate = compOrDirective;
  updatedStateData.keyPath.forEach(key => {
    parentObjectOfValueToUpdate = parentObjectOfValueToUpdate[key];
  });

  parentObjectOfValueToUpdate[valueKey] = updatedStateData.newValue;
};
