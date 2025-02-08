import {Directive} from '@angular/core';

@Directive({
    selector: '[my-dir]', host: { '[title]': 'myTitle', '[tabindex]': '1', '[id]': 'myId' },
    standalone: false
})
export class MyDirective {
  myTitle = 'hello';
  myId = 'special-directive';
}
