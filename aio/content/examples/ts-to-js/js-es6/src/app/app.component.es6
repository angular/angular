import { Component } from '@angular/core';

export class AppComponent {
  constructor() {
    this.title = 'Plain ES6 JavaScript';
  }
}

AppComponent.annotations = [
  new Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styles: [
      // See hero-di-inject-additional.component
      'hero-host { border: 1px dashed black; display: block; padding: 4px;}',
      '.heading {font-style: italic}'
    ]
  })
];
