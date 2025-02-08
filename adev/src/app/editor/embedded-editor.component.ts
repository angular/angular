/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isPlatformBrowser} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {IconComponent} from '@angular/docs';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {distinctUntilChanged, map} from 'rxjs';

import {MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES} from './alert-manager.service';

import {AngularSplitModule} from 'angular-split';
import {CodeEditor} from './code-editor/code-editor.component';
import {DiagnosticsState} from './code-editor/services/diagnostics-state.service';
import {EditorUiState} from './editor-ui-state.service';
import {LoadingStep} from './enums/loading-steps';
import {NodeRuntimeSandbox} from './node-runtime-sandbox.service';
import {NodeRuntimeState} from './node-runtime-state.service';
import {Preview} from './preview/preview.component';
import {TerminalType} from './terminal/terminal-handler.service';
import {Terminal} from './terminal/terminal.component';

export const EMBEDDED_EDITOR_SELECTOR = 'embedded-editor';
export const LARGE_EDITOR_WIDTH_BREAKPOINT = 950;
export const LARGE_EDITOR_HEIGHT_BREAKPOINT = 550;

@Component({
  selector: EMBEDDED_EDITOR_SELECTOR,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AngularSplitModule, CodeEditor, Preview, Terminal, MatTabsModule, IconComponent],
  templateUrl: './embedded-editor.component.html',
  styleUrls: ['./embedded-editor.component.scss'],
  providers: [EditorUiState],
})
export class EmbeddedEditor implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorContainer') editorContainer!: ElementRef<HTMLDivElement>;
  @ViewChild(MatTabGroup) matTabGroup!: MatTabGroup;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly diagnosticsState = inject(DiagnosticsState);
  private readonly editorUiState = inject(EditorUiState);
  private readonly nodeRuntimeState = inject(NodeRuntimeState);
  private readonly nodeRuntimeSandbox = inject(NodeRuntimeSandbox);

  private resizeObserver?: ResizeObserver;

  protected splitDirection: 'horizontal' | 'vertical' = 'vertical';

  readonly MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES = MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES;

  readonly TerminalType = TerminalType;
  readonly displayOnlyTerminal = computed(
    () => this.editorUiState.uiState().displayOnlyInteractiveTerminal,
  );
  readonly errorsCount = signal<number>(0);
  readonly displayPreviewInMatTabGroup = signal<boolean>(true);

  readonly shouldEnableReset = computed(
    () =>
      this.nodeRuntimeState.loadingStep() > LoadingStep.BOOT &&
      !this.nodeRuntimeState.isResetting(),
  );

  private readonly errorsCount$ = this.diagnosticsState.diagnostics$.pipe(
    map((diagnosticsItem) => diagnosticsItem.filter((item) => item.severity === 'error').length),
    distinctUntilChanged(),
    takeUntilDestroyed(this.destroyRef),
  );
  private readonly displayPreviewInMatTabGroup$ = toObservable(
    this.displayPreviewInMatTabGroup,
  ).pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef));

  ngOnInit(): void {
    this.listenToErrorsCount();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setFirstTabAsActiveAfterResize();

      this.setResizeObserver();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  setVisibleEmbeddedEditorTabs(): void {
    this.displayPreviewInMatTabGroup.set(!this.isLargeEmbeddedEditor());
  }

  async reset(): Promise<void> {
    await this.nodeRuntimeSandbox.reset();
  }

  private setFirstTabAsActiveAfterResize(): void {
    this.displayPreviewInMatTabGroup$.subscribe(() => {
      this.changeDetector.detectChanges();
      this.matTabGroup.selectedIndex = 0;
    });
  }

  private listenToErrorsCount(): void {
    this.errorsCount$.subscribe((errorsCount) => {
      this.errorsCount.set(errorsCount);
    });
  }

  // Listen to resizing of Embedded Editor and set proper list of the tabs for the current resolution.
  private setResizeObserver() {
    this.resizeObserver = new ResizeObserver((_) => {
      this.setVisibleEmbeddedEditorTabs();

      this.splitDirection = this.isLargeEmbeddedEditor() ? 'horizontal' : 'vertical';
    });

    this.resizeObserver.observe(this.editorContainer.nativeElement);
  }

  private isLargeEmbeddedEditor(): boolean {
    const editorContainer = this.editorContainer.nativeElement;
    const width = editorContainer.offsetWidth;
    const height = editorContainer.offsetHeight;

    return width > LARGE_EDITOR_WIDTH_BREAKPOINT && height > LARGE_EDITOR_HEIGHT_BREAKPOINT;
  }
}
