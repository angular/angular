/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  Input,
  signal,
  Type,
  viewChild,
} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {Clipboard} from '@angular/cdk/clipboard';
import {CopySourceCodeButton} from '../../copy-source-code-button/copy-source-code-button.component';
import {ExampleMetadata, Snippet} from '../../../interfaces/index';
import {EXAMPLE_VIEWER_CONTENT_LOADER} from '../../../providers/index';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DocViewer} from '../docs-viewer/docs-viewer.component';

export enum CodeExampleViewMode {
  SNIPPET = 'snippet',
  MULTI_FILE = 'multi',
}

export const CODE_LINE_NUMBER_CLASS_NAME = 'shiki-ln-number';
export const CODE_LINE_CLASS_NAME = 'line';
export const GAP_CODE_LINE_CLASS_NAME = 'gap';
export const HIDDEN_CLASS_NAME = 'hidden';

@Component({
  selector: 'docs-example-viewer',
  imports: [CommonModule, forwardRef(() => DocViewer), CopySourceCodeButton, MatTabsModule],
  templateUrl: './example-viewer.component.html',
  styleUrls: ['./example-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleViewer {
  exampleMetadata = input<ExampleMetadata | null>(null, {alias: 'metadata'});

  @Input() githubUrl: string | null = null;
  @Input() stackblitzUrl: string | null = null;
  readonly matTabGroup = viewChild<MatTabGroup>('codeTabs');

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly clipboard = inject(Clipboard);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly exampleViewerContentLoader = inject(EXAMPLE_VIEWER_CONTENT_LOADER);

  private readonly shouldDisplayFullName = computed(() => {
    const fileExtensions =
      this.exampleMetadata()?.files.map((file) => this.getFileExtension(file.name)) ?? [];

    // Display full file names only when exist files with the same extension
    return new Set(fileExtensions).size !== fileExtensions.length;
  });

  CodeExampleViewMode = CodeExampleViewMode;
  exampleComponent?: Type<unknown>;

  expandable = signal<boolean>(false);
  expanded = signal<boolean>(false);
  snippetCode = signal<Snippet | undefined>(undefined);
  tabs = computed(() =>
    this.exampleMetadata()?.files.map((file) => ({
      name:
        file.title ?? (this.shouldDisplayFullName() ? file.name : this.getFileExtension(file.name)),
      code: file.content,
    })),
  );
  view = computed(() =>
    this.exampleMetadata()?.files.length === 1
      ? CodeExampleViewMode.SNIPPET
      : CodeExampleViewMode.MULTI_FILE,
  );

  async renderExample(): Promise<void> {
    // Lazy load live example component
    if (this.exampleMetadata()?.path && this.exampleMetadata()?.preview) {
      this.exampleComponent = await this.exampleViewerContentLoader.loadPreview(
        this.exampleMetadata()?.path!,
      );
    }

    this.snippetCode.set(this.exampleMetadata()?.files[0]);

    afterNextRender(
      () => {
        // Several function below query the DOM directly, we need to wait until the DOM is rendered.
        this.setCodeLinesVisibility();

        this.elementRef.nativeElement.setAttribute(
          'id',
          `example-${this.exampleMetadata()?.id.toString()!}`,
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

  toggleExampleVisibility(): void {
    this.expanded.update((expanded) => !expanded);

    this.setCodeLinesVisibility();
  }

  copyLink(): void {
    // Reconstruct the URL using `origin + pathname` so we drop any pre-existing hash.
    const fullUrl =
      location.origin +
      location.pathname +
      location.search +
      '#example-' +
      this.exampleMetadata()?.id;
    this.clipboard.copy(fullUrl);
  }

  private listenToMatTabIndexChange(): void {
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

  private getFileExtension(name: string): string {
    const segments = name.split('.');
    return segments.length ? segments[segments.length - 1].toLocaleUpperCase() : '';
  }

  private setCodeLinesVisibility(): void {
    this.expanded()
      ? this.handleExpandedStateForCodeBlock()
      : this.handleCollapsedStateForCodeBlock();
  }

  private handleExpandedStateForCodeBlock(): void {
    const lines = this.getHiddenCodeLines();

    const lineNumbers = this.getHiddenCodeLineNumbers();

    const gapLines = <HTMLDivElement[]>(
      Array.from(
        this.elementRef.nativeElement.querySelectorAll(
          `.${CODE_LINE_CLASS_NAME}.${GAP_CODE_LINE_CLASS_NAME}`,
        ),
      )
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

  private handleCollapsedStateForCodeBlock(): void {
    const visibleLinesRange = this.snippetCode()?.visibleLinesRange;

    if (!visibleLinesRange) {
      return;
    }

    const linesToDisplay = (visibleLinesRange?.split(',') ?? []).map((line) => Number(line));
    const lines = <HTMLDivElement[]>(
      Array.from(this.elementRef.nativeElement.querySelectorAll(`.${CODE_LINE_CLASS_NAME}`))
    );
    const lineNumbers = <HTMLSpanElement[]>(
      Array.from(this.elementRef.nativeElement.querySelectorAll(`.${CODE_LINE_NUMBER_CLASS_NAME}`))
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

  private getHiddenCodeLines(): HTMLDivElement[] {
    return <HTMLDivElement[]>(
      Array.from(
        this.elementRef.nativeElement.querySelectorAll(
          `.${CODE_LINE_CLASS_NAME}.${HIDDEN_CLASS_NAME}`,
        ),
      )
    );
  }

  private getHiddenCodeLineNumbers(): HTMLSpanElement[] {
    return <HTMLSpanElement[]>(
      Array.from(
        this.elementRef.nativeElement.querySelectorAll(
          `.${CODE_LINE_NUMBER_CLASS_NAME}.${HIDDEN_CLASS_NAME}`,
        ),
      )
    );
  }
}
