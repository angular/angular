import { Tree, TreeNode } from './utils/tree';
import { UrlSegment } from './url_tree';
import { Params } from './shared';
import { Observable } from 'rxjs/Observable';
import { Type } from '@angular/core';
export declare class RouterState extends Tree<ActivatedRoute> {
    queryParams: Observable<Params>;
    fragment: Observable<string>;
    constructor(root: TreeNode<ActivatedRoute>, queryParams: Observable<Params>, fragment: Observable<string>);
}
export declare function createEmptyState(rootComponent: Type): RouterState;
export declare class ActivatedRoute {
    urlSegments: Observable<UrlSegment[]>;
    params: Observable<Params>;
    outlet: string;
    component: Type | string;
    constructor(urlSegments: Observable<UrlSegment[]>, params: Observable<Params>, outlet: string, component: Type | string);
}
