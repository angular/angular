/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
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
import {DiagnosticWithLocation, DiagnosticsState} from './services/diagnostics-state.service';
import {DownloadManager} from '../download-manager.service';
import {StackBlitzOpener} from '../stackblitz-opener.service';
import {ClickOutside, IconComponent} from '@angular/docs';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {IDXLauncher} from '../idx-launcher.service';
import {MatTooltip} from '@angular/material/tooltip';
import {injectEmbeddedTutorialManager} from '../inject-embedded-tutorial-manager';

export const REQUIRED_FILES = new Set([
  'src/main.ts',
  'src/index.html',
  'src/app/app.component.ts',
]);

const ANGULAR_DEV = 'https://angular.dev';

@Component({
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
})
export class CodeEditor {
  readonly restrictedMode = input(false);
  readonly codeEditorWrapperRef =
    viewChild.required<ElementRef<HTMLDivElement>>('codeEditorWrapper');
  readonly matTabGroup = viewChild.required(MatTabGroup);

  readonly createFileInputRef = viewChild<ElementRef<HTMLInputElement>>('createFileInput');

  readonly renameFileInputRef = viewChild<ElementRef<HTMLInputElement>>('renameFileInput');

  private readonly destroyRef = inject(DestroyRef);

  private readonly codeMirrorEditor = inject(CodeMirrorEditor);
  private readonly diagnosticsState = inject(DiagnosticsState);
  private readonly downloadManager = inject(DownloadManager);
  private readonly stackblitzOpener = inject(StackBlitzOpener);
  private readonly idxLauncher = inject(IDXLauncher);
  private readonly title = inject(Title);
  private readonly location = inject(Location);
  private readonly environmentInjector = inject(EnvironmentInjector);

  private readonly errors$ = this.diagnosticsState.diagnostics$.pipe(
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

  readonly TerminalType = TerminalType;

  readonly displayErrorsBox = signal<boolean>(false);
  readonly errors = signal<DiagnosticWithLocation[]>([]);
  readonly files = this.codeMirrorEditor.openFiles;
  readonly isCreatingFile = signal<boolean>(false);
  readonly isRenamingFile = signal<boolean>(false);

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

  openCurrentSolutionInIDX(): void {
    this.idxLauncher.openCurrentSolutionInIDX();
  }
  async openCurrentCodeInStackBlitz(): Promise<void> {
    const title = this.title.getTitle();

    const path = this.location.path();
    const editorUrl = `${ANGULAR_DEV}${path}`;
    const description = `Angular.dev example generated from [${editorUrl}](${editorUrl})`;

    await this.stackblitzOpener.openCurrentSolutionInStackBlitz({title, description});
  }

  async downloadCurrentCodeEditorState(): Promise<void> {
    const embeddedTutorialManager = await injectEmbeddedTutorialManager(this.environmentInjector);
    const name = embeddedTutorialManager.tutorialId();
    await this.downloadManager.downloadCurrentStateOfTheSolution(name);
  }

  closeErrorsBox(): void {
    this.displayErrorsBox.set(false);
  }

  closeRenameFile(): void {
    this.isRenamingFile.set(false);
  }

  canRenameFile = (filename: string) => this.canDeleteFile(filename);

  canDeleteFile(filename: string) {
    return !REQUIRED_FILES.has(filename) && !this.restrictedMode();
  }

  canCreateFile = () => !this.restrictedMode();

  async deleteFile(filename: string) {
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

  async renameFile(event: SubmitEvent, oldPath: string) {
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

  async createFile(event: SubmitEvent) {
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

  private listenToDiagnosticsChange(): void {
    this.errors$.subscribe((diagnostics) => {
      this.errors.set(diagnostics);
      this.displayErrorsBox.set(diagnostics.length > 0);
    });
  }

  private setSelectedTabOnTutorialChange() {
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

  private listenToTabChange() {
    this.matTabGroup()
      .selectedIndexChange.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((index) => {
        const selectedFile = this.files()[index];

        if (selectedFile) {
          this.codeMirrorEditor.changeCurrentFile(selectedFile.filename);
        }
      });
  }
}
