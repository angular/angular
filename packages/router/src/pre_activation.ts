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
import {merge} from 'rxjs/observable/merge';
import {of } from 'rxjs/observable/of';
import {concatMap} from 'rxjs/operator/concatMap';
import {first} from 'rxjs/operator/first';
import {last} from 'rxjs/operator/last';
import {map} from 'rxjs/operator/map';
import {mergeMap} from 'rxjs/operator/mergeMap';
import {reduce} from 'rxjs/operator/reduce';

import {LoadedRouterConfig, ResolveData, RunGuardsAndResolvers} from './config';
import {ActivationStart, ChildActivationStart, Event} from './events';
import {ChildrenOutletContexts, OutletContext} from './router_outlet_context';
import {ActivatedRouteSnapshot, ParamsInheritanceStrategy, RouterStateSnapshot, equalParamsAndUrlSegments, inheritedParamsDataResolve} from './router_state';
import {andObservable, forEach, runGuards, shallowEqual} from './utils/collection';
import {TreeNode, nodeChildrenAsMap} from './utils/tree';

class CanActivate {
  readonly route: ActivatedRouteSnapshot;
  constructor(public path: ActivatedRouteSnapshot[]) {
    this.route = this.path[this.path.length - 1];
  }
}

class CanDeactivate {
  constructor(public component: Object|null, public route: ActivatedRouteSnapshot) {}
}

/**
 * This class bundles the actions involved in preactivation of a route.
 */
export class PreActivation {
  private canActivateChecks: CanActivate[] = [];
  private canDeactivateChecks: CanDeactivate[] = [];

  constructor(
      private future: RouterStateSnapshot, private curr: RouterStateSnapshot,
      private moduleInjector: Injector, private forwardEvent?: (evt: Event) => void) {}

  initialize(parentContexts: ChildrenOutletContexts): void {
    const futureRoot = this.future._root;
    const currRoot = this.curr ? this.curr._root : null;
    this.setupChildRouteGuards(futureRoot, currRoot, parentContexts, [futureRoot.value]);
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

  resolveData(paramsInheritanceStrategy: ParamsInheritanceStrategy): Observable<any> {
    if (!this.isActivating()) return of (null);
    const checks$ = from(this.canActivateChecks);
    const runningChecks$ = concatMap.call(
        checks$, (check: CanActivate) => this.runResolve(check.route, paramsInheritanceStrategy));
    return reduce.call(runningChecks$, (_: any, __: any) => _);
  }

  isDeactivating(): boolean { return this.canDeactivateChecks.length !== 0; }

  isActivating(): boolean { return this.canActivateChecks.length !== 0; }


  /**
   * Iterates over child routes and calls recursive `setupRouteGuards` to get `this` instance in
   * proper state to run `checkGuards()` method.
   */
  private setupChildRouteGuards(
      futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>|null,
      contexts: ChildrenOutletContexts|null, futurePath: ActivatedRouteSnapshot[]): void {
    const prevChildren = nodeChildrenAsMap(currNode);

    // Process the children of the future route
    futureNode.children.forEach(c => {
      this.setupRouteGuards(
          c, prevChildren[c.value.outlet], contexts, futurePath.concat([c.value]));
      delete prevChildren[c.value.outlet];
    });

    // Process any children left from the current route (not active for the future route)
    forEach(
        prevChildren, (v: TreeNode<ActivatedRouteSnapshot>, k: string) =>
                          this.deactivateRouteAndItsChildren(v, contexts !.getContext(k)));
  }

  /**
   * Iterates over child routes and calls recursive `setupRouteGuards` to get `this` instance in
   * proper state to run `checkGuards()` method.
   */
  private setupRouteGuards(
      futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>,
      parentContexts: ChildrenOutletContexts|null, futurePath: ActivatedRouteSnapshot[]): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;
    const context = parentContexts ? parentContexts.getContext(futureNode.value.outlet) : null;

    // reusing the node
    if (curr && future.routeConfig === curr.routeConfig) {
      const shouldRunGuardsAndResolvers = this.shouldRunGuardsAndResolvers(
          curr, future, future.routeConfig !.runGuardsAndResolvers);
      if (shouldRunGuardsAndResolvers) {
        this.canActivateChecks.push(new CanActivate(futurePath));
      } else {
        // we need to set the data
        future.data = curr.data;
        future._resolvedData = curr._resolvedData;
      }

      // If we have a component, we need to go through an outlet.
      if (future.component) {
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
      if (future.component) {
        this.setupChildRouteGuards(futureNode, null, context ? context.children : null, futurePath);

        // if we have a componentless route, we recurse but keep the same outlet map.
      } else {
        this.setupChildRouteGuards(futureNode, null, parentContexts, futurePath);
      }
    }
  }

  private shouldRunGuardsAndResolvers(
      curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot,
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
      route: TreeNode<ActivatedRouteSnapshot>, context: OutletContext|null): void {
    const children = nodeChildrenAsMap(route);
    const r = route.value;

    forEach(children, (node: TreeNode<ActivatedRouteSnapshot>, childName: string) => {
      if (!r.component) {
        this.deactivateRouteAndItsChildren(node, context);
      } else if (context) {
        this.deactivateRouteAndItsChildren(node, context.children.getContext(childName));
      } else {
        this.deactivateRouteAndItsChildren(node, null);
      }
    });

    if (!r.component) {
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
    return andObservable(runningChecks$);
  }

  private runCanActivateChecks(): Observable<boolean> {
    const checks$ = from(this.canActivateChecks);
    const runningChecks$ = concatMap.call(
        checks$, (check: CanActivate) => andObservable(merge(
                     this.fireChildActivationStart(check.route.parent),
                     this.fireActivationStart(check.route), this.runCanActivateChild(check.path),
                     this.runCanActivate(check.route))));
    return andObservable(runningChecks$);
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

  private runCanActivate(future: ActivatedRouteSnapshot): Observable<boolean> {
    const canActivate = future.routeConfig ? future.routeConfig.canActivate : null;
    return andObservable(runGuards(
        'canActivate', canActivate, this.getInjector(future), [future, this.future], true));
  }

  private runCanActivateChild(path: ActivatedRouteSnapshot[]): Observable<boolean> {
    const future = path[path.length - 1];

    const canActivateChildGuards = path.slice(0, path.length - 1)
                                       .reverse()
                                       .map(p => this.extractCanActivateChild(p))
                                       .filter(_ => _ !== null);

    return andObservable(mergeMap.call(
        from(canActivateChildGuards),
        (d: any) => runGuards(
            'canActivateChild', d.guards, this.getInjector(d.node), [future, this.future], true)));
  }

  private extractCanActivateChild(p: ActivatedRouteSnapshot):
      {node: ActivatedRouteSnapshot, guards: any[]}|null {
    const canActivateChild = p.routeConfig ? p.routeConfig.canActivateChild : null;
    if (!canActivateChild || canActivateChild.length === 0) return null;
    return {node: p, guards: canActivateChild};
  }

  private runCanDeactivate(component: Object|null, curr: ActivatedRouteSnapshot):
      Observable<boolean> {
    const canDeactivate = curr && curr.routeConfig ? curr.routeConfig.canDeactivate : null;
    return andObservable(runGuards(
        'canDeactivate', canDeactivate, this.getInjector(curr),
        [component, curr, this.curr, this.future], true));
  }

  private runResolve(
      future: ActivatedRouteSnapshot,
      paramsInheritanceStrategy: ParamsInheritanceStrategy): Observable<any> {
    const resolve = future._resolve;
    return map.call(this.resolveNode(resolve, future), (resolvedData: any): any => {
      future._resolvedData = resolvedData;
      future.data = {...future.data,
                     ...inheritedParamsDataResolve(future, paramsInheritanceStrategy).resolve};
      return null;
    });
  }

  private resolveNode(resolve: ResolveData, future: ActivatedRouteSnapshot):
      Observable<{[k: string]: any}> {
    const keys = Object.keys(resolve);
    if (keys.length === 0) {
      return of ({});
    }

    const values = Object.keys(resolve).map(k => resolve[k]);
    const guard$ = runGuards('resolve', values, this.getInjector(future), [future, this.future]);

    return reduce.call(guard$, (obj: {[k: string]: any}, value: any, idx: number) => {
      const key = keys[idx];
      obj[key] = value;
      return obj;
    }, {});
  }

  private getInjector(snapshot: ActivatedRouteSnapshot): Injector {
    const config = closestLoadedConfig(snapshot);
    return config ? config.module.injector : this.moduleInjector;
  }
}


function closestLoadedConfig(snapshot: ActivatedRouteSnapshot): LoadedRouterConfig|null {
  if (!snapshot) return null;

  for (let s = snapshot.parent; s; s = s.parent) {
    const route = s.routeConfig;
    if (route && route._loadedConfig) return route._loadedConfig;
  }

  return null;
}
