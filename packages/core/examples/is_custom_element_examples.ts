/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule} from '@angular/core';

// Example 1: NgModule with isCustomElement
@Component({
  selector: 'app-with-custom-elements',
  template: `
    <div>
      <polymer-button>Polymer Button</polymer-button>
      <lit-element>Lit Element</lit-element>
      <my-widget>Custom Widget</my-widget>
      <!-- This would generate an error since it doesn't match our custom element criteria -->
      <!-- <unknown-element>Unknown</unknown-element> -->
    </div>
  `,
})
export class AppWithCustomElementsComponent {}

@NgModule({
  declarations: [AppWithCustomElementsComponent],
  // Custom function to determine what counts as a custom element
  isCustomElement: (tag: string) => {
    // Allow elements that start with 'polymer-', 'lit-', or 'my-'
    return tag.startsWith('polymer-') || tag.startsWith('lit-') || tag.startsWith('my-');
  },
})
export class AppModule {}

// Example 2: Standalone Component with isCustomElement
@Component({
  standalone: true,
  selector: 'standalone-with-custom-elements',
  template: `
    <div>
      <web-component-1>Web Component 1</web-component-1>
      <web-component-2>Web Component 2</web-component-2>
      <!-- Any element with dashes is considered a custom element -->
      <some-other-element>Some Other Element</some-other-element>
    </div>
  `,
  // Simple function: any tag with a dash is a custom element
  isCustomElement: (tag: string) => tag.includes('-'),
})
export class StandaloneComponentWithCustomElements {}

// Example 3: Complex custom element detection
@Component({
  standalone: true,
  selector: 'complex-custom-element-detection',
  template: `
    <div>
      <stencil-component>Stencil Component</stencil-component>
      <angular-elements>Angular Elements</angular-elements>
      <vue-custom-element>Vue Custom Element</vue-custom-element>
      <legacy-element>Legacy Element</legacy-element>
    </div>
  `,
  isCustomElement: (tag: string) => {
    // More complex logic for different types of custom elements
    const customElementPrefixes = ['stencil-', 'angular-', 'vue-'];
    const allowedElements = new Set(['legacy-element']);
    
    return customElementPrefixes.some(prefix => tag.startsWith(prefix)) || 
           allowedElements.has(tag);
  },
})
export class ComplexCustomElementDetectionComponent {}

// Example 4: Property binding with custom elements
@Component({
  standalone: true,
  selector: 'custom-element-properties',
  template: `
    <div>
      <!-- These property bindings will be allowed since the elements are recognized as custom -->
      <my-slider 
        [value]="sliderValue" 
        [min]="0" 
        [max]="100"
        (valueChange)="onSliderChange($event)">
      </my-slider>
      
      <my-data-grid 
        [data]="gridData"
        [columns]="gridColumns"
        [sortable]="true">
      </my-data-grid>
    </div>
  `,
  isCustomElement: (tag: string) => tag.startsWith('my-'),
})
export class CustomElementPropertiesComponent {
  sliderValue = 50;
  gridData = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
  ];
  gridColumns = ['id', 'name', 'age'];

  onSliderChange(value: number) {
    this.sliderValue = value;
  }
}
