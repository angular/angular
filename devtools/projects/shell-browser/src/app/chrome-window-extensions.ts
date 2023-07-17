/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {findNodeFromSerializedPosition} from 'ng-devtools-backend';

import {buildDirectiveForest, queryDirectiveForest} from '../../../ng-devtools-backend/src/lib/component-tree';

export const initializeExtendedWindowOperations = () => {
  extendWindowOperations(window, {inspectedApplication: chromeWindowExtensions});
};

const extendWindowOperations = <T extends {}>(target, classImpl: T) => {
  for (const key of Object.keys(classImpl)) {
    if (target[key] != null) {
      console.warn(`A window function or object named ${key} would be overwritten`);
    }
  }

  Object.assign(target, classImpl);
};

const chromeWindowExtensions = {
  findConstructorByPosition: (serializedId: string, directiveIndex: number):
                                 Element | undefined => {
    const node = findNodeFromSerializedPosition(serializedId);
    if (node === null) {
      console.error(`Cannot find element associated with node ${serializedId}`);
      return;
    }
    if (directiveIndex !== undefined) {
      if (node.directives[directiveIndex]) {
        return node.directives[directiveIndex].instance.constructor;
      } else {
        console.error(
            `Could not find the directive in the current node at index ${directiveIndex}`);
        return;
      }
    }
    if (node.component) {
      return node.component.instance.constructor;
    } else {
      console.error('This component has no instance and therefore no constructor');
    }
  },
  findDomElementByPosition: (serializedId: string): Node | undefined => {
    const node = findNodeFromSerializedPosition(serializedId);
    if (node === null) {
      console.error(`Cannot find element associated with node ${serializedId}`);
      return undefined;
    }
    return node.nativeElement;
  },
  findPropertyByPosition: (args): any => {
    const {directivePosition, objectPath} = JSON.parse(args);
    const node = queryDirectiveForest(directivePosition.element, buildDirectiveForest());
    if (node === null) {
      console.error(`Cannot find element associated with node ${directivePosition}`);
      return undefined;
    }

    const isDirective = directivePosition.directive !== undefined &&
        node.directives[directivePosition.directive] &&
        typeof node.directives[directivePosition.directive] === 'object';
    if (isDirective) {
      return traverseDirective(node.directives[directivePosition.directive].instance, objectPath);
    }
    if (node.component) {
      return traverseDirective(node.component.instance, objectPath);
    }
  },
};

const traverseDirective = (dir: any, objectPath: string[]): any => {
  for (const key of objectPath) {
    if (!dir[key]) {
      return;
    }
    dir = dir[key];
  }
  return dir;
};
