import {isPresent} from 'angular2/src/facade/lang';
import {Directive, Query, Attribute, ElementRef, Renderer, QueryList} from 'angular2/core';
import {Router} from './router';
import {RouterLink} from './router_link';

/**
 * RouterActive dynamically finds the first element with routerLink and toggles the active class
 *
 * ## Use
 *
 * ```
 * <li router-active="active"><a [routerLink]=" ['/Home'] ">Home</a></li>
 * <li [routerActive]="'active'"><a [routerLink]=" ['/Home'] ">Home</a></li>
 * ```
 */
@Directive({selector: '[router-active]', inputs: ['routerActive']})
export class RouterActive {
  routerActive: string = null;
  routerActiveAttr: string = 'active';

  constructor(router: Router, element: ElementRef, renderer: Renderer,
              @Query(RouterLink) routerLink: QueryList<RouterLink>,
              @Attribute('router-active') routerActiveAttr: string) {
    router.subscribe(() => {
      let active = routerLink.first.isRouteActive;
      renderer.setElementClass(element.nativeElement, this._propOrAttr(), active);
    });
  }
  private _propOrAttr() {
    return isPresent(this.routerActive) ? this.routerActive : this.routerActiveAttr;
  }
}
