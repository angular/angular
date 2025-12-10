/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Events, MessageBus} from '../../../protocol';
import {
  isAngularInternalSignal,
  RawSignalGraphNode,
  subscribeToClientEvents,
} from './client-event-subscribers';
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

  describe('isAngularInternalSignal', () => {
    const baseNode: RawSignalGraphNode = {
      id: '1',
      kind: 'signal',
      epoch: 1,
    };
    const angularFn = Object.assign(() => {}, {
      toString: () => 'function(){/* node_modules/@angular/forms */}',
    });

    it('returns true for unknown nodes and ɵ-prefixed labels', () => {
      expect(isAngularInternalSignal({...baseNode, kind: 'unknown'})).toBeTrue();
      expect(isAngularInternalSignal({...baseNode, label: 'ɵfoo'})).toBeTrue();
    });

    it('returns true for functions that look like Angular internals', () => {
      const fn = function ɵɵinternalFn() {};
      expect(isAngularInternalSignal({...baseNode, debuggableFn: fn})).toBeTrue();
    });

    it('returns true for common Angular-provided debug names when source is Angular', () => {
      expect(
        isAngularInternalSignal({
          ...baseNode,
          label: 'reactiveHref',
          debuggableFn: angularFn as () => void,
        }),
      ).toBeTrue();
      expect(
        isAngularInternalSignal({
          ...baseNode,
          label: 'pristine',
          debuggableFn: angularFn as () => void,
        }),
      ).toBeTrue();
      expect(
        isAngularInternalSignal({
          ...baseNode,
          label: 'touchedReactive',
          debuggableFn: angularFn as () => void,
        }),
      ).toBeTrue();
      expect(
        isAngularInternalSignal({
          ...baseNode,
          label: '_pristine',
          debuggableFn: angularFn as () => void,
        }),
      ).toBeTrue();
      expect(
        isAngularInternalSignal({
          ...baseNode,
          label: '_status',
          debuggableFn: angularFn as () => void,
        }),
      ).toBeTrue();
    });

    it('returns true for functions with Angular paths in source', () => {
      expect(
        isAngularInternalSignal({...baseNode, debuggableFn: angularFn as () => void}),
      ).toBeTrue();
    });

    it('returns false for user-defined signals', () => {
      const userFn = function userEffect() {};
      expect(
        isAngularInternalSignal({...baseNode, label: 'user', debuggableFn: userFn}),
      ).toBeFalse();
      expect(
        isAngularInternalSignal({...baseNode, label: 'reactiveTest', debuggableFn: userFn}),
      ).toBeFalse();
      expect(
        isAngularInternalSignal({...baseNode, label: 'touched', debuggableFn: userFn}),
      ).toBeFalse();
      expect(
        isAngularInternalSignal({...baseNode, label: 'pristine', debuggableFn: userFn}),
      ).toBeFalse();
    });

    it('prefers source over label when available', () => {
      const userFn = function pristine() {};

      expect(
        isAngularInternalSignal({
          ...baseNode,
          label: 'pristine',
          debuggableFn: angularFn as () => void,
        }),
      ).toBeTrue();
      expect(
        isAngularInternalSignal({...baseNode, label: 'pristine', debuggableFn: userFn}),
      ).toBeFalse();
    });

    it('returns true when debugName is explicitly marked internal', () => {
      expect(isAngularInternalSignal({...baseNode, label: 'ɵanything'})).toBeTrue();
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

class MockDirectiveForestHooks extends DirectiveForestHooks {
  profiler = {
    subscribe: () => {},
    changeDetection$: of(),
  } as any as DirectiveForestHooks['profiler'];
  initialize = () => {};
}
