/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCS_VIEWER_SELECTOR, DocViewer, WINDOW} from '@angular/docs';
import {Component, input, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {EMBEDDED_EDITOR_SELECTOR, EmbeddedEditor, EmbeddedTutorialManager} from '../../editor';
import {NodeRuntimeSandbox} from '../../editor/node-runtime-sandbox.service';
import {mockAsyncProvider} from '../../core/services/inject-async';
import Tutorial from './tutorial.component';
let FakeEmbeddedEditor = (() => {
  let _classDecorators = [
    Component({
      selector: EMBEDDED_EDITOR_SELECTOR,
      template: '<div>FakeEmbeddedEditor</div>',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FakeEmbeddedEditor = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      FakeEmbeddedEditor = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (FakeEmbeddedEditor = _classThis);
})();
let FakeDocViewer = (() => {
  let _classDecorators = [
    Component({
      selector: DOCS_VIEWER_SELECTOR,
      template: '<div>FakeDocsViewer</div>',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FakeDocViewer = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      FakeDocViewer = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    documentFilePath = input();
  };
  return (FakeDocViewer = _classThis);
})();
// TODO: export this class, it's a helpful mock we could you on other tests.
class FakeNodeRuntimeSandbox {
  loadingStep = signal(0);
  previewUrl$ = of();
  writeFile(path, content) {
    return Promise.resolve();
  }
  init() {
    return Promise.resolve();
  }
}
describe('Tutorial', () => {
  let component;
  let fixture;
  const fakeWindow = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  const fakeEmbeddedTutorialManager = {
    tutorialFiles: signal({'app.component.ts': 'original'}),
    answerFiles: signal({'app.component.ts': 'answer'}),
    type: signal('editor' /* TutorialType.EDITOR */),
    revealAnswer: () => {},
    resetRevealAnswer: () => {},
    tutorialChanged$: of(false),
    openFiles: signal(['app.component.ts']),
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
        mockAsyncProvider(NodeRuntimeSandbox, FakeNodeRuntimeSandbox),
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
    await TestBed;
    fixture = TestBed.createComponent(Tutorial);
    component = fixture.componentInstance;
    // Replace EmbeddedEditor with FakeEmbeddedEditor
    spyOn(component, 'loadEmbeddedEditorComponent').and.resolveTo(FakeEmbeddedEditor);
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // TODO: Add tests in a future PR
  // it('should render the embedded editor based on the tutorial config', () => {});
  // it('should not render the embedded editor based on the tutorial config', () => {});
  // it('should load the tutorial', () => {});
  it('should reset the reveal answer', async () => {
    setupResetRevealAnswerValues();
    fixture.detectChanges();
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
    fixture.detectChanges();
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
    fixture.detectChanges();
    expect(revealAnswerButton.nativeElement.textContent?.trim()).toBe('Reset');
  });
  it('should not reveal the answer when button is disabled', async () => {
    setupDisabledRevealAnswerValues();
    fixture.detectChanges();
    const revealAnswerButton = component.revealAnswerButton();
    if (!revealAnswerButton) throw new Error('revealAnswerButton is undefined');
    spyOn(component, 'canRevealAnswer').and.returnValue(false);
    const handleRevealAnswerSpy = spyOn(component, 'handleRevealAnswer');
    revealAnswerButton.nativeElement.click();
    expect(revealAnswerButton.nativeElement.getAttribute('disabled')).toBeDefined();
    expect(handleRevealAnswerSpy).not.toHaveBeenCalled();
  });
  it('should not render the reveal answer button when there are no answers', () => {
    setupNoRevealAnswerValues();
    fixture.detectChanges();
    expect(component.revealAnswerButton()).toBe(undefined);
  });
});
//# sourceMappingURL=tutorial.component.spec.js.map
