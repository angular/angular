/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {render} from 'webtreemap/build/treemap';
import {TreeMapFormatter} from '../../record-formatter/tree-map-formatter';
let TreeMapVisualizerComponent = class TreeMapVisualizerComponent {
  constructor() {
    this._formatter = new TreeMapFormatter();
    this.frame = input.required();
    this.resize$ = new Subject();
    this._resizeObserver = new ResizeObserver(() => this.resize$.next());
    this.treeMapRecords = computed(() => {
      // first element in data is the Application node
      return this._formatter.formatFrame(this.frame());
    });
    this.tree = viewChild.required('webTree');
    effect(() => {
      if (this.tree()) this._renderTree();
    });
    afterNextRender({
      read: () => {
        this._throttledResizeSubscription = this.resize$
          .pipe(debounceTime(100))
          .subscribe(() => this._renderTree());
        this._resizeObserver.observe(this.tree().nativeElement);
      },
    });
  }
  ngOnDestroy() {
    this._throttledResizeSubscription.unsubscribe();
    this._resizeObserver.unobserve(this.tree().nativeElement);
  }
  _renderTree() {
    this._removeTree();
    this._createTree();
  }
  _removeTree() {
    Array.from(this.tree().nativeElement.children).forEach((child) => child.remove());
  }
  _createTree() {
    render(this.tree().nativeElement, this.treeMapRecords(), {
      padding: [20, 5, 5, 5],
      caption: (node) => `${node.id}: ${node.size.toFixed(3)} ms`,
      showNode: () => true,
    });
  }
};
TreeMapVisualizerComponent = __decorate(
  [
    Component({
      selector: 'ng-tree-map-visualizer',
      templateUrl: './tree-map-visualizer.component.html',
      styleUrls: ['./tree-map-visualizer.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  TreeMapVisualizerComponent,
);
export {TreeMapVisualizerComponent};
//# sourceMappingURL=tree-map-visualizer.component.js.map
