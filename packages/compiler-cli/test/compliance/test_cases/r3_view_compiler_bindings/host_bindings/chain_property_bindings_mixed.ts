import {Directive} from '@angular/core';

@Directive({
  selector: '[my-dir]',
  host: {'[title]': '"my title"', '[attr.tabindex]': '1', '[id]': '"my-id"'}
})
export class MyDirective {
}
