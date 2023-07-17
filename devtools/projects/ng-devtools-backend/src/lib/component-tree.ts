/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentExplorerViewQuery, DirectiveMetadata, DirectivesProperties, ElementPosition, PropertyQueryTypes, UpdatedStateData,} from 'protocol';

import {buildDirectiveTree, getLViewFromDirectiveOrElementInstance} from './directive-forest/index';
import {deeplySerializeSelectedProperties, serializeDirectiveState} from './state-serializer/state-serializer';

// Need to be kept in sync with Angular framework
// We can't directly import it from framework now
// because this also pulls up the security policies
// for Trusted Types, which we reinstantiate.
enum ChangeDetectionStrategy {
  OnPush = 0,
  Default = 1,
}

import {ComponentTreeNode, DirectiveInstanceType, ComponentInstanceType} from './interfaces';

const ngDebug = () => (window as any).ng;

export const getLatestComponentState =
    (query: ComponentExplorerViewQuery, directiveForest?: ComponentTreeNode[]):
        DirectivesProperties|undefined => {
          // if a directive forest is passed in we don't have to build the forest again.
          directiveForest = directiveForest ?? buildDirectiveForest();

          const node = queryDirectiveForest(query.selectedElement, directiveForest);
          if (!node) {
            return;
          }

          const result: DirectivesProperties = {};

          const populateResultSet = (dir: DirectiveInstanceType|ComponentInstanceType) => {
            if (query.propertyQuery.type === PropertyQueryTypes.All) {
              result[dir.name] = {
                props: serializeDirectiveState(dir.instance),
                metadata: getDirectiveMetadata(dir.instance),
              };
            }
            if (query.propertyQuery.type === PropertyQueryTypes.Specified) {
              result[dir.name] = {
                props: deeplySerializeSelectedProperties(
                    dir.instance, query.propertyQuery.properties[dir.name] || []),
                metadata: getDirectiveMetadata(dir.instance),
              };
            }
          };

          node.directives.forEach(populateResultSet);
          if (node.component) {
            populateResultSet(node.component);
          }

          return result;
        };

const enum DirectiveMetadataKey {
  INPUTS = 'inputs',
  OUTPUTS = 'outputs',
  ENCAPSULATION = 'encapsulation',
  ON_PUSH = 'onPush',
}

// Gets directive metadata. For newer versions of Angular (v12+) it uses
// the global `getDirectiveMetadata`. For prior versions of the framework
// the method directly interacts with the directive/component definition.
export const getDirectiveMetadata = (dir: any): DirectiveMetadata => {
  const getMetadata = (window as any).ng.getDirectiveMetadata;
  if (getMetadata) {
    const metadata = getMetadata(dir);
    if (metadata) {
      return {
        inputs: metadata.inputs,
        outputs: metadata.outputs,
        encapsulation: metadata.encapsulation,
        onPush: metadata.changeDetection === ChangeDetectionStrategy.OnPush,
      };
    }
  }

  // Used in older Angular versions, prior to the introduction of `getDirectiveMetadata`.
  const safelyGrabMetadata = (key: DirectiveMetadataKey) => {
    try {
      return dir.constructor.ɵcmp ? dir.constructor.ɵcmp[key] : dir.constructor.ɵdir[key];
    } catch {
      console.warn(`Could not find metadata for key: ${key} in directive:`, dir);
      return undefined;
    }
  };

  return {
    inputs: safelyGrabMetadata(DirectiveMetadataKey.INPUTS),
    outputs: safelyGrabMetadata(DirectiveMetadataKey.OUTPUTS),
    encapsulation: safelyGrabMetadata(DirectiveMetadataKey.ENCAPSULATION),
    onPush: safelyGrabMetadata(DirectiveMetadataKey.ON_PUSH),
  };
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

const getRoots = () => {
  const roots =
      Array.from(document.documentElement.querySelectorAll('[ng-version]')) as HTMLElement[];

  const isTopLevel = (element: HTMLElement) => {
    let parent: HTMLElement|null = element;

    while (parent?.parentElement) {
      parent = parent.parentElement;
      if (parent.hasAttribute('ng-version')) {
        return false;
      }
    }

    return true;
  };

  return roots.filter(isTopLevel);
};

export const buildDirectiveForest = (): ComponentTreeNode[] => {
  const roots = getRoots();
  return Array.prototype.concat.apply([], Array.from(roots).map(buildDirectiveTree));
};

// Based on an ElementID we return a specific component node.
// If we can't find any, we return null.
export const queryDirectiveForest =
    (position: ElementPosition, forest: ComponentTreeNode[]): ComponentTreeNode|null => {
      if (!position.length) {
        return null;
      }
      let node: null|ComponentTreeNode = null;
      for (const i of position) {
        node = forest[i];
        if (!node) {
          return null;
        }
        forest = node.children;
      }
      return node;
    };

export const findNodeInForest =
    (position: ElementPosition, forest: ComponentTreeNode[]): HTMLElement|null => {
      const foundComponent: ComponentTreeNode|null = queryDirectiveForest(position, forest);
      return foundComponent ? (foundComponent.nativeElement as HTMLElement) : null;
    };

export const findNodeFromSerializedPosition =
    (serializedPosition: string): ComponentTreeNode|null => {
      const position: number[] = serializedPosition.split(',').map((index) => parseInt(index, 10));
      return queryDirectiveForest(position, buildDirectiveForest());
    };

export const updateState = (updatedStateData: UpdatedStateData): void => {
  const ngd = ngDebug();
  const node = queryDirectiveForest(updatedStateData.directiveId.element, buildDirectiveForest());
  if (!node) {
    console.warn(
        'Could not update the state of component', updatedStateData,
        'because the component was not found');
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
  updatedStateData.keyPath.forEach((key) => {
    parentObjectOfValueToUpdate = parentObjectOfValueToUpdate[key];
  });

  // When we try to set a property which only has a getter
  // the line below could throw an error.
  try {
    parentObjectOfValueToUpdate[valueKey] = updatedStateData.newValue;
  } catch {
  }
};
