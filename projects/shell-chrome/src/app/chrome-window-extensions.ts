import { findNodeFromSerializedPosition } from 'ng-devtools-backend';

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
};
