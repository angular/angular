import { UrlTree } from './url_tree';
import { RouterState } from './router_state';
import { RouterConfig } from './config';
import { Observable } from 'rxjs/Observable';
export declare function recognize(config: RouterConfig, url: UrlTree, existingState: RouterState): Observable<RouterState>;
