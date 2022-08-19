/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {ChangeDetectorRef, Component, ElementRef, Inject, ViewEncapsulation} from '@angular/core';

import {DevAppDirectionality} from './dev-app-directionality';
import {DevAppRippleOptions} from './ripple-options';
import {CommonModule, DOCUMENT} from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatLegacyListModule} from '@angular/material/legacy-list';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {RouterModule} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

const isDarkThemeKey = 'ANGULAR_COMPONENTS_DEV_APP_DARK_THEME';

export const ANIMATIONS_STORAGE_KEY = 'ANGULAR_COMPONENTS_ANIMATIONS_DISABLED';

/** Root component for the dev-app demos. */
@Component({
  selector: 'dev-app-layout',
  templateUrl: 'dev-app-layout.html',
  styleUrls: ['dev-app-layout.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    MatLegacyButtonModule,
    MatIconModule,
    MatLegacyListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterModule,
  ],
})
export class DevAppLayout {
  readonly darkThemeClass = 'demo-unicorn-dark-theme';
  _isDark = false;
  strongFocus = false;
  navItems = [
    {name: 'Examples', route: '/examples'},
    {name: 'Autocomplete', route: '/autocomplete'},
    {name: 'Badge', route: '/badge'},
    {name: 'Bottom sheet', route: '/bottom-sheet'},
    {name: 'Button Toggle', route: '/button-toggle'},
    {name: 'Button', route: '/button'},
    {name: 'Card', route: '/card'},
    {name: 'CDK Dialog', route: '/cdk-dialog'},
    {name: 'CDK Listbox', route: '/cdk-listbox'},
    {name: 'CDK Menu', route: '/cdk-menu'},
    {name: 'CDK Experimental Combobox', route: '/cdk-experimental-combobox'},
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
    {name: 'Input Modality', route: '/input-modality'},
    {name: 'List', route: '/list'},
    {name: 'Layout', route: '/layout'},
    {name: 'Live Announcer', route: '/live-announcer'},
    {name: 'Menu', route: '/menu'},
    {name: 'Menubar', route: '/menubar'},
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
    {name: 'Selection', route: '/selection'},
    {name: 'Sidenav', route: '/sidenav'},
    {name: 'Slide Toggle', route: '/slide-toggle'},
    {name: 'Slider', route: '/slider'},
    {name: 'Snack Bar', route: '/snack-bar'},
    {name: 'Stepper', route: '/stepper'},
    {name: 'Table', route: '/table'},
    {name: 'Table Scroll Container', route: '/table-scroll-container'},
    {name: 'Tabs', route: '/tabs'},
    {name: 'Toolbar', route: '/toolbar'},
    {name: 'Tooltip', route: '/tooltip'},
    {name: 'Tree', route: '/tree'},
    {name: 'Typography', route: '/typography'},
    {name: 'Virtual Scrolling', route: '/virtual-scroll'},
    {name: 'YouTube Player', route: '/youtube-player'},
    {name: 'MDC Autocomplete', route: '/mdc-autocomplete'},
    {name: 'MDC Button', route: '/mdc-button'},
    {name: 'MDC Card', route: '/mdc-card'},
    {name: 'MDC Checkbox', route: '/mdc-checkbox'},
    {name: 'MDC Chips', route: '/mdc-chips'},
    {name: 'MDC Dialog', route: '/mdc-dialog'},
    {name: 'MDC Input', route: '/mdc-input'},
    {name: 'MDC List', route: '/mdc-list'},
    {name: 'MDC Menu', route: '/mdc-menu'},
    {name: 'MDC Radio', route: '/mdc-radio'},
    {name: 'MDC Paginator', route: '/mdc-paginator'},
    {name: 'MDC Progress Bar', route: '/mdc-progress-bar'},
    {name: 'MDC Progress Spinner', route: '/mdc-progress-spinner'},
    {name: 'MDC Tabs', route: '/mdc-tabs'},
    {name: 'MDC Tooltip', route: '/mdc-tooltip'},
    {name: 'MDC Select', route: '/mdc-select'},
    {name: 'MDC Slide Toggle', route: '/mdc-slide-toggle'},
    {name: 'MDC Slider', route: '/mdc-slider'},
    {name: 'MDC Snack Bar', route: '/mdc-snack-bar'},
    {name: 'Legacy Table', route: '/legacy-table'},
  ];

  /** Currently selected density scale based on the index. */
  currentDensityIndex = 0;

  /** List of possible global density scale values. */
  densityScales = [0, -1, -2, 'minimum', 'maximum'];

  /** Whether animations are disabled. */
  animationsDisabled = localStorage.getItem(ANIMATIONS_STORAGE_KEY) === 'true';

  constructor(
    private _element: ElementRef<HTMLElement>,
    public rippleOptions: DevAppRippleOptions,
    @Inject(Directionality) public dir: DevAppDirectionality,
    cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private _document: Document,
  ) {
    dir.change.subscribe(() => cdr.markForCheck());
    try {
      const isDark = localStorage.getItem(isDarkThemeKey);
      if (isDark != null) {
        // We avoid calling the setter and apply the themes directly here.
        // This avoids writing the same value, that we just read, back to localStorage.
        this._isDark = isDark === 'true';
        this.updateThemeClass(this._isDark);
      }
    } catch (error) {
      console.error(`Failed to read ${isDarkThemeKey} from localStorage: `, error);
    }
  }

  get isDark(): boolean {
    return this._isDark;
  }

  set isDark(value: boolean) {
    // Noop if the value is the same as is already set.
    if (value !== this._isDark) {
      this._isDark = value;
      this.updateThemeClass(this._isDark);

      try {
        localStorage.setItem(isDarkThemeKey, String(value));
      } catch (error) {
        console.error(`Failed to write ${isDarkThemeKey} to localStorage: `, error);
      }
    }
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

  updateThemeClass(isDark?: boolean) {
    if (isDark) {
      this._document.body.classList.add(this.darkThemeClass);
    } else {
      this._document.body.classList.remove(this.darkThemeClass);
    }
  }

  toggleStrongFocus() {
    const strongFocusClass = 'demo-strong-focus';

    this.strongFocus = !this.strongFocus;

    if (this.strongFocus) {
      this._document.body.classList.add(strongFocusClass);
    } else {
      this._document.body.classList.remove(strongFocusClass);
    }
  }

  toggleAnimations() {
    localStorage.setItem(ANIMATIONS_STORAGE_KEY, !this.animationsDisabled + '');
    location.reload();
  }

  /** Gets the index of the next density scale that can be selected. */
  getNextDensityIndex() {
    return (this.currentDensityIndex + 1) % this.densityScales.length;
  }

  /** Selects the next possible density scale. */
  selectNextDensity() {
    this.currentDensityIndex = this.getNextDensityIndex();
  }

  /**
   * Updates the density classes on the host element. Applies a unique class for
   * a given density scale, so that the density styles are conditionally applied.
   */
  getDensityClass() {
    return `demo-density-${this.densityScales[this.currentDensityIndex]}`;
  }
}
