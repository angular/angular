import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: false,
  host: {
    '(click)': 'handleClick($event)',
    '(mouseenter)': 'handleMouseEnter($event)',
    '[class.highlighted]': 'isHighlighted',
    '[style.backgroundColor]': 'bgColor',
    '[attr.data-highlight]': 'highlightId',
  },
})
export class HighlightDirective {
  isHighlighted = false;
  bgColor = 'yellow';
  highlightId = 'highlight-1';

  handleClick(event: MouseEvent) {
    console.log('clicked', event);
    this.isHighlighted = !this.isHighlighted;
  }

  handleMouseEnter(event: MouseEvent) {
    console.log('mouse entered', event);
  }
}
