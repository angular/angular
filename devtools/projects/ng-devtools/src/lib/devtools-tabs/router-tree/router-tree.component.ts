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
import {MatCheckboxModule} from '@angular/material/checkbox';
import {TreeVisualizerHostComponent} from '../../shared/tree-visualizer-host/tree-visualizer-host.component';
import {SplitAreaDirective, SplitComponent} from '../../vendor/angular-split/public_api';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {ApplicationOperations} from '../../application-operations/index';
import {RouteDetailsRowComponent} from './route-details-row.component';
import {MatTableModule} from '@angular/material/table';
import {FrameManager} from '../../application-services/frame_manager';
import {Events, MessageBus, Route} from '../../../../../protocol';
import {SvgD3Node, TreeVisualizer} from '../../shared/tree-visualizer-host/tree-visualizer';
import {
  RouterTreeVisualizer,
  RouterTreeD3Node,
  transformRoutesIntoVisTree,
  RouterTreeNode,
  getRouteLabel,
} from './router-tree-fns';

const DEFAULT_FILTER = /.^/;

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

  private readonly messageBus = inject(MessageBus) as MessageBus<Events>;
  private readonly appOperations = inject(ApplicationOperations);
  private readonly frameManager = inject(FrameManager);

  protected selectedRoute = signal<RouterTreeD3Node | null>(null);

  routes = input<Route[]>([]);
  snapToRoot = input(false);

  private readonly visualizerReady = signal<boolean>(false);

  constructor() {
    effect(async () => {
      if (this.visualizerReady()) {
        this.renderGraph(this.routes());
      }
    });

    effect(async () => {
      if (this.visualizerReady() && this.snapToRoot()) {
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
    this.routerTreeVisualizer = new TreeVisualizer(container, group, {
      nodeSeparation: () => 1,
      d3NodeModifier: (n) => this.d3NodeModifier(n),
    });

    this.visualizerReady.set(true);
  }

  searchRoutes(event: Event) {
    this.filterRegex = new RegExp(
      (event?.target as HTMLInputElement)?.value?.toLowerCase() || DEFAULT_FILTER,
    );
    this.renderGraph(this.routes());
  }

  renderGraph(routes: Route[]): void {
    const root = transformRoutesIntoVisTree(routes[0], this.showFullPath);
    this.routerTreeVisualizer?.render(root);
    this.routerTreeVisualizer?.onNodeClick((_, node) => {
      this.selectedRoute.set(node);
      setTimeout(() => {
        this.routerTreeVisualizer?.snapToNode(node, 0.7);
      });
    });
  }

  viewSourceFromRouter(className: string, type: string): void {
    this.appOperations.viewSourceFromRouter(className, type, this.frameManager.selectedFrame()!);
  }

  viewComponentSource(component: string): void {
    this.appOperations.viewSourceFromRouter(
      component,
      'component',
      this.frameManager.selectedFrame()!,
    );
  }

  navigateRoute(route: any): void {
    this.messageBus.emit('navigateRoute', [route.data.path]);
  }

  private d3NodeModifier(d3Node: SvgD3Node<RouterTreeNode>) {
    d3Node.attr('class', (node: RouterTreeD3Node) => {
      const name = getRouteLabel(node.data, node.parent?.data, this.showFullPath);
      const isMatched = this.filterRegex.test(name.toLowerCase());

      const nodeClasses = [d3Node.attr('class')];
      if (node.data.isActive) {
        nodeClasses.push('node-element');
      } else if (node.data.isLazy) {
        nodeClasses.push('node-lazy');
      } else {
        nodeClasses.push('node-environment');
      }

      if (isMatched) {
        nodeClasses.push('node-search');
      }
      return nodeClasses.join(' ');
    });
  }
}
