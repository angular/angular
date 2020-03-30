import { buildDirectiveForest, ComponentTreeNode } from './component-tree';
import { runOutsideAngular, patchTemplate } from './utils';

let hookInitialized = false;

export const onChangeDetection = (callback: () => void): void => {
  if (hookInitialized) {
    return;
  }
  const forest = buildDirectiveForest();
  listenAndNotifyOnUpdates(forest, callback);
  hookInitialized = true;
};

// We patch the component tView template function reference
// to detect when the change detection has completed and notify the client.
const listenAndNotifyOnUpdates = (roots: ComponentTreeNode[], callback: () => void): void => {
  roots.forEach((root) => {
    const { component } = root;
    if (!component) {
      console.warn('Could not find component instance on root');
      return;
    }
    patchTemplate(component.instance, () => {
      runOutsideAngular(() => {
        setTimeout(callback, 0);
      });
    });
  });
};
