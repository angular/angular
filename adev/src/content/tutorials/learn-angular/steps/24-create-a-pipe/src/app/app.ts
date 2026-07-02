import {Component} from '@angular/core';
import {ReversePipe} from './reverse.pipe';

@Component({
  selector: 'app-root',
  template: ` Reverse Machine: {{ word }} `,
  imports: [],
})
export class App {
  word = 'You are a champion';
}
