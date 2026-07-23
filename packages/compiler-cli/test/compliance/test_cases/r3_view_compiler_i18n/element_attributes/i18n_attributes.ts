import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<div
    i18n-title
    i18n-aria-label
    title="Hello {{ name }}"
    aria-label="Label {{ name }}"
  ></div>`,
})
export class AppComponent {
  name = 'world';
}
