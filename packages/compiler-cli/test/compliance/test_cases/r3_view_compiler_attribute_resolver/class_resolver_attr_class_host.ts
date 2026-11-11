import {Directive} from '@angular/core';

@Directive({
  selector: '[myDir]',
  host: {'(attr.class)': 'resolve($event)'},
})
export class MyDirective {
  resolve(event: unknown): void {}
}
