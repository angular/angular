/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {ChangeDetectorRef, Component, ElementRef, Inject, ViewEncapsulation} from '@angular/core';
import {DevAppRippleOptions} from './ripple-options';
import {DevAppDirectionality} from './dev-app-directionality';

/** Root component for the dev-app demos. */
@Component({
  selector: 'dev-app-layout',
  templateUrl: 'dev-app-layout.html',
  styleUrls: ['dev-app-layout.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DevAppLayout {
  dark = false;
  strongFocus = false;
  navItems = [
    {name: 'Examples', route: '/examples'},
    {name: 'Autocomplete', route: '/autocomplete'},
    {name: 'Badge', route: '/badge'},
    {name: 'Bottom sheet', route: '/bottom-sheet'},
    {name: 'Button Toggle', route: '/button-toggle'},
    {name: 'Button', route: '/button'},
    {name: 'Card', route: '/card'},
    {name: 'Cdk Experimental Menu', route: '/cdk-experimental-menu'},
    {name: 'Checkbox', route: '/checkbox'},
    {name: 'Chips', route: '/chips'},
    {name: 'Clipboard', route: '/clipboard'},
    {name: 'Column Resize', route: 'column-resize'},
    {name: 'Connected Overlay', route: '/connected-overlay'},
    {name: 'Datepicker', route: '/datepicker'},
    {name: 'Dialog', route: '/dialog'},
    {name: 'Drawer', route: '/drawer'},
    {name: 'Drag and Drop', route: '/drag-drop'},
    {name: 'Expansion Panel', route: '/expansion'},
    {name: 'Focus Origin', route: '/focus-origin'},
    {name: 'Focus Trap', route: '/focus-trap'},
    {name: 'Google Map', route: '/google-map'},
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
    {name: 'YouTube Player', route: '/youtube-player'},
    {name: 'MDC Button', route: '/mdc-button'},
    {name: 'MDC Card', route: '/mdc-card'},
    {name: 'MDC Checkbox', route: '/mdc-checkbox'},
    {name: 'MDC Chips', route: '/mdc-chips'},
    {name: 'MDC Input', route: '/mdc-input'},
    {name: 'MDC List', route: '/mdc-list'},
    {name: 'MDC Menu', route: '/mdc-menu'},
    {name: 'MDC Radio', route: '/mdc-radio'},
    {name: 'MDC Progress Bar', route: '/mdc-progress-bar'},
    {name: 'MDC Tabs', route: '/mdc-tabs'},
    {name: 'MDC Sidenav', route: '/mdc-sidenav'},
    {name: 'MDC Slide Toggle', route: '/mdc-slide-toggle'},
    {name: 'MDC Slider', route: '/mdc-slider'},
    {name: 'MDC Snackbar', route: '/mdc-snackbar'},
    {name: 'MDC Table', route: '/mdc-table'},
  ];

  /** Currently selected density scale based on the index. */
  currentDensityIndex = 0;

  /** List of possible global density scale values. */
  densityScales = [0, -1, -2, 'minimum', 'maximum'];

  constructor(
      private _element: ElementRef<HTMLElement>, public rippleOptions: DevAppRippleOptions,
      @Inject(Directionality) public dir: DevAppDirectionality, cdr: ChangeDetectorRef) {
    dir.change.subscribe(() => cdr.markForCheck());
    this.updateDensityClasses();
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
      document.body.classList.add(darkThemeClass);
    } else {
      document.body.classList.remove(darkThemeClass);
    }
  }

  toggleStrongFocus() {
    const strongFocusClass = 'demo-strong-focus';

    this.strongFocus = !this.strongFocus;

    if (this.strongFocus) {
      document.body.classList.add(strongFocusClass);
    } else {
      document.body.classList.remove(strongFocusClass);
    }
  }


  /** Gets the index of the next density scale that can be selected. */
  getNextDensityIndex() {
    return (this.currentDensityIndex + 1) % this.densityScales.length;
  }

  /** Selects the next possible density scale. */
  selectNextDensity() {
    this.currentDensityIndex = this.getNextDensityIndex();
    this.updateDensityClasses();
  }

  /**
   * Updates the density classes on the host element. Applies a unique class for
   * a given density scale, so that the density styles are conditionally applied.
   */
  updateDensityClasses() {
    for (let i = 0; i < this.densityScales.length; i++) {
      const className = `demo-density-${this.densityScales[i]}`;
      if (i === this.currentDensityIndex) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    }
  }
}
