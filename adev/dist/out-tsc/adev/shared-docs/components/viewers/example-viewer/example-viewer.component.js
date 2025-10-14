/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {DOCUMENT, NgTemplateOutlet} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {Clipboard} from '@angular/cdk/clipboard';
import {CopySourceCodeButton} from '../../copy-source-code-button/copy-source-code-button.component';
import {IconComponent} from '../../icon/icon.component';
import {EXAMPLE_VIEWER_CONTENT_LOADER} from '../../../providers/index';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatTooltipModule} from '@angular/material/tooltip';
export var CodeExampleViewMode;
(function (CodeExampleViewMode) {
  CodeExampleViewMode['SNIPPET'] = 'snippet';
  CodeExampleViewMode['MULTI_FILE'] = 'multi';
})(CodeExampleViewMode || (CodeExampleViewMode = {}));
export const CODE_LINE_NUMBER_CLASS_NAME = 'shiki-ln-number';
export const CODE_LINE_CLASS_NAME = 'line';
export const GAP_CODE_LINE_CLASS_NAME = 'gap';
export const HIDDEN_CLASS_NAME = 'hidden';
let ExampleViewer = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-example-viewer',
      imports: [
        CopySourceCodeButton,
        MatTabsModule,
        MatTooltipModule,
        IconComponent,
        NgTemplateOutlet,
      ],
      templateUrl: './example-viewer.component.html',
      styleUrls: ['./example-viewer.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ExampleViewer = class {
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
      ExampleViewer = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    exampleMetadata = input(null, {alias: 'metadata'});
    githubUrl = input(null);
    stackblitzUrl = input(null);
    matTabGroup = viewChild('codeTabs');
    changeDetector = inject(ChangeDetectorRef);
    clipboard = inject(Clipboard);
    destroyRef = inject(DestroyRef);
    document = inject(DOCUMENT);
    injector = inject(Injector);
    elementRef = inject(ElementRef);
    exampleViewerContentLoader = inject(EXAMPLE_VIEWER_CONTENT_LOADER);
    shouldDisplayFullName = computed(() => {
      const fileExtensions =
        this.exampleMetadata()?.files.map((file) => this.getFileExtension(file.name)) ?? [];
      // Display full file names only when exist files with the same extension
      return new Set(fileExtensions).size !== fileExtensions.length;
    });
    CodeExampleViewMode = CodeExampleViewMode;
    exampleComponent;
    expandable = signal(false);
    expanded = signal(false);
    snippetCode = signal(undefined);
    showCode = signal(true);
    tabs = computed(() =>
      this.exampleMetadata()?.files.map((file) => ({
        name:
          file.title ??
          (this.shouldDisplayFullName() ? file.name : this.getFileExtension(file.name)),
        code: file.sanitizedContent,
      })),
    );
    view = computed(() =>
      this.exampleMetadata()?.files.length === 1
        ? CodeExampleViewMode.SNIPPET
        : CodeExampleViewMode.MULTI_FILE,
    );
    async renderExample() {
      // Lazy load live example component
      if (this.exampleMetadata()?.path && this.exampleMetadata()?.preview) {
        this.exampleComponent = await this.exampleViewerContentLoader.loadPreview(
          this.exampleMetadata()?.path,
        );
      }
      this.snippetCode.set(this.exampleMetadata()?.files[0]);
      if (this.exampleMetadata()?.hideCode) {
        this.showCode.set(false);
      }
      afterNextRender(
        () => {
          // Several function below query the DOM directly, we need to wait until the DOM is rendered.
          this.setCodeLinesVisibility();
          this.elementRef.nativeElement.setAttribute(
            'id',
            `example-${this.exampleMetadata()?.id.toString()}`,
          );
          this.matTabGroup()?.realignInkBar();
          this.listenToMatTabIndexChange();
          const lines = this.getHiddenCodeLines();
          const lineNumbers = this.getHiddenCodeLineNumbers();
          this.expandable.set(lines.length > 0 || lineNumbers.length > 0);
        },
        {injector: this.injector},
      );
    }
    toggleExampleVisibility() {
      this.expanded.update((expanded) => !expanded);
      this.setCodeLinesVisibility();
    }
    copyLink() {
      // Reconstruct the URL using `origin + pathname` so we drop any pre-existing hash.
      const fullUrl =
        location.origin +
        location.pathname +
        location.search +
        '#example-' +
        this.exampleMetadata()?.id;
      this.clipboard.copy(fullUrl);
    }
    listenToMatTabIndexChange() {
      const matTabGroup = this.matTabGroup();
      matTabGroup?.realignInkBar();
      matTabGroup?.selectedIndexChange
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((index) => {
          this.snippetCode.set(this.exampleMetadata()?.files[index]);
          this.changeDetector.detectChanges();
          this.setCodeLinesVisibility();
        });
    }
    getFileExtension(name) {
      const segments = name.split('.');
      return segments.length ? segments[segments.length - 1].toLocaleUpperCase() : '';
    }
    setCodeLinesVisibility() {
      this.expanded()
        ? this.handleExpandedStateForCodeBlock()
        : this.handleCollapsedStateForCodeBlock();
    }
    handleExpandedStateForCodeBlock() {
      const lines = this.getHiddenCodeLines();
      const lineNumbers = this.getHiddenCodeLineNumbers();
      const gapLines = Array.from(
        this.elementRef.nativeElement.querySelectorAll(
          `.${CODE_LINE_CLASS_NAME}.${GAP_CODE_LINE_CLASS_NAME}`,
        ),
      );
      for (const line of lines) {
        line.classList.remove(HIDDEN_CLASS_NAME);
      }
      for (const lineNumber of lineNumbers) {
        lineNumber.classList.remove(HIDDEN_CLASS_NAME);
      }
      for (const expandLine of gapLines) {
        expandLine.remove();
      }
    }
    handleCollapsedStateForCodeBlock() {
      const visibleLinesRange = this.snippetCode()?.visibleLinesRange;
      if (!visibleLinesRange) {
        return;
      }
      const linesToDisplay = (visibleLinesRange?.split(',') ?? []).map((line) => Number(line));
      const lines = Array.from(
        this.elementRef.nativeElement.querySelectorAll(`.${CODE_LINE_CLASS_NAME}`),
      );
      const lineNumbers = Array.from(
        this.elementRef.nativeElement.querySelectorAll(`.${CODE_LINE_NUMBER_CLASS_NAME}`),
      );
      const appendGapBefore = [];
      for (const [index, line] of lines.entries()) {
        if (!linesToDisplay.includes(index)) {
          line.classList.add(HIDDEN_CLASS_NAME);
        } else if (!linesToDisplay.includes(index - 1)) {
          appendGapBefore.push(line);
        }
      }
      for (const [index, lineNumber] of lineNumbers.entries()) {
        if (!linesToDisplay.includes(index)) {
          lineNumber.classList.add(HIDDEN_CLASS_NAME);
        }
      }
      // Create gap line between visible ranges. For example we would like to display 10-16 and 20-29 lines.
      // We should display separator, gap between those two scopes.
      // TODO: we could replace div it with the component, and allow to expand code block after click.
      for (const [index, element] of appendGapBefore.entries()) {
        if (index === 0) {
          continue;
        }
        const separator = this.document.createElement('div');
        separator.textContent = `...`;
        separator.classList.add(CODE_LINE_CLASS_NAME);
        separator.classList.add(GAP_CODE_LINE_CLASS_NAME);
        element.parentNode?.insertBefore(separator, element);
      }
    }
    getHiddenCodeLines() {
      return Array.from(
        this.elementRef.nativeElement.querySelectorAll(
          `.${CODE_LINE_CLASS_NAME}.${HIDDEN_CLASS_NAME}`,
        ),
      );
    }
    getHiddenCodeLineNumbers() {
      return Array.from(
        this.elementRef.nativeElement.querySelectorAll(
          `.${CODE_LINE_NUMBER_CLASS_NAME}.${HIDDEN_CLASS_NAME}`,
        ),
      );
    }
  };
  return (ExampleViewer = _classThis);
})();
export {ExampleViewer};
//# sourceMappingURL=example-viewer.component.js.map
