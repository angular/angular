import {Component, signal} from '@angular/core';
import {FormField, form} from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  imports: [FormField],
  template: `<input [formField]="f" />

    {{ f().valid() }} - {{ f().value() }} - {{ f().dirty() }}`,
})
export class App {
  f = form(signal('foo'));
}
