/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, inject, input, linkedSignal, signal, viewChild} from '@angular/core';
import {TreeVisualizerComponent} from '../../shared/tree-visualizer/tree-visualizer.component';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {ApplicationOperations} from '../../application-operations/index';
import {RouteDetailsRowComponent} from './route-details-row.component';
import {FrameManager} from '../../application-services/frame_manager';
import {Events, MessageBus, Route, RunGuardsAndResolvers} from '../../../../../protocol';
import {SvgD3Node, TreeVisualizerConfig} from '../../shared/tree-visualizer/tree-visualizer';
import {
  RouterTreeD3Node,
  transformRoutesIntoVisTree,
  RouterTreeNode,
  RouterTreeVisualizer,
} from './router-tree-fns';
import {ButtonComponent} from '../../shared/button/button.component';
import {SplitComponent} from '../../shared/split/split.component';
import {SplitAreaDirective} from '../../shared/split/splitArea.directive';
import {FilterComponent, FilterFn} from '../../shared/filter/filter.component';

const NODE_SNAP_SCALE = 0.6;
const RUN_GUARDS_AND_RESOLVERS_OPTIONS: RunGuardsAndResolvers[] = [
  'pathParamsChange',
  'pathParamsOrQueryParamsChange',
  'always',
  'paramsChange',
  'paramsOrQueryParamsChange',
];

@Component({
  selector: 'ng-router-tree',
  templateUrl: './router-tree.component.html',
  styleUrls: ['./router-tree.component.scss'],
  imports: [
    TreeVisualizerComponent,
    SplitComponent,
    SplitAreaDirective,
    MatIconModule,
    MatSnackBarModule,
    RouteDetailsRowComponent,
    ButtonComponent,
    FilterComponent,
  ],
})
export class RouterTreeComponent {
  private readonly filter = viewChild.required<FilterComponent>('filter');
  private readonly routerTree = viewChild.required<RouterTreeVisualizer>('routerTree');

  private readonly messageBus = inject(MessageBus) as MessageBus<Events>;
  private readonly appOperations = inject(ApplicationOperations);
  private readonly frameManager = inject(FrameManager);
  private readonly snackBar = inject(MatSnackBar);

  protected selectedRoute = signal<RouterTreeD3Node | null>(null);
  protected routeData = computed<RouterTreeNode | undefined>(() => {
    return this.selectedRoute()?.data;
  });

  protected hasStaticOptionRunGuardsAndResolvers = computed(() =>
    RUN_GUARDS_AND_RESOLVERS_OPTIONS.includes(
      this.routeData()?.runGuardsAndResolvers as RunGuardsAndResolvers,
    ),
  );

  protected readonly currentSearchMatchIdx = signal<number>(-1);
  protected readonly searchMatches = signal<RouterTreeNode[]>([]);

  routes = input.required<Route[]>();
  routerDebugApiSupport = input<boolean>(false);

  private readonly showFullPath = signal(false);
  protected readonly d3RootNode = linkedSignal<RouterTreeNode | null>(() => {
    const routes = this.routes();
    if (routes.length) {
      return transformRoutesIntoVisTree(routes[0], this.showFullPath());
    }
    return null;
  });

  protected readonly routerTreeConfig: Partial<TreeVisualizerConfig<RouterTreeNode>> = {
    nodeSeparation: () => 1,
    d3NodeModifier: (n) => this.d3NodeModifier(n),
  };

  togglePathSettings(): void {
    this.filter().clearFilter();
    this.showFullPath.update((v) => !v);
  }

  viewSourceFromRouter(className: string, type: string): void {
    const data = this.selectedRoute()?.data;
    // Check if the selected route is a lazy loaded route or a redirecting route.
    // These routes have no component associated with them.
    if (data?.isLazy || data?.redirectTo) {
      const message = 'Cannot view source for lazy loaded routes or redirecting routes.';
      this.snackBar.open(message, 'Dismiss', {duration: 5000, horizontalPosition: 'left'});
      return;
    }

    if (className === '[Function]') {
      const message = 'Cannot view the source of functions defined inline (arrow or anonymous).';
      this.snackBar.open(message, 'Dismiss', {duration: 5000, horizontalPosition: 'left'});
      return;
    }

    this.appOperations.viewSourceFromRouter(className, type, this.frameManager.selectedFrame()!);
  }

  viewComponentSource(component: string): void {
    const data = this.selectedRoute()?.data;
    // Check if the selected route is a lazy loaded route or a redirecting route.
    // These routes have no component associated with them.
    if (data?.isLazy || data?.redirectTo) {
      const message = 'Cannot view source for lazy loaded routes or redirecting routes.';
      this.snackBar.open(message, 'Dismiss', {duration: 5000, horizontalPosition: 'left'});
      return;
    }

    this.appOperations.viewSourceFromRouter(
      component,
      'component',
      this.frameManager.selectedFrame()!,
    );
  }

  viewFunctionSource(
    functionName: string,
    type: 'title' | 'redirectTo' | 'matcher' | 'runGuardsAndResolvers',
  ): void {
    if (functionName === '[Function]') {
      const message =
        'Cannot view the source of redirect functions defined inline (arrow or anonymous).';
      this.snackBar.open(message, 'Dismiss', {duration: 5000, horizontalPosition: 'left'});
      return;
    }

    this.appOperations.viewSourceFromRouter(functionName, type, this.frameManager.selectedFrame()!);
  }

  navigateRoute(route: any): void {
    this.messageBus.emit('navigateRoute', [route.data.path]);
  }

  onRouterTreeRender({initial}: {initial: boolean}) {
    if (initial) {
      this.routerTree().snapToRoot(NODE_SNAP_SCALE);
    }
  }

  nodeClick(node: RouterTreeD3Node) {
    this.selectedRoute.set(node);
    this.routerTree().snapToNode(node.data, 0.7);
  }

  navigateMatchedRoute(dir: 'prev' | 'next') {
    const dirIdx = dir === 'next' ? 1 : -1;
    const matches = Array.from(this.searchMatches());

    const newMatchedIdx = (this.currentSearchMatchIdx() + dirIdx + matches.length) % matches.length;
    const newMatchedNode = matches[newMatchedIdx];

    this.routerTree().snapToNode(newMatchedNode, NODE_SNAP_SCALE);
    this.routerTree().highlightNode(newMatchedNode);
    this.currentSearchMatchIdx.set(newMatchedIdx);
  }

  handleFilter(filterFn: FilterFn): void {
    this.currentSearchMatchIdx.set(-1);
    this.searchMatches.set([]);
    const d3RootNode = this.d3RootNode();

    if (!d3RootNode) {
      return;
    }
    const matches: RouterTreeNode[] = [];
    const traverse = (node: RouterTreeNode) => {
      if (filterFn(node.label.toLowerCase()).length) {
        matches.push(node);
      }

      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };
    traverse(d3RootNode);

    this.searchMatches.update((curr) => curr.concat(matches));

    // Select the first match, if there are any.
    if (this.searchMatches().length) {
      this.navigateMatchedRoute('next');
    } else {
      this.routerTree().highlightNode(null);
    }
  }

  private d3NodeModifier(d3Node: SvgD3Node<RouterTreeNode>) {
    d3Node.attr('class', (node: RouterTreeD3Node) => {
      // Drop all class labels and recompute them.
      const classesToRemove = new Set([
        'node-faded',
        'node-element',
        'node-lazy',
        'node-search',
        'node-environment',
      ]);

      const nodeClasses = d3Node
        .attr('class')
        .split(' ')
        .filter((cls) => !classesToRemove.has(cls));

      if (node.data.isActive) {
        nodeClasses.push('node-element');
      }

      return nodeClasses.join(' ');
    });
  }
}
