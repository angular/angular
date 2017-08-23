import {Component, ViewEncapsulation} from '@angular/core';

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
})
export class AccessibilityDemo {
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
    {name: 'Grid list', route: 'grid-list'},
    {name: 'Icon', route: 'icon'},
    {name: 'Input', route: 'input'},
    {name: 'Menu', route: 'menu'},
    {name: 'Progress spinner', route: 'progress-spinner'},
    {name: 'Radio buttons', route: 'radio'},
    {name: 'Slider', route: 'slider'},
    {name: 'Slide toggle', route: 'slide-toggle'},
    {name: 'Snack bar', route: 'snack-bar'},
    {name: 'Select', route: 'select'},
    {name: 'Toolbar', route: 'toolbar'},
  ];
}
