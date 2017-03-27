/* tslint:disable use-output-property-decorator */
// #docplaster
import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';

@Directive({selector: '[myClick]'})
export class ClickDirective {
  // #docregion output-myClick
  @Output('myClick') clicks = new EventEmitter<string>(); //  @Output(alias) propertyName = ...
 // #enddocregion output-myClick

  toggle = false;

  constructor(el: ElementRef) {
    el.nativeElement
      .addEventListener('click', (event: Event) => {
        this.toggle = !this.toggle;
        this.clicks.emit(this.toggle ? 'Click!' : '');
      });
  }
}

// #docregion output-myClick2
@Directive({
  // #enddocregion output-myClick2
  selector: '[myClick2]',
  // #docregion output-myClick2
  outputs: ['clicks:myClick']  // propertyName:alias
})
// #enddocregion output-myClick2
export class ClickDirective2 {
  clicks = new EventEmitter<string>();
  toggle = false;

  constructor(el: ElementRef) {
    el.nativeElement
      .addEventListener('click', (event: Event) => {
        this.toggle = !this.toggle;
        this.clicks.emit(this.toggle ? 'Click2!' : '');
      });
  }
}
