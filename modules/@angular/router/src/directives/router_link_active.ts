import {AfterContentInit, ContentChildren, Directive, ElementRef, Input, OnChanges, OnDestroy, QueryList, Renderer} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {NavigationEnd, Router} from '../router';
import {containsTree} from '../url_tree';

import {RouterLink} from './router_link';

interface RouterLinkActiveOptions {
  exact: boolean;
}

@Directive({selector: '[routerLinkActive]'})
export class RouterLinkActive implements OnChanges, OnDestroy, AfterContentInit {
  @ContentChildren(RouterLink) private links: QueryList<RouterLink>;
  private classes: string[] = [];
  private subscription: Subscription;

  @Input() private routerLinkActiveOptions: RouterLinkActiveOptions = {exact: true};

  /**
   * @internal
   */
  constructor(private router: Router, private element: ElementRef, private renderer: Renderer) {
    this.subscription = router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        this.update();
      }
    });
  }

  ngAfterContentInit(): void {
    this.links.changes.subscribe(s => this.update());
    this.update();
  }

  @Input()
  set routerLinkActive(data: string[]|string) {
    if (Array.isArray(data)) {
      this.classes = <any>data;
    } else {
      this.classes = data.split(' ');
    }
  }

  ngOnChanges(changes: {}): any { this.update(); }
  ngOnDestroy(): any { this.subscription.unsubscribe(); }

  private update(): void {
    if (!this.links || this.links.length === 0) return;

    const currentUrlTree = this.router.parseUrl(this.router.url);
    const isActive = this.links.reduce(
        (res, link) =>
            res || containsTree(currentUrlTree, link.urlTree, this.routerLinkActiveOptions.exact),
        false);

    this.classes.forEach(
        c => this.renderer.setElementClass(this.element.nativeElement, c, isActive));
  }
}
