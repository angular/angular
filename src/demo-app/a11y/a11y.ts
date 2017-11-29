/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, OnDestroy, ViewChild, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'accessibility-home',
  template: `<p>Welcome to the accessibility demos for Angular Material!</p>`,
})
export class AccessibilityHome {}

@Component({
  moduleId: module.id,
  selector: 'accessibility-demo',
  templateUrl: 'a11y.html',
  styleUrls: ['a11y.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class AccessibilityDemo implements OnDestroy {
  currentComponent: string = '';

  fullscreen = false;

  private _routerSubscription = Subscription.EMPTY;

  @ViewChild('maincontent') mainContent: ElementRef;
  @ViewChild('header') sectionHeader: ElementRef;

  navItems = [
    {name: 'Home', route: '.'},
    {name: 'Autocomplete', route: 'autocomplete'},
    {name: 'Button toggle', route: 'button-toggle'},
    {name: 'Button', route: 'button'},
    {name: 'Card', route: 'card'},
    {name: 'Checkbox', route: 'checkbox'},
    {name: 'Chips', route: 'chips'},
    {name: 'Datepicker', route: 'datepicker'},
    {name: 'Dialog', route: 'dialog'},
    {name: 'Expansion panel', route: 'expansion'},
    {name: 'Grid list', route: 'grid-list'},
    {name: 'Icon', route: 'icon'},
    {name: 'Input', route: 'input'},
    {name: 'List', route: 'list'},
    {name: 'Menu', route: 'menu'},
    {name: 'Progress bar', route: 'progress-bar'},
    {name: 'Progress spinner', route: 'progress-spinner'},
    {name: 'Radio buttons', route: 'radio'},
    {name: 'Select', route: 'select'},
    {name: 'Sidenav', route: 'sidenav'},
    {name: 'Slide toggle', route: 'slide-toggle'},
    {name: 'Slider', route: 'slider'},
    {name: 'Snack bar', route: 'snack-bar'},
    {name: 'Table', route: 'table'},
    {name: 'Tabs', route: 'tabs'},
    {name: 'Toolbar', route: 'toolbar'},
    {name: 'Tooltip', route: 'tooltip'},
  ];

  constructor(router: Router) {
    this._routerSubscription = router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        let fragments = e.url.split('/');
        let nav = this.navItems.find(navItem => {
          return fragments[fragments.length - 1] === navItem.route;
        });
        this.currentComponent = nav ? nav.name : '';

        let routerState = router.routerState.root;
        while (routerState.children.length) {
          routerState = routerState.children[0];
        }
        this.fullscreen = !!routerState.snapshot.data.fullscreen;
      }
    });
  }

  skipNavigation() {
    (this.currentComponent ? this.sectionHeader : this.mainContent).nativeElement.focus();
  }

  ngOnDestroy() {
    this._routerSubscription.unsubscribe();
  }
}
