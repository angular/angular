import {Component} from '@angular/core';

@Component({
  selector: 'hello-world-app',
  template: `<div i18n="desc|meaning" title="i18n attribute should be removed">Hello {{ name }}!</div>`,
})
export class HelloWorldComponent {
  name: string = 'world';
}
