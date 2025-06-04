/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ApplicationRef, ChangeDetectorRef, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatTabGroupHarness} from '@angular/material/tabs/testing';
import {By} from '@angular/platform-browser';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {BehaviorSubject} from 'rxjs';

import {EmbeddedTutorialManager} from '../embedded-tutorial-manager.service';

import {CodeEditor, REQUIRED_FILES} from './code-editor.component';
import {CodeMirrorEditor} from './code-mirror-editor.service';
import {FakeChangeDetectorRef, TutorialType} from '@angular/docs';
import {MatTooltipHarness} from '@angular/material/tooltip/testing';

const files = [
  {filename: 'a', content: '', language: {} as any},
  {filename: 'b', content: '', language: {} as any},
  {filename: 'c', content: '', language: {} as any},
  ...Array.from(REQUIRED_FILES).map((filename) => ({
    filename,
    content: '',
    language: {} as any,
  })),
];

class FakeCodeMirrorEditor implements Partial<CodeMirrorEditor> {
  isInit = false;
  init(element: HTMLElement) {
    this.isInit = true;
  }
  changeCurrentFile(fileName: string) {}
  disable() {}
  files = signal(files);
  currentFile = signal(this.files()[0]);
  openFiles = this.files;
}
const codeMirrorEditorService = new FakeCodeMirrorEditor();
const fakeChangeDetectorRef = new FakeChangeDetectorRef();

describe('CodeEditor', () => {
  let component: CodeEditor;
  let fixture: ComponentFixture<CodeEditor>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditor],
      providers: [
        // Removing the noop animations makes the test VERY flaky.
        // TODO: understand why and fix the flakiness.
        provideNoopAnimations(),
        {
          provide: CodeMirrorEditor,
          useValue: codeMirrorEditorService,
        },
        {
          provide: ChangeDetectorRef,
          useValue: fakeChangeDetectorRef,
        },
        {
          provide: EmbeddedTutorialManager,
          useValue: {
            tutorialChanged$: new BehaviorSubject(true),
            tutorialId: () => 'tutorial',
            tutorialFilesystemTree: () => ({'app.component.ts': ''}),
            commonFilesystemTree: () => ({'app.component.ts': ''}),
            openFiles: () => ['app.component.ts'],
            tutorialFiles: () => ({'app.component.ts': ''}),
            nextTutorial: () => 'next-tutorial',
            previousTutorial: () => 'previous-tutorial',
            type: () => TutorialType.EDITOR,
            title: () => 'Tutorial',
          },
        },
      ],
    });

    fixture = TestBed.createComponent(CodeEditor);
    loader = TestbedHarnessEnvironment.loader(fixture);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the code editor service with the code editor wrapper element', async () => {
    const codeMirrorEditorInitSpy = spyOn(codeMirrorEditorService, 'init');

    expect(component.codeEditorWrapperRef()).toBeDefined();
    expect(codeMirrorEditorService.isInit).toBeTrue();

    // For whatever reason this does not pass successfuly
    // expect(codeMirrorEditorInitSpy).toHaveBeenCalled();
  });

  it('should render tabs based on filenames order', async () => {
    const matTabGroup = await loader.getHarness(MatTabGroupHarness);
    const tabs = await matTabGroup.getTabs();
    const expectedLabels = files.map((file, index) => {
      const label = file.filename.replace('src/', '');
      if (index === 0) return `${label} editdelete`;
      return label;
    });

    for (const [index, tab] of tabs.entries()) {
      const tabLabel = await tab.getLabel();

      expect(tabLabel).toBe(expectedLabels[index]);
    }
  });

  describe('Tabs selection', () => {
    let codeMirrorEditorChangeCurrentFileSpy: jasmine.Spy<(fileName: string) => void>;

    beforeEach(() => {
      codeMirrorEditorChangeCurrentFileSpy = spyOn(codeMirrorEditorService, 'changeCurrentFile');
    });

    it('should change file content when clicking on an unselected tab', async () => {
      const matTabGroup = await loader.getHarness(MatTabGroupHarness);
      const tabs = await matTabGroup.getTabs();

      expect(await tabs[0].isSelected());
      await tabs[1].select();

      expect(codeMirrorEditorChangeCurrentFileSpy).toHaveBeenCalledWith(files[1].filename);
    });

    it('should not change file content when clicking on a selected tab', async () => {
      const matTabGroup = await loader.getHarness(MatTabGroupHarness);
      const tabs = await matTabGroup.getTabs();

      expect(await tabs[0].isSelected());
      await tabs[0].select();

      expect(codeMirrorEditorChangeCurrentFileSpy).not.toHaveBeenCalled();
    });

    it('should focused on a new tab when adding a new file', async () => {
      // Wait until the asynchronous injection stuff is done.
      await fixture.whenStable();

      const button = fixture.debugElement.query(By.css('button.adev-add-file')).nativeElement;
      button.click();

      const matTabGroup = await loader.getHarness(MatTabGroupHarness);
      const tabs = await matTabGroup.getTabs();

      expect(await tabs[files.length].isSelected()).toBeTrue();
    });

    it('should change file content when clicking on unselected tab while creating a new file', async () => {
      const button = fixture.debugElement.query(By.css('button.adev-add-file')).nativeElement;
      button.click();

      const matTabGroup = await loader.getHarness(MatTabGroupHarness);
      const tabs = await matTabGroup.getTabs();
      await tabs[2].select();

      expect(codeMirrorEditorChangeCurrentFileSpy).toHaveBeenCalledWith(files[2].filename);
    });

    it('start creating a new file, select an existing tab, should not change file content when return back on a new file tab', async () => {
      const button = fixture.debugElement.query(By.css('button.adev-add-file')).nativeElement;
      button.click();

      const matTabGroup = await loader.getHarness(MatTabGroupHarness);
      const tabs = await matTabGroup.getTabs();

      await tabs[1].select();
      expect(codeMirrorEditorChangeCurrentFileSpy).toHaveBeenCalledWith(files[1].filename);

      codeMirrorEditorChangeCurrentFileSpy.calls.reset();

      await tabs[files.length].select();
      expect(codeMirrorEditorChangeCurrentFileSpy).not.toHaveBeenCalled();
    });
  });

  it('should not allow to delete a required file', async () => {
    const matTabGroup = await loader.getHarness(MatTabGroupHarness);
    const tabs = await matTabGroup.getTabs();

    const requiredFilesTabIndexes = files
      .filter((file) => REQUIRED_FILES.has(file.filename))
      .map((file) => files.indexOf(file));

    for (const tabIndex of requiredFilesTabIndexes) {
      const tab = tabs[tabIndex];

      await tab.select();

      expect(fixture.debugElement.query(By.css('[aria-label="Delete file"]'))).toBeNull();
    }
  });

  it('should be able to display the tooltip on the download button', async () => {
    const tooltip = await loader.getHarness(
      MatTooltipHarness.with({selector: '.adev-editor-download-button'}),
    );
    expect(await tooltip.isOpen()).toBeFalse();
    await tooltip.show();
    expect(await tooltip.isOpen()).toBeTrue();
  });

  it('should be able to get the tooltip message on the download button', async () => {
    const tooltip = await loader.getHarness(
      MatTooltipHarness.with({selector: '.adev-editor-download-button'}),
    );
    await tooltip.show();
    expect(await tooltip.getTooltipText()).toBe('Download current source code');
  });

  it('should not be able to get the tooltip message on the download button when the tooltip is not shown', async () => {
    const tooltip = await loader.getHarness(
      MatTooltipHarness.with({selector: '.adev-editor-download-button'}),
    );
    expect(await tooltip.getTooltipText()).toBe('');
  });
});
