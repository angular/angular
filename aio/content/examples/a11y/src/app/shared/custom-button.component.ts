import { Component, EventEmitter, Output, HostBinding, HostListener } from '@angular/core';

// #docregion
@Component({
  selector: 'app-custom-button',
  templateUrl: './custom-button.component.html'
})
export class CustomButtonComponent {
  @HostBinding('attr.role') role = 'button';

  @HostBinding('attr.class') classes = 'btn btn-primary';

  @HostBinding('attr.tabindex') tabIndex = '0';

  @Output() click = new EventEmitter();

  @HostListener('keydown.space')
  @HostListener('keydown.enter')
  onKeyDown(): void {
    this.click.emit(null);
  }

}
// #enddocregion
