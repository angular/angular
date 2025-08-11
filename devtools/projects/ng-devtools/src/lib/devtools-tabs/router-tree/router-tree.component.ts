/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {TreeVisualizerHostComponent} from '../../shared/tree-visualizer-host/tree-visualizer-host.component';
import {MatIconModule} from '@angular/material/icon';
import {ApplicationOperations} from '../../application-operations/index';
import {RouteDetailsRowComponent} from './route-details-row.component';
import {FrameManager} from '../../application-services/frame_manager';
import {Events, MessageBus, Route} from '../../../../../protocol';
import {SvgD3Node, TreeVisualizer} from '../../shared/tree-visualizer-host/tree-visualizer';
import {
  RouterTreeVisualizer,
  RouterTreeD3Node,
  transformRoutesIntoVisTree,
  RouterTreeNode,
  findNodesByLabel,
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
    TreeVisualizerHostComponent,
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
  private readonly routerTree = viewChild.required<TreeVisualizerHostComponent>('routerTree');
  private routerTreeVisualizer!: RouterTreeVisualizer;

  private readonly messageBus = inject(MessageBus) as MessageBus<Events>;
  private readonly appOperations = inject(ApplicationOperations);
  private readonly frameManager = inject(FrameManager);

  protected selectedRoute = signal<RouterTreeD3Node | null>(null);
  protected routeData = computed<RouterTreeNode | undefined>(() => {
    return this.selectedRoute()?.data;
  });

  routerDebugApiSupport = input<boolean>(false);
  routes = input<Route[]>([]);
  snapToRoot = input(false);

  private readonly showFullPath = signal(false);
  private readonly visualizerReady = signal<boolean>(false);
  private readonly d3RootNode = computed(() => {
    return transformRoutesIntoVisTree(this.routes()[0], this.showFullPath());
  });

  private searchMatches: Set<RouterTreeNode> = new Set();

  private readonly searchDebouncer = new Debouncer();

  protected readonly searchRoutes = this.searchDebouncer.debounce((inputValue: string) => {
    this.searchMatches = findNodesByLabel(this.d3RootNode(), inputValue.toLowerCase());
    this.renderGraph(this.d3RootNode());
  }, SEARCH_DEBOUNCE);

  constructor() {
    effect(() => {
      if (this.visualizerReady()) {
        this.renderGraph(this.d3RootNode());
      }
    });

    effect(() => {
      if (this.visualizerReady() && this.snapToRoot()) {
        this.routerTreeVisualizer.snapToRoot(0.6);
      }
    });

    afterNextRender({
      write: () => {
        if (this.routerDebugApiSupport()) {
          this.setUpRouterVisualizer();
        }
      },
    });

    inject(DestroyRef).onDestroy(() => {
      this.routerTreeVisualizer?.dispose?.();
      this.searchDebouncer?.cancel?.();
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

  private renderGraph(root: RouterTreeNode): void {
    this.routerTreeVisualizer?.render(root);
    this.routerTreeVisualizer?.onNodeClick((_, node) => {
      this.selectedRoute.set(node);
      setTimeout(() => {
        this.routerTreeVisualizer?.snapToNode(node, 0.7);
      });
    });
  }

  private setUpRouterVisualizer(): void {
    const container = this.routerTree().container().nativeElement;
    const group = this.routerTree().group().nativeElement;

    this.routerTreeVisualizer?.cleanup?.();
    this.routerTreeVisualizer = new TreeVisualizer(container, group, {
      nodeSeparation: () => 1,
      d3NodeModifier: (n) => this.d3NodeModifier(n),
    });

    this.visualizerReady.set(true);
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
