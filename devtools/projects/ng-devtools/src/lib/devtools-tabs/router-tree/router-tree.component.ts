/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {afterNextRender, Component, effect, inject, input, signal, viewChild} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {Events, MessageBus, Route} from 'protocol';
import {RouterTreeVisualizer} from './router-tree-visualizer';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {TreeVisualizerHostComponent} from '../tree-visualizer-host/tree-visualizer-host.component';
import {SplitAreaDirective, SplitComponent} from '../../vendor/angular-split/public_api';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {ApplicationOperations} from '../../application-operations/index';
import {RouteDetailsRowComponent} from './route-details-row.component';
import {MatTableModule} from '@angular/material/table';

const DEFAULT_FILTER = /.^/;

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'ng-router-tree',
  templateUrl: './router-tree.component.html',
  styleUrls: ['./router-tree.component.scss'],
  imports: [
    CommonModule,
    MatInputModule,
    MatCheckboxModule,
    TreeVisualizerHostComponent,
    SplitComponent,
    SplitAreaDirective,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    RouteDetailsRowComponent,
  ],
  standalone: true,
})
export class RouterTreeComponent {
  private routerTree = viewChild.required<TreeVisualizerHostComponent>('routerTree');
  private filterRegex = new RegExp(DEFAULT_FILTER);
  private routerTreeVisualizer!: RouterTreeVisualizer;
  private showFullPath = false;

  private readonly _messageBus = inject(MessageBus) as MessageBus<Events>;
  private readonly _appOperations = inject(ApplicationOperations);

  protected selectedRoute = signal<Route | null>(null);

  routes = input<Route[]>([]);
  snapToRoot = input(false);

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  constructor() {
    effect(() => {
      this.renderGraph(this.routes());
    });

    effect(() => {
      if (this.snapToRoot()) {
        this.routerTreeVisualizer.snapToRoot(0.6);
      }
    });

    afterNextRender({
      write: () => {
        this.setUpRouterVisualizer();
      },
    });
  }

  togglePathSettings(): void {
    this.showFullPath = !this.showFullPath;
    this.renderGraph(this.routes());
  }

  setUpRouterVisualizer(): void {
    const container = this.routerTree().container().nativeElement;
    const group = this.routerTree().group().nativeElement;

    this.routerTreeVisualizer?.cleanup?.();
    this.routerTreeVisualizer = new RouterTreeVisualizer(container, group, {
      nodeSeparation: () => 1,
    });
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

  viewSourceFromRouter(className: string, type: string): void {
    this._appOperations.viewSourceFromRouter(className, type);
  }

  viewComponentSource(component: string): void {
    this._appOperations.viewSourceFromRouter(component, 'component');
  }

  navigateRoute(route: any): void {
    this._messageBus.emit('navigateRoute', [route.data.path]);
  }
}
