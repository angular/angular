import { findNodeFromSerializedPosition } from 'ng-devtools-backend';
import { buildDirectiveForest, queryDirectiveForest } from '../../../ng-devtools-backend/src/lib/component-tree';

declare const ng: any;

export const initializeExtendedWindowOperations = () => {
  extendWindowOperations(window, { inspectedApplication: chromeWindowExtensions });
};

const extendWindowOperations = <T>(target, classImpl: T) => {
  for (const key of Object.keys(classImpl)) {
    if (target[key] != null) {
      console.warn(`A window function or object named ${key} would be overwritten`);
    }
  }

  Object.assign(target, classImpl);
};

const chromeWindowExtensions = {
  findConstructorByPosition: (serializedId: string): Element | undefined => {
    const node = findNodeFromSerializedPosition(serializedId);
    if (node === null) {
      console.error(`Cannot find element associated with node ${serializedId}`);
      return;
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
  findFunctionByPosition: (args): any => {
    const { directivePosition, keyPath } = JSON.parse(args);
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
      return traverseDirective(node.directives[directivePosition.directive].instance, keyPath);
    }
    if (node.component) {
      return traverseDirective(node.component.instance, keyPath);
    }
  },
};

const traverseDirective = (dir: any, keyPath: string[]): any => {
  for (const key of keyPath) {
    if (!dir[key]) {
      return;
    }
    dir = dir[key];
  }
  return dir;
};
