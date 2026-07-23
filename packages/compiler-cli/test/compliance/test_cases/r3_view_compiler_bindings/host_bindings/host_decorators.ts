import {Directive, HostBinding, HostListener} from '@angular/core';

@Directive({
  selector: '[hostStuff]',
  host: {
    '[attr.role]': '"button"',
    '(mouseenter)': 'onEnter()',
  },
})
export class HostStuffDirective {
  active = false;
  label = 'x';

  @HostBinding('class.is-active') get isActive() {
    return this.active;
  }

  @HostBinding('attr.aria-label') ariaLabel = this.label;

  @HostListener('click', ['$event']) onClick(event: Event) {}

  @HostListener('window:resize') onResize() {}

  onEnter() {}
}
