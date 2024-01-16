/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {SerializedInjector} from 'protocol';

import {InjectorTreeNode, InjectorTreeVisualizer} from './injector-tree-visualizer';

@Component({
  selector: 'ng-resolution-path',
  template: `
    <section class="injector-graph">
      <svg #svgContainer>
        <g #mainGroup></g>
      </svg>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  standalone: true,
})
export class ResolutionPathComponent implements OnDestroy, AfterViewInit {
  @ViewChild('svgContainer', {static: true}) private svgContainer!: ElementRef;
  @ViewChild('mainGroup', {static: true}) private g!: ElementRef;

  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  private injectorTree!: InjectorTreeVisualizer;
  private pathNode!: InjectorTreeNode;

  @Input()
  set path(path: SerializedInjector[]) {
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

    this.pathNode = injectorTreeNodes[0];
    this.injectorTree?.render?.(this.pathNode);
  }

  ngOnInit(): void {
    this.injectorTree = new InjectorTreeVisualizer(
      this.svgContainer.nativeElement,
      this.g.nativeElement,
      {
        orientation: this.orientation,
      },
    );

    if (this.pathNode) {
      this.injectorTree.render(this.pathNode);
    }

    this.injectorTree.onNodeClick((_, node) => {
      this.injectorTree.snapToNode(node);
    });
  }

  ngAfterViewInit(): void {
    this.injectorTree.snapToRoot(0.7);
  }

  ngOnDestroy(): void {
    if (this.injectorTree) {
      this.injectorTree.cleanup();
    }
  }
}
