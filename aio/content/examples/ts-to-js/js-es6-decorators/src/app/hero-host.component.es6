import { Component, HostBinding, HostListener } from '@angular/core';

// #docregion
@Component({
  selector: 'hero-host',
  template: `
    <h1 [class.active]="active">Hero Host in Decorators</h1>
    <div>Heading clicks: {{clicks}}</div>
  `,
  // Styles within (but excluding) the <hero-host> element
  styles: ['.active {background-color: yellow;}']
})
export class HeroHostComponent {
  // HostBindings to the <hero-host> element
  @HostBinding() title = 'Hero Host in Decorators Tooltip';
  @HostBinding('class.heading') headingClass = true;

  active = false;
  clicks = 0;

  // HostListeners on the entire <hero-host> element
  @HostListener('click')
  clicked() {
    this.clicks += 1;
  }

  @HostListener('mouseenter', ['$event'])
  enter(event: Event) {
    this.active = true;
    this.headingClass = false;
  }

  @HostListener('mouseleave', ['$event'])
  leave(event: Event) {
    this.active = false;
    this.headingClass = true;
  }
}
// #enddocregion
