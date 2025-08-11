import {Directive, HostBinding, HostListener} from '@angular/core';

// TODO: Import input, signal, and computed from @angular/core

@Directive({
  selector: '[highlight]',
})
export class HighlightDirective {
  // TODO: Create signal input for color with default 'yellow'

  // TODO: Create signal input for intensity with default 0.3

  // TODO: Create internal signal for hover state (private isHovered)

  // TODO: Create computed signal for background style

  @HostBinding('style.backgroundColor')
  get backgroundColor() {
    return 'transparent'; // TODO: Use computed signal
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    // TODO: Set isHovered to true
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    // TODO: Set isHovered to false
  }
}
