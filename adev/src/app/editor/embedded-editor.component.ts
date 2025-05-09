/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isPlatformBrowser} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterRenderEffect,
  computed,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {IconComponent, TutorialType} from '@angular/docs';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {map} from 'rxjs';

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
export class EmbeddedEditor {
  readonly editorContainer = viewChild<ElementRef<HTMLDivElement>>('editorContainer');
  readonly matTabGroup = viewChild(MatTabGroup);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly diagnosticsState = inject(DiagnosticsState);
  readonly editorUiState = inject(EditorUiState);
  private readonly nodeRuntimeState = inject(NodeRuntimeState);
  private readonly nodeRuntimeSandbox = inject(NodeRuntimeSandbox);

  protected splitDirection = signal<'horizontal' | 'vertical'>('vertical');

  readonly MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES = MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES;

  readonly TerminalType = TerminalType;
  readonly displayOnlyTerminal = computed(
    () => this.editorUiState.tutorialType() === TutorialType.CLI,
  );
  readonly displayPreviewInMatTabGroup = signal<boolean>(true);
  readonly selectedTabIndex = linkedSignal({
    source: () => this.displayPreviewInMatTabGroup(),
    computation: () => 0,
  });

  readonly shouldEnableReset = computed(
    () =>
      this.nodeRuntimeState.loadingStep() > LoadingStep.BOOT &&
      !this.nodeRuntimeState.isResetting(),
  );

  private readonly errorsCount$ = this.diagnosticsState.diagnostics$.pipe(
    map((diagnosticsItem) => diagnosticsItem.filter((item) => item.severity === 'error').length),
  );
  readonly errorsCount = toSignal(this.errorsCount$, {initialValue: 0});

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const ref = afterRenderEffect({
      read: () => {
        const container = this.editorContainer()?.nativeElement;
        if (!container) {
          return;
        }
        this.setResizeObserver(container);
        ref.destroy();
      },
    });
  }

  async reset(): Promise<void> {
    await this.nodeRuntimeSandbox.reset();
  }

  // Listen to resizing of Embedded Editor and set proper list of the tabs for the current resolution.
  private setResizeObserver(container: HTMLDivElement) {
    const resizeObserver = new ResizeObserver((_) => {
      this.displayPreviewInMatTabGroup.set(!this.isLargeEmbeddedEditor(container));

      this.splitDirection.set(this.isLargeEmbeddedEditor(container) ? 'horizontal' : 'vertical');
    });

    resizeObserver.observe(container);
    this.destroyRef.onDestroy(() => {
      resizeObserver.disconnect();
    });
  }

  private isLargeEmbeddedEditor({offsetWidth, offsetHeight}: HTMLDivElement): boolean {
    return (
      offsetWidth > LARGE_EDITOR_WIDTH_BREAKPOINT && offsetHeight > LARGE_EDITOR_HEIGHT_BREAKPOINT
    );
  }
}
