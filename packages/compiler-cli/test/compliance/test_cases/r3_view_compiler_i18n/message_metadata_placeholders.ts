import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<div i18n="site header|A greeting@@greetingId">Hello {{name}}, you have <b>{{count}}</b> new <a href="/messages">messages</a></div>`,
})
export class AppComponent {
  name = 'world';
  count = 0;
}
