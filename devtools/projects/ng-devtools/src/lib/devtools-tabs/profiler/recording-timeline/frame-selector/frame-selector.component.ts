/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CdkVirtualScrollViewport,
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
} from '@angular/cdk/scrolling';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  Signal,
  signal,
  viewChild,
} from '@angular/core';

import {TabUpdate} from '../../../tab-update/index';

import {GraphNode} from '../record-formatter/record-formatter';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {DecimalPipe, NgStyle} from '@angular/common';
import {ProfilerFrame} from '../../../../../../../protocol';
import {ButtonComponent} from '../../../../shared/button/button.component';
import {estimateFrameRate} from '../shared/estimate-frame-rate';

const ITEM_GAP = 2.5;
const ITEM_WIDTH = 18;
const MAX_HEIGHT = 100;
const DRAG_SCROLL_SPEED = 2;

/** Returns a linked signal that resets on source change. */
function framesBoundSignal<T>(source: Signal<ProfilerFrame[]>, defaultValue: T) {
  return linkedSignal<ProfilerFrame[], T>({
    source,
    computation: (source, prev) => {
      if (source.length !== prev?.source.length) {
        return defaultValue;
      }
      return prev.value;
    },
  });
}

@Component({
  selector: 'ng-frame-selector',
  templateUrl: './frame-selector.component.html',
  styleUrls: ['./frame-selector.component.scss'],
  styles: `
    :host { --max-bar-height: ${MAX_HEIGHT}px }
  `,
  imports: [
    MatTooltip,
    MatIcon,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    NgStyle,
    ButtonComponent,
    DecimalPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameSelectorComponent {
  private readonly tabUpdate = inject(TabUpdate);

  readonly barContainer = viewChild.required<ElementRef>('barContainer');
  readonly frames = input<ProfilerFrame[]>([]);

  readonly selectFrames = output<{indexes: number[]}>();

  readonly viewport = viewChild.required<CdkVirtualScrollViewport>(CdkVirtualScrollViewport);

  readonly startFrameIndex = framesBoundSignal<number>(this.frames, -1);
  readonly endFrameIndex = framesBoundSignal<number>(this.frames, -1);
  readonly selectedFrameIndexes = framesBoundSignal<Set<number>>(this.frames, new Set());

  readonly dragScrolling = signal(false);
  readonly frameCount = computed(() => this.frames().length);
  readonly disableNextFrameButton = computed(
    () => this.endFrameIndex() >= this.frameCount() - 1 || this.selectedFrameIndexes().size > 1,
  );
  readonly disablePreviousFrameButton = computed(
    () => this.startFrameIndex() <= 0 || this.selectedFrameIndexes().size > 1,
  );
  readonly selectionLabel = computed(() => {
    if (this.startFrameIndex() === this.endFrameIndex()) {
      return `${this.startFrameIndex() + 1}`;
    }

    return this._smartJoinIndexLabels([...this.selectedFrameIndexes()]);
  });

  private _viewportScrollState = {scrollLeft: 0, xCoordinate: 0, isDragScrolling: false};

  readonly itemWidth = ITEM_WIDTH + ITEM_GAP;

  private readonly maxFrameDuration = computed(() =>
    this.frames().reduce((acc: number, frame: ProfilerFrame) => Math.max(acc, frame.duration), 0),
  );

  private readonly multiplicationFactor = computed(() =>
    parseFloat((MAX_HEIGHT / this.maxFrameDuration()).toFixed(2)),
  );

  protected readonly graphData = computed<GraphNode[]>(() =>
    this.frames().map((r) => this.getBarStyles(r, this.multiplicationFactor())),
  );

  constructor() {
    afterRenderEffect(() => {
      // Listen for tab updates to reset the scroll position to the top
      // This ensures the viewport is properly updated when switching tabs
      this.tabUpdate.tabUpdate();

      const viewport = this.viewport();
      viewport.scrollToIndex(0);
      viewport.checkViewportSize();
    });
    afterRenderEffect(() => {
      const items = this.frames();
      this.viewport().scrollToIndex(items.length);
    });
  }

  private _smartJoinIndexLabels(indexArray: number[]): string {
    const sortedIndexes = indexArray.sort((a, b) => a - b);

    const groups: number[][] = [];
    let prev: number | null = null;

    for (const index of sortedIndexes) {
      // First iteration: create initial group and set prev variable to the first index
      if (prev === null) {
        groups.push([index]);
        prev = index;
        continue;
      }

      // If current index is consecutive with the previous, group them, otherwise start a new group
      if (prev + 1 === index) {
        groups[groups.length - 1].push(index);
      } else {
        groups.push([index]);
      }

      prev = index;
    }

    return groups
      .filter((group) => group.length > 0)
      .map((group) =>
        group.length === 1 ? group[0] + 1 : `${group[0] + 1}-${group[group.length - 1] + 1}`,
      )
      .join(', ');
  }

  move(value: number): void {
    const newVal = this.startFrameIndex() + value;
    this.selectedFrameIndexes.set(new Set([newVal]));
    if (newVal > -1 && newVal < this.frameCount()) {
      this._selectFrames({indexes: this.selectedFrameIndexes()});
    }
  }

  private _selectFrames({indexes}: {indexes: Set<number>}): void {
    const sortedIndexes = [...indexes].sort((a, b) => a - b);
    this.startFrameIndex.set(sortedIndexes[0]);
    this.endFrameIndex.set(sortedIndexes[sortedIndexes.length - 1]);
    this._ensureVisible(this.startFrameIndex());
    this.selectFrames.emit({indexes: sortedIndexes});
  }

  handleFrameSelection(idx: number, event: MouseEvent): void {
    const {shiftKey, ctrlKey, metaKey} = event;
    let frames = this.selectedFrameIndexes();
    if (shiftKey) {
      const [start, end] = [
        Math.min(this.startFrameIndex(), idx),
        Math.max(this.endFrameIndex(), idx),
      ];
      frames = new Set(Array.from(Array(end - start + 1), (_, index) => index + start));
    } else if (ctrlKey || metaKey) {
      if (frames.has(idx)) {
        if (frames.size === 1) {
          return; // prevent deselection when only one frame is selected
        }

        frames.delete(idx);
      } else {
        frames.add(idx);
      }
    } else {
      frames = new Set([idx]);
    }
    this.selectedFrameIndexes.set(new Set(frames));
    this._selectFrames({indexes: this.selectedFrameIndexes()});
  }

  private _ensureVisible(index: number): void {
    if (!this.viewport()) {
      return;
    }
    const scrollParent = this.viewport().elementRef.nativeElement;
    // The left most point we see an element
    const left = scrollParent.scrollLeft;
    // That's the right most point we currently see an element.
    const right = left + scrollParent.offsetWidth;
    const itemLeft = index * this.itemWidth;
    if (itemLeft < left) {
      scrollParent.scrollTo({left: itemLeft});
    } else if (right < itemLeft + this.itemWidth) {
      scrollParent.scrollTo({left: itemLeft - scrollParent.offsetWidth + this.itemWidth});
    }
  }

  stopDragScrolling(): void {
    this.dragScrolling.set(false);
    this._viewportScrollState.isDragScrolling = false;
  }

  startDragScroll(event: MouseEvent): void {
    this.dragScrolling.set(true);
    this._viewportScrollState = {
      xCoordinate: event.clientX,
      scrollLeft: this.viewport().elementRef.nativeElement.scrollLeft,
      isDragScrolling: true,
    };
  }

  dragScroll(event: MouseEvent): void {
    if (!this._viewportScrollState.isDragScrolling) {
      return;
    }

    const dx = event.clientX - this._viewportScrollState.xCoordinate;
    this.viewport().elementRef.nativeElement.scrollLeft =
      this._viewportScrollState.scrollLeft - dx * DRAG_SCROLL_SPEED;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private getBarStyles(frame: ProfilerFrame, multiplicationFactor: number): GraphNode {
    const height = frame.duration * multiplicationFactor;
    const colorPercentage = Math.max(10, Math.round((height / MAX_HEIGHT) * 100));
    const backgroundColor = this.getColorByFrameRate(estimateFrameRate(frame.duration));

    const style = {
      'background-image': `-webkit-linear-gradient(bottom, ${backgroundColor} ${colorPercentage}%, transparent ${colorPercentage}%)`,
      width: ITEM_WIDTH + 'px',
      height: MAX_HEIGHT + 'px',
    };
    const toolTip = `${frame.source} TimeSpent: ${frame.duration.toFixed(3)}ms`;
    return {style, toolTip, frame};
  }

  private getColorByFrameRate(framerate: number): string {
    if (framerate >= 60) {
      return 'var(--dynamic-green-01)';
    } else if (60 > framerate && framerate >= 30) {
      return 'var(--dynamic-yellow-01)';
    } else if (30 > framerate && framerate >= 15) {
      return 'var(--dynamic-red-03)';
    }
    return 'var(--dynamic-red-01)';
  }
}
