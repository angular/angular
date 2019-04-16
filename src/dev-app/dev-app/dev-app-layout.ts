/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {OverlayContainer} from '@angular/cdk/overlay';
import {ChangeDetectorRef, Component, ElementRef, Inject, ViewEncapsulation} from '@angular/core';
import {DevAppRippleOptions} from '../ripple/ripple-options';
import {DevAppDirectionality} from './dev-app-directionality';

/** Root component for the dev-app demos. */
@Component({
  moduleId: module.id,
  selector: 'dev-app-layout',
  templateUrl: 'dev-app-layout.html',
  styleUrls: ['dev-app-layout.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DevAppLayout {
  dark = false;
  navItems = [
    {name: 'Examples', route: '/examples'},
    {name: 'Autocomplete', route: '/autocomplete'},
    {name: 'Badge', route: '/badge'},
    {name: 'Bottom sheet', route: '/bottom-sheet'},
    {name: 'Button Toggle', route: '/button-toggle'},
    {name: 'Button', route: '/button'},
    {name: 'Card', route: '/card'},
    {name: 'Chips', route: '/chips'},
    {name: 'Connected Overlay', route: '/connected-overlay'},
    {name: 'Checkbox', route: '/checkbox'},
    {name: 'Chips', route: '/chips'},
    {name: 'Datepicker', route: '/datepicker'},
    {name: 'Dialog', route: '/dialog'},
    {name: 'Drawer', route: '/drawer'},
    {name: 'Drag and Drop', route: '/drag-drop'},
    {name: 'Expansion Panel', route: '/expansion'},
    {name: 'Focus Origin', route: '/focus-origin'},
    {name: 'Gestures', route: '/gestures'},
    {name: 'Grid List', route: '/grid-list'},
    {name: 'Icon', route: '/icon'},
    {name: 'Input', route: '/input'},
    {name: 'List', route: '/list'},
    {name: 'Live Announcer', route: '/live-announcer'},
    {name: 'Menu', route: '/menu'},
    {name: 'Paginator', route: '/paginator'},
    {name: 'Platform', route: '/platform'},
    {name: 'Popover Edit', route: '/popover-edit'},
    {name: 'Portal', route: '/portal'},
    {name: 'Progress Bar', route: '/progress-bar'},
    {name: 'Progress Spinner', route: '/progress-spinner'},
    {name: 'Radio', route: '/radio'},
    {name: 'Ripple', route: '/ripple'},
    {name: 'Screen Type', route: '/screen-type'},
    {name: 'Select', route: '/select'},
    {name: 'Sidenav', route: '/sidenav'},
    {name: 'Slide Toggle', route: '/slide-toggle'},
    {name: 'Slider', route: '/slider'},
    {name: 'Snack Bar', route: '/snack-bar'},
    {name: 'Stepper', route: '/stepper'},
    {name: 'Table', route: '/table'},
    {name: 'Tabs', route: '/tabs'},
    {name: 'Toolbar', route: '/toolbar'},
    {name: 'Tooltip', route: '/tooltip'},
    {name: 'Tree', route: '/tree'},
    {name: 'Typography', route: '/typography'},
    {name: 'Virtual Scrolling', route: '/virtual-scroll'},
    {name: 'MDC Checkbox', route: '/mdc-checkbox'},
  ];

  constructor(
      private _element: ElementRef<HTMLElement>, private _overlayContainer: OverlayContainer,
      public rippleOptions: DevAppRippleOptions,
      @Inject(Directionality) public dir: DevAppDirectionality, cdr: ChangeDetectorRef) {
    dir.change.subscribe(() => cdr.markForCheck());
  }

  toggleFullscreen() {
    // Cast to `any`, because the typings don't include the browser-prefixed methods.
    const elem = this._element.nativeElement.querySelector('.demo-content') as any;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullScreen) {
      elem.msRequestFullScreen();
    }
  }

  toggleTheme() {
    const darkThemeClass = 'demo-unicorn-dark-theme';

    this.dark = !this.dark;

    if (this.dark) {
      this._element.nativeElement.classList.add(darkThemeClass);
      this._overlayContainer.getContainerElement().classList.add(darkThemeClass);
    } else {
      this._element.nativeElement.classList.remove(darkThemeClass);
      this._overlayContainer.getContainerElement().classList.remove(darkThemeClass);
    }
  }
}
