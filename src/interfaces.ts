import {Observable} from 'rxjs/Observable';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';

/**
 * An interface a class can implement to be a guard deciding if a route can be activated.
 */
export interface CanActivate {
  canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot):Observable<boolean> | boolean;
}

/**
 * An interface a class can implement to be a guard deciding if a route can be deactivated.
 */
export interface CanDeactivate<T> {
  canDeactivate(component:T, route:ActivatedRouteSnapshot, state:RouterStateSnapshot):Observable<boolean> | boolean;
}