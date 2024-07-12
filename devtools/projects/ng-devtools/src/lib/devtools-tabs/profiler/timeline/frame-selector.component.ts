/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  CdkVirtualScrollViewport,
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
} from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

import {TabUpdate} from '../../tab-update/index';

import {GraphNode} from './record-formatter/record-formatter';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatCard} from '@angular/material/card';
import {AsyncPipe, NgStyle} from '@angular/common';

const ITEM_WIDTH = 30;

@Component({
  selector: 'ng-frame-selector',
  templateUrl: './frame-selector.component.html',
  styleUrls: ['./frame-selector.component.scss'],
  standalone: true,
  imports: [
    MatCard,
    MatTooltip,
    MatButton,
    MatIcon,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    NgStyle,
    AsyncPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameSelectorComponent {
  private _tabUpdate = inject(TabUpdate);

  readonly barContainer = viewChild.required<ElementRef>('barContainer');

  readonly graphData = input<GraphNode[]>([]);

  readonly selectFrames = output<{indexes: number[]}>();

  readonly viewport = viewChild.required<CdkVirtualScrollViewport>(CdkVirtualScrollViewport);

  startFrameIndex = -1;
  endFrameIndex = -1;
  selectedFrameIndexes = new Set<number>();
  frameCount = computed(() => this.graphData().length);

  private _viewportScrollState = {scrollLeft: 0, xCoordinate: 0, isDragScrolling: false};

  readonly itemWidth = ITEM_WIDTH;

  constructor() {
    effect(() => {
      const _ = this._tabUpdate.tabUpdate();
      const viewport = this.viewport();
      if (viewport) {
        setTimeout(() => {
          viewport.scrollToIndex(0);
          viewport.checkViewportSize();
        });
      }
    });
    effect(() => {
      const items = this.graphData();
      setTimeout(() => {
        this.viewport().scrollToIndex(items.length);
      });
    });
  }

  get selectionLabel(): string {
    if (this.startFrameIndex === this.endFrameIndex) {
      return `${this.startFrameIndex + 1}`;
    }

    return this._smartJoinIndexLabels([...this.selectedFrameIndexes]);
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
    const newVal = this.startFrameIndex + value;
    this.selectedFrameIndexes = new Set([newVal]);
    if (newVal > -1 && newVal < this.frameCount()) {
      this._selectFrames({indexes: this.selectedFrameIndexes});
    }
  }

  private _selectFrames({indexes}: {indexes: Set<number>}): void {
    const sortedIndexes = [...indexes].sort((a, b) => a - b);
    this.startFrameIndex = sortedIndexes[0];
    this.endFrameIndex = sortedIndexes[sortedIndexes.length - 1];
    this._ensureVisible(this.startFrameIndex);
    this.selectFrames.emit({indexes: sortedIndexes});
  }

  handleFrameSelection(idx: number, event: MouseEvent): void {
    const {shiftKey, ctrlKey, metaKey} = event;

    if (shiftKey) {
      const [start, end] = [Math.min(this.startFrameIndex, idx), Math.max(this.endFrameIndex, idx)];
      this.selectedFrameIndexes = new Set(
        Array.from(Array(end - start + 1), (_, index) => index + start),
      );
    } else if (ctrlKey || metaKey) {
      if (this.selectedFrameIndexes.has(idx)) {
        if (this.selectedFrameIndexes.size === 1) {
          return; // prevent deselection when only one frame is selected
        }

        this.selectedFrameIndexes.delete(idx);
      } else {
        this.selectedFrameIndexes.add(idx);
      }
    } else {
      this.selectedFrameIndexes = new Set([idx]);
    }

    this._selectFrames({indexes: this.selectedFrameIndexes});
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
