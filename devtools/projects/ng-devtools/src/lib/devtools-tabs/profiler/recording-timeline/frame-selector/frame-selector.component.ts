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
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import {TabUpdate} from '../../../tab-update/index';

import {GraphNode} from '../record-formatter/record-formatter';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatCard} from '@angular/material/card';
import {NgStyle} from '@angular/common';
import {MatIconButton} from '@angular/material/button';

const ITEM_WIDTH = 30;

@Component({
  selector: 'ng-frame-selector',
  templateUrl: './frame-selector.component.html',
  styleUrls: ['./frame-selector.component.scss'],
  imports: [
    MatCard,
    MatTooltip,
    MatIcon,
    MatIconButton,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    NgStyle,
  ],
})
export class FrameSelectorComponent {
  readonly barContainer = viewChild.required<ElementRef>('barContainer');
  readonly graphData = input<GraphNode[]>([]);

  readonly selectFrames = output<{indexes: number[]}>();

  readonly viewport = viewChild.required<CdkVirtualScrollViewport>(CdkVirtualScrollViewport);

  readonly startFrameIndex = signal(-1);
  readonly endFrameIndex = signal(-1);
  readonly selectedFrameIndexes = signal(new Set<number>());
  readonly frameCount = computed(() => this.graphData().length);
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

  readonly itemWidth = ITEM_WIDTH;

  private _tabUpdate = inject(TabUpdate);

  constructor() {
    afterRenderEffect(() => {
      // Listen for tab updates to reset the scroll position to the top
      // This ensures the viewport is properly updated when switching tabs
      this._tabUpdate.tabUpdate();

      const viewport = this.viewport();
      viewport.scrollToIndex(0);
      viewport.checkViewportSize();
    });
    afterRenderEffect(() => {
      const items = this.graphData();
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
    this._viewportScrollState.isDragScrolling = false;
  }

  startDragScroll(event: MouseEvent): void {
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

    const dragScrollSpeed = 2;
    const dx = event.clientX - this._viewportScrollState.xCoordinate;
    this.viewport().elementRef.nativeElement.scrollLeft =
      this._viewportScrollState.scrollLeft - dx * dragScrollSpeed;
  }
}
