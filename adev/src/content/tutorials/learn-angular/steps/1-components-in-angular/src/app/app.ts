import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: ` Hello `,
  styles: `
    :host {
      color: blue;
    }
  `,
})
export class App {}
