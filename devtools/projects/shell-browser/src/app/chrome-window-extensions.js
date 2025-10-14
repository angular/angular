/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {viewSourceFromRouter} from '../../../ng-devtools-backend';
import {
  buildDirectiveForest,
  getInjectorFromElementNode,
  findNodeFromSerializedPosition,
  queryDirectiveForest,
} from '../../../ng-devtools-backend/src/lib/component-tree/component-tree';
import {ngDebugClient} from '../../../ng-devtools-backend/src/lib/ng-debug-api/ng-debug-api';
export const initializeExtendedWindowOperations = () => {
  extendWindowOperations(globalThis, {inspectedApplication: chromeWindowExtensions});
};
const extendWindowOperations = (target, classImpl) => {
  for (const key of Object.keys(classImpl)) {
    if (target[key] != null) {
      console.warn(`A window function or object named ${key} would be overwritten`);
    }
  }
  Object.assign(target, classImpl);
};
const chromeWindowExtensions = {
  findConstructorByPosition: (serializedId, directiveIndex) => {
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
          `Could not find the directive in the current node at index ${directiveIndex}`,
        );
        return;
      }
    }
    if (node.component) {
      return node.component.instance.constructor;
    } else {
      console.error('This component has no instance and therefore no constructor');
      return;
    }
  },
  findDomElementByPosition: (serializedId) => {
    const node = findNodeFromSerializedPosition(serializedId);
    if (node === null) {
      console.error(`Cannot find element associated with node ${serializedId}`);
      return undefined;
    }
    return node.nativeElement;
  },
  findSignalNodeByPosition: (args) => {
    const ng = ngDebugClient();
    const {element, signalId} = JSON.parse(args);
    const node = queryDirectiveForest(element, buildDirectiveForest());
    if (node === null) {
      console.error(`Cannot find element associated with node ${element}`);
      return undefined;
    }
    const injector = getInjectorFromElementNode(node.nativeElement);
    if (!injector) {
      return;
    }
    const graph = ng.ɵgetSignalGraph?.(injector);
    if (!graph) {
      return;
    }
    const signal = graph.nodes.find((node) => node.id === signalId);
    if (!signal) {
      return;
    }
    return signal.debuggableFn;
  },
  findPropertyByPosition: (args) => {
    const {directivePosition, objectPath} = JSON.parse(args);
    const node = queryDirectiveForest(directivePosition.element, buildDirectiveForest());
    if (node === null) {
      console.error(`Cannot find element associated with node ${directivePosition}`);
      return undefined;
    }
    const isDirective =
      directivePosition.directive !== undefined &&
      node.directives[directivePosition.directive] &&
      typeof node.directives[directivePosition.directive] === 'object';
    if (isDirective) {
      return traverseDirective(node.directives[directivePosition.directive].instance, objectPath);
    }
    if (node.component) {
      return traverseDirective(node.component.instance, objectPath);
    }
  },
  findConstructorByNameForRouter: (name, type) => {
    return viewSourceFromRouter(name, type);
  },
};
const traverseDirective = (dir, objectPath) => {
  for (const key of objectPath) {
    if (!dir[key]) {
      return;
    }
    dir = dir[key];
  }
  return dir;
};
//# sourceMappingURL=chrome-window-extensions.js.map
