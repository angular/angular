import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <section (mouseover)="onMouseOver()">
      There's a secret message for you, hover to reveal:
      {{ message }}
    </section>
  `,
})
export class App {
  message = '';

  onMouseOver() {
    this.message = 'Way to go 🚀';
  }
}
