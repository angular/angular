/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DevToolsComponent} from '../../../ng-devtools';
import {DEEP_LINK_INSTANCE_ID} from '../../../ng-devtools/src/lib/application-providers/deep_link';
import {Events, MessageBus} from '../../../protocol';

import {AppComponent} from './app.component';

@Component({
  selector: 'ng-devtools',
  template: '',
})
export class MockDevToolsComponent {}

interface ChromeEvent {
  addListener(callback: () => void): void;
  removeListener(callback: () => void): void;
}

/** An instance id that no test sets, so it detects a listener that should not have fired. */
const UNTOUCHED = -1;

/** Dispatches a deep link message on the window. */
function postDeepLink(data: unknown, origin = window.location.origin): void {
  window.dispatchEvent(new MessageEvent('message', {origin, data}));
}

describe('AppComponent', () => {
  let messageBus: jasmine.SpyObj<MessageBus<Events>>;
  let onNavigated: jasmine.SpyObj<ChromeEvent>;

  async function createFixture(): Promise<ComponentFixture<AppComponent>> {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    messageBus = jasmine.createSpyObj('MessageBus', ['on', 'once', 'emit', 'destroy']);
    onNavigated = jasmine.createSpyObj('onNavigated', ['addListener', 'removeListener']);

    (globalThis as any).chrome = {
      devtools: {
        network: {onNavigated},
      },
    };

    TestBed.configureTestingModule({
      providers: [{provide: MessageBus, useValue: messageBus}],
    }).overrideComponent(AppComponent, {
      remove: {imports: [DevToolsComponent]},
      add: {imports: [MockDevToolsComponent]},
    });
  });

  afterAll(() => {
    delete (globalThis as any).chrome;
  });

  it('should create the app', async () => {
    const fixture = await createFixture();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should listen for navigations on init', async () => {
    await createFixture();

    expect(onNavigated.addListener).toHaveBeenCalled();
  });

  it('should record the instance id sent by a same origin deep link', async () => {
    await createFixture();

    postDeepLink({type: 'angular-devtools-deep-link', instanceId: 7});

    expect(TestBed.inject(DEEP_LINK_INSTANCE_ID)()).toBe(7);
  });

  it('should ignore a deep link from another origin', async () => {
    await createFixture();
    TestBed.inject(DEEP_LINK_INSTANCE_ID).set(UNTOUCHED);

    postDeepLink({type: 'angular-devtools-deep-link', instanceId: 7}, 'https://malicious.example');

    expect(TestBed.inject(DEEP_LINK_INSTANCE_ID)()).toBe(UNTOUCHED);
  });

  it('should ignore a message of another type', async () => {
    await createFixture();
    TestBed.inject(DEEP_LINK_INSTANCE_ID).set(UNTOUCHED);

    postDeepLink({type: 'some-other-message', instanceId: 7});

    expect(TestBed.inject(DEEP_LINK_INSTANCE_ID)()).toBe(UNTOUCHED);
  });

  it('should ignore a deep link whose instance id is not a number', async () => {
    await createFixture();
    TestBed.inject(DEEP_LINK_INSTANCE_ID).set(UNTOUCHED);

    postDeepLink({type: 'angular-devtools-deep-link', instanceId: '7'});

    expect(TestBed.inject(DEEP_LINK_INSTANCE_ID)()).toBe(UNTOUCHED);
  });

  it('should stop listening for deep links once destroyed', async () => {
    const fixture = await createFixture();
    TestBed.inject(DEEP_LINK_INSTANCE_ID).set(UNTOUCHED);
    fixture.destroy();

    postDeepLink({type: 'angular-devtools-deep-link', instanceId: 7});

    expect(TestBed.inject(DEEP_LINK_INSTANCE_ID)()).toBe(UNTOUCHED);
  });
});
