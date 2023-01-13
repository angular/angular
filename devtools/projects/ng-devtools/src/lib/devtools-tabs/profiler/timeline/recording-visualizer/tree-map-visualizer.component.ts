/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProfilerFrame} from 'protocol';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {render} from '../../../../vendor/webtreemap/treemap';
import {TreeMapFormatter, TreeMapNode} from '../record-formatter/tree-map-formatter';

@Component({
  selector: 'ng-tree-map-visualizer',
  templateUrl: './tree-map-visualizer.component.html',
  styleUrls: ['./tree-map-visualizer.component.scss'],
})
export class TreeMapVisualizerComponent implements OnInit, OnDestroy {
  private _formatter = new TreeMapFormatter();

  @Input()
  set frame(frame: ProfilerFrame) {
    // first element in data is the Application node
    this.treeMapRecords = this._formatter.formatFrame(frame);
    if (this.tree) {
      this._renderTree();
    }
  }

  constructor(private _ngZone: NgZone) {}

  private resize$ = new Subject<void>();
  private _throttledResizeSubscription: Subscription;

  private _resizeObserver: ResizeObserver =
      new ResizeObserver(() => this._ngZone.run(() => this.resize$.next()));
  treeMapRecords: TreeMapNode;

  @ViewChild('webTree', {static: true}) tree: ElementRef;

  ngOnInit(): void {
    this._throttledResizeSubscription =
        this.resize$.pipe(debounceTime(100)).subscribe(() => this._renderTree());
    this._resizeObserver.observe(this.tree.nativeElement);
  }

  ngOnDestroy(): void {
    this._throttledResizeSubscription.unsubscribe();
    this._resizeObserver.unobserve(this.tree.nativeElement);
  }

  private _renderTree(): void {
    this._removeTree();
    this._createTree();
  }

  private _removeTree(): void {
    Array.from(this.tree.nativeElement.children).forEach((child: HTMLElement) => child.remove());
  }

  private _createTree(): void {
    render(this.tree.nativeElement, this.treeMapRecords, {
      padding: [20, 5, 5, 5],
      caption: (node) => `${node.id}: ${node.size.toFixed(3)} ms`,
      showNode: () => true,
    });
  }
}
