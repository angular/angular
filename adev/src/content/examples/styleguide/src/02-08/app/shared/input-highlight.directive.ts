// #docregion
import {Directive, ElementRef, inject} from '@angular/core';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({
  selector: 'input',
  standalone: false,
})
/** Highlight the attached input text element in blue */
export class InputHighlightDirective {
  private el = inject(ElementRef);
  constructor() {
    this.el.nativeElement.style.backgroundColor = 'powderblue';
  }
}
