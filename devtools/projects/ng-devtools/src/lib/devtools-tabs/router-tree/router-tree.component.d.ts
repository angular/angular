/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Route } from '../../../../../protocol';
import { TreeVisualizerConfig } from '../../shared/tree-visualizer/tree-visualizer';
import { RouterTreeD3Node, RouterTreeNode } from './router-tree-fns';
export declare class RouterTreeComponent {
    private readonly searchInput;
    private readonly routerTree;
    private readonly messageBus;
    private readonly appOperations;
    private readonly frameManager;
    protected selectedRoute: import("@angular/core").WritableSignal<RouterTreeD3Node | null>;
    protected routeData: import("@angular/core").Signal<RouterTreeNode | undefined>;
    routes: import("@angular/core").InputSignal<Route[]>;
    routerDebugApiSupport: import("@angular/core").InputSignal<boolean>;
    private readonly showFullPath;
    protected readonly d3RootNode: import("@angular/core").WritableSignal<RouterTreeNode | null>;
    private searchMatches;
    private readonly searchDebouncer;
    protected readonly searchRoutes: (inputValue: string) => void;
    protected readonly routerTreeConfig: Partial<TreeVisualizerConfig<RouterTreeNode>>;
    constructor();
    togglePathSettings(): void;
    viewSourceFromRouter(className: string, type: string): void;
    viewComponentSource(component: string): void;
    navigateRoute(route: any): void;
    onRouterTreeRender({ initial }: {
        initial: boolean;
    }): void;
    nodeClick(node: RouterTreeD3Node): void;
    private d3NodeModifier;
    private d3LinkModifier;
}
