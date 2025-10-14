/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {isPlatformBrowser} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {IconComponent} from '@angular/docs';
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
let EmbeddedEditor = (() => {
  let _classDecorators = [
    Component({
      selector: EMBEDDED_EDITOR_SELECTOR,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [AngularSplitModule, CodeEditor, Preview, Terminal, MatTabsModule, IconComponent],
      templateUrl: './embedded-editor.component.html',
      styleUrls: ['./embedded-editor.component.scss'],
      providers: [EditorUiState],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var EmbeddedEditor = class {
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
      EmbeddedEditor = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // Prevents from adding, removing or renaming files
    restrictedMode = input(false);
    editorContainer = viewChild('editorContainer');
    matTabGroup = viewChild(MatTabGroup);
    platformId = inject(PLATFORM_ID);
    destroyRef = inject(DestroyRef);
    diagnosticsState = inject(DiagnosticsState);
    editorUiState = inject(EditorUiState);
    nodeRuntimeState = inject(NodeRuntimeState);
    nodeRuntimeSandbox = inject(NodeRuntimeSandbox);
    splitDirection = signal('vertical');
    MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES = MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES;
    TerminalType = TerminalType;
    displayOnlyTerminal = computed(
      () => this.editorUiState.tutorialType() === 'cli' /* TutorialType.CLI */,
    );
    displayPreviewInMatTabGroup = signal(true);
    selectedTabIndex = linkedSignal({
      source: () => this.displayPreviewInMatTabGroup(),
      computation: () => 0,
    });
    shouldEnableReset = computed(
      () =>
        this.nodeRuntimeState.loadingStep() > LoadingStep.BOOT &&
        !this.nodeRuntimeState.isResetting(),
    );
    errorsCount$ = this.diagnosticsState.diagnostics$.pipe(
      map((diagnosticsItem) => diagnosticsItem.filter((item) => item.severity === 'error').length),
    );
    errorsCount = toSignal(this.errorsCount$, {initialValue: 0});
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
    async reset() {
      await this.nodeRuntimeSandbox.reset();
    }
    // Listen to resizing of Embedded Editor and set proper list of the tabs for the current resolution.
    setResizeObserver(container) {
      const resizeObserver = new ResizeObserver((_) => {
        this.displayPreviewInMatTabGroup.set(!this.isLargeEmbeddedEditor(container));
        this.splitDirection.set(this.isLargeEmbeddedEditor(container) ? 'horizontal' : 'vertical');
      });
      resizeObserver.observe(container);
      this.destroyRef.onDestroy(() => {
        resizeObserver.disconnect();
      });
    }
    isLargeEmbeddedEditor({offsetWidth, offsetHeight}) {
      return (
        offsetWidth > LARGE_EDITOR_WIDTH_BREAKPOINT && offsetHeight > LARGE_EDITOR_HEIGHT_BREAKPOINT
      );
    }
  };
  return (EmbeddedEditor = _classThis);
})();
export {EmbeddedEditor};
//# sourceMappingURL=embedded-editor.component.js.map
