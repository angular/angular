import {Component, ElementRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

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
export class AccessibilityDemo {
  currentComponent: string = '';

  @ViewChild('maincontent') mainContent: ElementRef;
  @ViewChild('header') sectionHeader: ElementRef;

  navItems = [
    {name: 'Home', route: '.'},
    {name: 'Autocomplete', route: 'autocomplete'},
    {name: 'Button', route: 'button'},
    {name: 'Button toggle', route: 'button-toggle'},
    {name: 'Card', route: 'card'},
    {name: 'Checkbox', route: 'checkbox'},
    {name: 'Chips', route: 'chips'},
    {name: 'Datepicker', route: 'datepicker'},
    {name: 'Dialog', route: 'dialog'},
    {name: 'Expansion panel', route: 'expansion'},
    {name: 'Grid list', route: 'grid-list'},
    {name: 'Icon', route: 'icon'},
    {name: 'Input', route: 'input'},
    {name: 'Menu', route: 'menu'},
    {name: 'Progress bar', route: 'progress-bar'},
    {name: 'Progress spinner', route: 'progress-spinner'},
    {name: 'Radio buttons', route: 'radio'},
    {name: 'Slider', route: 'slider'},
    {name: 'Slide toggle', route: 'slide-toggle'},
    {name: 'Snack bar', route: 'snack-bar'},
    {name: 'Select', route: 'select'},
    {name: 'Tabs', route: 'tabs'},
    {name: 'Toolbar', route: 'toolbar'},
    {name: 'Tooltip', route: 'tooltip'},
  ];

  constructor(router: Router) {
    router.events.subscribe(event => {
      let nav = this.navItems.find(navItem => {
        let fragments = (event as NavigationEnd).url.split('/');
        return fragments[fragments.length - 1] === navItem.route;
      });
      this.currentComponent = nav ? nav.name : '';
    });
  }

  skipNavigation() {
    (this.currentComponent ? this.sectionHeader : this.mainContent).nativeElement.focus();
  }
}
