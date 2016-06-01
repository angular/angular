import { RouterStateCandidate, ActivatedRouteCandidate } from './router_state';
import { TreeNode } from './utils/tree';
import { ComponentResolver } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {fromPromise} from 'rxjs/observable/fromPromise';
import 'rxjs/add/operator/toPromise';

export function resolve(resolver: ComponentResolver, state: RouterStateCandidate): Observable<RouterStateCandidate> {
  return resolveNode(resolver, state._root).map(_ => state);
}

function resolveNode(resolver: ComponentResolver, node: TreeNode<ActivatedRouteCandidate>): Observable<any> {
  if (node.children.length === 0) {
    return fromPromise(resolver.resolveComponent(<any>node.value.component).then(factory => {
      node.value._resolvedComponentFactory = factory;
      return node.value;
    }));
    
  } else {
    const c = node.children.map(c => resolveNode(resolver, c).toPromise());
    return forkJoin(c).map(_ => resolver.resolveComponent(<any>node.value.component).then(factory => {
      node.value._resolvedComponentFactory = factory;
      return node.value;
    }));
  }
}