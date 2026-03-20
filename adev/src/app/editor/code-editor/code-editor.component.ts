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
import {MatTabGroup, MatTab, MatTabLabel} from '@angular/material/tabs';
import {Title} from '@angular/platform-browser';
import {debounceTime, from, map, switchMap} from 'rxjs';

import {TerminalType} from '../terminal/terminal-handler.service';

import {CodeMirrorEditor} from './code-mirror-editor.service';
import {DiagnosticWithLocation, DiagnosticsState} from './services/diagnostics-state.service';
import {DownloadManager} from '../download-manager.service';
import {StackBlitzOpener} from '../stackblitz-opener.service';
import {IconComponent} from '@angular/docs';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {FirebaseStudioLauncher} from '../firebase-studio-launcher.service';
import {MatTooltip} from '@angular/material/tooltip';
import {injectEmbeddedTutorialManager} from '../inject-embedded-tutorial-manager';
import {NodeRuntimeState} from '../node-runtime-state.service';
import {LoadingStep} from '../enums/loading-steps';

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
    MatTabGroup,
    MatTab,
    MatTabLabel,
    MatTooltip,
    IconComponent,
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

  private readonly nodeRuntimeState = inject(NodeRuntimeState);
  private readonly codeMirrorEditor = inject(CodeMirrorEditor);
  private readonly diagnosticsState = inject(DiagnosticsState);
  private readonly downloadManager = inject(DownloadManager);
  private readonly stackblitzOpener = inject(StackBlitzOpener);
  private readonly firebaseStudioLauncher = inject(FirebaseStudioLauncher);
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

  protected readonly displayErrorsBox = signal<boolean>(false);
  protected readonly errors = signal<DiagnosticWithLocation[]>([]);
  protected readonly files = this.codeMirrorEditor.openFiles;
  protected readonly isCreatingFile = signal<boolean>(false);
  protected readonly isRenamingFile = signal<boolean>(false);

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
        this.listenToFileOpenRequests();
      });

      cleanupFn(() => this.codeMirrorEditor.disable());
    });
  }

  private listenToFileOpenRequests() {
    // Handler for opening files at specific locations
    const openFile = (file: string, line: number, character: number) => {
      // Normalize the file path - Vite uses /app/... but editor uses src/app/...
      let normalizedPath = file;
      if (file.startsWith('/')) {
        // Remove leading slash and prepend 'src'
        normalizedPath = 'src' + file;
      }

      // Find the file in the files list
      const targetFile = this.files().find((f) => f.filename === normalizedPath);
      if (targetFile) {
        // Switch to the file's tab
        const fileIndex = this.files().indexOf(targetFile);
        this.matTabGroup().selectedIndex = fileIndex;

        // Explicitly change the current file in the editor
        this.codeMirrorEditor.changeCurrentFile(targetFile.filename);

        // Wait for the tab to switch and file to load, then scroll to the line
        setTimeout(() => {
          this.codeMirrorEditor.scrollToLine(line - 1, character); // Convert to 0-based
        }, 200);
      } else {
        // console.warn('File not found in editor:', normalizedPath);
      }
    };

    // Listen for CustomEvent (backward compatibility)
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{file: string; line: number; character: number}>;
      const {file, line, character} = customEvent.detail;
      openFile(file, line, character);
    };

    // Listen for postMessage from preview iframe (Vite error overlay)
    const handlePostMessage = (event: MessageEvent) => {
      // Check if this is an openFileAtLocation message
      if (event.data?.type === 'openFileAtLocation') {
        const {file, line, character} = event.data;
        openFile(file, line, character);
      }
    };

    window.addEventListener('openFileAtLocation', handleCustomEvent);
    window.addEventListener('message', handlePostMessage);

    // Cleanup listeners on destroy
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('openFileAtLocation', handleCustomEvent);
      window.removeEventListener('message', handlePostMessage);
    });
  }

  protected openCurrentSolutionInFirebaseStudio(): void {
    this.firebaseStudioLauncher.openCurrentSolutionInFirebaseStudio();
  }

  protected async openCurrentCodeInStackBlitz(): Promise<void> {
    const title = this.title.getTitle();

    const path = this.location.path();
    const editorUrl = `${ANGULAR_DEV}${path}`;
    const description = `Angular.dev example generated from [${editorUrl}](${editorUrl})`;

    await this.stackblitzOpener.openCurrentSolutionInStackBlitz({title, description});
  }

  protected async downloadCurrentCodeEditorState(): Promise<void> {
    const embeddedTutorialManager = await injectEmbeddedTutorialManager(this.environmentInjector);
    const name = embeddedTutorialManager.tutorialId();
    await this.downloadManager.downloadCurrentStateOfTheSolution(name);
  }

  protected closeErrorsBox(): void {
    this.displayErrorsBox.set(false);
  }

  protected openFileAtLocation(error: DiagnosticWithLocation): void {
    // Scroll the editor to the error location
    // The error is always in the current file since diagnostics are file-specific
    const lineNumber = error.lineNumber;
    const characterPosition = error.characterPosition;

    // Calculate the position in the document
    // CodeMirror uses 0-based line numbers, but our error uses 1-based
    const line = Math.max(0, lineNumber - 1);

    // Request the editor to scroll to this line
    // We'll need to add a method to CodeMirrorEditor service to handle this
    this.codeMirrorEditor.scrollToLine(line, characterPosition);
  }

  protected closeRenameFile(): void {
    this.isRenamingFile.set(false);
  }

  protected canRenameFile = (filename: string) => this.canDeleteFile(filename);

  protected canDeleteFile(filename: string) {
    return !REQUIRED_FILES.has(filename) && !this.restrictedMode();
  }

  protected canCreateFile = () => !this.restrictedMode();

  protected async deleteFile(filename: string) {
    await this.codeMirrorEditor.deleteFile(filename);
    this.matTabGroup().selectedIndex = 0;
  }

  protected onAddButtonClick() {
    this.isCreatingFile.set(true);
    this.matTabGroup().selectedIndex = this.files().length;
  }

  protected onRenameButtonClick() {
    this.isRenamingFile.set(true);
  }

  protected async renameFile(event: SubmitEvent, oldPath: string) {
    const renameFileInput = this.renameFileInputRef();
    if (!renameFileInput) return;

    event.preventDefault();

    const renameFileInputValue = renameFileInput.nativeElement.value;

    if (this.validateFileName(renameFileInputValue)) {
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

  protected async createFile(event?: SubmitEvent) {
    const fileInput = this.createFileInputRef();
    if (!fileInput) return;

    event?.preventDefault();

    const newFileInputValue = fileInput.nativeElement.value;

    if (this.validateFileName(newFileInputValue)) {
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

  private validateFileName(fileName: string): boolean {
    if (!fileName) {
      return false;
    }
    if (fileName.split('/').pop()?.indexOf('.') === 0) {
      alert('File must contain a name.');
      return false;
    }
    if (fileName.includes('..')) {
      alert('File name can not contain ".."');
      return false;
    }
    return true;
  }

  private listenToDiagnosticsChange(): void {
    this.errors$.subscribe((diagnostics) => {
      if (this.nodeRuntimeState.loadingStep() !== LoadingStep.READY) {
        return;
      }
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
