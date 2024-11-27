/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {
  EMBEDDED_EDITOR_SELECTOR,
  EmbeddedEditor,
  NodeRuntimeSandbox,
  EmbeddedTutorialManager,
} from '../../editor';

import {mockAsyncProvider} from '../../core/services/inject-async';
import TutorialPlayground from './playground.component';

@Component({
  selector: EMBEDDED_EDITOR_SELECTOR,
  template: '<div>FakeEmbeddedEditor</div>',
})
class FakeEmbeddedEditor {}

class FakeNodeRuntimeSandbox {
  init() {
    return Promise.resolve();
  }
}

describe('TutorialPlayground', () => {
  let component: TutorialPlayground;
  let fixture: ComponentFixture<TutorialPlayground>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TutorialPlayground],
      providers: [
        {
          provide: EmbeddedTutorialManager,
          useValue: {
            fetchAndSetTutorialFiles: () => {},
          },
        },
        mockAsyncProvider(NodeRuntimeSandbox, FakeNodeRuntimeSandbox),
      ],
    });

    TestBed.overrideComponent(TutorialPlayground, {
      remove: {
        imports: [EmbeddedEditor],
      },
      add: {
        imports: [FakeEmbeddedEditor],
      },
    });

    fixture = TestBed.createComponent(TutorialPlayground);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
