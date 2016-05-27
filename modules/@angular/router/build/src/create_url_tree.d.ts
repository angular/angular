import { UrlTree } from './url_tree';
import { ActivatedRoute } from './router_state';
import { Params } from './shared';
export declare function createUrlTree(route: ActivatedRoute, urlTree: UrlTree, commands: any[], queryParameters: Params | undefined, fragment: string | undefined): UrlTree;
