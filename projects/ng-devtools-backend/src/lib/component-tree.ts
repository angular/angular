import { deeplySerializeSelectedProperties } from './state-serializer/state-serializer';

import {
  DevToolsNode,
  ElementPosition,
  ComponentExplorerViewQuery,
  DirectivesProperties,
  UpdatedStateData,
} from 'protocol';
import { getComponentName } from './highlighter';
import { DebuggingAPI } from './interfaces';
import { IndexedNode } from './observer/identity-tracker';
import { buildDirectiveTree } from './lview-transform';

const ngDebug = (window as any).ng;

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

export const getDirectiveForest = (root: HTMLElement, ngd: DebuggingAPI): ComponentTreeNode[] => {
  const roots = Array.from(root.querySelectorAll('[ng-version]')).map(el => ngd.getComponent(el).__ngContext__);
  return Array.prototype.concat.apply([], roots.map(buildDirectiveTree));
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
  return queryComponentForest(position, getDirectiveForest(document.documentElement, ngDebug));
};

export const updateState = (updatedStateData: UpdatedStateData) => {
  const node = queryComponentForest(
    updatedStateData.directiveId.element,
    getDirectiveForest(document.documentElement, ngDebug)
  );
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
