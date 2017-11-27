import { Component, ElementRef } from '@angular/core';

/**
 * A simple embedded component that displays an Angular Material icon
 */
@Component({
  selector: 'aio-icon',
  template: '<mat-icon [svgIcon]="name"></mat-icon>'
})
export class IconComponent {
  public name: string;
  constructor(private elementRef: ElementRef) {
    const element: HTMLElement = this.elementRef.nativeElement;
    this.name = element.getAttribute('name');
  }
}
