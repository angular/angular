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
  documentFilePath = input<string | undefined>();
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
    hiddenFiles: signal<string[]>([]),
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
    fakeEmbeddedTutorialManager.tutorialFiles?.set({'app.component.ts': 'original'});
    fakeEmbeddedTutorialManager.answerFiles?.set({'app.component.ts': 'answer'});
    fakeEmbeddedTutorialManager.hiddenFiles?.set([]);
    fakeEmbeddedTutorialManager.openFiles?.set(['app.component.ts']);

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

  // TODO: Add tests in a future PR
  // it('should render the embedded editor based on the tutorial config', () => {});
  // it('should not render the embedded editor based on the tutorial config', () => {});
  // it('should load the tutorial', () => {});

  it('should hide the revealed answer', async () => {
    setupResetRevealAnswerValues();
    await fixture.whenStable();

    const revealAnswerButton = component.revealAnswerButton();
    if (!revealAnswerButton) throw new Error('revealAnswerButton is undefined');

    revealAnswerButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.answerRevealed()).toBe(false);
  });

  it('should reveal the answer on button click', async () => {
    setupRevealAnswerValues();
    await fixture.whenStable();

    const revealAnswerButton = component.revealAnswerButton();
    if (!revealAnswerButton) throw new Error('revealAnswerButton is undefined');

    await component.handleRevealAnswer();
    fixture.detectChanges();

    expect(component.answerRevealed()).toBe(true);

    await fixture.whenStable();

    expect(revealAnswerButton.nativeElement.textContent?.trim()).toBe('Hide Answer');
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

  it('should order answer comparison files using the visible editor files first', () => {
    component['embeddedTutorialManager'].openFiles.set(['src/app/app.component.ts']);
    component['embeddedTutorialManager'].answerFiles.set({
      'src/app/app.component.ts': 'answer',
      'src/app/new.component.ts': 'new answer',
      'src/app/hidden.component.ts': 'hidden answer',
    });
    component['embeddedTutorialManager'].hiddenFiles?.set(['src/app/hidden.component.ts']);

    expect(component.answerComparisonFiles()).toEqual([
      {path: 'src/app/app.component.ts', content: 'answer'},
      {path: 'src/app/new.component.ts', content: 'new answer'},
    ]);
  });
});
