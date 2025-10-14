/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentRef, EnvironmentInjector } from '@angular/core';
import type { RouterOutletContract } from './directives/router_outlet';
import { ActivatedRoute } from './router_state';
/**
 * Store contextual information about a `RouterOutlet`
 *
 * @publicApi
 */
export declare class OutletContext {
    private readonly rootInjector;
    outlet: RouterOutletContract | null;
    route: ActivatedRoute | null;
    children: ChildrenOutletContexts;
    attachRef: ComponentRef<any> | null;
    get injector(): EnvironmentInjector;
    constructor(rootInjector: EnvironmentInjector);
}
/**
 * Store contextual information about the children (= nested) `RouterOutlet`
 *
 * @publicApi
 */
export declare class ChildrenOutletContexts {
    private rootInjector;
    private contexts;
    /** @docs-private */
    constructor(rootInjector: EnvironmentInjector);
    /** Called when a `RouterOutlet` directive is instantiated */
    onChildOutletCreated(childName: string, outlet: RouterOutletContract): void;
    /**
     * Called when a `RouterOutlet` directive is destroyed.
     * We need to keep the context as the outlet could be destroyed inside a NgIf and might be
     * re-created later.
     */
    onChildOutletDestroyed(childName: string): void;
    /**
     * Called when the corresponding route is deactivated during navigation.
     * Because the component get destroyed, all children outlet are destroyed.
     */
    onOutletDeactivated(): Map<string, OutletContext>;
    onOutletReAttached(contexts: Map<string, OutletContext>): void;
    getOrCreateContext(childName: string): OutletContext;
    getContext(childName: string): OutletContext | null;
}
