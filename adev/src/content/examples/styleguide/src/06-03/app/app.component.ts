import {Component} from '@angular/core';

@Component({
  selector: 'sg-app',
  template: `
  <input type="text" tohValidator>
  <textarea tohValidator2></textarea>`,
  standalone: false,
})
export class AppComponent {}
