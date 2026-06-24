import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    Hello world!
  `,
})
export class Playground {}

bootstrapApplication(Playground);
