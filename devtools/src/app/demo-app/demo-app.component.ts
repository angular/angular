/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import {ZippyComponent} from './zippy.component';

@Component({
  selector: 'app-demo-component',
  templateUrl: './demo-app.component.html',
  styleUrls: ['./demo-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class DemoAppComponent {
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

  getTitle(): '► Click to expand' | '▼ Click to collapse' {
    if (!this.zippy || !this.zippy.visible) {
      return '► Click to expand';
    }
    return '▼ Click to collapse';
  }
}
