import { UrlTree } from './url_tree';
import { RouterStateSnapshot } from './router_state';
import { RouterConfig } from './config';
import { Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
export declare function recognize(rootComponentType: Type, config: RouterConfig, url: UrlTree): Observable<RouterStateSnapshot>;
