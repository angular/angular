/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Location} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EnvironmentInjector,
  afterRenderEffect,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {Title} from '@angular/platform-browser';
import {debounceTime, from, map, switchMap} from 'rxjs';
import {TerminalType} from '../terminal/terminal-handler.service';
import {CodeMirrorEditor} from './code-mirror-editor.service';
import {DiagnosticsState} from './services/diagnostics-state.service';
import {DownloadManager} from '../download-manager.service';
import {StackBlitzOpener} from '../stackblitz-opener.service';
import {ClickOutside, IconComponent} from '@angular/docs';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {FirebaseStudioLauncher} from '../firebase-studio-launcher.service';
import {MatTooltip} from '@angular/material/tooltip';
import {injectEmbeddedTutorialManager} from '../inject-embedded-tutorial-manager';
export const REQUIRED_FILES = new Set([
  'src/main.ts',
  'src/index.html',
  'src/app/app.component.ts',
]);
const ANGULAR_DEV = 'https://angular.dev';
let CodeEditor = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-tutorial-code-editor',
      templateUrl: './code-editor.component.html',
      styleUrls: ['./code-editor.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [
        MatTabsModule,
        MatTooltip,
        IconComponent,
        ClickOutside,
        CdkMenu,
        CdkMenuItem,
        CdkMenuTrigger,
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CodeEditor = class {
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
      CodeEditor = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    restrictedMode = input(false);
    codeEditorWrapperRef = viewChild.required('codeEditorWrapper');
    matTabGroup = viewChild.required(MatTabGroup);
    createFileInputRef = viewChild('createFileInput');
    renameFileInputRef = viewChild('renameFileInput');
    destroyRef = inject(DestroyRef);
    codeMirrorEditor = inject(CodeMirrorEditor);
    diagnosticsState = inject(DiagnosticsState);
    downloadManager = inject(DownloadManager);
    stackblitzOpener = inject(StackBlitzOpener);
    firebaseStudioLauncher = inject(FirebaseStudioLauncher);
    title = inject(Title);
    location = inject(Location);
    environmentInjector = inject(EnvironmentInjector);
    errors$ = this.diagnosticsState.diagnostics$.pipe(
      // Display errors one second after code update
      debounceTime(1000),
      map((diagnosticsItem) =>
        diagnosticsItem
          .filter((item) => item.severity === 'error')
          .sort((a, b) =>
            a.lineNumber != b.lineNumber
              ? a.lineNumber - b.lineNumber
              : a.characterPosition - b.characterPosition,
          ),
      ),
      takeUntilDestroyed(this.destroyRef),
    );
    TerminalType = TerminalType;
    displayErrorsBox = signal(false);
    errors = signal([]);
    files = this.codeMirrorEditor.openFiles;
    isCreatingFile = signal(false);
    isRenamingFile = signal(false);
    constructor() {
      afterRenderEffect(() => {
        const createFileInput = this.createFileInputRef();
        createFileInput?.nativeElement.focus();
      });
      afterRenderEffect(() => {
        const renameFileInput = this.renameFileInputRef();
        renameFileInput?.nativeElement.focus();
      });
      effect((cleanupFn) => {
        const parent = this.codeEditorWrapperRef().nativeElement;
        untracked(() => {
          this.codeMirrorEditor.init(parent);
          this.listenToDiagnosticsChange();
          this.listenToTabChange();
          this.setSelectedTabOnTutorialChange();
        });
        cleanupFn(() => this.codeMirrorEditor.disable());
      });
    }
    openCurrentSolutionInFirebaseStudio() {
      this.firebaseStudioLauncher.openCurrentSolutionInFirebaseStudio();
    }
    async openCurrentCodeInStackBlitz() {
      const title = this.title.getTitle();
      const path = this.location.path();
      const editorUrl = `${ANGULAR_DEV}${path}`;
      const description = `Angular.dev example generated from [${editorUrl}](${editorUrl})`;
      await this.stackblitzOpener.openCurrentSolutionInStackBlitz({title, description});
    }
    async downloadCurrentCodeEditorState() {
      const embeddedTutorialManager = await injectEmbeddedTutorialManager(this.environmentInjector);
      const name = embeddedTutorialManager.tutorialId();
      await this.downloadManager.downloadCurrentStateOfTheSolution(name);
    }
    closeErrorsBox() {
      this.displayErrorsBox.set(false);
    }
    closeRenameFile() {
      this.isRenamingFile.set(false);
    }
    canRenameFile = (filename) => this.canDeleteFile(filename);
    canDeleteFile(filename) {
      return !REQUIRED_FILES.has(filename) && !this.restrictedMode();
    }
    canCreateFile = () => !this.restrictedMode();
    async deleteFile(filename) {
      await this.codeMirrorEditor.deleteFile(filename);
      this.matTabGroup().selectedIndex = 0;
    }
    onAddButtonClick() {
      this.isCreatingFile.set(true);
      this.matTabGroup().selectedIndex = this.files().length;
    }
    onRenameButtonClick() {
      this.isRenamingFile.set(true);
    }
    async renameFile(event, oldPath) {
      const renameFileInput = this.renameFileInputRef();
      if (!renameFileInput) return;
      event.preventDefault();
      const renameFileInputValue = renameFileInput.nativeElement.value;
      if (renameFileInputValue) {
        if (renameFileInputValue.includes('..')) {
          alert('File name can not contain ".."');
          return;
        }
        // src is hidden from users, here we manually add it to the new filename
        const newFile = 'src/' + renameFileInputValue;
        if (this.files().find(({filename}) => filename.includes(newFile))) {
          alert('File name already exists');
          return;
        }
        await this.codeMirrorEditor.renameFile(oldPath, newFile);
      }
      this.isRenamingFile.set(false);
    }
    async createFile(event) {
      const fileInput = this.createFileInputRef();
      if (!fileInput) return;
      event.preventDefault();
      const newFileInputValue = fileInput.nativeElement.value;
      if (newFileInputValue) {
        if (newFileInputValue.includes('..')) {
          alert('File name can not contain ".."');
          return;
        }
        // src is hidden from users, here we manually add it to the new filename
        const newFile = 'src/' + newFileInputValue;
        if (this.files().find(({filename}) => filename.includes(newFile))) {
          alert('File already exists');
          return;
        }
        await this.codeMirrorEditor.createFile(newFile);
      }
      this.isCreatingFile.set(false);
    }
    listenToDiagnosticsChange() {
      this.errors$.subscribe((diagnostics) => {
        this.errors.set(diagnostics);
        this.displayErrorsBox.set(diagnostics.length > 0);
      });
    }
    setSelectedTabOnTutorialChange() {
      // Using `from` to prevent injecting the embedded tutorial manager once the
      // injector is destroyed (this may happen in unit tests when the test ends
      // before `injectAsync` runs, causing an error).
      from(injectEmbeddedTutorialManager(this.environmentInjector))
        .pipe(
          switchMap((embeddedTutorialManager) => embeddedTutorialManager.tutorialChanged$),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          // selected file on project change is always the first
          this.matTabGroup().selectedIndex = 0;
        });
    }
    listenToTabChange() {
      this.matTabGroup()
        .selectedIndexChange.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((index) => {
          const selectedFile = this.files()[index];
          if (selectedFile) {
            this.codeMirrorEditor.changeCurrentFile(selectedFile.filename);
          }
        });
    }
  };
  return (CodeEditor = _classThis);
})();
export {CodeEditor};
//# sourceMappingURL=code-editor.component.js.map
