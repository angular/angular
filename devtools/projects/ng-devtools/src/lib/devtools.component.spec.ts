/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FrameManager} from './application-services/frame_manager';
import {DevToolsComponent, LAST_SUPPORTED_VERSION} from './devtools.component';
import {DevToolsTabsComponent} from './devtools-tabs/devtools-tabs.component';
import {MessageBus} from '../../../protocol';
import {SETTINGS_MOCK} from './application-services/test-utils/settings_mock';
import {APP_DATA, AppData} from './application-providers/app_data';

@Component({
  selector: 'ng-devtools-tabs',
  template: '',
})
export class MockNgDevToolsTabs {}

async function configureTestingModule(appData?: Partial<AppData>) {
  const mockMessageBus = jasmine.createSpyObj('MessageBus', ['on', 'emit', 'once']);

  TestBed.configureTestingModule({
    providers: [
      {provide: MessageBus, useValue: mockMessageBus},
      SETTINGS_MOCK,
      {
        provide: APP_DATA,
        useValue: signal<AppData>({
          devMode: true,
          ivy: true,
          hydration: false,
          fullVersion: '0.0.0',
          majorVersion: 0,
          minorVersion: 0,
          patchVersion: 0,
          ...appData,
        }),
      },
    ],
  }).overrideComponent(DevToolsComponent, {
    remove: {imports: [DevToolsTabsComponent], providers: [FrameManager]},
    add: {
      imports: [MockNgDevToolsTabs],
      providers: [{provide: FrameManager, useFactory: () => FrameManager.initialize(123)}],
    },
  });

  const fixture = TestBed.createComponent(DevToolsComponent);
  const component = fixture.componentInstance;

  await fixture.whenStable();

  return {
    fixture,
    component,
  };
}

describe('DevtoolsComponent', () => {
  it('should render ng devtools tabs when Angular Status is EXISTS and is in dev mode and is supported version', async () => {
    const {fixture, component} = await configureTestingModule({
      devMode: true,
      ivy: true,
      fullVersion: '0.0.0',
      majorVersion: 0,
      minorVersion: 0,
      patchVersion: 0,
    });
    component.angularStatus.set(component.AngularStatus.EXISTS);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('ng-devtools-tabs')).toBeTruthy();
  });

  it('should render Angular Devtools dev mode only support text when Angular Status is EXISTS and is angular is not in dev mode', async () => {
    const {fixture, component} = await configureTestingModule({devMode: false});
    component.angularStatus.set(component.AngularStatus.EXISTS);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.devtools-state-screen').textContent).toContain(
      'We detected an application built with a production configuration. Angular DevTools only supports development builds.',
    );
  });

  it('should render version support message when Angular Status is EXISTS and angular version is not supported', async () => {
    const {fixture, component} = await configureTestingModule({
      devMode: true,
      fullVersion: '1.0.0',
      majorVersion: 1,
    });
    component.angularStatus.set(component.AngularStatus.EXISTS);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.devtools-state-screen').textContent).toContain(
      `Angular DevTools only supports Angular versions ${LAST_SUPPORTED_VERSION} and above`,
    );
  });

  it('should render Angular application not detected when Angular Status is DOES_NOT_EXIST', async () => {
    const {fixture, component} = await configureTestingModule();
    component.angularStatus.set(component.AngularStatus.DOES_NOT_EXIST);
    await fixture.whenStable();

    // expect the text to be "Angular application not detected"
    expect(fixture.nativeElement.querySelector('.devtools-state-screen').textContent).toContain(
      'Angular application not detected',
    );
  });

  it('should render loading svg when Angular Status is UNKNOWN', async () => {
    const {fixture, component} = await configureTestingModule();
    component.angularStatus.set(component.AngularStatus.UNKNOWN);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.loading svg')).toBeTruthy();
  });
});
