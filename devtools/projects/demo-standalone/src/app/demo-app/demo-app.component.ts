/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, inject, Injector, Input, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {RouterOutlet} from '@angular/router';
import {initializeMessageBus} from 'ng-devtools-backend';

import {ZoneUnawareIFrameMessageBus} from '../../../../../src/zone-unaware-iframe-message-bus';

import {HeavyComponent} from './heavy.component';
import {ZippyComponent} from './zippy.component';

@Component({
  selector: 'app-demo-component',
  templateUrl: './demo-app.component.html',
  styleUrls: ['./demo-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [HeavyComponent, RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DemoAppComponent {
  @ViewChild(ZippyComponent) zippy: ZippyComponent;
  @ViewChild('elementReference') elementRef: ElementRef;

  @Input('input_one') inputOne = 'input one';
  @Input() inputTwo = 'input two';

  @Output() outputOne = new EventEmitter();
  @Output('output_two') outputTwo = new EventEmitter();

  constructor() {
    const el = createCustomElement(ZippyComponent, {injector: inject(Injector)});
    customElements.define('app-zippy', el as any);
  }

  getTitle(): '► Click to expand'|'▼ Click to collapse' {
    if (!this.zippy || !this.zippy.visible) {
      return '► Click to expand';
    }
    return '▼ Click to collapse';
  }
}

export const ROUTES = [
  {
    path: '',
    component: DemoAppComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./todo/todo-app.component').then((m) => m.ROUTES),
      },
    ],
  },
];

initializeMessageBus(new ZoneUnawareIFrameMessageBus(
    'angular-devtools-backend', 'angular-devtools', () => window.parent));
