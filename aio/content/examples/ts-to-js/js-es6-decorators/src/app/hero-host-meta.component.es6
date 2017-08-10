import { Component } from '@angular/core';

// #docregion
@Component({
  selector: 'hero-host-meta',
  template: `
    <h1 [class.active]="active">Hero Host in Metadata</h1>
    <div>Heading clicks: {{clicks}}</div>
  `,
  host: {
    // HostBindings to the <hero-host-meta> element
    '[title]': 'title',
    '[class.heading]': 'headingClass',

    // HostListeners on the entire <hero-host-meta> element
    '(click)': 'clicked()',
    '(mouseenter)': 'enter($event)',
    '(mouseleave)': 'leave($event)'
  },
  // Styles within (but excluding) the <hero-host-meta> element
  styles: ['.active {background-color: coral;}']
})
export class HeroHostMetaComponent {
  title = 'Hero Host in Metadata Tooltip';
  headingClass = true;

  active = false;
  clicks = 0;

  clicked() {
    this.clicks += 1;
  }

  enter(event: Event) {
    this.active = true;
    this.headingClass = false;
  }

  leave(event: Event) {
    this.active = false;
    this.headingClass = true;
  }
}
// #enddocregion
