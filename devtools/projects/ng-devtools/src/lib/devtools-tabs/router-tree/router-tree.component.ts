/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import {TreeVisualizerComponent} from '../../shared/tree-visualizer/tree-visualizer.component';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {ApplicationOperations} from '../../application-operations/index';
import {RouteDetailsRowComponent} from './router-details-row/route-details-row.component';
import {FrameManager} from '../../application-services/frame_manager';
import {Events, MessageBus, Route, RunGuardsAndResolvers} from '../../../../../protocol';
import {SvgD3Node, TreeVisualizerConfig} from '../../shared/tree-visualizer/tree-visualizer';
import {
  RouterTreeD3Node,
  transformRoutesIntoVisTree,
  RouterTreeNode,
  findNodesByLabel,
  RouterTreeVisualizer,
} from './router-tree-fns';
import {ButtonComponent} from '../../shared/button/button.component';
import {SplitComponent} from '../../shared/split/split.component';
import {SplitAreaDirective} from '../../shared/split/splitArea.directive';
import {Debouncer} from '../../shared/utils/debouncer';

const SEARCH_DEBOUNCE = 250;
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterTreeComponent {
  private readonly searchInput = viewChild.required<ElementRef>('searchInput');
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

  private searchMatches: Set<RouterTreeNode> = new Set();

  private readonly searchDebouncer = new Debouncer();

  protected readonly searchRoutes = this.searchDebouncer.debounce((inputValue: string) => {
    const d3RootNode = this.d3RootNode();
    if (!d3RootNode) {
      return;
    }
    this.searchMatches = findNodesByLabel(d3RootNode, inputValue.toLowerCase());
    // Since `searchMatches` is used in the D3 node modifier, reset the root to trigger a re-render.
    // Consider: Ideally, we could perform the search visual changes via direct DOM manipulations
    // that won't require re-rendering the whole tree.
    this.d3RootNode.set({...d3RootNode});
  }, SEARCH_DEBOUNCE);

  protected readonly routerTreeConfig: Partial<TreeVisualizerConfig<RouterTreeNode>> = {
    nodeSeparation: () => 1,
    d3NodeModifier: (n) => this.d3NodeModifier(n),
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.searchDebouncer.cancel();
    });
  }

  togglePathSettings(): void {
    this.searchInput().nativeElement.value = '';
    this.searchMatches = new Set();
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
      this.routerTree().snapToRoot(0.6);
    }
  }

  nodeClick(node: RouterTreeD3Node) {
    this.selectedRoute.set(node);
    this.routerTree().snapToNode(node.data, 0.7);
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

      if (this.searchMatches.has(node.data)) {
        nodeClasses.push('node-search');
      } else if (this.searchMatches.size) {
        nodeClasses.push('node-faded');
      }

      return nodeClasses.join(' ');
    });
  }
}
