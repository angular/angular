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
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import {SerializedInjector} from 'protocol';

import {InjectorTreeNode, InjectorTreeVisualizer} from './injector-tree-visualizer';
import {TreeVisualizerHostComponent} from '../tree-visualizer-host/tree-visualizer-host.component';

@Component({
  selector: 'ng-resolution-path',
  imports: [TreeVisualizerHostComponent],
  template: `
    <ng-tree-visualizer-host #tree />
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ResolutionPathComponent implements OnDestroy {
  private tree = viewChild.required<TreeVisualizerHostComponent>('tree');

  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  private injectorTree!: InjectorTreeVisualizer;

  readonly path = input<SerializedInjector[]>([]);
  private readonly pathNode = computed(() => {
    const path = this.path();
    const serializedInjectors = path.slice().reverse();
    const injectorTreeNodes: InjectorTreeNode[] = [];

    // map serialized injectors to injector tree nodes
    for (const serializedInjector of serializedInjectors) {
      injectorTreeNodes.push({injector: serializedInjector, children: []});
    }

    // set injector tree node children
    for (const [index, injectorTreeNode] of injectorTreeNodes.entries()) {
      if (index !== injectorTreeNodes.length - 1) {
        injectorTreeNode.children = [injectorTreeNodes[index + 1]];
      } else {
        injectorTreeNode.children = [];
      }
    }

    return injectorTreeNodes[0];
  });

  constructor() {
    afterNextRender({
      write: () => {
        this.injectorTree = new InjectorTreeVisualizer(
          this.tree().container().nativeElement,
          this.tree().group().nativeElement,
          {
            orientation: this.orientation(),
          },
        );

        if (this.pathNode()) {
          this.injectorTree.render(this.pathNode());
        }

        this.injectorTree.onNodeClick((_, node) => {
          this.injectorTree.snapToNode(node);
        });

        this.injectorTree.snapToRoot(0.7);
      },
    });

    effect(() => {
      this.injectorTree?.render?.(this.pathNode());
    });
  }

  ngOnDestroy(): void {
    if (this.injectorTree) {
      this.injectorTree.cleanup();
    }
  }
}
