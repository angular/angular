/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Events, MessageBus} from 'protocol';

import {ApplicationEnvironment} from '../application-environment/index';

import {DevToolsTabsComponent} from './devtools-tabs.component';
import {TabUpdate} from './tab-update/index';

describe('DevtoolsTabsComponent', () => {
  let messageBusMock: MessageBus<Events>;
  let applicationEnvironmentMock: ApplicationEnvironment;
  let comp: DevToolsTabsComponent;
  let mockThemeService: any;

  beforeEach(() => {
    messageBusMock = jasmine.createSpyObj('messageBus', ['on', 'once', 'emit', 'destroy']);
    applicationEnvironmentMock = jasmine.createSpyObj('applicationEnvironment', ['environment']);
    mockThemeService = {};

    comp = new DevToolsTabsComponent(
        new TabUpdate(), mockThemeService as any, messageBusMock, applicationEnvironmentMock);
  });

  it('should create instance from class', () => {
    expect(comp).toBeTruthy();
  });

  it('toggles inspector flag', () => {
    expect(comp.inspectorRunning).toBe(false);
    comp.toggleInspectorState();
    expect(comp.inspectorRunning).toBe(true);
    comp.toggleInspectorState();
    expect(comp.inspectorRunning).toBe(false);
  });

  it('emits inspector event', () => {
    comp.toggleInspector();
    expect(messageBusMock.emit).toHaveBeenCalledTimes(1);
    expect(messageBusMock.emit).toHaveBeenCalledWith('inspectorStart');
    comp.toggleInspector();
    expect(messageBusMock.emit).toHaveBeenCalledTimes(3);
    expect(messageBusMock.emit).toHaveBeenCalledWith('inspectorEnd');
    expect(messageBusMock.emit).toHaveBeenCalledWith('removeHighlightOverlay');
  });
});
