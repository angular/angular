import {Component, ViewEncapsulation} from '@angular/core';

@Component({selector: 'home', template: `<p>e2e website!</p>`})
export class Home {}

@Component({
  selector: 'e2e-app-layout',
  templateUrl: 'e2e-app-layout.html',
  encapsulation: ViewEncapsulation.None,
})
export class E2eAppLayout {
  showLinks = false;

  navLinks = [
    {path: 'block-scroll-strategy', title: 'Block scroll strategy'},
    {path: 'button', title: 'Button'},
    {path: 'button-toggle', title: 'Button Toggle'},
    {path: 'checkbox', title: 'Checkbox'},
    {path: 'component-harness', title: 'Component Harness'},
    {path: 'dialog', title: 'Dialog'},
    {path: 'expansion', title: 'Expansion'},
    {path: 'grid-list', title: 'Grid list'},
    {path: 'icon', title: 'Icon'},
    {path: 'input', title: 'Input'},
    {path: 'list', title: 'List'},
    {path: 'menu', title: 'Menu'},
    {path: 'progress-bar', title: 'Progress bar'},
    {path: 'progress-spinner', title: 'Progress Spinner'},
    {path: 'radio', title: 'Radios'},
    {path: 'select', title: 'Select'},
    {path: 'sidenav', title: 'Sidenav'},
    {path: 'slide-toggle', title: 'Slide Toggle'},
    {path: 'stepper', title: 'Stepper'},
    {path: 'tabs', title: 'Tabs'},
    {path: 'cards', title: 'Cards'},
    {path: 'toolbar', title: 'Toolbar'},
    {path: 'virtual-scroll', title: 'Virtual Scroll'},
    {path: 'mdc-button', title: 'MDC Button'},
    {path: 'mdc-checkbox', title: 'MDC Checkbox'},
    {path: 'mdc-chips', title: 'MDC Chips'},
    {path: 'mdc-dialog', title: 'MDC Dialog'},
    {path: 'mdc-input', title: 'MDC Input'},
    {path: 'mdc-menu', title: 'MDC Menu'},
    {path: 'mdc-radio', title: 'MDC Radio'},
    {path: 'mdc-slide-toggle', title: 'MDC Slide Toggle'},
    {path: 'mdc-table', title: 'MDC Table'},
    {path: 'mdc-tabs', title: 'MDC Tabs'},
    {path: 'mdc-progress-bar', title: 'MDC Progress bar'},
    {path: 'mdc-progress-spinner', title: 'MDC Progress spinner'},
  ];
}
