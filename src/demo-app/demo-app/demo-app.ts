import {
  Component,
  ViewEncapsulation,
  ElementRef,
  Renderer2,
} from '@angular/core';
import {OverlayContainer} from '@angular/material';

/**
 * The entry app for demo site. Routes under `accessibility` will use AccessibilityDemo component,
 * while other demos will use `DemoApp` component. Since DemoApp and AccessibilityDemo use
 * different templates (DemoApp has toolbar and sidenav), we use this EntryApp in index.html
 * as our entry point.
 */
@Component({
  moduleId: module.id,
  selector: 'entry-app',
  template: '<router-outlet></router-outlet>',
  encapsulation: ViewEncapsulation.None,
})
export class EntryApp {}

/**
 * Home component for welcome message in DemoApp.
 */
@Component({
  selector: 'home',
  template: `
    <p>Welcome to the development demos for Angular Material!</p>
    <p>Open the sidenav to select a demo.</p>
  `
})
export class Home {}

/**
 * DemoApp with toolbar and sidenav.
 */
@Component({
  moduleId: module.id,
  selector: 'demo-app',
  templateUrl: 'demo-app.html',
  styleUrls: ['demo-app.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DemoApp {
  dark = false;
  navItems = [
    {name: 'Autocomplete', route: '/autocomplete'},
    {name: 'Button', route: '/button'},
    {name: 'Button Toggle', route: '/button-toggle'},
    {name: 'Card', route: '/card'},
    {name: 'Chips', route: '/chips'},
    {name: 'Checkbox', route: '/checkbox'},
    {name: 'Datepicker', route: '/datepicker'},
    {name: 'Dialog', route: '/dialog'},
    {name: 'Expansion Panel', route: '/expansion'},
    {name: 'Gestures', route: '/gestures'},
    {name: 'Grid List', route: '/grid-list'},
    {name: 'Icon', route: '/icon'},
    {name: 'Input', route: '/input'},
    {name: 'List', route: '/list'},
    {name: 'Menu', route: '/menu'},
    {name: 'Live Announcer', route: '/live-announcer'},
    {name: 'Overlay', route: '/overlay'},
    {name: 'Portal', route: '/portal'},
    {name: 'Progress Bar', route: '/progress-bar'},
    {name: 'Progress Spinner', route: '/progress-spinner'},
    {name: 'Radio', route: '/radio'},
    {name: 'Ripple', route: '/ripple'},
    {name: 'Select', route: '/select'},
    {name: 'Sidenav', route: '/sidenav'},
    {name: 'Slider', route: '/slider'},
    {name: 'Slide Toggle', route: '/slide-toggle'},
    {name: 'Snack Bar', route: '/snack-bar'},
    {name: 'Stepper', route: '/stepper'},
    {name: 'Table', route: '/table'},
    {name: 'Tabs', route: '/tabs'},
    {name: 'Toolbar', route: '/toolbar'},
    {name: 'Tooltip', route: '/tooltip'},
    {name: 'Platform', route: '/platform'},
    {name: 'Style', route: '/style'},
    {name: 'Typography', route: '/typography'}
  ];

  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2,
    private _overlayContainer: OverlayContainer) {}

  toggleFullscreen() {
    let elem = this._element.nativeElement.querySelector('.demo-content');
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
    const darkThemeClass = 'unicorn-dark-theme';

    this.dark = !this.dark;

    if (this.dark) {
      this._renderer.addClass(this._element.nativeElement, darkThemeClass);
      this._overlayContainer.themeClass = darkThemeClass;
    } else {
      this._renderer.removeClass(this._element.nativeElement, darkThemeClass);
      this._overlayContainer.themeClass = '';
    }
  }
}
