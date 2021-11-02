import {Directive} from '@angular/core';

@Directive({
  selector: '[my-dir]',
  host: {'[attr.title]': 'myTitle', '[attr.tabindex]': '1', '[attr.id]': 'myId'}
})
export class MyDirective {
  myTitle = 'hello';
  myId = 'special-directive';
}
