/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {afterNextRender, Component, effect, ElementRef, input, viewChild} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {Route} from 'protocol';
import {RouterTreeVisualizer} from './router-tree-visualizer';
import {MatCheckboxModule} from '@angular/material/checkbox';

const DEFAULT_FILTER = /.^/;
@Component({
  selector: 'ng-router-tree',
  templateUrl: './router-tree.component.html',
  styleUrls: ['./router-tree.component.scss'],
  imports: [CommonModule, MatInputModule, MatCheckboxModule],
  standalone: true,
})
export class RouterTreeComponent {
  private routerTreeSvgContainerRef = viewChild<ElementRef>('routerTreeSvgContainer');
  private routerTreeMainGroupRef = viewChild<ElementRef>('routerTreeMainGroup');
  private filterRegex = new RegExp(DEFAULT_FILTER);
  private routerTreeVisualizer!: RouterTreeVisualizer;
  private showFullPath = false;

  routes = input<Route[]>([]);
  snapToRoot = input(false);

  constructor() {
    effect(() => {
      this.renderGraph(this.routes());
    });

    effect(() => {
      if (this.snapToRoot()) {
        this.routerTreeVisualizer.snapToRoot(0.6);
      }
    });

    afterNextRender(() => {
      this.setUpRouterVisualizer();
    });
  }

  togglePathSettings(): void {
    this.showFullPath = !this.showFullPath;
    this.renderGraph(this.routes());
  }

  setUpRouterVisualizer(): void {
    if (
      !this.routerTreeSvgContainerRef()?.nativeElement ||
      !this.routerTreeMainGroupRef()?.nativeElement
    ) {
      return;
    }

    this.routerTreeVisualizer?.cleanup?.();
    this.routerTreeVisualizer = new RouterTreeVisualizer(
      this.routerTreeSvgContainerRef()?.nativeElement,
      this.routerTreeMainGroupRef()?.nativeElement,
      {nodeSeparation: () => 1},
    );
  }

  searchRoutes($event: InputEvent) {
    this.filterRegex = new RegExp(
      ($event?.target as HTMLInputElement)?.value?.toLowerCase() || DEFAULT_FILTER,
    );
    this.renderGraph(this.routes());
  }

  renderGraph(routes: Route[]): void {
    this.routerTreeVisualizer?.render(routes[0], this.filterRegex, this.showFullPath);
  }
}
