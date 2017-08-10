import { Component } from '@angular/core';

// #docregion
export class HeroHostComponent {
  constructor() {
    this.active = false;
    this.clicks = 0;
    this.headingClass = true;
    this.title = 'Hero Host Tooltip';
  }

  clicked() {
    this.clicks += 1;
  }

  enter(event) {
    this.active = true;
    this.headingClass = false;
  }

  leave(event) {
    this.active = false;
    this.headingClass = true;
  }
}

// #docregion metadata
HeroHostComponent.annotations = [
  new Component({
    selector: 'hero-host',
    template: `
      <h1 [class.active]="active">Hero Host</h1>
      <div>Heading clicks: {{clicks}}</div>
    `,
    host: {
      // HostBindings to the <hero-host> element
      '[title]': 'title',
      '[class.heading]': 'headingClass',
      '(click)': 'clicked()',

      // HostListeners on the entire <hero-host> element
      '(mouseenter)': 'enter($event)',
      '(mouseleave)': 'leave($event)'
    },
    // Styles within (but excluding) the <hero-host> element
    styles: ['.active {background-color: yellow;}']
  })
];
// #enddocregion metadata
// #enddocregion
