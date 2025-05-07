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
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import {ZippyComponent} from './zippy.component';
import {HeavyComponent} from './heavy.component';
import {SamplePropertiesComponent} from './sample-properties.component';
import {RouterOutlet} from '@angular/router';
import {CookieRecipe} from './cookies.component';

@Component({
  selector: 'app-demo-component',
  templateUrl: './demo-app.component.html',
  styleUrls: ['./demo-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [HeavyComponent, SamplePropertiesComponent, RouterOutlet, CookieRecipe],
})
export class DemoAppComponent {
  readonly zippy = viewChild(ZippyComponent);
  readonly elementRef = viewChild<ElementRef>('elementReference');

  readonly inputOne = input('input one', {alias: 'input_one'});
  readonly inputTwo = input('input two');

  readonly outputOne = output();
  readonly outputTwo = output({alias: 'output_two'});

  primitiveSignal = signal(123);
  primitiveComputed = computed(() => this.primitiveSignal() ** 2);
  objectSignal = signal({name: 'John', age: 40});
  objectComputed = computed(() => {
    const original = this.objectSignal();
    return {...original, age: original.age + 1};
  });

  getTitle(): '► Click to expand' | '▼ Click to collapse' {
    if (!this.zippy() || !this.zippy()?.visible) {
      return '► Click to expand';
    }
    return '▼ Click to collapse';
  }
}
