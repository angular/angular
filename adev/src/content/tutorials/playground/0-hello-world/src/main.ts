import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    Hello world!
  `,
})
export class PlaygroundComponent {}

bootstrapApplication(PlaygroundComponent);
