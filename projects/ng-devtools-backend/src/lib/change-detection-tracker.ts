import { ComponentTreeNode } from './component-tree';
import { runOutsideAngular, patchTemplate } from './utils';
import { Subject } from 'rxjs';

export const onChangeDetection$ = new Subject();

// We patch the component tView template function reference
// to detect when the change detection has completed and notify the client.
export const listenAndNotifyOnUpdates = (roots: ComponentTreeNode[]): void => {
  roots.forEach((root) => {
    const { component } = root;
    if (!component) {
      console.warn('Could not find component instance on root');
      return;
    }
    patchTemplate(component.instance, () => {
      runOutsideAngular(() => {
        setTimeout(() => onChangeDetection$.next(), 0);
      });
    });
  });
};
