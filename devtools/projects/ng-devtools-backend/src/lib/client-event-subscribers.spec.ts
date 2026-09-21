/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DirectivePosition, Events, MessageBus} from '../../../protocol';
import {subscribeToClientEvents} from './client-event-subscribers';
import {appIsAngular, appIsAngularIvy, appIsSupportedAngularVersion} from '../../../shared-utils';
import {Profiler} from './profiling/profiler';
import {IndexedNode, NodeArray} from './directive-forest/identity-tracker/identity-tracker';
import {getDirectiveForestManager} from './directive-forest/manager';
import {log} from './shared/utils/log';

describe('ClientEventSubscriber', () => {
  let messageBusMock: MessageBus<Events>;
  let appNode: HTMLElement | null = null;

  beforeEach(() => {
    // mock isAngular et al
    appNode = mockAngular();

    messageBusMock = jasmine.createSpyObj<MessageBus<Events>>('messageBus', [
      'on',
      'once',
      'emit',
      'destroy',
    ]);
  });

  afterEach(() => {
    // clearing the dom after each test
    if (appNode) {
      document.body.removeChild(appNode);
      appNode = null;
    }
  });

  it('is it Angular ready (testing purposed)', () => {
    expect(appIsAngular()).withContext('isAng').toBe(true);
    expect(appIsSupportedAngularVersion()).withContext('appIsSupportedAngularVersion').toBe(true);
    expect(appIsAngularIvy()).withContext('appIsAngularIvy').toBe(true);
  });

  it('should setup inspector', () => {
    subscribeToClientEvents(messageBusMock, {
      devtoolsDevMode: true,
      depsForTestOnly: {profiler: MockProfiler},
    });

    expect(messageBusMock.on).toHaveBeenCalledWith('inspectorStart', jasmine.any(Function));
    expect(messageBusMock.on).toHaveBeenCalledWith('inspectorEnd', jasmine.any(Function));
  });

  describe('getNestedProperties', () => {
    const position: DirectivePosition = {element: [0]};

    function getRegisteredHandler(topic: string): any {
      const onSpy = messageBusMock.on as jasmine.Spy;
      const call = onSpy.calls.allArgs().find(([name]) => name === topic);
      return call?.[1];
    }

    function createIndexedNode(instance: object): IndexedNode {
      return {
        position: [0],
        nativeElement: document.createElement('app'),
        tagName: 'app',
        component: {instance, name: 'Cmp', isElement: false},
        directives: [],
        children: [],
        hydration: undefined,
        controlFlowBlock: null,
        injector: undefined,
        static: false,
      } as IndexedNode;
    }

    function seedIndexedForest(nodes: IndexedNode[]): void {
      // Initializes the manager with the (empty) mock forest first, then replaces
      // the indexed forest with a synthetic one for the test.
      const manager = getDirectiveForestManager();
      (manager as any)._indexedForest = nodes;
    }

    beforeEach(() => {
      subscribeToClientEvents(messageBusMock, {devtoolsDevMode: true});
      seedIndexedForest([createIndexedNode({count: 0, label: '', enabled: false})]);
    });

    it('should not log an error when a nested property resolves to a falsy value', () => {
      const logErrorSpy = spyOn(log, 'error');
      const handler = getRegisteredHandler('getNestedProperties');

      handler(position, ['count']);
      handler(position, ['label']);
      handler(position, ['enabled']);

      expect(logErrorSpy).not.toHaveBeenCalled();
      expect(messageBusMock.emit).toHaveBeenCalledWith('nestedProperties', [
        position,
        jasmine.anything(),
        ['count'],
      ]);
    });

    it('should log an error when the property path cannot be resolved', () => {
      const logErrorSpy = spyOn(log, 'error');
      const handler = getRegisteredHandler('getNestedProperties');

      handler(position, ['missing']);

      expect(logErrorSpy).toHaveBeenCalled();
    });
  });
});

function mockAngular() {
  const appNode = document.createElement('app');
  appNode.setAttribute('ng-version', '17.0.0');
  (appNode as any).__ngContext__ = true;
  document.body.appendChild(appNode);

  (window as any).ng = {
    getComponent: () => {},
  };
  return appNode;
}

class MockProfiler extends Profiler {
  override destroy(): void {}

  override onIndexForest(_: NodeArray, __: NodeArray): void {}
}
