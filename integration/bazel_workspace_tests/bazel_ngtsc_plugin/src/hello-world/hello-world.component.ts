
import {Component} from '@angular/core';

@Component({
  selector: 'hello-world-app',
  template: `
    <div>Hello {{ name }}!</div>
    <input type="text" [value]="name" (input)="name = $event.target.value"/>
  `,
  styleUrls: ['./hello-world.component.scss'],
})
export class HelloWorldComponent {
  name: string = 'world';
}
