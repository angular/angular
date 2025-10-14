/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
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
import {MessageBus} from '../../../../../protocol';
import {transformRoutesIntoVisTree, findNodesByLabel} from './router-tree-fns';
import {ButtonComponent} from '../../shared/button/button.component';
import {SplitComponent} from '../../shared/split/split.component';
import {SplitAreaDirective} from '../../shared/split/splitArea.directive';
import {Debouncer} from '../../shared/utils/debouncer';
const SEARCH_DEBOUNCE = 250;
let RouterTreeComponent = class RouterTreeComponent {
  constructor() {
    this.searchInput = viewChild.required('searchInput');
    this.routerTree = viewChild.required('routerTree');
    this.messageBus = inject(MessageBus);
    this.appOperations = inject(ApplicationOperations);
    this.frameManager = inject(FrameManager);
    this.selectedRoute = signal(null);
    this.routeData = computed(() => {
      return this.selectedRoute()?.data;
    });
    this.routes = input.required();
    this.routerDebugApiSupport = input(false);
    this.showFullPath = signal(false);
    this.d3RootNode = linkedSignal(() => {
      const routes = this.routes();
      if (routes.length) {
        return transformRoutesIntoVisTree(routes[0], this.showFullPath());
      }
      return null;
    });
    this.searchMatches = new Set();
    this.searchDebouncer = new Debouncer();
    this.searchRoutes = this.searchDebouncer.debounce((inputValue) => {
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
    this.routerTreeConfig = {
      nodeSeparation: () => 1,
      d3NodeModifier: (n) => this.d3NodeModifier(n),
      d3LinkModifier: (l) => this.d3LinkModifier(l),
    };
    inject(DestroyRef).onDestroy(() => {
      this.searchDebouncer.cancel();
    });
  }
  togglePathSettings() {
    this.searchInput().nativeElement.value = '';
    this.searchMatches = new Set();
    this.showFullPath.update((v) => !v);
  }
  viewSourceFromRouter(className, type) {
    const data = this.selectedRoute()?.data;
    // Check if the selected route is a lazy loaded route or a redirecting route.
    // These routes have no component associated with them.
    if (data?.isLazy || data?.isRedirect) {
      // todo: replace with UI notification.
      console.warn('Cannot view source for lazy loaded routes or redirecting routes.');
      return;
    }
    this.appOperations.viewSourceFromRouter(className, type, this.frameManager.selectedFrame());
  }
  viewComponentSource(component) {
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
      this.frameManager.selectedFrame(),
    );
  }
  navigateRoute(route) {
    this.messageBus.emit('navigateRoute', [route.data.path]);
  }
  onRouterTreeRender({initial}) {
    if (initial) {
      this.routerTree().snapToRoot(0.6);
    }
  }
  nodeClick(node) {
    this.selectedRoute.set(node);
    this.routerTree().snapToNode(node.data, 0.7);
  }
  d3NodeModifier(d3Node) {
    d3Node.attr('class', (node) => {
      // Since `node-faded` could pre-exist, drop it if the node is a match.
      const classNames = d3Node.attr('class').replace('node-faded', '');
      const nodeClasses = [classNames];
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
  d3LinkModifier(d3Link) {
    d3Link.attr('stroke-dasharray', (node) => {
      // Make edges to lazy loaded routes dashed
      return node.data.isLazy ? '5,5' : 'none';
    });
  }
};
RouterTreeComponent = __decorate(
  [
    Component({
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
    }),
  ],
  RouterTreeComponent,
);
export {RouterTreeComponent};
//# sourceMappingURL=router-tree.component.js.map
