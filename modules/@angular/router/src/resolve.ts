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
    return fromPromise(resolver.resolveComponent(<any>node.value.component).then(factory => {
      node.value._resolvedComponentFactory = factory;
      return node.value;
    }));

  } else {
    const c = node.children.map(c => resolveNode(resolver, c).toPromise());
    return forkJoin(c).map(
        _ => resolver.resolveComponent(<any>node.value.component).then(factory => {
          node.value._resolvedComponentFactory = factory;
          return node.value;
        }));
  }
}