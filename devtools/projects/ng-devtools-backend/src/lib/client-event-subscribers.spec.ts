/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Events, MessageBus} from '../../../protocol';
import {subscribeToClientEvents} from './client-event-subscribers';
import {appIsAngular, appIsAngularIvy, appIsSupportedAngularVersion} from '../../../shared-utils';
import {DirectiveForestHooks} from './hooks/hooks';
import {of} from 'rxjs';

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
    subscribeToClientEvents(messageBusMock, {directiveForestHooks: MockDirectiveForestHooks});

    expect(messageBusMock.on).toHaveBeenCalledWith('inspectorStart', jasmine.any(Function));
    expect(messageBusMock.on).toHaveBeenCalledWith('inspectorEnd', jasmine.any(Function));
    expect(messageBusMock.on).toHaveBeenCalledWith('createHighlightOverlay', jasmine.any(Function));
    expect(messageBusMock.on).toHaveBeenCalledWith('removeHighlightOverlay', jasmine.any(Function));
    expect(messageBusMock.on).toHaveBeenCalledWith('createHydrationOverlay', jasmine.any(Function));
    expect(messageBusMock.on).toHaveBeenCalledWith('removeHydrationOverlay', jasmine.any(Function));
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

class MockDirectiveForestHooks extends DirectiveForestHooks {
  profiler = {
    subscribe: () => {},
    changeDetection$: of(),
  } as any as DirectiveForestHooks['profiler'];
  initialize = () => {};
}
