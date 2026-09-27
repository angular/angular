/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCS_VIEWER_SELECTOR, DocViewer, TutorialConfig, TutorialType, WINDOW} from '@angular/docs';

import {Component, input, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of} from 'rxjs';

import {EMBEDDED_EDITOR_SELECTOR, EmbeddedEditor, EmbeddedTutorialManager} from '../../editor';
import {NodeRuntimeSandbox} from '../../editor/node-runtime-sandbox.service';

import Tutorial from './tutorial.component';

@Component({
  selector: EMBEDDED_EDITOR_SELECTOR,
  template: '<div>FakeEmbeddedEditor</div>',
})
class FakeEmbeddedEditor {}

@Component({
  selector: DOCS_VIEWER_SELECTOR,
  template: '<div>FakeDocsViewer</div>',
})
class FakeDocViewer {
  docContent = input<string | undefined>();
}

// TODO: export this class, it's a helpful mock we could you on other tests.
class FakeNodeRuntimeSandbox {
  loadingStep = signal(0);
  previewUrl$ = of();
  writeFile(path: string, content: string) {
    return Promise.resolve();
  }
  init() {
    return Promise.resolve();
  }
}

describe('Tutorial', () => {
  let component: Tutorial;
  let fixture: ComponentFixture<Tutorial>;
  const fakeWindow = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  const fakeEmbeddedTutorialManager: Partial<EmbeddedTutorialManager> = {
    tutorialFiles: signal({'app.component.ts': 'original'}),
    answerFiles: signal({'app.component.ts': 'answer'}),
    type: signal(TutorialType.EDITOR),
    revealAnswer: () => {},
    resetRevealAnswer: () => {},
    tutorialChanged$: of(false),
    openFiles: signal<NonNullable<TutorialConfig['openFiles']>>(['app.component.ts']),
  };

  function setupRevealAnswerValues() {
    component['shouldRenderRevealAnswer'].set(true);
    component['canRevealAnswer'] = signal(true);
    component['embeddedTutorialManager'].answerFiles.set({'app.component.ts': 'answer'});
  }

  function setupDisabledRevealAnswerValues() {
    component['shouldRenderRevealAnswer'].set(true);
    component['canRevealAnswer'] = signal(false);
    component['embeddedTutorialManager'].answerFiles.set({'app.component.ts': 'answer'});
  }

  function setupNoRevealAnswerValues() {
    component['shouldRenderRevealAnswer'].set(false);
    component['canRevealAnswer'] = signal(true);
    component['embeddedTutorialManager'].answerFiles.set({});
  }

  function setupResetRevealAnswerValues() {
    setupRevealAnswerValues();
    component['answerRevealed'].set(true);
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Tutorial, EmbeddedEditor, DocViewer],
      providers: [
        provideRouter([]),
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
        {
          provide: EmbeddedTutorialManager,
          useValue: fakeEmbeddedTutorialManager,
        },
        {provide: NodeRuntimeSandbox, useClass: FakeNodeRuntimeSandbox},
      ],
    });
    TestBed.overrideComponent(Tutorial, {
      remove: {
        imports: [DocViewer],
      },
      add: {
        imports: [FakeDocViewer],
      },
    });

    fixture = TestBed.createComponent(Tutorial);
    component = fixture.componentInstance;

    // Replace EmbeddedEditor with FakeEmbeddedEditor
    spyOn(component as any, 'loadEmbeddedEditorComponent').and.resolveTo(FakeEmbeddedEditor);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the tutorial data from the route data inputs', async () => {
    const parent = {
      path: 'tutorials/first-app',
      label: 'First App',
      tutorialData: {type: TutorialType.LOCAL, title: 'First App', restrictedMode: false},
    };
    fixture.componentRef.setInput('path', 'tutorials/first-app/steps/01-hello-world');
    fixture.componentRef.setInput('label', 'Hello world');
    fixture.componentRef.setInput('parent', parent);
    fixture.componentRef.setInput('tutorialData', {
      type: TutorialType.LOCAL,
      title: 'Hello world',
      sourceCodeZipPath: 'assets/tutorials/01-hello-world.zip',
      nextStep: 'tutorials/first-app/steps/02-home',
      restrictedMode: false,
    });
    fixture.componentRef.setInput('docContent', {id: 'hello-world', contents: '<p>Hello</p>'});
    await fixture.whenStable();

    expect(component.documentContent()).toBe('<p>Hello</p>');
    expect(component.tutorialName()).toBe('First App');
    expect(component.stepName()).toBe('Hello world');
    expect(component.localTutorialZipUrl()).toBe('assets/tutorials/01-hello-world.zip');
    expect(component.nextStepPath).toBe('/tutorials/first-app/steps/02-home');
    expect(component.shouldRenderEmbeddedEditor()).toBeFalse();

    // Navigating to another step reuses the component and only updates the inputs.
    fixture.componentRef.setInput('path', 'tutorials/first-app/steps/02-home');
    fixture.componentRef.setInput('label', 'Home');
    fixture.componentRef.setInput('tutorialData', {
      type: TutorialType.LOCAL,
      title: 'Home',
      previousStep: 'tutorials/first-app/steps/01-hello-world',
      restrictedMode: false,
    });
    await fixture.whenStable();

    expect(component.stepName()).toBe('Home');
    expect(component.previousStepPath).toBe('/tutorials/first-app/steps/01-hello-world');
    expect(component.nextStepPath).toBeUndefined();
  });

  // TODO: Add tests in a future PR
  // it('should render the embedded editor based on the tutorial config', () => {});
  // it('should not render the embedded editor based on the tutorial config', () => {});

  it('should reset the reveal answer', async () => {
    setupResetRevealAnswerValues();
    await fixture.whenStable();

    const revealAnswerButton = component.revealAnswerButton();
    if (!revealAnswerButton) throw new Error('revealAnswerButton is undefined');

    const revealAnswerSpy = spyOn(component['embeddedTutorialManager'], 'revealAnswer');
    const resetRevealAnswerSpy = spyOn(component['embeddedTutorialManager'], 'resetRevealAnswer');

    revealAnswerButton.nativeElement.click();

    expect(revealAnswerSpy).not.toHaveBeenCalled();
    expect(resetRevealAnswerSpy).toHaveBeenCalled();
  });

  it('should reveal the answer on button click', async () => {
    setupRevealAnswerValues();
    await fixture.whenStable();

    const revealAnswerButton = component.revealAnswerButton();
    if (!revealAnswerButton) throw new Error('revealAnswerButton is undefined');

    const embeddedTutorialManagerRevealAnswerSpy = spyOn(
      component['embeddedTutorialManager'],
      'revealAnswer',
    );

    // Simulate a click on the reveal answer button
    await component.handleRevealAnswer();

    expect(embeddedTutorialManagerRevealAnswerSpy).toHaveBeenCalled();

    await fixture.whenStable();

    expect(revealAnswerButton.nativeElement.textContent?.trim()).toBe('Reset');
  });

  it('should not reveal the answer when button is disabled', async () => {
    setupDisabledRevealAnswerValues();
    await fixture.whenStable();

    const revealAnswerButton = component.revealAnswerButton();
    if (!revealAnswerButton) throw new Error('revealAnswerButton is undefined');

    spyOn(component, 'canRevealAnswer').and.returnValue(false);

    const handleRevealAnswerSpy = spyOn(component, 'handleRevealAnswer');

    revealAnswerButton.nativeElement.click();

    expect(revealAnswerButton.nativeElement.getAttribute('disabled')).toBeDefined();
    expect(handleRevealAnswerSpy).not.toHaveBeenCalled();
  });

  it('should not render the reveal answer button when there are no answers', async () => {
    setupNoRevealAnswerValues();
    await fixture.whenStable();

    expect(component.revealAnswerButton()).toBe(undefined);
  });
});
