/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  viewChild,
} from '@angular/core';
import {ProfilerFrame} from '../../../../../../../../protocol';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

import {render} from '../../../../../vendor/webtreemap/treemap';
import {TreeMapFormatter, TreeMapNode} from '../../record-formatter/tree-map-formatter';

@Component({
  selector: 'ng-tree-map-visualizer',
  templateUrl: './tree-map-visualizer.component.html',
  styleUrls: ['./tree-map-visualizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeMapVisualizerComponent implements OnDestroy {
  private _formatter = new TreeMapFormatter();

  readonly frame = input.required<ProfilerFrame>();

  private _ngZone = inject(NgZone);

  private resize$ = new Subject<void>();
  private _throttledResizeSubscription!: Subscription;

  private _resizeObserver: ResizeObserver = new ResizeObserver(() =>
    this._ngZone.run(() => this.resize$.next()),
  );
  private readonly treeMapRecords = computed<TreeMapNode>(() => {
    // first element in data is the Application node
    return this._formatter.formatFrame(this.frame());
  });

  readonly tree = viewChild.required<ElementRef<HTMLElement>>('webTree');

  constructor() {
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

  ngOnDestroy(): void {
    this._throttledResizeSubscription.unsubscribe();
    this._resizeObserver.unobserve(this.tree().nativeElement);
  }

  private _renderTree(): void {
    this._removeTree();
    this._createTree();
  }

  private _removeTree(): void {
    Array.from(this.tree().nativeElement.children).forEach((child) => child.remove());
  }

  private _createTree(): void {
    render(this.tree().nativeElement, this.treeMapRecords(), {
      padding: [20, 5, 5, 5],
      caption: (node) => `${node.id}: ${node.size.toFixed(3)} ms`,
      showNode: () => true,
    });
  }
}
