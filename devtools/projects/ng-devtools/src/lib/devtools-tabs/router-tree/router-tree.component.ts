/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {Events, MessageBus, Route} from 'protocol';
import {RouterTreeVisualizer} from './router-tree-visualizer';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {SplitAreaDirective, SplitComponent} from '../../vendor/angular-split/public_api';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {ApplicationOperations} from '../../application-operations/index';
import {RouteDetailsRowComponent} from './route-details-row.component';

const DEFAULT_FILTER = /.^/;
@Component({
  selector: 'ng-router-tree',
  templateUrl: './router-tree.component.html',
  styleUrls: ['./router-tree.component.scss'],
  imports: [
    CommonModule,
    MatInputModule,
    MatCheckboxModule,
    SplitComponent,
    SplitAreaDirective,
    MatIconModule,
    MatButtonModule,
    RouteDetailsRowComponent,
  ],
  standalone: true,
})
export class RouterTreeComponent {
  private routerTreeSvgContainerRef = viewChild<ElementRef>('routerTreeSvgContainer');
  private routerTreeMainGroupRef = viewChild<ElementRef>('routerTreeMainGroup');
  private filterRegex = new RegExp(DEFAULT_FILTER);
  private routerTreeVisualizer!: RouterTreeVisualizer;
  private showFullPath = false;

  private readonly _messageBus = inject(MessageBus) as MessageBus<Events>;
  private readonly _appOperations = inject(ApplicationOperations);

  selectedRoute = signal<Route | null>(null);

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
    this.routerTreeVisualizer?.onNodeClick((_, node) => {
      this.selectedRoute.set(node);
    });
  }

  viewSourceFromRouter(g: string, type: string): void {
    this._appOperations.viewSourceFromRouter(g, type);
  }

  viewComponentSource(c: string): void {
    this._appOperations.viewSourceFromRouter(c, 'component');
  }

  navigateRoute(route: any): void {
    this._messageBus.emit('navigateRoute', [route.data.path]);
  }
}
