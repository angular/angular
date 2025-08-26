import {Component} from '@angular/core';

@Component({
  selector: 'hello-world',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
})
export class HelloWorldComponent {
  message = 'Hello World!';
}
