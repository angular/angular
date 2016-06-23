/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {ComponentResolver} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {fromPromise} from 'rxjs/observable/fromPromise';

import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {TreeNode} from './utils/tree';

export function resolve(
    resolver: ComponentResolver, state: RouterStateSnapshot): Observable<RouterStateSnapshot> {
  return resolveNode(resolver, state._root).map(_ => state);
}

function resolveNode(
    resolver: ComponentResolver, node: TreeNode<ActivatedRouteSnapshot>): Observable<any> {
  if (node.children.length === 0) {
    return fromPromise(resolveComponent(resolver, <any>node.value).then(factory => {
      node.value._resolvedComponentFactory = factory;
      return node.value;
    }));

  } else {
    const c = node.children.map(c => resolveNode(resolver, c).toPromise());
    return forkJoin(c).map(_ => resolveComponent(resolver, <any>node.value).then(factory => {
      node.value._resolvedComponentFactory = factory;
      return node.value;
    }));
  }
}

function resolveComponent(
    resolver: ComponentResolver, snapshot: ActivatedRouteSnapshot): Promise<any> {
  if (snapshot.component && snapshot._routeConfig) {
    return resolver.resolveComponent(<any>snapshot.component);
  } else {
    return Promise.resolve(null);
  }
}