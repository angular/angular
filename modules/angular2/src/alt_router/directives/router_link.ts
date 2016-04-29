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
  OnDestroy
} from 'angular2/core';
import {RouterOutletMap, Router} from '../router';
import {RouteSegment, UrlSegment, Tree} from '../segments';
import {link} from '../link';
import {isString} from 'angular2/src/facade/lang';
import {ObservableWrapper} from 'angular2/src/facade/async';

@Directive({selector: '[routerLink]'})
export class RouterLink implements OnDestroy {
  @Input() target: string;
  private _changes: any[] = [];
  private _targetUrl: Tree<UrlSegment>;
  private _subscription: any;

  @HostBinding() private href: string;

  constructor(private _router: Router) {
    this._subscription = ObservableWrapper.subscribe(_router.changes, (_) => {
      this._targetUrl = _router.urlTree;
      this._updateTargetUrlAndHref();
    });
  }

  ngOnDestroy() { ObservableWrapper.dispose(this._subscription); }

  @Input()
  set routerLink(data: any[]) {
    this._changes = data;
    this._updateTargetUrlAndHref();
  }

  @HostListener("click")
  onClick(): boolean {
    if (!isString(this.target) || this.target == '_self') {
      this._router.navigate(this._targetUrl);
      return false;
    }
    return true;
  }

  private _updateTargetUrlAndHref(): void {
    this._targetUrl = link(null, this._router.urlTree, this._changes);
    this.href = this._router.serializeUrl(this._targetUrl);
  }
}