/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {JsonPipe} from '@angular/common';
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  inject,
  InjectionToken,
  Injector,
  Input,
  Output,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {RouterOutlet} from '@angular/router';
import {initializeMessageBus} from '../../../../ng-devtools-backend';

import {ZoneUnawareIFrameMessageBus} from '../../../../../src/zone-unaware-iframe-message-bus';

import {HeavyComponent} from './heavy.component';
import {ZippyComponent} from './zippy.component';

const NUMBER_TOKEN = new InjectionToken<number>('number-token');
const SYMBOL_TOKEN = new InjectionToken<Symbol>('symbol-token');

@Component({
  selector: 'app-demo-component',
  templateUrl: './demo-app.component.html',
  styleUrls: ['./demo-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [HeavyComponent, RouterOutlet, JsonPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {provide: NUMBER_TOKEN, useValue: 42},
    {provide: SYMBOL_TOKEN, useValue: Symbol('symbol_token')},
  ],
})
export class DemoAppComponent {
  readonly myNumber = inject(NUMBER_TOKEN);
  readonly mySymbol = inject(SYMBOL_TOKEN);

  @ViewChild(ZippyComponent) zippy!: ZippyComponent;
  @ViewChild('elementReference') elementRef!: ElementRef;

  @Input('input_one') inputOne = 'input one';
  @Input() inputTwo = 'input two';

  @Output() outputOne = new EventEmitter();
  @Output('output_two') outputTwo = new EventEmitter();

  primitiveSignal = signal(123);
  primitiveComputed = computed(() => this.primitiveSignal() ** 2);
  objectSignal = signal({name: 'John', age: 40});
  objectComputed = computed(() => {
    const original = this.objectSignal();
    return {...original, age: original.age + 1};
  });
  test = [signal(3)];

  constructor() {
    const el = createCustomElement(ZippyComponent, {injector: inject(Injector)});
    customElements.define('app-zippy', el as any);
  }

  getTitle(): '► Click to expand' | '▼ Click to collapse' {
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

initializeMessageBus(
  new ZoneUnawareIFrameMessageBus(
    'angular-devtools-backend',
    'angular-devtools',
    () => window.parent,
  ),
);
