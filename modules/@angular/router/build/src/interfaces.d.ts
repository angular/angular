import { Observable } from 'rxjs/Observable';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from './router_state';
export interface CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean;
}
export interface CanDeactivate<T> {
    canDeactivate(component: T, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean;
}
