/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, OnDestroy, OpaqueToken} from '@angular/core';
import {Meta, MetaDefinition, Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {NavigationEnd, Router} from './router';
import {ActivatedRoute} from './router_state';

export const HELMET_CONFIG: OpaqueToken = new OpaqueToken('Helmet Config');

/** @experimental */
export interface HelmetConfig {
  /**
   * The default title, used when a route does not have its own title.
   */
  defaultTitle?: string;
  /**
   * The title template, used to format title text in your page title.
   */
  titleTemplate?: string;
}

/** @experimental */
export interface Head {
  title?: string;
  meta?: MetaDefinition[];
}

/**
 * A document head manager.
 *
 * @experimental
 */
@Injectable()
export class Helmet implements OnDestroy {
  private sub: Subscription;

  constructor(
      private router: Router, private title: Title, private meta: Meta,
      @Inject(HELMET_CONFIG) private config: any /* Head */) {
    this.sub = router.events.filter(event => event instanceof NavigationEnd)
                   .map(_ => this.router.routerState.root)
                   .map((route: ActivatedRoute) => this.findActiveRoute(route))
                   .mergeMap((route: ActivatedRoute) => route.data)
                   .subscribe((data: any) => this.updateHead(data['head']));
  }

  private findActiveRoute(root: ActivatedRoute): ActivatedRoute {
    while (root.firstChild) {
      root = root.firstChild;
    }
    return root;
  }

  private updateHead(head: Head): void {
    if (head) {
      this.updateTitle(head.title);
      if (Array.isArray(head.meta)) {
        head.meta.forEach(tag => this.meta.updateTag(tag));
      }
    }
  }

  private updateTitle(title: string): void {
    title = title || this.config.defaultTitle;

    if (title != null) {
      if (this.config.titleTemplate) {
        title = this.config.titleTemplate.replace(/%s/g, title);
      }

      this.title.setTitle(title);
    }
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }
}
