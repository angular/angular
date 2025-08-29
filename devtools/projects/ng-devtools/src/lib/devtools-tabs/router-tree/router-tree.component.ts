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
import {ApplicationOperations} from '../../application-operations/index';
import {RouteDetailsRowComponent} from './route-details-row.component';
import {FrameManager} from '../../application-services/frame_manager';
import {Events, MessageBus, Route} from '../../../../../protocol';
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

@Component({
  selector: 'ng-router-tree',
  templateUrl: './router-tree.component.html',
  styleUrls: ['./router-tree.component.scss'],
  imports: [
    TreeVisualizerComponent,
    SplitComponent,
    SplitAreaDirective,
    MatIconModule,
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

  protected selectedRoute = signal<RouterTreeD3Node | null>(null);
  protected routeData = computed<RouterTreeNode | undefined>(() => {
    return this.selectedRoute()?.data;
  });

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
    if (data?.isLazy || data?.isRedirect) {
      // todo: replace with UI notification.
      console.warn('Cannot view source for lazy loaded routes or redirecting routes.');
      return;
    }

    this.appOperations.viewSourceFromRouter(className, type, this.frameManager.selectedFrame()!);
  }

  viewComponentSource(component: string): void {
    const data = this.selectedRoute()?.data;
    // Check if the selected route is a lazy loaded route or a redirecting route.
    // These routes have no component associated with them.
    if (data?.isLazy || data?.isRedirect) {
      // todo: replace with UI notification.
      console.warn('Cannot view source for lazy loaded routes or redirecting routes.');
      return;
    }

    this.appOperations.viewSourceFromRouter(
      component,
      'component',
      this.frameManager.selectedFrame()!,
    );
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
      // Since `node-faded` could pre-exist, drop it if the node is a match.
      const classNames = d3Node.attr('class').replace('node-faded', '');
      const nodeClasses = [classNames];

      if (node.data.isActive) {
        nodeClasses.push('node-element');
      } else if (node.data.isLazy) {
        nodeClasses.push('node-lazy');
      } else {
        nodeClasses.push('node-environment');
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
