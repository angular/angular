/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {FocusMonitor} from '@angular/cdk/a11y';
import {DOCUMENT} from '@angular/common';
import {DestroyRef, Injectable, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {fromEvent, combineLatest} from 'rxjs';
import {map, filter, finalize} from 'rxjs/operators';
const MIN_WIDTH_OF_CONTENT_IN_PX = 300;
const MAX_WIDTH_OF_CONTENT_IN_PX = 800;
let SplitResizerHandler = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SplitResizerHandler = class {
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
      SplitResizerHandler = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    destroyRef = inject(DestroyRef);
    document = inject(DOCUMENT);
    focusMonitor = inject(FocusMonitor);
    container;
    content;
    editor;
    resizer;
    resizeData = signal({
      initialContentContainerWidthInPercentage: 0,
      initialDividerPosition: 0,
      initialEditorContainerWidthInPercentage: 0,
      isProgress: false,
    });
    init(container, content, resizer, editor) {
      this.container = container;
      this.content = content;
      this.resizer = resizer;
      this.editor = editor;
      this.listenToResizeStart();
      this.listenToResize();
      this.listenToResizeEnd();
      this.resizeContainersUsingKeyArrows();
    }
    listenToResizeStart() {
      fromEvent(this.resizer.nativeElement, 'mousedown')
        .pipe(
          map((event) => ({editor: this.editor, event})),
          filter((eventAndEditor) => !!eventAndEditor.editor?.nativeElement),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(({event}) => {
          const contentWidthInPercentage = this.getCurrentContainerWidth(
            this.content.nativeElement,
          );
          const editorWidthInPercentage = this.getCurrentContainerWidth(this.editor.nativeElement);
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
    listenToResize() {
      fromEvent(this.document, 'mousemove')
        .pipe(
          map((event) => ({editor: this.editor, event})),
          filter((eventAndEditor) => !!eventAndEditor.editor?.nativeElement),
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
    listenToResizeEnd() {
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
    resizeContainersUsingKeyArrows() {
      combineLatest([this.focusMonitor.monitor(this.resizer), fromEvent(this.document, 'keydown')])
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
          const editorWidth = this.getCurrentContainerWidth(this.editor.nativeElement);
          this.setWidthOfTheContainers(contentWidth + shift, editorWidth - shift);
        });
    }
    setWidthOfTheContainers(newContentWidthInPercentage, newEditorWidthInPercentage) {
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
    getCurrentContainerWidth(element) {
      const savedWidth = Number(element.style.width.replace('%', ''));
      return savedWidth > 0
        ? savedWidth
        : (element.offsetWidth / this.getParentContainerWidth()) * 100;
    }
    getParentContainerWidth() {
      return (
        this.resizer.nativeElement.offsetWidth +
        this.content.nativeElement.offsetWidth +
        this.editor.nativeElement.offsetWidth
      );
    }
  };
  return (SplitResizerHandler = _classThis);
})();
export {SplitResizerHandler};
//# sourceMappingURL=split-resizer-handler.service.js.map
