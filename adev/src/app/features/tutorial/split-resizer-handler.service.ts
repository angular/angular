/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {DOCUMENT} from '@angular/common';
import {DestroyRef, ElementRef, Injectable, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {fromEvent, combineLatest} from 'rxjs';
import {map, filter, finalize} from 'rxjs/operators';

interface ResizingData {
  isProgress: boolean;
  initialContentContainerWidthInPercentage: number;
  initialDividerPosition: number;
  initialEditorContainerWidthInPercentage: number;
}

interface MouseEventAndEditor {
  event: MouseEvent;
  editor: ElementRef<HTMLDivElement>;
}

const MIN_WIDTH_OF_CONTENT_IN_PX = 300;
const MAX_WIDTH_OF_CONTENT_IN_PX = 800;

@Injectable()
export class SplitResizerHandler {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly focusMonitor = inject(FocusMonitor);

  private container!: ElementRef<any>;
  private content!: ElementRef<HTMLDivElement>;
  private editor: ElementRef<HTMLDivElement> | undefined;
  private resizer!: ElementRef<HTMLDivElement>;

  private readonly resizeData = signal<ResizingData>({
    initialContentContainerWidthInPercentage: 0,
    initialDividerPosition: 0,
    initialEditorContainerWidthInPercentage: 0,
    isProgress: false,
  });

  init(
    container: ElementRef<unknown>,
    content: ElementRef<HTMLDivElement>,
    resizer: ElementRef<HTMLDivElement>,
    editor?: ElementRef<HTMLDivElement>,
  ): void {
    this.container = container;
    this.content = content;
    this.resizer = resizer;
    this.editor = editor;

    this.listenToResizeStart();

    this.listenToResize();

    this.listenToResizeEnd();

    this.resizeContainersUsingKeyArrows();
  }

  private listenToResizeStart(): void {
    fromEvent<MouseEvent>(this.resizer.nativeElement, 'mousedown')
      .pipe(
        map((event) => ({editor: this.editor, event})),
        filter(
          (eventAndEditor): eventAndEditor is MouseEventAndEditor =>
            !!eventAndEditor.editor?.nativeElement,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({event}) => {
        const contentWidthInPercentage = this.getCurrentContainerWidth(this.content.nativeElement);
        const editorWidthInPercentage = this.getCurrentContainerWidth(this.editor!.nativeElement);

        this.content.nativeElement.style.minWidth = `${MIN_WIDTH_OF_CONTENT_IN_PX}px`;

        this.resizeData.update((data) => {
          data.initialDividerPosition = event.pageX;
          data.isProgress = true;
          data.initialContentContainerWidthInPercentage = contentWidthInPercentage;
          data.initialEditorContainerWidthInPercentage = editorWidthInPercentage;
          return {...data};
        });
      });
  }

  private listenToResize(): void {
    fromEvent<MouseEvent>(this.document, 'mousemove')
      .pipe(
        map((event) => ({editor: this.editor, event})),
        filter(
          (eventAndEditor): eventAndEditor is MouseEventAndEditor =>
            !!eventAndEditor.editor?.nativeElement,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({event}) => {
        if (this.resizeData().isProgress) {
          const newDividerPosition = event.pageX;
          const containerWidth = this.getParentContainerWidth();
          const shift =
            ((newDividerPosition - this.resizeData().initialDividerPosition) / containerWidth) *
            100;
          const newContentWidthInPercentage =
            this.resizeData().initialContentContainerWidthInPercentage + shift;
          const newEditorWidthInPercentage =
            this.resizeData().initialEditorContainerWidthInPercentage - shift;
          this.setWidthOfTheContainers(newContentWidthInPercentage, newEditorWidthInPercentage);
        }
      });
  }

  private listenToResizeEnd(): void {
    fromEvent(this.document, 'mouseup')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.resizeData().isProgress) {
          this.content.nativeElement.style.minWidth = `${MIN_WIDTH_OF_CONTENT_IN_PX}px`;

          this.resizeData.update((data) => {
            data.isProgress = false;
            data.initialDividerPosition = 0;
            data.initialContentContainerWidthInPercentage = 0;
            data.initialEditorContainerWidthInPercentage = 0;
            return {...data};
          });
        }
      });
  }

  // When resizer bar is focused, resize containers when user presses key arrows.
  private resizeContainersUsingKeyArrows(): void {
    combineLatest([
      this.focusMonitor.monitor(this.resizer),
      fromEvent<KeyboardEvent>(this.document, 'keydown'),
    ])
      .pipe(
        filter(
          ([origin, keyEvent]) =>
            !!origin && (keyEvent.key === 'ArrowLeft' || keyEvent.key === 'ArrowRight'),
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.focusMonitor.stopMonitoring(this.resizer)),
      )
      .subscribe(([_, keyEvent]) => {
        const shift = keyEvent.key === 'ArrowLeft' ? -1 : 1;

        const contentWidth = this.getCurrentContainerWidth(this.content.nativeElement);
        const editorWidth = this.getCurrentContainerWidth(this.editor!.nativeElement);
        this.setWidthOfTheContainers(contentWidth + shift, editorWidth - shift);
      });
  }

  private setWidthOfTheContainers(
    newContentWidthInPercentage: number,
    newEditorWidthInPercentage: number,
  ) {
    const containerWidth = this.container.nativeElement.offsetWidth;
    const newContentWidthInPx = (containerWidth * newContentWidthInPercentage) / 100;

    if (
      newContentWidthInPx > MIN_WIDTH_OF_CONTENT_IN_PX &&
      newContentWidthInPx < MAX_WIDTH_OF_CONTENT_IN_PX &&
      this.editor
    ) {
      this.content.nativeElement.style.width = `${newContentWidthInPercentage}%`;
      this.editor.nativeElement.style.width = `${newEditorWidthInPercentage}%`;
    }
  }

  private getCurrentContainerWidth(element: HTMLDivElement): number {
    const savedWidth = Number(element.style.width.replace('%', ''));
    return savedWidth > 0
      ? savedWidth
      : (element.offsetWidth / this.getParentContainerWidth()) * 100;
  }

  private getParentContainerWidth(): number {
    return (
      this.resizer.nativeElement.offsetWidth +
      this.content.nativeElement.offsetWidth +
      this.editor!.nativeElement.offsetWidth
    );
  }
}
