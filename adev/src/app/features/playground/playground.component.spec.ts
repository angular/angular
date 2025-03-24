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

describe('TutorialPlayground', () => {
  let component: TutorialPlayground;
  let fixture: ComponentFixture<TutorialPlayground>;

  const fakeWindow = {
    location: {
      search: window.location.search,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TutorialPlayground],
      providers: [
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
        {
          provide: EmbeddedTutorialManager,
          useValue: {
            fetchAndSetTutorialFiles: () => {},
          },
        },
        {
          provide: NodeRuntimeSandbox,
          useVaue: {
            init: () => {},
          },
        },
      ],
    });

    fixture = TestBed.createComponent(TutorialPlayground);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
