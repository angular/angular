/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {Events, MessageBus, Route} from 'protocol';
import {RouterTreeVisualizer} from './router-tree-visualizer';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'ng-router-tree',
  templateUrl: './router-tree.component.html',
  styleUrls: ['./router-tree.component.scss'],
  imports: [CommonModule, MatInputModule, MatCheckboxModule],
  standalone: true,
})
export class RouterTreeComponent implements AfterViewInit {
  @ViewChild('routerTreeSvgContainer', {static: false})
  private routerTreeSvgContainerRef!: ElementRef;
  @ViewChild('routerTreeMainGroup', {static: false}) private routerTreeMainGroupRef!: ElementRef;

  @Input()
  set routes(routes: Route[]) {
    this._routes = routes;
    this.renderGraph();
  }

  private _routes: Route[] = [];
  private filterRegex = new RegExp('.^');
  private routerTreeVisualizer!: RouterTreeVisualizer;
  private showFullPath = false;

  constructor() {
    effect(() => {
      // this.render();
    });
  }

  ngAfterViewInit(): void {
    this.setUpRouterVisualizer();
    // this._messageBus.emit('getRoutes');
  }

  togglePathSettings(): void {
    this.showFullPath = !this.showFullPath;
    this.renderGraph(false);
  }

  setUpRouterVisualizer(): void {
    if (
      !this.routerTreeSvgContainerRef?.nativeElement ||
      !this.routerTreeMainGroupRef?.nativeElement
    ) {
      return;
    }

    this.routerTreeVisualizer?.cleanup?.();
    this.routerTreeVisualizer = new RouterTreeVisualizer(
      this.routerTreeSvgContainerRef.nativeElement,
      this.routerTreeMainGroupRef.nativeElement,
      {nodeSeparation: () => 1},
    );
  }

  searchRoutes($event: InputEvent) {
    this.filterRegex = new RegExp(
      ($event?.target as HTMLInputElement)?.value?.toLowerCase() || '.^',
    );
    this.renderGraph(false);
  }

  renderGraph(snapToRoot: boolean = true): void {
    this.routerTreeVisualizer?.render(this._routes[0] as any, this.filterRegex, this.showFullPath);
    if (snapToRoot) {
      setTimeout(() => this.routerTreeVisualizer.snapToRoot(0.6), 250);
    }
  }
}
