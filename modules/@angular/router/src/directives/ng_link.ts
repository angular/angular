/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationStrategy} from '@angular/common';
import {Directive, ElementRef, Host, HostBinding, HostListener, Input, OnChanges, OnDestroy, RendererV2, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {QueryParamsHandling} from '../config';
import {NavigationEnd, Router} from '../router';
import {ActivatedRoute} from '../router_state';
import {UrlTree} from '../url_tree';

export abstract class NgLinkBase implements OnChanges, OnDestroy {
  @Input() queryParams: {[k: string]: any};
  @Input() fragment: string;
  @Input() queryParamsHandling: QueryParamsHandling;
  @Input() preserveFragment: boolean;
  @Input() skipLocationChange: boolean;
  @Input() replaceUrl: boolean;
  protected commands: any[] = [];
  protected classes: string[] = ['ng-link-active'];
  protected active: boolean = false;
  private subscription: Subscription;

  constructor(
      protected router: Router, protected route: ActivatedRoute, private renderer: RendererV2,
      private host: ElementRef) {
    this.subscription = router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.update();
      }
    });
  }

  @Input()
  set ngLink(commands: any[]|string) {
    if (commands != null) {
      this.commands = Array.isArray(commands) ? commands : [commands];
    } else {
      this.commands = null;
    }
  }

  @Input()
  set activeClass(classes: string|string[]) {
    this.classes = Array.isArray(classes) ? classes : classes.split(' ');
  }

  ngOnChanges(changes: SimpleChanges): void { this.update(); }

  ngOnDestroy(): void { this.subscription.unsubscribe(); }

  protected get urlTree(): UrlTree|null {
    if (!this.hasCommands()) return null;
    return this.router.createUrlTree(this.commands, {
      relativeTo: this.route,
      queryParams: this.queryParams,
      fragment: this.fragment,
      queryParamsHandling: this.queryParamsHandling,
      preserveFragment: attrBoolValue(this.preserveFragment),
    });
  }

  protected hasCommands(): boolean { return this.commands != null; }

  protected updateActiveClass(urlTree: UrlTree|null): void {
    if (!this.router.navigated) return;
    const active: boolean = this.router.isActive(urlTree, false);  // fixme add options
    if (this.active !== active) {
      this.active = active;
      if (active) {
        this.classes.forEach(clazz => this.renderer.addClass(this.host.nativeElement, clazz));
      } else {
        this.classes.forEach(clazz => this.renderer.removeClass(this.host.nativeElement, clazz));
      }
    }
  }

  protected abstract update(): void;
}

@Directive({selector: ':not(a)[ngLink]'})
export class NgLink extends NgLinkBase {
  @HostBinding('attr.tabindex') @Input() tabindex: string = '0';

  constructor(
      router: Router, route: ActivatedRoute, renderer: RendererV2, @Host() host: ElementRef) {
    super(router, route, renderer, host);
  }

  @HostListener('click')
  onClick(): boolean {
    if (this.hasCommands()) {
      const extras = {
        skipLocationChange: attrBoolValue(this.skipLocationChange),
        replaceUrl: attrBoolValue(this.replaceUrl),
      };
      this.router.navigateByUrl(this.urlTree, extras);
    }
    return false;
  }

  protected update(): void { this.updateActiveClass(this.urlTree); }
}

@Directive({selector: 'a[ngLink]'})
export class NgAnchor extends NgLinkBase {
  @HostBinding('attr.target') @Input() target: string;
  @HostBinding('attr.href') href: string;

  constructor(
      private locationStrategy: LocationStrategy, router: Router, route: ActivatedRoute,
      renderer: RendererV2, @Host() host: ElementRef) {
    super(router, route, renderer, host);
  }

  @HostListener('click', ['$event.button', '$event.ctrlKey', '$event.metaKey'])
  onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean {
    if (!this.hasCommands()) return false;

    if (button !== 0 || ctrlKey || metaKey) {
      return true;
    }

    if (typeof this.target === 'string' && this.target !== '_self') {
      return true;
    }

    const extras = {
      skipLocationChange: attrBoolValue(this.skipLocationChange),
      replaceUrl: attrBoolValue(this.replaceUrl),
    };
    this.router.navigateByUrl(this.urlTree, extras);

    return false;
  }

  protected update(): void {
    const urlTree = this.urlTree;
    this.updateHref(urlTree);
    this.updateActiveClass(urlTree);
  }

  private updateHref(urlTree: UrlTree|null): void {
    this.href = urlTree != null ?
        this.locationStrategy.prepareExternalUrl(this.router.serializeUrl(urlTree)) :
        null;
  }
}

function attrBoolValue(s: any): boolean {
  return s === '' || !!s;
}
