import { Tree, TreeNode } from './tree';
import { UrlSegment } from './url_tree';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ComponentFactory, Type } from '@angular/core';

export type Params = { [key: string]: string };

export const PRIMARY_OUTLET = "PRIMARY_OUTLET";

export class RouterState extends Tree<ActivatedRoute> {
  constructor(root: TreeNode<ActivatedRoute>, public queryParams: Observable<Params>, public fragment: Observable<string>) {
    super(root);
  }
}

export function createEmptyState(rootComponent: Type): RouterState {
  const emptyUrl = new BehaviorSubject([new UrlSegment("", {})]);
  const emptyParams = new BehaviorSubject({});
  const emptyQueryParams = new BehaviorSubject({});
  const fragment = new BehaviorSubject("");
  // TODO outlet name should not be outlet
  const activated = new ActivatedRoute(emptyUrl, emptyParams, PRIMARY_OUTLET, rootComponent, <any>null);
  return new RouterState(new TreeNode<ActivatedRoute>(activated, []), emptyQueryParams, fragment);
}

export class ActivatedRoute {
  constructor(public urlSegments: Observable<UrlSegment[]>,
              public params: Observable<Params>,
              public outlet: string,
              public component: Type,
              public factory: ComponentFactory<any>) {}
}