/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal, WritableSignal} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {MatMenuModule} from '@angular/material/menu';
import {Subject} from 'rxjs';
import {Events, MessageBus} from '../../../../protocol';

import {ApplicationEnvironment} from '../application-environment';
import {ThemeService} from '../application-services/theme_service';
import {DEEP_LINK_INSTANCE_ID} from '../application-services/deep_link_service';
import {APP_DATA} from '../application-providers/app_data';

import {FrameManager} from '../application-services/frame_manager';
import {SETTINGS_MOCK} from '../application-services/test-utils/settings_mock';
import {ThemeUi} from '../application-services/theme_types';
import {DevToolsTabsComponent} from './devtools-tabs.component';
import {DirectiveExplorerComponent} from './directive-explorer/directive-explorer.component';
import {TabUpdate} from './tab-update/index';

@Component({
  selector: 'ng-directive-explorer',
  template: '',
  imports: [MatMenuModule],
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
      imports: [MatMenuModule, DevToolsTabsComponent],
      providers: [
        TabUpdate,
        SETTINGS_MOCK,
        {provide: ThemeService, useFactory: () => ({currentTheme: new Subject<ThemeUi>()})},
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

  describe('deep link from Performance panel', () => {
    let deepLinkInstanceId: WritableSignal<number | null>;
    let fixture: ComponentFixture<DevToolsTabsComponent>;

    function setupWithDeepLink(): void {
      const busMock = jasmine.createSpyObj<MessageBus<Events>>('messageBus', [
        'on',
        'once',
        'emit',
        'destroy',
      ]);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [MatMenuModule, DevToolsTabsComponent],
        providers: [
          TabUpdate,
          SETTINGS_MOCK,
          {provide: ThemeService, useFactory: () => ({currentTheme: signal('light')})},
          {provide: MessageBus, useValue: busMock},
          {provide: ApplicationEnvironment, useValue: applicationEnvironmentMock},
          {provide: FrameManager, useFactory: () => FrameManager.initialize(456)},
        ],
      }).overrideComponent(DevToolsTabsComponent, {
        remove: {imports: [DirectiveExplorerComponent]},
        add: {imports: [MockDirectiveExplorerComponent]},
      });

      fixture = TestBed.createComponent(DevToolsTabsComponent);
      deepLinkInstanceId = TestBed.inject(DEEP_LINK_INSTANCE_ID);
      const appData = TestBed.inject(APP_DATA);
      appData.init({version: '19.0.0', devMode: true, ivy: true, hydration: false});
    }

    it('should switch to Components tab on deep link request', () => {
      setupWithDeepLink();

      // Switch to a different tab first.
      fixture.componentInstance.changeTab('Profiler');
      expect(fixture.componentInstance['activeTab']()).toBe('Profiler');

      // Trigger a deep link request.
      deepLinkInstanceId.set(42);
      TestBed.tick();

      // The deep link effect should have switched to the Components tab.
      expect(fixture.componentInstance['activeTab']()).toBe('Components');
    });

    it('should not change tab when no deep link is pending', () => {
      setupWithDeepLink();

      fixture.componentInstance.changeTab('Profiler');
      TestBed.tick();

      expect(fixture.componentInstance['activeTab']()).toBe('Profiler');
    });
  });
});
