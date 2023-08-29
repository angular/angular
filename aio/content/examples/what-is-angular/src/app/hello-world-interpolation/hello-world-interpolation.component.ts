import {Component} from '@angular/core';

@Component({
  standalone: true,
  selector: 'hello-world-interpolation',
  templateUrl: './hello-world-interpolation.component.html',
})
export class HelloWorldInterpolationComponent {
  message = 'Hello, World!';
}
