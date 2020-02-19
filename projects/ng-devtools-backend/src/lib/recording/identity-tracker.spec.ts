import { IdentityTracker } from './identity-tracker';
import { DebuggingAPI } from '../interfaces';
import { DirectiveInstanceType } from '../component-tree';
import { debug } from 'ng-packagr/lib/utils/log';

let debuggingAPI: DebuggingAPI = {
  getComponent(node: Node): any {},
  getDirectives(node: Node): any[] {
    return [];
  },
  getHostElement(cmp: any): HTMLElement {
    return null;
  },
};

describe('identity tracker', () => {
  let tracker: IdentityTracker;

  beforeEach(() => {
    tracker = new IdentityTracker(debuggingAPI);
  });

  it('should index trees', () => {
    const dirInstance = {};
    const dir: DirectiveInstanceType = {
      instance: dirInstance,
      name: 'DIR',
    };
    const cmpInstance = {};
    const nested = {
      id: [0, 0],
      element: 'CMP2',
      component: {
        name: 'CMP2',
        instance: cmpInstance,
      },
      directives: [dir],
      nativeElement: undefined,
      children: [],
    };
    tracker.index({
      children: [nested],
      nativeElement: undefined,
      directives: [],
      component: {
        instance: {},
        name: 'CMP1',
      },
      element: 'CMP',
      id: [0],
    });

    expect(tracker.getDirectiveID(dirInstance)).toEqual([0, 0]);
    expect(tracker.getDirectiveID(cmpInstance)).toEqual([0, 0]);
  });

  it('should update indexes on insertion', () => {
    const childEl = {
      children: [],
      parentElement: null,
      tagName: 'child',
    };
    const childCmp = {
      name: 'childCmp',
    };

    const siblingEl = {
      children: [],
      parentElement: null,
      tagName: 'sibling',
    };
    const siblingCmp = {
      name: 'siblingCmp',
    };

    const rootEl = {
      children: [childEl, siblingEl],
      tagName: 'parent',
    };
    const rootCmp = {
      name: 'rootCmp',
    };

    childEl.parentElement = rootEl;
    siblingEl.parentElement = rootEl;

    const nested = {
      id: [0, 0],
      element: 'CMP2',
      component: {
        name: 'CMP2',
        instance: childCmp,
      },
      directives: [],
      nativeElement: childEl as any,
      children: [],
    };

    const nodeComponent = new Map<any, any>();
    nodeComponent.set(rootEl, rootCmp);
    nodeComponent.set(childEl, childCmp);
    nodeComponent.set(siblingEl, siblingCmp);

    const componentNode = new Map<any, any>();
    componentNode.set(rootCmp, rootEl);
    componentNode.set(childCmp, childEl);
    componentNode.set(siblingCmp, siblingEl);

    debuggingAPI = {
      getComponent(node: Node): any {
        return nodeComponent.get(node);
      },
      getDirectives(node: Node): any[] {
        return [];
      },
      getHostElement(cmp: any): HTMLElement {
        return componentNode.get(cmp);
      },
    };

    tracker = new IdentityTracker(debuggingAPI);

    tracker.index({
      children: [nested],
      nativeElement: rootEl as any,
      directives: [],
      component: {
        instance: rootCmp,
        name: 'CMP1',
      },
      element: 'CMP',
      id: [0],
    });

    expect(tracker.getDirectiveID(rootCmp)).toEqual([0]);
    tracker.insert(siblingEl as any, siblingCmp);
    expect(tracker.getDirectiveID(siblingCmp)).toEqual([0, 1]);
  });
});
