import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<div i18n>{count, plural, =0 {no items} =1 {one item} other {{{count}} items}}</div>`,
})
export class AppComponent {
  count = 0;
}
