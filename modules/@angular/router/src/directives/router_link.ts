import {
  ResolvedReflectiveProvider,
  Directive,
  DynamicComponentLoader,
  ViewContainerRef,
  Attribute,
  ComponentRef,
  ComponentFactory,
  ReflectiveInjector,
  OnInit,
  HostListener,
  HostBinding,
  Input,
  OnDestroy,
  Optional
} from '@angular/core';
import {RouterOutletMap, Router} from '../router';
import {RouteSegment, UrlSegment, Tree} from '../segments';
import {isString, isArray, isPresent} from '../facade/lang';
import {ObservableWrapper} from '../facade/async';

@Directive({selector: '[routerLink]'})
export class RouterLink implements OnDestroy {
  @Input() target: string;
  private _comands: any[] = [];
  private _subscription: any;

  @HostBinding() href: string;
  @HostBinding('class.router-link-active') isActive: boolean = false;

  constructor(@Optional() private _routeSegment: RouteSegment, private _router: Router) {
    this._subscription =
        ObservableWrapper.subscribe(_router.changes, (_) => { this._updateTargetUrlAndHref(); });
  }

  ngOnDestroy() { ObservableWrapper.dispose(this._subscription); }

  @Input()
  set routerLink(data: any[]|any) {
    if (isArray(data)) {
      this._comands = <any[]>data;
    } else {
      this._comands = [data];
    }
    this._updateTargetUrlAndHref();
  }


  @HostListener("click")
  onClick(): boolean {
    if (!isString(this.target) || this.target == '_self') {
      this._router.navigate(this._comands, this._routeSegment);
      return false;
    }
    return true;
  }

  private _updateTargetUrlAndHref(): void {
    let tree = this._router.createUrlTree(this._comands, this._routeSegment);
    if (isPresent(tree)) {
      this.href = this._router.serializeUrl(tree);
      this.isActive = this._router.urlTree.contains(tree);
    } else {
      this.isActive = false;
    }
  }
}
