/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  afterRenderEffect,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  Directive,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {ZippyComponent} from './zippy.component';
import {HeavyComponent} from './heavy.component';
import {SamplePropertiesComponent} from './sample-properties.component';
import {RouterOutlet} from '@angular/router';
import {CookieRecipe} from './cookies.component';
// structual directive example
let StructuralDirective = class StructuralDirective {
  constructor() {
    this.templateRef = inject(TemplateRef);
    this.viewContainerRef = inject(ViewContainerRef);
  }
  ngOnInit() {
    // Example of using the structural directive
    this.viewContainerRef.createEmbeddedView(this.templateRef);
  }
};
StructuralDirective = __decorate(
  [
    Directive({
      selector: '[appStructural]',
      host: {
        '[class.app-structural]': 'true',
      },
    }),
  ],
  StructuralDirective,
);
export {StructuralDirective};
let DemoAppComponent = class DemoAppComponent {
  getTitle() {
    if (!this.zippy() || !this.zippy()?.visible) {
      return '► Click to expand';
    }
    return '▼ Click to collapse';
  }
  constructor() {
    this.zippy = viewChild(ZippyComponent);
    this.elementRef = viewChild('elementReference');
    this.inputOne = input('input one', {alias: 'input_one'});
    this.inputTwo = input('input two');
    this.outputOne = output();
    this.outputTwo = output({alias: 'output_two'});
    this.primitiveSignal = signal(123);
    this.primitiveComputed = computed(() => this.primitiveSignal() ** 2);
    this.objectSignal = signal({name: 'John', age: 40});
    this.objectComputed = computed(() => {
      const original = this.objectSignal();
      return {...original, age: original.age + 1};
    });
    afterRenderEffect(() => {
      this.zippy();
    });
  }
};
DemoAppComponent = __decorate(
  [
    Component({
      selector: 'app-demo-component',
      templateUrl: './demo-app.component.html',
      styleUrls: ['./demo-app.component.scss'],
      encapsulation: ViewEncapsulation.None,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        StructuralDirective,
        HeavyComponent,
        SamplePropertiesComponent,
        RouterOutlet,
        CookieRecipe,
      ],
    }),
  ],
  DemoAppComponent,
);
export {DemoAppComponent};
//# sourceMappingURL=demo-app.component.js.map
