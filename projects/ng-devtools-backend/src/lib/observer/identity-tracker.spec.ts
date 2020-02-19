import { IdentityTracker } from './identity-tracker';
import { DebuggingAPI } from '../interfaces';
import { DirectiveInstanceType } from '../component-tree';

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
      position: [0, 0],
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
      position: [0],
    });

    expect(tracker.getDirectivePosition(dirInstance)).toEqual([0, 0]);
    expect(tracker.getDirectivePosition(cmpInstance)).toEqual([0, 0]);
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
      position: [0, 0],
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
      position: [0],
    });

    expect(tracker.getDirectivePosition(rootCmp)).toEqual([0]);
    tracker.insert(siblingEl as any, siblingCmp);
    expect(tracker.getDirectivePosition(siblingCmp)).toEqual([0, 1]);
  });

  it('should update indexes on insertion of root', () => {
    const rootEl = {
      children: [],
      tagName: 'parent',
    };
    const rootCmp = {
      name: 'rootCmp',
    };

    const secondRootEl = {
      children: [],
      tagName: 'second-root',
    };
    const secondRootCmp = {
      name: 'secondRoot',
    };

    const nodeComponent = new Map<any, any>();
    nodeComponent.set(rootEl, rootCmp);
    nodeComponent.set(secondRootEl, secondRootCmp);

    const componentNode = new Map<any, any>();
    componentNode.set(rootCmp, rootEl);
    componentNode.set(secondRootCmp, secondRootEl);

    debuggingAPI = {
      getComponent(node: Node): any {
        return nodeComponent.get(node);
      },
      getDirectives(_: Node): any[] {
        return [];
      },
      getHostElement(cmp: any): HTMLElement {
        return componentNode.get(cmp);
      },
    };

    tracker = new IdentityTracker(debuggingAPI);

    tracker.index({
      children: [],
      nativeElement: rootEl as any,
      directives: [],
      component: {
        instance: rootCmp,
        name: 'CMP1',
      },
      element: 'CMP',
      position: [0],
    });

    expect(tracker.getDirectivePosition(rootCmp)).toEqual([0]);
    tracker.insert(secondRootEl as any, secondRootCmp);
    expect(tracker.getDirectivePosition(secondRootCmp)).toEqual([0]);
    expect(tracker.getDirectivePosition(rootCmp)).toEqual([1]);
  });
});
