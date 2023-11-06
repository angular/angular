import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <label>Name:</label>
    <input type="text" [(ngModel)]="name" placeholder="Enter a name here" />
    <hr />
    <h1>Hello {{ name }}!</h1>
  `,
  imports: [FormsModule],
})
export class DemoComponent {
  name = '';
}

bootstrapApplication(DemoComponent);
