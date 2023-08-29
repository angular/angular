import {Component} from '@angular/core';

@Component({
  standalone: true,
  selector: 'hello-world-bindings',
  templateUrl: './hello-world-bindings.component.html',
})
export class HelloWorldBindingsComponent {
  fontColor = 'blue';
  sayHelloId = 1;
  canClick = true;
  message = 'Hello, World';

  sayMessage() {
    alert(this.message);
  }
}
