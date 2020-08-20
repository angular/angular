/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {CdkMenu, CdkMenuItem, CdkMenuGroup, CDK_MENU} from '@angular/cdk-experimental/menu';

@Component({
  templateUrl: 'mat-menubar-demo.html',
})
export class MatMenuBarDemo {}

// TODO: Remove the fake when mat-menu is re-built with CdkMenu directives
@Component({
  selector: 'demo-menu',
  exportAs: 'demoMenu',
  template: '<ng-content></ng-content>',
  host: {
    '[tabindex]': '_isInline() ? 0 : null',
    'role': 'menu',
    'class': 'cdk-menu mat-menu mat-menu-panel',
    '[class.cdk-menu-inline]': '_isInline()',
    '[attr.aria-orientation]': 'orientation',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: DemoMenu},
    {provide: CDK_MENU, useExisting: DemoMenu},
  ],
  styleUrls: ['mat-menubar-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DemoMenu extends CdkMenu {}

// TODO: Remove the fake when mat-menu-item is re-built with CdkMenu directives
@Component({
  selector: 'demo-menu-item',
  exportAs: 'demoMenuItem',
  host: {
    '[tabindex]': '_tabindex',
    'type': 'button',
    'role': 'menuitem',
    'class': 'cdk-menu-item mat-menu-item',
    '[attr.aria-disabled]': 'disabled || null',
  },
  template: '<ng-content></ng-content>',
  styleUrls: ['mat-menubar-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DemoMenuItem extends CdkMenuItem {}
