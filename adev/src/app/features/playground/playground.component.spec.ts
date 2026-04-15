/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WINDOW} from '@angular/docs';

import {EmbeddedTutorialManager} from '../../editor';
import {NodeRuntimeSandbox} from '../../editor/node-runtime-sandbox.service';

import TutorialPlayground from './playground.component';
import {provideRouter} from '@angular/router';
import {mockAsyncProvider} from '../../core/services/inject-async';

describe('TutorialPlayground', () => {
  let component: TutorialPlayground;
  let fixture: ComponentFixture<TutorialPlayground>;

  const fakeWindow = {
    location: {
      search: window.location.search,
    },
  };

  beforeEach(async () => {
    class FakeEmbeddedTutorialManager {
      fetchAndSetTutorialFiles() {}
    }

    class FakeNodeRuntimeSandbox {
      init() {}
      reset() {}
    }

    TestBed.configureTestingModule({
      imports: [TutorialPlayground],
      providers: [
        provideRouter([]),
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
        mockAsyncProvider(NodeRuntimeSandbox, FakeNodeRuntimeSandbox),
        mockAsyncProvider(EmbeddedTutorialManager, FakeEmbeddedTutorialManager),
      ],
    });

    fixture = TestBed.createComponent(TutorialPlayground);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call reset on the sandbox before it is initialized', async () => {
    const fakeSandbox = {reset: jasmine.createSpy('reset')} as any;
    component['nodeRuntimeSandbox'] = fakeSandbox;
    component['isSandboxReady'].set(false);
    spyOn<any>(component, 'loadTemplate').and.resolveTo();
    await component.changeTemplate(component.templates[1]);
    expect(fakeSandbox.reset).not.toHaveBeenCalled();
  });

  it('should call reset on the sandbox after it is initialized', async () => {
    const fakeSandbox = {reset: jasmine.createSpy('reset')} as any;
    component['nodeRuntimeSandbox'] = fakeSandbox;
    component['isSandboxReady'].set(true);
    spyOn<any>(component, 'loadTemplate').and.resolveTo();
    await component.changeTemplate(component.templates[1]);
    expect(fakeSandbox.reset).toHaveBeenCalled();
  });
});
