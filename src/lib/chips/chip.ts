import { Component, ElementRef, Renderer } from '@angular/core';

@Component({
  selector: 'md-chip, [md-chip]',
  template: `<ng-content></ng-content>`,
  host: {
    // Properties
    'class': 'md-chip',
    'tabindex': '-1',
    'role': 'option'
  }
})
export class MdChip {
  constructor(protected _renderer: Renderer, protected _elementRef: ElementRef) {}

  ngAfterContentInit(): void {}
}
