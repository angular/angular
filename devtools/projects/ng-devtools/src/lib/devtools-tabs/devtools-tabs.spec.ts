/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {Events, MessageBus} from '../../../../protocol';
import {Subject} from 'rxjs';

import {ApplicationEnvironment} from '../application-environment';
import {Theme, ThemeService} from '../application-services/theme_service';

import {DevToolsTabsComponent} from './devtools-tabs.component';
import {TabUpdate} from './tab-update/index';
import {DirectiveExplorerComponent} from './directive-explorer/directive-explorer.component';
import {FrameManager} from '../application-services/frame_manager';
import {SETTINGS_MOCK} from '../application-services/test-utils/settings_mock';

@Component({
  selector: 'ng-directive-explorer',
  template: '',
  imports: [MatTooltip, MatMenuModule],
})
export class MockDirectiveExplorerComponent {}

describe('DevtoolsTabsComponent', () => {
  let messageBusMock: MessageBus<Events>;
  let applicationEnvironmentMock: ApplicationEnvironment;
  let comp: DevToolsTabsComponent;

  beforeEach(async () => {
    messageBusMock = jasmine.createSpyObj('messageBus', ['on', 'once', 'emit', 'destroy']);
    applicationEnvironmentMock = jasmine.createSpyObj('applicationEnvironment', ['environment']);

    await TestBed.configureTestingModule({
      imports: [MatTooltip, MatMenuModule, DevToolsTabsComponent],
      providers: [
        TabUpdate,
        SETTINGS_MOCK,
        {provide: ThemeService, useFactory: () => ({currentTheme: new Subject<Theme>()})},
        {provide: MessageBus, useValue: messageBusMock},
        {provide: ApplicationEnvironment, useValue: applicationEnvironmentMock},
        {provide: FrameManager, useFactory: () => FrameManager.initialize(123)},
      ],
    })
      .overrideComponent(DevToolsTabsComponent, {
        remove: {imports: [DirectiveExplorerComponent]},
        add: {imports: [MockDirectiveExplorerComponent]},
      })
      .compileComponents();

    const fixture = TestBed.createComponent(DevToolsTabsComponent);
    comp = fixture.componentInstance;
  });

  it('should create instance from class', () => {
    expect(comp).toBeTruthy();
  });

  it('toggles inspector flag', () => {
    expect(comp.inspectorRunning()).toBe(false);
    comp.toggleInspectorState();
    expect(comp.inspectorRunning()).toBe(true);
    comp.toggleInspectorState();
    expect(comp.inspectorRunning()).toBe(false);
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

  it('should emit a selectedFrame when emitSelectedFrame is called', () => {
    let contentScriptConnected: Function = () => {};

    // mock message bus on method with jasmine fake call in order to pick out callback
    // and call it with frame
    (messageBusMock.on as any).and.callFake((topic: string, cb: Function) => {
      if (topic === 'contentScriptConnected') {
        contentScriptConnected = cb;
      }
    });

    const frameId = 1;
    expect(contentScriptConnected).toEqual(jasmine.any(Function));
    contentScriptConnected(frameId, 'name', 'http://localhost:4200/url');
    spyOn(comp.frameSelected, 'emit');
    comp.emitSelectedFrame({
      target: {
        value: '1',
      },
    } as unknown as Event);

    expect(comp.frameSelected.emit).toHaveBeenCalledWith(comp.frameManager.frames()[0]);
  });
});
