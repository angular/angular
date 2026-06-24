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
import {DevToolsComponent} from './devtools.component';
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

  it('should render ng devtools tabs when Angular Status is EXISTS and is in dev mode and is supported version', () => {
    component.angularStatus.set(component.AngularStatus.EXISTS);
    component.angularIsInDevMode.set(true);
    component.angularVersion.set('0.0.0');
    component.ivy.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ng-devtools-tabs')).toBeTruthy();
  });

  it('should render Angular Devtools dev mode only support text when Angular Status is EXISTS and is angular is not in dev mode', () => {
    component.angularStatus.set(component.AngularStatus.EXISTS);
    component.angularIsInDevMode.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.devtools').textContent).toContain(
      'We detected an application built with production configuration. Angular DevTools only supports development builds.',
    );
  });

  it('should render version support message when Angular Status is EXISTS and angular version is not supported', () => {
    component.angularStatus.set(component.AngularStatus.EXISTS);
    component.angularIsInDevMode.set(true);
    component.angularVersion.set('1.0.0');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.devtools').textContent).toContain(
      'Angular Devtools only supports Angular versions 12 and above',
    );
  });

  it('should render Angular application not detected when Angular Status is DOES_NOT_EXIST', () => {
    component.angularStatus.set(component.AngularStatus.DOES_NOT_EXIST);
    fixture.detectChanges();
    // expect the text to be "Angular application not detected"
    expect(fixture.nativeElement.querySelector('.not-detected').textContent).toContain(
      'Angular application not detected',
    );
  });

  it('should render loading svg when Angular Status is UNKNOWN', () => {
    component.angularStatus.set(component.AngularStatus.UNKNOWN);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading svg')).toBeTruthy();
  });
});
