/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import {ProfilerFrame} from '../../../../../../../../protocol';
import {Subject, Subscription, debounceTime} from 'rxjs';

import {render} from 'webtreemap/build/treemap';
import {TreeMapFormatter, TreeMapNode} from '../../record-formatter/tree-map-formatter';

@Component({
  selector: 'ng-tree-map-visualizer',
  templateUrl: './tree-map-visualizer.component.html',
  styleUrls: ['./tree-map-visualizer.component.scss'],
})
export class TreeMapVisualizerComponent implements OnDestroy {
  private formatter = new TreeMapFormatter();

  readonly frame = input.required<ProfilerFrame>();

  private resize$ = new Subject<void>();
  private throttledResizeSubscription!: Subscription;

  private resizeObserver: ResizeObserver = new ResizeObserver(() => this.resize$.next());
  private readonly treeMapRecords = computed<TreeMapNode>(() => {
    // first element in data is the Application node
    return this.formatter.formatFrame(this.frame());
  });

  readonly tree = viewChild.required<ElementRef<HTMLElement>>('webTree');

  constructor() {
    effect(() => {
      if (this.tree()) this.renderTree();
    });

    afterNextRender({
      read: () => {
        this.throttledResizeSubscription = this.resize$
          .pipe(debounceTime(100))
          .subscribe(() => this.renderTree());
        this.resizeObserver.observe(this.tree().nativeElement);
      },
    });
  }

  ngOnDestroy(): void {
    this.throttledResizeSubscription.unsubscribe();
    this.resizeObserver.unobserve(this.tree().nativeElement);
  }

  private renderTree(): void {
    this.removeTree();
    this.createTree();
  }

  private removeTree(): void {
    Array.from(this.tree().nativeElement.children).forEach((child) => child.remove());
  }

  private createTree(): void {
    render(this.tree().nativeElement, this.treeMapRecords(), {
      padding: [20, 5, 5, 5],
      caption: (node) => `${node.id}: ${node.size.toFixed(1)} ms`,
      showNode: () => true,
    });
  }
}
