import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { GraphNode } from '../record-formatter/record-formatter';
import { Observable, Subscription } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { TabUpdate } from '../../../../tab-update';
import { map, tap } from 'rxjs/operators';

const ITEM_WIDTH = 29;

@Component({
  selector: 'ng-frame-selector',
  templateUrl: './frame-selector.component.html',
  styleUrls: ['./frame-selector.component.scss'],
})
export class FrameSelectorComponent implements OnInit, OnDestroy {
  @ViewChild('barContainer') barContainer: ElementRef;
  @Input() set startFrame(value: number) {
    this.startFrameIndex = value;
    this._ensureVisible(value);
  }
  @Input() set endFrame(value: number) {
    this.endFrameIndex = value;
  }
  @Input() set graphData$(graphData: Observable<GraphNode[]>) {
    this._graphData$ = graphData;
    this._graphDataSubscription = this._graphData$.subscribe((items) =>
      setTimeout(() => {
        this.viewport.scrollToIndex(items.length);
      })
    );
  }

  get graphData$(): Observable<GraphNode[]> {
    return this._graphData$;
  }

  @Output() move = new EventEmitter<number>();
  @Output() selectFrames = new EventEmitter<{ start: number; end: number }>();
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;

  startFrameIndex: number;
  endFrameIndex: number;

  get itemWidth(): number {
    return ITEM_WIDTH;
  }

  private _graphData$: Observable<GraphNode[]>;
  private _graphDataSubscription: Subscription;
  private _tabUpdateSubscription: Subscription;
  private _keydownCallback: (e: KeyboardEvent) => void;
  private _keyupCallback: (e: KeyboardEvent) => void;
  private _shiftDown = false;

  constructor(private _tabUpdate: TabUpdate) {}

  ngOnInit(): void {
    this._tabUpdateSubscription = this._tabUpdate.tabUpdate$.subscribe(() => {
      if (this.viewport) {
        setTimeout(() => {
          this.viewport.scrollToIndex(0);
          this.viewport.checkViewportSize();
        });
      }
    });
    window.addEventListener('keydown', (this._keydownCallback = (e: KeyboardEvent) => (this._shiftDown = e.shiftKey)));
    window.addEventListener('keyup', (this._keyupCallback = (e: KeyboardEvent) => (this._shiftDown = e.shiftKey)));
  }

  ngOnDestroy(): void {
    if (this._tabUpdateSubscription) {
      this._tabUpdateSubscription.unsubscribe();
    }
    if (this._graphDataSubscription) {
      this._graphDataSubscription.unsubscribe();
    }
    window.removeEventListener('keydown', this._keydownCallback);
    window.removeEventListener('keyup', this._keyupCallback);
  }

  get selectionLabel(): string {
    if (this.startFrameIndex !== this.endFrameIndex) {
      return `${this.startFrameIndex + 1}-${this.endFrameIndex + 1}`;
    }
    return `${this.startFrameIndex + 1}`;
  }

  handleFrameSelection(idx: number): void {
    if (!this._shiftDown) {
      this.startFrameIndex = this.endFrameIndex = idx;
    } else {
      const start = Math.min(this.startFrameIndex, idx);
      this.endFrameIndex = Math.max(this.startFrameIndex, this.endFrameIndex, idx);
      this.startFrameIndex = start;
    }
    this.selectFrames.emit({ start: this.startFrameIndex, end: this.endFrameIndex });
  }

  private _ensureVisible(index: number): void {
    if (!this.viewport) {
      return;
    }
    const scrollParent = this.viewport.elementRef.nativeElement;
    // The left most point we see an element
    const left = scrollParent.scrollLeft;
    // That's the right most point we currently see an element.
    const right = left + scrollParent.offsetWidth;
    const itemLeft = index * this.itemWidth;
    if (itemLeft < left) {
      scrollParent.scrollTo({ left: itemLeft });
    } else if (right < itemLeft + this.itemWidth) {
      scrollParent.scrollTo({ left: itemLeft - scrollParent.offsetWidth + this.itemWidth });
    }
  }
}
