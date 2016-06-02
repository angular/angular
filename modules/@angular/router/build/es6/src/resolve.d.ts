import { RouterStateSnapshot } from './router_state';
import { ComponentResolver } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
export declare function resolve(resolver: ComponentResolver, state: RouterStateSnapshot): Observable<RouterStateSnapshot>;
