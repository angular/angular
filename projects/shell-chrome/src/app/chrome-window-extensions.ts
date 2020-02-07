import { findNodeFromSerializedPathId } from 'ng-devtools-backend';

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
  findConstructorByPathId: (serializedId: string): Element => {
    const node = findNodeFromSerializedPathId(serializedId);
    if (node === null) {
      console.error(`Cannot find element associated with node ${serializedId}`);
      return null;
    }
    const root = ng.getComponent(node.nativeElement);
    if (root) {
      return root.constructor;
    } else {
      console.error('This component has no instance and therefore no constructor');
    }
  },
};
