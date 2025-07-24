/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {DebugElement, signal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';

import {NodeRuntimeSandbox} from '../node-runtime-sandbox.service';
import {Preview} from './preview.component';
import {LoadingStep} from '../enums/loading-steps';
import {NodeRuntimeError, NodeRuntimeState} from '../node-runtime-state.service';
import {PreviewError} from './preview-error.component';

describe('Preview', () => {
  // Before each is used as a callable function to prevent conflicts between tests
  const beforeEach = () => {
    const PREVIEW_URL = 'https://angular.dev/';

    const fakeNodeRuntimeSandbox: Partial<NodeRuntimeSandbox> = {
      previewUrl$: of(PREVIEW_URL),
    };

    const fakeNodeRuntimeState = {
      loadingStep: signal(LoadingStep.NOT_STARTED),
      error: signal<NodeRuntimeError | undefined>(undefined),
    };

    TestBed.configureTestingModule({
      imports: [Preview],
      providers: [
        {
          provide: NodeRuntimeSandbox,
          useValue: fakeNodeRuntimeSandbox,
        },
        {
          provide: NodeRuntimeState,
          useValue: fakeNodeRuntimeState,
        },
      ],
    });

    const fixture = TestBed.createComponent(Preview);

    const component = fixture.componentInstance;
    const iframeElement = fixture.debugElement.query(By.css('iframe'));

    fixture.detectChanges();

    return {
      fixture,
      component,
      iframeElement,
      PREVIEW_URL,
      fakeNodeRuntimeState,
      fakeNodeRuntimeSandbox,
      getLoadingElementsWrapper: () =>
        fixture.debugElement.query(By.css('adev-embedded-editor-preview-loading')),
    };
  };

  it('should set iframe src', () => {
    const {fixture, PREVIEW_URL} = beforeEach();
    const iframeElement = fixture.debugElement.query(By.css('iframe'));
    expect(iframeElement?.nativeElement?.src).toBe(PREVIEW_URL);
  });

  it('should not render loading elements if the loadingStep is READY or ERROR', () => {
    const {fixture, fakeNodeRuntimeState, getLoadingElementsWrapper} = beforeEach();

    fakeNodeRuntimeState.loadingStep.set(LoadingStep.READY);
    fixture.detectChanges();

    expect(getLoadingElementsWrapper()).toBeNull();

    fakeNodeRuntimeState.loadingStep.set(LoadingStep.ERROR);
    fixture.detectChanges();

    expect(getLoadingElementsWrapper()).toBeNull();
  });

  it('should render the correct loading element based on loadingStep', () => {
    const {fixture, fakeNodeRuntimeState} = beforeEach();

    function getDebugElements(): Record<number, DebugElement | null> {
      return {
        [LoadingStep.NOT_STARTED]: fixture.debugElement.query(
          By.css('.adev-embedded-editor-preview-loading-starting'),
        ),
        [LoadingStep.BOOT]: fixture.debugElement.query(
          By.css('.adev-embedded-editor-preview-loading-boot'),
        ),
        [LoadingStep.LOAD_FILES]: fixture.debugElement.query(
          By.css('.adev-embedded-editor-preview-loading-load-files'),
        ),
        [LoadingStep.INSTALL]: fixture.debugElement.query(
          By.css('.adev-embedded-editor-preview-loading-install'),
        ),
        [LoadingStep.START_DEV_SERVER]: fixture.debugElement.query(
          By.css('.adev-embedded-editor-preview-loading-start-dev-server'),
        ),
      };
    }

    for (
      let componentLoadingStep = 0;
      componentLoadingStep < LoadingStep.READY;
      componentLoadingStep++
    ) {
      fakeNodeRuntimeState.loadingStep.set(componentLoadingStep);
      fixture.detectChanges();

      const loadingElements = getDebugElements();

      for (
        let elementLoadingStep = 0;
        elementLoadingStep < LoadingStep.READY;
        elementLoadingStep++
      ) {
        if (elementLoadingStep === componentLoadingStep) {
          expect(loadingElements[elementLoadingStep]).toBeDefined();
        } else {
          expect(loadingElements[elementLoadingStep]).toBeNull();
        }
      }
    }
  });

  it('should render the error component and hide the iframe and loading element if loadingStep is ERROR', async () => {
    const {fixture, fakeNodeRuntimeState, iframeElement, getLoadingElementsWrapper} = beforeEach();

    fakeNodeRuntimeState.loadingStep.set(LoadingStep.ERROR);
    fakeNodeRuntimeState.error.set({message: 'Error message', type: undefined});
    fixture.detectChanges();

    await fixture.whenStable();

    expect(fixture.debugElement.query(By.directive(PreviewError))).toBeDefined();
    expect(getLoadingElementsWrapper()).toBeNull();
    expect(iframeElement).toBeNull();
  });
});
