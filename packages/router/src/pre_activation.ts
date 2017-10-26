/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {from} from 'rxjs/observable/from';
import {of } from 'rxjs/observable/of';
import {concatMap} from 'rxjs/operator/concatMap';
import {every} from 'rxjs/operator/every';
import {first} from 'rxjs/operator/first';
import {last} from 'rxjs/operator/last';
import {map} from 'rxjs/operator/map';
import {mergeMap} from 'rxjs/operator/mergeMap';
import {reduce} from 'rxjs/operator/reduce';

import {LoadedRouterConfig, ResolveData, RunGuardsAndResolvers, Route} from './config';
import {ActivationStart, ChildActivationStart, Event} from './events';
import {ChildrenOutletContexts, OutletContext} from './router_outlet_context';
import {
  ActivatedRouteSnapshot, RouterStateSnapshot, equalParamsAndUrlSegments, inheritedParamsDataResolve,
  RouteSnapshot, getConfig, createRouterStateSnapshot, inheritedResolve
} from './router_state';
import {andObservables, forEach, shallowEqual, wrapIntoObservable} from './utils/collection';
import {
  TreeNode, nodeChildrenAsMap, Tree, pathFromRoot, getPath, getNodeFromPath,
  cloneTree
} from './utils/tree';

class CanActivate {
  constructor(public path: RouteSnapshot[]) {}
  get route(): RouteSnapshot { return this.path[this.path.length - 1]; }
}

class CanDeactivate {
  constructor(public component: Object|null, public route: RouteSnapshot) {}
}

/**
 * This class bundles the actions involved in preactivation of a route.
 */
export class PreActivation {
  private canActivateChecks: CanActivate[] = [];
  private canDeactivateChecks: CanDeactivate[] = [];

  constructor(
      private futureRoot: TreeNode<RouteSnapshot>, private currRoot: TreeNode<RouteSnapshot>,
      private legacySnapshots: {
        curr: RouterStateSnapshot,
        future: RouterStateSnapshot
      }, private routes: Route[], private moduleInjector: Injector, private forwardEvent?: (evt: Event) => void) {}

  // TODO (jasonaden): Get rid of initialize if we can. Do in constructor.
  initialize(parentContexts: ChildrenOutletContexts): void {
    this.setupChildRouteGuards(this.futureRoot, this.currRoot, parentContexts, [this.futureRoot.value]);
  }

  checkGuards(): Observable<boolean> {
    if (!this.isDeactivating() && !this.isActivating()) {
      return of (true);
    }
    const canDeactivate$ = this.runCanDeactivateChecks();
    return mergeMap.call(
        canDeactivate$,
        (canDeactivate: boolean) => canDeactivate ? this.runCanActivateChecks() : of (false));
  }

  resolveData(): Observable<TreeNode<RouteSnapshot>> {
    // TODO: cloning doesn't work as === check is busted
    // implement tree.map instead of cloning
    const clonedRoot = cloneTree(this.futureRoot, v => ({...v, data: {...v.data}}));
    if (!this.isActivating()) return of (clonedRoot);

    const checks$ = from(this.canActivateChecks);
    const runningChecks$ =
        concatMap.call(checks$, (check: CanActivate) => this.runResolve(clonedRoot, check.route));
    return map.call(reduce.call(runningChecks$, (_: any, __: any) => _), () => clonedRoot);
  }

  isDeactivating(): boolean { return this.canDeactivateChecks.length !== 0; }

  isActivating(): boolean { return this.canActivateChecks.length !== 0; }


  /**
   * Iterates over child routes and calls recursive `setupRouteGuards` to get `this` instance in
   * proper state to run `checkGuards()` method.
   */
  private setupChildRouteGuards(
      futureNode: TreeNode<RouteSnapshot>, currNode: TreeNode<RouteSnapshot>|null,
      contexts: ChildrenOutletContexts|null, futurePath: RouteSnapshot[]): void {
    const prevChildren = nodeChildrenAsMap(currNode);

    // Process the children of the future route
    futureNode.children.forEach(c => {
      this.setupRouteGuards(
          c, prevChildren[c.value.outlet], contexts, futurePath.concat([c.value]));
      delete prevChildren[c.value.outlet];
    });

    // Process any children left from the current route (not active for the future route)
    forEach(
        prevChildren, (v: TreeNode<RouteSnapshot>, k: string) =>
                          this.deactivateRouteAndItsChildren(v, contexts !.getContext(k)));
  }

  /**
   * Iterates over child routes and calls recursive `setupRouteGuards` to get `this` instance in
   * proper state to run `checkGuards()` method.
   */
  private setupRouteGuards(
      futureNode: TreeNode<RouteSnapshot>, currNode: TreeNode<RouteSnapshot>,
      parentContexts: ChildrenOutletContexts|null, futurePath: RouteSnapshot[]): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;
    const context = parentContexts ? parentContexts.getContext(futureNode.value.outlet) : null;
    const currConfig = curr && getConfig(curr.configPath, this.routes);
    const futureConfig = getConfig(future.configPath, this.routes)

    // reusing the node
    if (curr && futureConfig === currConfig) {
      const shouldRunGuardsAndResolvers = this.shouldRunGuardsAndResolvers(
          curr, future, futureConfig !.runGuardsAndResolvers);
      if (shouldRunGuardsAndResolvers) {
        this.canActivateChecks.push(new CanActivate(futurePath));
      } else {
        // we need to set the data
        future.data = curr.data;
        // TODO: Fix
        // future._resolvedData = curr._resolvedData;
      }

      // If we have a component, we need to go through an outlet.
      if (futureConfig && futureConfig.component) {
        this.setupChildRouteGuards(
            futureNode, currNode, context ? context.children : null, futurePath);

        // if we have a componentless route, we recurse but keep the same outlet map.
      } else {
        this.setupChildRouteGuards(futureNode, currNode, parentContexts, futurePath);
      }

      if (shouldRunGuardsAndResolvers) {
        const outlet = context !.outlet !;
        this.canDeactivateChecks.push(new CanDeactivate(outlet.component, curr));
      }
    } else {
      if (curr) {
        this.deactivateRouteAndItsChildren(currNode, context);
      }

      this.canActivateChecks.push(new CanActivate(futurePath));
      // If we have a component, we need to go through an outlet.
      if (futureConfig && futureConfig.component) {
        this.setupChildRouteGuards(futureNode, null, context ? context.children : null, futurePath);

        // if we have a componentless route, we recurse but keep the same outlet map.
      } else {
        this.setupChildRouteGuards(futureNode, null, parentContexts, futurePath);
      }
    }
  }

  private shouldRunGuardsAndResolvers(
      curr: RouteSnapshot, future: RouteSnapshot,
      mode: RunGuardsAndResolvers|undefined): boolean {
    switch (mode) {
      case 'always':
        return true;

      case 'paramsOrQueryParamsChange':
        return !equalParamsAndUrlSegments(curr, future) ||
            !shallowEqual(curr.queryParams, future.queryParams);

      case 'paramsChange':
      default:
        return !equalParamsAndUrlSegments(curr, future);
    }
  }

  private deactivateRouteAndItsChildren(
      route: TreeNode<RouteSnapshot>, context: OutletContext|null): void {
    const children = nodeChildrenAsMap(route);
    const r = route.value;
    const config = getConfig(r.configPath, this.routes)

    forEach(children, (node: TreeNode<RouteSnapshot>, childName: string) => {
      if (config && !config.component) {
        this.deactivateRouteAndItsChildren(node, context);
      } else if (context) {
        this.deactivateRouteAndItsChildren(node, context.children.getContext(childName));
      } else {
        this.deactivateRouteAndItsChildren(node, null);
      }
    });

    if (config && !config.component) {
      this.canDeactivateChecks.push(new CanDeactivate(null, r));
    } else if (context && context.outlet && context.outlet.isActivated) {
      this.canDeactivateChecks.push(new CanDeactivate(context.outlet.component, r));
    } else {
      this.canDeactivateChecks.push(new CanDeactivate(null, r));
    }
  }

  private runCanDeactivateChecks(): Observable<boolean> {
    const checks$ = from(this.canDeactivateChecks);
    const runningChecks$ = mergeMap.call(
        checks$, (check: CanDeactivate) => this.runCanDeactivate(check.component, check.route));
    return every.call(runningChecks$, (result: boolean) => result === true);
  }

  private runCanActivateChecks(): Observable<boolean> {
    const checks$ = from(this.canActivateChecks);
    const runningChecks$ = concatMap.call(
        checks$,
        (check: CanActivate) => {
          const legacySnapshot = getLegacySnapshot(this.futureRoot, check.route, this.legacySnapshots.future._root);
          return andObservables(from([
            this.fireChildActivationStart(legacySnapshot.parent), this.fireActivationStart(legacySnapshot),
            this.runCanActivateChild(check.path), this.runCanActivate(check.route)
          ]))
        });
    return every.call(runningChecks$, (result: boolean) => result === true);
    // this.fireChildActivationStart(check.path),
  }

  /**
   * This should fire off `ActivationStart` events for each route being activated at this
   * level.
   * In other words, if you're activating `a` and `b` below, `path` will contain the
   * `ActivatedRouteSnapshot`s for both and we will fire `ActivationStart` for both. Always
   * return
   * `true` so checks continue to run.
   */
  private fireActivationStart(snapshot: ActivatedRouteSnapshot|null): Observable<boolean> {
    if (snapshot !== null && this.forwardEvent) {
      this.forwardEvent(new ActivationStart(snapshot));
    }
    return of (true);
  }

  /**
   * This should fire off `ChildActivationStart` events for each route being activated at this
   * level.
   * In other words, if you're activating `a` and `b` below, `path` will contain the
   * `ActivatedRouteSnapshot`s for both and we will fire `ChildActivationStart` for both. Always
   * return
   * `true` so checks continue to run.
   */
  private fireChildActivationStart(snapshot: ActivatedRouteSnapshot|null): Observable<boolean> {
    if (snapshot !== null && this.forwardEvent) {
      this.forwardEvent(new ChildActivationStart(snapshot));
    }
    return of (true);
  }

  private runCanActivate(future: RouteSnapshot): Observable<boolean> {
    const futureConfig = getConfig(future.configPath, this.routes);
    const canActivate = futureConfig ? futureConfig.canActivate : null;
    const legacyFuture = getLegacySnapshot(this.futureRoot, future, this.legacySnapshots.future._root);
    if (!canActivate || canActivate.length === 0) return of (true);
    const obs = map.call(from(canActivate), (c: any) => {
      const guard = this.getToken(c, this.futureRoot, future);
      let observable: Observable<boolean>;
      if (guard.canActivate) {
        observable = wrapIntoObservable(guard.canActivate(legacyFuture, this.legacySnapshots.future));
      } else {
        observable = wrapIntoObservable(guard(legacyFuture, this.legacySnapshots.future));
      }
      return first.call(observable);
    });
    return andObservables(obs);
  }

  private runCanActivateChild(path: RouteSnapshot[]): Observable<boolean> {
    const future = path[path.length - 1];

    const canActivateChildGuards = path.slice(0, path.length - 1)
                                       .reverse()
                                       .map(p => this.extractCanActivateChild(p))
                                       .filter(_ => _ !== null);

    return andObservables(map.call(from(canActivateChildGuards), (d: any) => {
      const obs = map.call(from(d.guards), (c: any) => {
        const guard = this.getToken(c, this.futureRoot, d.node);
        let observable: Observable<boolean>;
        if (guard.canActivateChild) {
          observable = wrapIntoObservable(guard.canActivateChild(future, this.legacySnapshots.future));
        } else {
          observable = wrapIntoObservable(guard(future, this.legacySnapshots.future));
        }
        return first.call(observable);
      });
      return andObservables(obs);
    }));
  }

  private extractCanActivateChild(p: RouteSnapshot): {node: RouteSnapshot, guards: any[]}|null {
    const pConfig = getConfig(p.configPath, this.routes);
    const canActivateChild = pConfig ? pConfig.canActivateChild : null;
    if (!canActivateChild || canActivateChild.length === 0) return null;
    return {node: p, guards: canActivateChild};
  }

  private runCanDeactivate(component: Object|null, curr: RouteSnapshot):
      Observable<boolean> {
    const currConfig = getConfig(curr.configPath, this.routes);
    const currLegacy = getLegacySnapshot(this.currRoot, curr, this.legacySnapshots.curr._root);
    const canDeactivate = curr && currConfig ? currConfig.canDeactivate : null;
    if (!canDeactivate || canDeactivate.length === 0) return of (true);
    const canDeactivate$ = mergeMap.call(from(canDeactivate), (c: any) => {
      const guard = this.getToken(c, this.currRoot, curr);
      let observable: Observable<boolean>;
      if (guard.canDeactivate) {
        observable =
            wrapIntoObservable(guard.canDeactivate(component, currLegacy, this.legacySnapshots.curr, this.legacySnapshots.future));
      } else {
        observable = wrapIntoObservable(guard(component, currLegacy, this.legacySnapshots.curr, this.legacySnapshots.future));
      }
      return first.call(observable);
    });
    return every.call(canDeactivate$, (result: any) => result === true);
  }

  private runResolve(root: TreeNode<RouteSnapshot>, node: RouteSnapshot): Observable<any> {
    const config = getConfig(node.configPath, this.routes);
    const resolve = config && config.resolve ? config.resolve : {};
    const legacyNode = getLegacySnapshot(root, node, this.legacySnapshots.future._root);

    return map.call(this.resolveNode(resolve, root, node), (resolvedData: any): any => {
      // local mutation (the object is created by PreActivation and mutated before return)
      node.data = {...node.data, ...resolvedData};
      legacyNode._resolvedData = resolvedData;
      legacyNode.data = {...legacyNode.data, ...inheritedResolve(legacyNode)};
    });
  }

  private resolveNode(resolve: ResolveData, root: TreeNode<RouteSnapshot>, future: RouteSnapshot): Observable<any> {
    const keys = Object.keys(resolve);
    if (keys.length === 0) {
      return of ({});
    }
    if (keys.length === 1) {
      const key = keys[0];
      return map.call(
          this.getResolver(resolve[key], root, future), (value: any) => { return {[key]: value}; });
    }
    const data: {[k: string]: any} = {};
    const runningResolvers$ = mergeMap.call(from(keys), (key: string) => {
      return map.call(this.getResolver(resolve[key], root, future), (value: any) => {
        data[key] = value;
        return value;
      });
    });
    return map.call(last.call(runningResolvers$), () => data);
  }

  private getResolver(injectionToken: any, root: TreeNode<RouteSnapshot>, future: RouteSnapshot): Observable<any> {
    const resolver = this.getToken(injectionToken, root, future);
    return resolver.resolve ? wrapIntoObservable(resolver.resolve(future, this.futureRoot)) :
                              wrapIntoObservable(resolver(future, this.futureRoot));
  }

  private getToken(token: any, root: TreeNode<RouteSnapshot>, snapshot: RouteSnapshot): any {
    const config = this.closestLoadedConfig(root, snapshot);
    const injector = config ? config.module.injector : this.moduleInjector;
    return injector.get(token);
  }

  private closestLoadedConfig(root: TreeNode<RouteSnapshot>, snapshot: RouteSnapshot): LoadedRouterConfig|null {
    if (!snapshot) return null;
    const p = pathFromRoot(root, snapshot).reverse().slice(1).map(r => getConfig(r.configPath, this.routes));
    for (let config of p) {
      if (config && config._loadedConfig) return config._loadedConfig;
    }
    return null;
  }
}


function getLegacySnapshot(root: TreeNode<RouteSnapshot>, node: RouteSnapshot, legacyRoot: TreeNode<ActivatedRouteSnapshot>): ActivatedRouteSnapshot {
  const path = getPath(node, root);
  return getNodeFromPath(path, legacyRoot).value;
}
