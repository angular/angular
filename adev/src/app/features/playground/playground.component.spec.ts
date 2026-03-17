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
});
