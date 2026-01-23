/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FrameManager} from './application-services/frame_manager';
import {DevToolsComponent, LAST_SUPPORTED_VERSION} from './devtools.component';
import {DevToolsTabsComponent} from './devtools-tabs/devtools-tabs.component';
import {MessageBus} from '../../../protocol';
import {SETTINGS_MOCK} from './application-services/test-utils/settings_mock';

@Component({
  selector: 'ng-devtools-tabs',
  template: '',
})
export class MockNgDevToolsTabs {}

describe('DevtoolsComponent', () => {
  let fixture: ComponentFixture<DevToolsComponent>;
  let component: DevToolsComponent;

  beforeEach(() => {
    const mockMessageBus = jasmine.createSpyObj('MessageBus', ['on', 'emit', 'once']);

    TestBed.configureTestingModule({
      providers: [{provide: MessageBus, useValue: mockMessageBus}, SETTINGS_MOCK],
    }).overrideComponent(DevToolsComponent, {
      remove: {imports: [DevToolsTabsComponent], providers: [FrameManager]},
      add: {
        imports: [MockNgDevToolsTabs],
        providers: [{provide: FrameManager, useFactory: () => FrameManager.initialize(123)}],
      },
    });

    fixture = TestBed.createComponent(DevToolsComponent);
    component = fixture.componentInstance;
  });

  it('should render ng devtools tabs when Angular Status is EXISTS and is in dev mode and is supported version', async () => {
    component.angularStatus.set(component.AngularStatus.EXISTS);
    component.angularIsInDevMode.set(true);
    component.angularVersion.set('0.0.0');
    component.ivy.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('ng-devtools-tabs')).toBeTruthy();
  });

  it('should render Angular Devtools dev mode only support text when Angular Status is EXISTS and is angular is not in dev mode', async () => {
    component.angularStatus.set(component.AngularStatus.EXISTS);
    component.angularIsInDevMode.set(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.devtools-state-screen').textContent).toContain(
      'We detected an application built with a production configuration. Angular DevTools only supports development builds.',
    );
  });

  it('should render version support message when Angular Status is EXISTS and angular version is not supported', async () => {
    component.angularStatus.set(component.AngularStatus.EXISTS);
    component.angularIsInDevMode.set(true);
    component.angularVersion.set('1.0.0');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.devtools-state-screen').textContent).toContain(
      `Angular DevTools only supports Angular versions ${LAST_SUPPORTED_VERSION} and above`,
    );
  });

  it('should render Angular application not detected when Angular Status is DOES_NOT_EXIST', async () => {
    component.angularStatus.set(component.AngularStatus.DOES_NOT_EXIST);
    await fixture.whenStable();
    // expect the text to be "Angular application not detected"
    expect(fixture.nativeElement.querySelector('.devtools-state-screen').textContent).toContain(
      'Angular application not detected',
    );
  });

  it('should render loading svg when Angular Status is UNKNOWN', async () => {
    component.angularStatus.set(component.AngularStatus.UNKNOWN);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.loading svg')).toBeTruthy();
  });
});
