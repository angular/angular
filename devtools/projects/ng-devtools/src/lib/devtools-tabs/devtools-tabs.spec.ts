/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {Events, MessageBus} from 'protocol';
import {Subject} from 'rxjs';

import {ApplicationEnvironment} from '../application-environment';
import {Theme, ThemeService} from '../theme-service';

import {DevToolsTabsComponent} from './devtools-tabs.component';
import {TabUpdate} from './tab-update/index';
import {DirectiveExplorerComponent} from './directive-explorer/directive-explorer.component';

@Component({
  selector: 'ng-directive-explorer',
  template: '',
  standalone: true,
  imports: [MatTooltip, MatMenuModule],
})
export class MockDirectiveExplorerComponent {}

describe('DevtoolsTabsComponent', () => {
  let messageBusMock: MessageBus<Events>;
  let applicationEnvironmentMock: ApplicationEnvironment;
  let comp: DevToolsTabsComponent;

  beforeEach(() => {
    messageBusMock = jasmine.createSpyObj('messageBus', ['on', 'once', 'emit', 'destroy']);
    applicationEnvironmentMock = jasmine.createSpyObj('applicationEnvironment', ['environment']);
    TestBed.configureTestingModule({
      imports: [MatTooltip, MatMenuModule, DevToolsTabsComponent],
      providers: [
        TabUpdate,
        {provide: ThemeService, useFactory: () => ({currentTheme: new Subject<Theme>()})},
        {provide: MessageBus, useValue: messageBusMock},
        {provide: ApplicationEnvironment, useValue: applicationEnvironmentMock},
      ],
    }).overrideComponent(DevToolsTabsComponent, {
      remove: {imports: [DirectiveExplorerComponent]},
      add: {imports: [MockDirectiveExplorerComponent]},
    });

    const fixture = TestBed.createComponent(DevToolsTabsComponent);
    comp = fixture.componentInstance;
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
