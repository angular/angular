/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {afterRender, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {D3GraphRenderer, InjectorTreeNode, InjectorTreeVisualizer} from './injector-tree-visualizer';

@Component({
  selector: 'ng-resolution-path',
  template: `
      <section>
        <svg #svgContainer class="svg-container">
            <g #mainGroup></g>
        </svg>
      </section>
    `,
  styles: [`:host { display: block; }`],
  standalone: true
})
export class ResolutionPathComponent implements OnDestroy {
  @ViewChild('svgContainer', {static: true}) private svgContainer: ElementRef;
  @ViewChild('mainGroup', {static: true}) private g: ElementRef;

  @Input() orientation: 'horizontal'|'vertical' = 'horizontal';

  private injectorTree: InjectorTreeVisualizer;
  private pathNode: InjectorTreeNode;

  @Input()
  set path(path: InjectorTreeNode[]) {
    path = path.slice().reverse();

    let injectorIndex = 0;
    for (const injector of path) {
      if (injectorIndex !== path.length - 1) {
        injector.children = [path[injectorIndex + 1]];
      } else {
        injector.children = [];
      }
      injectorIndex++;
    }

    this.pathNode = path[0];
  }

  constructor() {
    afterRender(() => {
      this.injectorTree = new InjectorTreeVisualizer(new D3GraphRenderer(
          this.svgContainer.nativeElement, this.g.nativeElement, this.orientation,
          this.orientation === 'horizontal' ? [75, 200] : [20, 75]));

      this.injectorTree.render([this.pathNode]);
    });
  }

  ngOnDestroy(): void {
    if (this.injectorTree) {
      this.injectorTree.cleanup();
    }
  }
}
